const InterviewSession = require("../models/InterviewSession");
const { generateGroqFeedback } = require("./groqFeedback");
const User=require("../models/users");

exports.endSession = async (req, res) => {
  try {
    const { sessionId,round } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID missing" });
    }

// finding session in db
    const session = await InterviewSession.findOne({ sessionId });
    console.log( session );

    if (!session || !round) {
      return res.status(404).json({ error: "Session or round not found" });
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

      console.log("req.userId:", req.userId);
console.log("round:", round);

    // generate Ai feedback
 const feedback = await generateGroqFeedback(combinedText);

 // $set stores or updates the score and result for the current round.
 //$addToSet records that the round has been completed, without adding duplicates.
 await User.findByIdAndUpdate(
  req.userId,
  {
    $set: {
      [`roundResults.${round}`]: {
        score: feedback.overallScore,
        result: feedback.result
      },
    },
     $addToSet: {
      completedRounds: round,
    },
  },
  { new: true }
);

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


