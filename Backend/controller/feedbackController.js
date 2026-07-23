const InterviewSession = require("../models/InterviewSession");

exports.getFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { round } = req.query; // now requires ?round=Round1 in the URL

    const session = await InterviewSession.findOne({ sessionId });
    const feedback = round ? session?.feedbackByRound?.get(round) : null;

    if (!session || !feedback) {
      return res.status(404).json({ error: "Feedback not ready" });
    }

    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get feedback" });
  }
};