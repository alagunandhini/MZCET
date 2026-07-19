const User=require("../models/users");
const analyzeResume = async (req, res) => {
  try {
    // getting resume text from from frontend
    const { text, jobDescription } = req.body;
    const userId = req.userId;


       console.log("Sending response:", text);
 

    if (!text) {
      return res.status(400).json({ error: "No resume text received" });
    }
const prompt = `
You are an AI Interview Preparation Assistant.

Candidate Resume:
${text}

Job Description:
${jobDescription || "Not Provided"}

Instructions:

- If a Job Description is provided, generate interview questions mainly based on it while also considering the resume.

- If no Job Description is provided, analyze the resume and infer the most suitable job role.

Generate exactly four interview rounds.

Each round should contain 15 questions with ideal answers.

Return ONLY valid JSON.

Output Format:

{
  "Round1": {
    "name": "",
    "questions": [
      {
        "q": "",
        "a": ""
      }
    ]
  },
  "Round2": {
    "name": "",
    "questions": []
  },
  "Round3": {
    "name": "",
    "questions": []
  },
  "Round4": {
    "name": "",
    "questions": []
  }
}
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
          temperature: 0.3,

  max_tokens: 8000,

  response_format: {
    type: "json_object"
  },
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });
         console.log("Sending response:", response);

    const data = await response.json();
 
    console.log("GROQ INTERVIEW OUTPUT:", JSON.stringify(data, null, 2));

    let analysis = "No output";

    // this checks whether the groq api response in form or not , because groq send response in Api format 

    if (
      data &&
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      // it will taje only required response format 
      analysis = data.choices[0].message.content;
    }

    let parsedQuestions = {};

try {
  parsedQuestions = JSON.parse(analysis);
} catch (err) {
  return res.status(500).json({
    success: false,
    message: "AI returned invalid JSON",
  });
}

await User.findByIdAndUpdate(userId, {
  resumeText: text,
  jobDescription,
  questions: parsedQuestions,
  hasResume: true,
});

  
  // now response send back to frontend 
    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error("GROQ INTERVIEW ERROR:", error);
    res.status(500).json({ error: "AI interview generation failed" });
  }
};

module.exports = analyzeResume;



