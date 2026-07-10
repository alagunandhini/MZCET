const InterviewSession = require("../models/InterviewSession");

exports.getFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({ sessionId });

    if (!session || !session.feedback) {
      return res.status(404).json({ error: "Feedback not ready" });
    }

    res.json(session.feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get feedback" });
  }
};
