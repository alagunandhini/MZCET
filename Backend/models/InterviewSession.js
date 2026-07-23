const mongoose = require("mongoose");

const QAFeedbackSchema = new mongoose.Schema({
  question: { type: String, required: true },
  user_answer: { type: String, default: "" },
  improved_answer: { type: String, required: true },
});

const CommunicationSchema = new mongoose.Schema({
  confidence_percentage: { type: Number, required: true },
  clarity_percentage: { type: Number, required: true },
});

const FeedbackSchema = new mongoose.Schema({
  overallScore: { type: Number, required: true },
  result: { type: String, enum: ["PASS", "FAIL"], required: true },
  performance_label: { type: String, enum: ["Extraordinary", "Good", "Average", "Bad"], required: true },
  attempted_questions: { type: Number, required: true },
  skipped_questions: { type: Number, required: true },
  communication: { type: CommunicationSchema, required: true },
  overall_feedback: { type: String, required: true },
  motivation_message: [{ type: String, required: true }],
  qa_feedback: [QAFeedbackSchema],
});

const AnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  transcript: { type: String },
  round: { type: String, required: true },
});

const InterviewSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  answers: [AnswerSchema],
  feedbackByRound: {
    type: Map,
    of: FeedbackSchema,
    default: {},
  },
  completedRoundsInSession: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);