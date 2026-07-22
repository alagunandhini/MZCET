const axios = require("axios");

exports.generateGroqFeedback= async(combinedText) =>{

const prompt = `
You are an experienced professional interviewer and interview evaluator.

TASK:
Evaluate the candidate's interview using the provided interview data.

The interview may belong to ANY professional domain. Use the interview questions, reference answers, candidate answers, resume, and job description (if available) to understand the interview context before evaluating.

INTERVIEW DATA:
${combinedText}

EVALUATION RULES:

1. Evaluate EVERY question exactly once.
2. Never skip any question, even if the answer is empty, incorrect, or irrelevant.
3. Use the candidate's exact answer as user_answer.
4. Treat the reference answer as guidance only. Do NOT compare answers word-for-word.
5. Accept different approaches if they are technically or professionally correct.
6. Evaluate each answer like a real interviewer by considering:
   - Understanding of the question
   - Technical or domain correctness
   - Relevance
   - Completeness
   - Conceptual understanding
   - Practical applicability (when appropriate)
   - Clarity of communication
7. Penalize:
   - Incorrect facts
   - Irrelevant answers
   - Hallucinated information
   - Very vague or incomplete responses
8. Do not reward lengthy answers unless they provide meaningful and correct information.
9. Score each answer fairly and calculate ONE overallScore out of 100 based on the candidate's complete interview performance.
10. Do not inflate scores. Award scores above 90 only for exceptional interview performance.
11. Determine the result:
    - overallScore >= 10 → PASS
    - overallScore < 10 → FAIL
12. For every question, generate an improved_answer that:
    - Is based on the candidate's original answer.
    - Preserves the candidate's intent whenever possible.
    - Corrects technical, factual, or logical mistakes.
    - Adds important missing information.
    - Removes incorrect or irrelevant content.
    - Improves clarity, structure, grammar, and professionalism.
    - Represents how the candidate could have answered better in a real interview.
    - If the answer is empty or completely incorrect, generate the best professional answer instead.
13. overall_feedback should summarize the candidate's strengths, weaknesses, and key improvement areas in 3–5 concise sentences.

STRICT RULES:

- Return ONLY valid JSON.
- Do NOT add markdown, explanations, comments, or extra text.
- Do NOT rename any keys.
- Ensure qa_feedback contains every interview question exactly once.

OUTPUT FORMAT:

{
  "overallScore": 0,
  "result": "PASS",
  "performance_label": "Excellent | Good | Average | Bad",
  "communication": {
    "confidence_percentage": 0,
    "clarity_percentage": 0
  },
  "overall_feedback": "",
  "motivation_message": [
    "",
    "",
    ""
  ],
  "qa_feedback": [
    {
      "question": "",
      "user_answer": "",
      "improved_answer": ""
    }
  ]
}
`;


const response = await axios.post( "https://api.groq.com/openai/v1/chat/completions",
     {
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      timeout: 30000, // ⏱ safety
    }
)

const raw=response.data.choices[0].message.content
console.log("feedback response:");
console.log(raw);

const start =raw.indexOf('{');
const end=raw.lastIndexOf('}');

if(start==-1 || end==-1) throw new Error("Invalid AI Response format");

return JSON.parse(raw.slice(start,end+1));
}