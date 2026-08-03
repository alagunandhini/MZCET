const { getPool, sql } = require("../db-sql");
const geminiQueue = require("../utils/geminiQueue");
// One Gemini call per round — each call generates 45 questions for that
// round only (3 sequential sets of 15, one set per attempt). This replaces
// the old single mega-call that tried to generate all 4 rounds x 45
// questions (180 total) in one JSON response, which risked truncation.
const ROUND_DEFS = [
  {
    key: "Round1",
    focus: `Introduction & Resume Review: mix of resume-specific questions and commonly-asked "tell me about yourself" style questions for this field.`,
  },
  {
    key: "Round2",
    focus: `Technical Assessment: frequently-asked technical questions for this specific role/tech stack, blended with questions tailored to the candidate's listed skills/projects.
IMPORTANT: If the candidate's field is Computer Science / CSE / IT / related, this round MUST include core CS subject questions — covering areas like Data Structures & Algorithms, Operating Systems, DBMS/SQL, Computer Networks, and OOP concepts — in addition to resume/tech-stack-specific questions.`,
  },
  {
    key: "Round3",
    focus: `System Design / Domain Depth: system design or domain-depth questions relevant to this role's seniority level.`,
  },
  {
    key: "Round4",
    focus: `Behavioral & Cultural Fit: behavioral questions (STAR-method style), tailored where possible to the candidate's actual work/project history.`,
  },
];

const buildRoundPrompt = (roundDef, text, jobDescription) => `
You are an experienced technical interviewer and career coach.

TASK:
Generate interview questions for ONE round of a 4-round interview process, for this candidate, based on their resume and the job description (if provided).

Candidate Resume:
${text}

Job Description:
${jobDescription || "Not Provided — infer the most suitable job role from the resume"}

THIS ROUND'S FOCUS:
${roundDef.focus}

INSTRUCTIONS:
- Generate exactly 45 questions for this round, as 3 sequential sets of 15 questions each — one set per reattempt of this round (a candidate may retry a round up to 3 times and must not see a repeated or near-duplicate question across attempts).
  - Questions 1-15: first attempt set.
  - Questions 16-30: second attempt set — different questions from the first set, same round theme and difficulty level.
  - Questions 31-45: third attempt set — different questions again from both sets above.
- Do NOT fabricate technologies or experience the candidate doesn't have.
- NAMING: the "name" field must be short (3-6 words), specific, and meaningful to what this round actually covers for THIS candidate. Examples: "Resume & Background Check", "DSA & Core CS Fundamentals". Avoid generic names like "Round 1" or "Technical Round".

Return ONLY valid JSON, no markdown, no commentary, no keys renamed.

Output Format:
{
  "name": "",
  "questions": [ { "q": "" } ]
}
`;

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    // Fail fast and loud instead of sending a request with an empty/undefined
    // key, which is what produces the confusing 401 ACCESS_TOKEN_TYPE_UNSUPPORTED.
    return {
      error: { code: 401, status: "MISSING_KEY", message: "GEMINI_API_KEY is not set or empty in the environment." },
    };
  }

  return geminiQueue.enqueue(async () => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              // 45 questions per call now (was up to 180 in one call) —
              // 6000 is comfortable headroom for a single round's response.
              maxOutputTokens: 6000,
              responseMimeType: "application/json",
              thinkingConfig: {
                thinkingLevel: "low",
              },
            },
          }),
        }
      );
      const json = await response.json();
      // Some non-2xx responses don't populate a top-level `error` key
      // consistently — normalize so callers can always branch on json.error.
      if (!response.ok && !json.error) {
        json.error = { code: response.status, status: response.statusText, message: "Unknown error" };
      }
      return json;
    } catch (networkErr) {
      console.error("Gemini network error:", networkErr.message);
      return { error: { message: `Network error: ${networkErr.message}` } };
    }
  });
};

// Pulls Google's suggested retryDelay (e.g. "28s") out of a 429 error body,
// falling back to a default if it's not present.
const getRetryDelayMs = (errorObj, fallbackMs) => {
  const retryInfo = errorObj?.details?.find((d) => d["@type"]?.includes("RetryInfo"));
  const raw = retryInfo?.retryDelay; // e.g. "28s"
  if (!raw) return fallbackMs;
  const seconds = parseFloat(raw);
  return Number.isFinite(seconds) ? Math.ceil(seconds * 1000) + 500 : fallbackMs;
};

