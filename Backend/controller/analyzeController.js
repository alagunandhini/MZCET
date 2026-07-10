const analyzeResume = async (req, res) => {
  try {
    // getting resume text from from frontend
    const { text } = req.body;
 

    if (!text) {
      return res.status(400).json({ error: "No resume text received" });
    }

    const prompt = `
      You are an AI Interview Preparation Assistant.
      Analyze the following resume:

      --- RESUME TEXT ---
      ${text}
      --------------------

      Generate the following results in clean, structured sections:

      1️⃣ **10 Technical Interview Questions**
          - Based ONLY on the skills, education, and projects in the resume
          - Provide short, interview-style answers a fresher should tell

      2️⃣ **10 HR Interview Questions**
          - Provide correct sample answers

      3️⃣ **5 Project-Based Questions**
          - Based on the projects found in the resume
          - Provide “best way to answer”

      4️⃣ **2 Stress Interview Questions**
          - Provide strong, composed answers

      5️⃣ **3 Scenario-Based Questions**
          - Provide realistic situational answers

      Output Format (VERY IMPORTANT):
      {
        "Technical": [ {"q": "", "a": ""}, ... ],
        "HR": [ {"q": "", "a": ""}, ... ],
        "Project": [ {"q": "", "a": ""}, ... ],
        "Stress": [ {"q": "", "a": ""}, ... ],
        "Scenario": [ {"q": "", "a": ""}, ... ]
      }

      Return ONLY valid JSON. No markdown, no headings, no text outside JSON.

    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

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



