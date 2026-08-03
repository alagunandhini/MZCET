import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ROUND_KEYS = ["Round1", "Round2", "Round3", "Round4"];

const StudentDetail = () => {
  const { registerNumber } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [rounds, setRounds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Which round is expanded, and which attempt within it (null = collapsed)
  const [openRound, setOpenRound] = useState(null);
  const [openAttempt, setOpenAttempt] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `http://localhost:3007/admin/students/${registerNumber}`
        );
        setStudent(res.data.student);
        setRounds(res.data.rounds);
      } catch (err) {
        console.error("Failed to fetch student detail", err);
        setError("Couldn't load this student's details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [registerNumber]);

  const toggleRound = (roundKey) => {
    setOpenRound((prev) => (prev === roundKey ? null : roundKey));
    setOpenAttempt(null);
  };

  const toggleAttempt = (key) => {
    setOpenAttempt((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Loading student details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <button
        onClick={() => navigate("/admin")}
        className="text-sky-600 text-sm font-semibold mb-6 hover:text-sky-700"
      >
        ← Back to Dashboard
      </button>

      {/* Student header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 flex flex-wrap items-center gap-x-8 gap-y-2">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Name</p>
          <p className="text-lg font-bold text-gray-800">{student.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Register No.</p>
          <p className="text-gray-700">{student.registerNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Department</p>
          <p className="text-gray-700">{student.department}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Year</p>
          <p className="text-gray-700">{student.year}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Logged In</p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              student.loggedIn
                ? "bg-emerald-50 text-emerald-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {student.loggedIn ? "true" : "false"}
          </span>
        </div>
      </div>

      {/* Per-round accordion */}
      <div className="space-y-4">
        {ROUND_KEYS.map((roundKey) => {
          const round = rounds[roundKey];
          const isOpen = openRound === roundKey;
          const isPass = round.bestResult?.toLowerCase().includes("pass");

          return (
            <div
              key={roundKey}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Round summary row — click to expand */}
              <button
                onClick={() => toggleRound(roundKey)}
                className="w-full flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-700">{roundKey}</span>
                  {round.bestScore !== null ? (
                    <span
                      className={`text-sm font-semibold ${
                        isPass ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      Best: {round.bestScore} ({round.bestResult})
                    </span>
                  ) : (
                    <span className="text-sm text-gray-300">Not attempted</span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>
                    Attempts: {round.attemptsUsed}/3 ({round.attemptsLeft} left)
                  </span>
                  {round.timeTaken !== null && (
                    <span>Last time: {Math.round(round.timeTaken / 60)}m</span>
                  )}
                  <span className="text-sky-500">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Expanded: list every attempt for this round */}
              {isOpen && (
                <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                  {round.attempts.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No attempts recorded for this round yet.
                    </p>
                  ) : (
                    round.attempts.map((attempt) => {
                      const attemptKey = `${roundKey}-${attempt.attemptNumber}`;
                      const attemptOpen = openAttempt === attemptKey;
                      const attemptIsPass = attempt.result
                        ?.toLowerCase()
                        .includes("pass");

                      return (
                        <div
                          key={attemptKey}
                          className="border border-gray-100 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => toggleAttempt(attemptKey)}
                            className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50/60 hover:bg-gray-100 transition text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-700 text-sm">
                                Attempt {attempt.attemptNumber}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  attemptIsPass
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-500"
                                }`}
                              >
                                {attempt.score} · {attempt.result}
                              </span>
                              {attempt.terminatedForViolation && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                                  Ended by violation
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(attempt.date).toLocaleString()}
                            </span>
                          </button>

                          {attemptOpen && (
                            <div className="px-4 py-4 space-y-4">
                              {/* Quick stats */}
                              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                                <span>
                                  Answered: {attempt.attemptedQuestions} · Skipped:{" "}
                                  {attempt.skippedQuestions}
                                </span>
                                <span>
                                  Confidence: {attempt.communication?.confidence_percentage}%
                                </span>
                                <span>
                                  Clarity: {attempt.communication?.clarity_percentage}%
                                </span>
                                <span className="font-medium text-gray-500">
                                  {attempt.performanceLabel}
                                </span>
                              </div>

                              {/* Overall feedback */}
                              <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4">
                                <p className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-1">
                                  Summary
                                </p>
                                <p className="text-sm text-gray-700">
                                  {attempt.overallFeedback}
                                </p>
                              </div>

                              {/* Q&A list */}
                              <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                  Questions & Answers
                                </p>
                                {attempt.qaFeedback?.map((qa, i) => (
                                  <div
                                    key={i}
                                    className="border border-gray-100 rounded-xl p-4"
                                  >
                                    <p className="text-sm font-semibold text-gray-800 mb-2">
                                      Q{i + 1}. {qa.question}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="bg-gray-50 rounded-lg p-3">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                                          Student Answered
                                        </span>
                                        <p className="text-sm text-gray-600 italic mt-1">
                                          {qa.user_answer || "(No answer provided)"}
                                        </p>
                                      </div>
                                      <div className="bg-indigo-50/50 rounded-lg p-3">
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                                          AI Suggested Answer
                                        </span>
                                        <p className="text-sm text-gray-700 mt-1">
                                          {qa.improved_answer}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDetail;