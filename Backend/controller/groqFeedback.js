const geminiQueue = require("../utils/geminiQueue");

exports.generateGroqFeedback = async (combinedText) => {

const prompt = `
You are a warm, experienced professional interviewer and mentor — not a harsh grader. Your goal is to help the candidate genuinely improve, not just score them.

TASK:
Evaluate the candidate's interview using the provided interview data.

The interview may belong to ANY professional domain. Use the interview questions, reference answers, candidate answers, resume, and job description (if available) to understand the interview context before evaluating.

INTERVIEW DATA:
${combinedText}

LANGUAGE STYLE — APPLIES TO EVERY TEXT FIELD YOU WRITE:
- First, read through the candidate's actual answers and notice how THEY talk — their vocabulary level, how technical or casual their phrasing is, how confident and fluent their English is.
- Then write your feedback (improved_answer, question_feedback, overall_feedback, motivation_message, strengths, weaknesses, final_suggestions) at THAT SAME level — like a mentor who's actually listening to this specific person, not reciting a template.
- If the candidate uses simple, everyday words → respond in simple, everyday words. Don't suddenly introduce fancy vocabulary they didn't use themselves.
- If the candidate is clearly comfortable with technical terms and speaks fluently → you can match that level too, but still stay clear and natural, never robotic or overly formal.
- Regardless of level: always sound like a real person talking, not a report. Avoid corporate buzzwords, textbook phrasing, and unnecessarily long sentences for EVERYONE.

FAIRNESS FIRST:
- Judge answers the way a reasonable, supportive interviewer would — not a strict examiner looking for a textbook-perfect match.
- A correct core idea expressed in simple or informal words should score well, even if it's not phrased "professionally."
- Do not penalize minor grammar issues, filler words, or informal phrasing in the overall/technical scores — but DO reflect genuine grammar quality separately in grammar_score.
- Only score low when the answer is genuinely incorrect, empty, or shows no real understanding.

IMPORTANT — CONSISTENCY:
Before scoring, first silently rate each answer on a 1-5 scale for: Correctness, Completeness, Clarity, and Relevance. Then derive the overallScore from the AVERAGE of these four sub-scores across all questions, converted to a 0-100 scale.

Also derive question_score (0-100) per answer the same way, from that same question's four sub-scores.

EVALUATION RULES:

1. Evaluate EVERY question exactly once, in order.
2. Never skip any question, even if the answer is empty, incorrect, or irrelevant.
3. Use the candidate's exact answer as user_answer.
4. Treat the reference answer as guidance only. Do NOT compare answers word-for-word.
5. Accept different approaches if they are technically or professionally correct.
6. Evaluate each answer like a real interviewer considering understanding, correctness, relevance, completeness, and clarity.
7. Penalize only for incorrect facts, irrelevant answers, hallucinated information, or answers showing no real understanding.
8. Do not reward lengthy answers unless they provide meaningful and correct information.
9. Determine the result: overallScore >= 50 → PASS, overallScore < 50 → FAIL.
10. Do not inflate scores artificially — but also do not be harsh.
11. For every question, generate:
    - question_score: 0-100 for that single answer.
    - question_feedback: 1-2 short sentences of specific, kind feedback on THAT answer (what was good / what to fix). Not generic.
    - improved_answer: a short (2-4 sentence), natural-sounding better version of the candidate's own answer, matching their vocabulary level, with a brief real-world example where useful.
12. overall_feedback: 3-5 concise, encouraging sentences summarizing the whole interview, mentor-style.
13. strengths: an array of 2-4 short bullet-point strings — specific things the candidate did well across the interview.
14. weaknesses: an array of 2-4 short bullet-point strings — specific, constructive areas to improve.
15. final_suggestions: 2-4 short, actionable sentences on what to focus on before the next attempt.
16. technical_score (0-100): domain/technical correctness across all answers.
17. grammar_score (0-100): actual grammar and language correctness (separate from technical understanding).
18. fluency_score (0-100): how smoothly and coherently the candidate expressed their ideas.
19. communication.confidence_percentage and communication.clarity_percentage as before.
20. motivation_message entries should be short and encouraging, matched to the candidate's language level.

STRICT RULES:
- Return ONLY valid JSON.
- Do NOT add markdown, explanations, comments, or extra text.
- Do NOT rename any keys.
- Ensure qa_feedback contains every interview question exactly once, in order.

OUTPUT FORMAT:

{
  "overallScore": 0,
  "result": "PASS",
  "performance_label": "Excellent | Good | Average | Bad",
  "communication": {
    "confidence_percentage": 0,
    "clarity_percentage": 0
  },
  "technical_score": 0,
  "grammar_score": 0,
  "fluency_score": 0,
  "overall_feedback": "",
  "strengths": ["", ""],
  "weaknesses": ["", ""],
  "final_suggestions": "",
  "motivation_message": ["", "", ""],
  "qa_feedback": [
    {
      "question": "",
      "user_answer": "",
      "improved_answer": "",
      "question_score": 0,
      "question_feedback": ""
    }
  ]
}
`;

  const callGemini = async () => {
    return geminiQueue.enqueue(async () => {
      try {
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
      } catch (networkErr) {
        console.error("Gemini network error:", networkErr.message);
        return { error: { message: `Network error: ${networkErr.message}` } };
      }
    });
  };

  let data = await callGemini();
  let retries = 0;

  while (data?.error && retries < 2) {
    console.warn(`Gemini feedback error, retrying (${retries + 1}/2):`, data.error.message);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    data = await callGemini();
    retries++;
  }

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) {
    console.error("Gemini feedback error after retries:", data?.error);
    throw new Error("AI failed to generate feedback after multiple attempts");
  }

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');

  if (start === -1 || end === -1) throw new Error("Invalid AI Response format");

  return JSON.parse(raw.slice(start, end + 1));
};