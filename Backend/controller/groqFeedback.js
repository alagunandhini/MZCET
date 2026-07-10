const axios = require("axios");

exports.generateGroqFeedback= async(combinedText) =>{

const prompt = `
You are an AI Interview Feedback Generator used in a production system.

TASK:
You will receive multiple interview questions with user answers.
You MUST generate feedback for EVERY question provided.

INPUT INTERVIEW DATA:
${combinedText}

STRICT RULES (VERY IMPORTANT):
1. Each question in the input MUST appear exactly once in qa_feedback.
2. DO NOT SKIP any question, even if:
   - the answer is empty
   - the answer is incorrect
   - the answer is irrelevant
3. qa_feedback array length MUST equal the number of questions in the input.
4. Use the EXACT user answer as user_answer (even if it is empty or weak).
5. improved_answer must be:
   - professional
   - clear
   - suitable for a Full Stack Developer interview
6. If user_answer is empty, generate a complete improved answer.
7. Output MUST be valid JSON only.
8. Do NOT add explanations, comments, markdown, or extra text.
9. Do NOT rename any keys.
10. Ensure all required fields are present.

OUTPUT FORMAT (FOLLOW EXACTLY):

{
  "performance_label": "Extraordinary | Good | Average | Bad",
  "attempted_questions": 0,
  "skipped_questions": 0,
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

FINAL SELF-CHECK BEFORE RESPONDING:
- Count the total number of questions in the input
- Ensure qa_feedback contains ALL of them
- Ensure JSON is valid and complete
- Return ONLY the JSON object
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

const start =raw.indexOf('{');
const end=raw.lastIndexOf('}');

if(start==-1 || end==-1) throw new Error("Invalid AI Response format");

return JSON.parse(raw.slice(start,end+1));
}