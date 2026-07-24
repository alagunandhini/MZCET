const InterviewSession = require("../models/InterviewSession");
const { generateGroqFeedback } = require("./groqFeedback");
const User = require("../models/users");

exports.endSession = async (req, res) => {
  try {
    const { sessionId, round, timeTaken } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID missing" });
    }

    const session = await InterviewSession.findOne({ sessionId });
    console.log(session);

    if (!session || !round) {
      return res.status(404).json({ error: "Session or round not found" });
    }


    // ---- ATTEMPT LIMIT CHECK ----
    const user = await User.findById(req.userId);
    const alreadyPassed = user.completedRounds.includes(round);
    const attemptsUsed = user.roundAttempts?.[round] || 0;

    if (!alreadyPassed && attemptsUsed >= 3) {
      return res.status(403).json({
        error: "No attempts remaining for this round",
      });
    }

    // --- PIECE A: don't re-grade a round that's already been graded ---
    if (
      session.completedRoundsInSession.includes(round) &&
      session.feedbackByRound.get(round)
    ) {
      return res.json({
        success: true,
        feedback: session.feedbackByRound.get(round),
      });
    }

    // --- PIECE B: pull out ONLY this round's answers ---
    const roundAnswers = session.answers.filter((a) => a.round === round);

    if (roundAnswers.length === 0) {
      return res.status(400).json({ error: "No answers found for this round" });
    }

    // --- PIECE C: build the text block to send to the AI ---
    const combinedText = roundAnswers
      .map((a, index) => `Q${index + 1}: ${a.question}\nA: ${a.transcript}`)
      .join("\n\n");
    console.log("Combined Text:", combinedText);
    console.log("req.userId:", req.userId);
    console.log("round:", round);

    // --- PIECE D: call Groq to grade it ---
    const feedback = await generateGroqFeedback(combinedText);

    // --- PIECE E: save the score onto the student's profile ---
    const isPass = feedback.result?.toLowerCase().includes("pass");

    const existingResult = user.roundResults?.[round];
    const isNewScoreBetter = !existingResult || feedback.overallScore > existingResult.score;

    const updateQuery = {
      $inc: {
        [`roundAttempts.${round}`]: 1,
      },
    };

    // Only overwrite the saved result if this attempt is the best one so far
    if (isNewScoreBetter) {
      updateQuery.$set = {
        [`roundResults.${round}`]: {
          score: feedback.overallScore,
          result: feedback.result,
        },
      };
    }

    // Time taken is saved for every attempt (not just the best-scoring one),
    // so it always reflects the most recent attempt's duration.
    updateQuery.$set = {
      ...(updateQuery.$set || {}),
      [`roundTimeTaken.${round}`]: timeTaken || 0,
    };

    if (isPass) {
      updateQuery.$addToSet = { completedRounds: round };
    }

    await User.findByIdAndUpdate(req.userId, updateQuery, { new: true });

    // --- PIECE F: safety net if AI returns wrong number of answers ---
    if (!feedback.qa_feedback) feedback.qa_feedback = [];

    if (feedback.qa_feedback.length !== roundAnswers.length) {
      console.warn(
        `qa_feedback length mismatch: got ${feedback.qa_feedback.length}, expected ${roundAnswers.length}`
      );
      feedback.qa_feedback = feedback.qa_feedback.slice(0, roundAnswers.length);
      for (let i = feedback.qa_feedback.length; i < roundAnswers.length; i++) {
        feedback.qa_feedback.push({
          question: roundAnswers[i].question,
          user_answer: roundAnswers[i].transcript || "(No answer provided)",
          improved_answer: "Feedback unavailable for this answer.",
        });
      }
    }

    // --- PIECE G: count answered vs skipped questions ---
    const attempted = roundAnswers.filter(
      (a) => a.transcript && a.transcript.trim().length > 0
    ).length;
    const skipped = roundAnswers.length - attempted;

    feedback.attempted_questions = attempted;
    feedback.skipped_questions = skipped;
    feedback.time_taken = timeTaken || 0;

    // --- PIECE H: save this round's result into its own slot ---
    session.feedbackByRound.set(round, feedback);
    if (!session.completedRoundsInSession.includes(round)) {
      session.completedRoundsInSession.push(round);
    }
    await session.save();

    res.json({ success: true, feedback });

  } catch (err) {
    console.error("end session error:", err);
    res.status(500).json({ error: "Failed to end session" });
  }
};

exports.terminateRound = async (req, res) => {
  try {
    const { sessionId, round } = req.body;

    if (!sessionId || !round) {
      return res.status(400).json({ error: "Session ID or round missing" });
    }

    const user = await User.findById(req.userId);
    const alreadyPassed = user.completedRounds.includes(round);
    const attemptsUsed = user.roundAttempts?.[round] || 0;

    if (alreadyPassed) {
      return res.json({ success: true, message: "Round already passed" });
    }

    if (attemptsUsed >= 3) {
      return res.status(403).json({ error: "No attempts remaining for this round" });
    }

    const existingResult = user.roundResults?.[round];
    const isNewScoreBetter = !existingResult || 0 > existingResult.score;

    const updateQuery = {
      $inc: {
        [`roundAttempts.${round}`]: 1,
      },
    };

    if (isNewScoreBetter) {
      updateQuery.$set = {
        [`roundResults.${round}`]: {
          score: 0,
          result: "FAIL",
        },
      };
    }

    await User.findByIdAndUpdate(req.userId, updateQuery, { new: true });

    const session = await InterviewSession.findOne({ sessionId });
    if (session) {
      session.terminatedForViolation = true;
      await session.save();
    }

    res.json({ success: true, message: "Round terminated due to violations" });

  } catch (err) {
    console.error("terminate round error:", err);
    res.status(500).json({ error: "Failed to terminate round" });
  }
};