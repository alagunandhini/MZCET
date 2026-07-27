const { getPool, sql } = require("../db-sql");

const analyzeResume = async (req, res) => {
  try {
    const { text, jobDescription } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: "No resume text received" });
    }

    const prompt = `
You are an experienced technical interviewer and career coach.

TASK:
Generate 4 rounds of interview questions for this candidate, based on their resume and the job description (if provided).

Candidate Resume:
${text}

Job Description:
${jobDescription || "Not Provided — infer the most suitable job role from the resume"}

INSTRUCTIONS:
- Round 1 (Introduction & Resume Review): mix of resume-specific questions and commonly-asked "tell me about yourself" style questions for this field.
- Round 2 (Technical Assessment): frequently-asked technical questions for this specific role/tech stack, blended with questions tailored to the candidate's listed skills/projects.
  - IMPORTANT: If the candidate's field is Computer Science / CSE / IT / related, this round MUST include core CS subject questions — covering areas like Data Structures & Algorithms, Operating Systems, DBMS/SQL, Computer Networks, and OOP concepts — in addition to resume/tech-stack-specific questions.
- Round 3 (System Design / Domain Depth): system design or domain-depth questions relevant to this role's seniority level.
- Round 4 (Behavioral & Cultural Fit): behavioral questions (STAR-method style), tailored where possible to the candidate's actual work/project history.
- Each round must have exactly 15 questions.
- Do NOT fabricate technologies or experience the candidate doesn't have.
- NAMING EACH ROUND: the "name" field for each round must be short (3-6 words), specific, and meaningful to what that round actually covers for THIS candidate. Examples: "Resume & Background Check", "DSA & Core CS Fundamentals". Avoid generic names like "Round 1" or "Technical Round".

Return ONLY valid JSON, no markdown, no commentary, no keys renamed.

Output Format:
{
  "Round1": { "name": "", "questions": [ { "q": "" } ] },
  "Round2": { "name": "", "questions": [] },
  "Round3": { "name": "", "questions": [] },
  "Round4": { "name": "", "questions": [] }
}
`;

    const callGemini = async () => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8000,
              responseMimeType: "application/json",
              thinkingConfig: {
                thinkingLevel: "low",
              },
            },
          }),
        }
      );
      return await response.json();
    };

    let data = await callGemini();
    let retries = 0;

    while (data?.error && retries < 2) {
      console.warn(`Gemini error, retrying (${retries + 1}/2):`, data.error.message);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      data = await callGemini();
      retries++;
    }

    console.log("GEMINI INTERVIEW OUTPUT:", JSON.stringify(data, null, 2));

    let analysis = "";
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      analysis = data.candidates[0].content.parts[0].text;
    } else {
      console.error("Gemini API error after retries:", data?.error);
      return res.status(500).json({
        success: false,
        message: "AI failed to generate questions. Please try again.",
      });
    }

    let parsedQuestions = {};
    try {
      parsedQuestions = JSON.parse(analysis);
    } catch (err) {
      try {
        const start = analysis.indexOf('{');
        const end = analysis.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error("No JSON object found");
        parsedQuestions = JSON.parse(analysis.slice(start, end + 1));
      } catch (fallbackErr) {
        console.error("JSON parse failed even after fallback:", fallbackErr);
        return res.status(500).json({
          success: false,
          message: "AI returned invalid JSON",
        });
      }
    }

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
      await transaction.rollback();
      throw txErr;
    }

    res.json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error("GEMINI INTERVIEW ERROR:", error);
    res.status(500).json({ error: "AI interview generation failed" });
  }
};

module.exports = analyzeResume;