// Calls Gemini for a single round, with error-aware retry behavior:
// - 401/403 (bad/missing credentials) fail immediately — retrying won't help.
// - 429 (quota) backs off using Google's suggested retryDelay instead of a flat 3s.
// - anything else retries with a short flat delay, same as before.
const generateRound = async (roundDef, text, jobDescription) => {
  const prompt = buildRoundPrompt(roundDef, text, jobDescription);

  let data = await callGemini(prompt);
  let retries = 0;
  const maxRetries = 2;

  while (data?.error && retries < maxRetries) {
    const code = data.error.code;

    if (code === 401 || code === 403) {
      console.error(`Gemini auth error on ${roundDef.key}, not retrying:`, data.error.message);
      break;
    }

    const delayMs = code === 429 ? getRetryDelayMs(data.error, 5000) : 3000;
    console.warn(
      `Gemini error on ${roundDef.key}, retrying (${retries + 1}/${maxRetries}) in ${delayMs}ms:`,
      data.error.message
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    data = await callGemini(prompt);
    retries++;
  }

  const analysis = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!analysis) {
    console.error(`Gemini API error for ${roundDef.key} after retries:`, data?.error);
    const code = data?.error?.code;
    if (code === 401 || code === 403) {
      throw new Error(
        `Gemini API rejected the credentials for ${roundDef.key}. Check that GEMINI_API_KEY is set correctly and hasn't been revoked/regenerated.`
      );
    }
    if (code === 429) {
      throw new Error(`Gemini API quota exceeded for ${roundDef.key}. Check your plan/rate limits.`);
    }
    throw new Error(`AI failed to generate questions for ${roundDef.key}`);
  }

  try {
    return JSON.parse(analysis);
  } catch (err) {
    try {
      const start = analysis.indexOf('{');
      const end = analysis.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error("No JSON object found");
      return JSON.parse(analysis.slice(start, end + 1));
    } catch (fallbackErr) {
      console.error(`JSON parse failed for ${roundDef.key} even after fallback:`, fallbackErr);
      throw new Error(`AI returned invalid JSON for ${roundDef.key}`);
    }
  }
};

const analyzeResume = async (req, res) => {
  try {
    const { text, jobDescription } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: "No resume text received" });
    }

    // One Gemini call per round (4 total), run sequentially so a failure on
    // one round is easy to attribute and retry independently. Pacing across
    // rounds (and across students) is handled by geminiQueue now, so no
    // manual setTimeout delay is needed here between rounds.
    const parsedQuestions = {};
    for (const roundDef of ROUND_DEFS) {
      try {
        parsedQuestions[roundDef.key] = await generateRound(roundDef, text, jobDescription);
      } catch (roundErr) {
        console.error(`GEMINI INTERVIEW ERROR (${roundDef.key}):`, roundErr);
        return res.status(500).json({
          success: false,
          message: `AI failed to generate questions for ${roundDef.key}. Please try again.`,
        });
      }
    }

    console.log("GEMINI INTERVIEW OUTPUT:", JSON.stringify(parsedQuestions, null, 2));

    // A fresh resume upload means a fresh start — wipe every round-progress
    // table alongside the new resumeText/questions, all inside one transaction.
    const pool = getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Update the user's resume info
      await transaction.request()
        .input("id", sql.Int, userId)
        .input("resumeText", sql.NVarChar, text)
        .input("jobDescription", sql.NVarChar, jobDescription || "")
        .query(`
          UPDATE Users
          SET resumeText = @resumeText,
              jobDescription = @jobDescription,
              hasResume = 1
          WHERE id = @id
        `);

      // 2. Wipe old progress — this user is starting over with a new resume
      await transaction.request()
        .input("id", sql.Int, userId)
        .query("DELETE FROM Questions WHERE userId = @id");

      await transaction.request()
        .input("id", sql.Int, userId)
        .query("DELETE FROM CompletedRounds WHERE userId = @id");

      await transaction.request()
        .input("id", sql.Int, userId)
        .query("DELETE FROM RoundResults WHERE userId = @id");

      await transaction.request()
        .input("id", sql.Int, userId)
        .query("DELETE FROM RoundAttempts WHERE userId = @id");

        await transaction.request()
  .input("id", sql.Int, userId)
  .query("DELETE FROM RoundTimeTaken WHERE userId = @id");

      // 3. Insert the newly generated questions
      // questionOrder runs 1-45 per round — 3 sets of 15, one set per
      // attempt. The attempt-to-question-set mapping is derived later, at
      // fetch time in /resume-status, purely from questionOrder.
      for (const roundKey of Object.keys(parsedQuestions)) {
        const round = parsedQuestions[roundKey];
        const roundName = round?.name || "";
        const questions = round?.questions || [];

        for (let i = 0; i < questions.length; i++) {
          await transaction.request()
            .input("userId", sql.Int, userId)
            .input("round", sql.NVarChar, roundKey)
            .input("roundName", sql.NVarChar, roundName)
            .input("questionText", sql.NVarChar, questions[i].q || "")
            .input("questionOrder", sql.Int, i + 1)
            .query(`
              INSERT INTO Questions (userId, round, roundName, questionText, questionOrder)
              VALUES (@userId, @round, @roundName, @questionText, @questionOrder)
            `);
        }
      }

      await transaction.commit();
    } catch (txErr) {
      try { await transaction.rollback(); } catch (_) {}
      throw txErr;
    }

    res.json({
      success: true,
      analysis: JSON.stringify(parsedQuestions),
    });

  } catch (error) {
    console.error("GEMINI INTERVIEW ERROR:", error);
    res.status(500).json({ error: "AI interview generation failed" });
  }
};

module.exports = analyzeResume;
module.exports.ROUND_DEFS = ROUND_DEFS;
module.exports.generateRound = generateRound;