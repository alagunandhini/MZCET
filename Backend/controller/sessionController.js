const InterviewSession = require("../models/InterviewSession");
const { generateGroqFeedback } = require("./groqFeedback");

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID missing" });
    }

// finding session in db
    const session = await InterviewSession.findOne({ sessionId });
    console.log( session );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // User refreshes feedback page ,Avoid calling AI again ,Saves API cost
      if (session.completed && session.feedback) {
      return res.json({
        success: true,
        feedback: session.feedback,
      });
    }

    // Combine all transcripts
      const combinedText = session.answers
      .map(
        (a, index) =>
          `Q${index + 1}: ${a.question}\nA: ${a.transcript}`
      )
      .join("\n\n");
      console.log("Combined Text:", combinedText);


    // generate Ai feedback
 const feedback = await generateGroqFeedback(combinedText);

 // HARD VALIDATION — MUST EXIST
if (
  !feedback.qa_feedback ||
  feedback.qa_feedback.length !== session.answers.length
) {
  throw new Error(
    `AI returned ${feedback.qa_feedback?.length || 0} feedbacks, but expected ${session.answers.length}`
  );
}

const attempted = session.answers.filter(
  a => a.transcript && a.transcript.trim().length > 0
).length;

const skipped = session.answers.length - attempted;

feedback.attempted_questions = attempted;
feedback.skipped_questions = skipped;


// save feedback in db
    session.feedback = feedback;
    session.completed = true;
    await session.save();

    res.json({ success: true, feedback });

  } catch (err) {
    console.error("end session error:",err);
    res.status(500).json({ error: "Failed to end session" });
  }
};


