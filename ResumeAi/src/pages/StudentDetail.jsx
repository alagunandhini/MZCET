import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Clock, RotateCcw, AlertTriangle, ChevronDown, ChevronRight, Hash } from "lucide-react";
import { API_URL } from "../config";

const ROUND_KEYS = ["Round1", "Round2", "Round3", "Round4"];

const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token");

const fmtDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const ScorePill = ({ label, value }) => (
  <div className="flex flex-col items-center bg-white border border-sky-100 rounded-xl px-3 py-2 min-w-[84px]">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    <span className="text-lg font-extrabold text-sky-600">
      {value === null || value === undefined ? "—" : value}
    </span>
  </div>
);

const StudentDetail = () => {
  const { registerNumber } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [rounds, setRounds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openRound, setOpenRound] = useState(null);
  const [openAttempt, setOpenAttempt] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/admin/students/${registerNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    setOpenQuestion(null);
  };

  const toggleAttempt = (key) => {
    setOpenAttempt((prev) => (prev === key ? null : key));
    setOpenQuestion(null);
  };

  const toggleQuestion = (key) => {
    setOpenQuestion((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-400 text-sm">
        Loading student details…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-rose-500 text-sm">
        {error}
      </div>
    );
  }

  if (!student || !rounds) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div className="bg-sky-900">
        <div className="mx-auto max-w-5xl px-6 md:px-10 py-7">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 text-sky-200 text-sm font-semibold mb-3 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">
            Session Detail
          </p>
          <h1
            className="text-2xl md:text-[28px] font-extrabold text-white tracking-tight mt-1"
            style={{ fontFamily: "'Manrope', ui-sans-serif" }}
          >
            {student.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 md:px-10 -mt-6 pb-10">
        {/* Student header card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_14px_rgba(15,23,42,0.05)] p-6 mb-6 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Register No.</p>
            <p className="text-slate-700 font-semibold">{student.registerNumber}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Department</p>
            <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
              {student.department}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Year</p>
            <p className="text-slate-700">{student.year}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</p>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                student.loggedIn ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${student.loggedIn ? "bg-sky-500" : "bg-slate-400"}`} />
              {student.loggedIn ? "Online" : "Offline"}
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
                className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.05)] overflow-hidden"
              >
                <button
                  onClick={() => toggleRound(roundKey)}
                  className="w-full flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-left hover:bg-sky-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isOpen ? <ChevronDown className="h-4 w-4 text-sky-400" /> : <ChevronRight className="h-4 w-4 text-sky-300" />}
                    <span className="font-bold text-slate-700">{roundKey}</span>
                    {round.bestScore !== null ? (
                      <span className={`text-sm font-bold ${isPass ? "text-sky-600" : "text-rose-500"}`}>
                        Best: {round.bestScore} ({round.bestResult})
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">Not attempted</span>
                    )}
                  </div>

                  <div className="flex items-center gap-5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" /> {round.attemptsUsed}/3 used ({round.attemptsLeft} left)
                    </span>
                    {round.timeTaken !== null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {fmtDuration(round.timeTaken)}
                      </span>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-sky-50 px-6 py-4 space-y-3 bg-sky-50/20">
                    {round.attempts.length === 0 ? (
                      <p className="text-sm text-slate-400">No attempts recorded for this round yet.</p>
                    ) : (
                      round.attempts.map((attempt) => {
                        const attemptKey = `${roundKey}-${attempt.attemptNumber ?? attempt.sessionId}`;
                        const attemptOpen = openAttempt === attemptKey;
                        const attemptIsPass = attempt.result?.toLowerCase().includes("pass");

                        return (
                          <div key={attemptKey} className="border border-sky-100 rounded-xl overflow-hidden bg-white">
                            <button
                              onClick={() => toggleAttempt(attemptKey)}
                              className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-sky-50/60 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                {attemptOpen ? <ChevronDown className="h-3.5 w-3.5 text-sky-400" /> : <ChevronRight className="h-3.5 w-3.5 text-sky-300" />}
                                <span className="font-semibold text-slate-700 text-sm">
                                  Attempt {attempt.attemptNumber ?? "—"}
                                </span>
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    attemptIsPass ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-500"
                                  }`}
                                >
                                  {attempt.score} · {attempt.result}
                                </span>
                                {attempt.terminatedForViolation && (
                                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                                    <AlertTriangle className="h-3 w-3" /> Ended by violation
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">
                                {attempt.date ? new Date(attempt.date).toLocaleString() : "—"}
                              </span>
                            </button>

                            {attemptOpen && (
                              <div className="px-4 py-4 space-y-5 border-t border-sky-50">
                                {/* Interview Details */}
                                <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" /> Session: <b className="text-slate-700 font-mono">{attempt.sessionId}</b>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Duration: <b className="text-slate-700">{fmtDuration(attempt.durationSeconds)}</b>
                                  </span>
                                  <span>Answered: <b className="text-slate-700">{attempt.attemptedQuestions}</b></span>
                                  <span>Skipped: <b className="text-slate-700">{attempt.skippedQuestions}</b></span>
                                  <span className="font-semibold text-sky-500">{attempt.performanceLabel}</span>
                                </div>

                                {/* Score breakdown */}
                                <div className="flex flex-wrap gap-3">
                                  <ScorePill label="Overall" value={attempt.score} />
                                  <ScorePill label="Confidence" value={attempt.communication?.confidence_percentage} />
                                  <ScorePill label="Clarity" value={attempt.communication?.clarity_percentage} />
                                  <ScorePill label="Technical" value={attempt.technicalScore} />
                                  <ScorePill label="Grammar" value={attempt.grammarScore} />
                                  <ScorePill label="Fluency" value={attempt.fluencyScore} />
                                </div>

                                {/* Overall feedback */}
                                <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-4">
                                  <p className="text-[11px] font-bold text-sky-500 uppercase tracking-wide mb-1">Summary</p>
                                  <p className="text-sm text-slate-700">{attempt.overallFeedback}</p>
                                </div>

                                {/* Round Analysis: strengths / weaknesses / suggestions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-4">
                                    <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wide mb-2">Strengths</p>
                                    {attempt.strengths?.length ? (
                                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                                        {attempt.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                      </ul>
                                    ) : (
                                      <p className="text-sm text-slate-400">—</p>
                                    )}
                                  </div>
                                  <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4">
                                    <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wide mb-2">Weaknesses</p>
                                    {attempt.weaknesses?.length ? (
                                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                                        {attempt.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                      </ul>
                                    ) : (
                                      <p className="text-sm text-slate-400">—</p>
                                    )}
                                  </div>
                                </div>

                                {attempt.finalSuggestions && (
                                  <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-4">
                                    <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wide mb-1">Final Suggestions</p>
                                    <p className="text-sm text-slate-700">{attempt.finalSuggestions}</p>
                                  </div>
                                )}

                                {/* Q&A accordion */}
                                <div className="space-y-2">
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                    Questions &amp; Answers ({attempt.qaFeedback?.length || 0})
                                  </p>
                                  {attempt.qaFeedback?.map((qa, i) => {
                                    const qKey = `${attemptKey}-q${i}`;
                                    const qOpen = openQuestion === qKey;
                                    return (
                                      <div key={qKey} className="border border-sky-100 rounded-xl overflow-hidden">
                                        <button
                                          onClick={() => toggleQuestion(qKey)}
                                          className="w-full flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-sky-50/50 transition-colors"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            {qOpen ? <ChevronDown className="h-3.5 w-3.5 text-sky-400 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-sky-300 shrink-0" />}
                                            <span className="text-sm font-semibold text-slate-800 truncate">
                                              Q{qa.questionNumber ?? i + 1}. {qa.question}
                                            </span>
                                          </div>
                                          {qa.question_score !== null && qa.question_score !== undefined && (
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                              qa.question_score >= 50 ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-500"
                                            }`}>
                                              {qa.question_score}
                                            </span>
                                          )}
                                        </button>

                                        {qOpen && (
                                          <div className="px-4 py-3 border-t border-sky-50 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              <div className="bg-slate-50 rounded-lg p-3">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Student Answered</span>
                                                <p className="text-sm text-slate-600 italic mt-1">
                                                  {qa.user_answer || "(No answer provided)"}
                                                </p>
                                              </div>
                                              <div className="bg-sky-50/60 rounded-lg p-3">
                                                <span className="text-[10px] font-bold text-sky-600 uppercase">AI Suggested Answer</span>
                                                <p className="text-sm text-slate-700 mt-1">{qa.improved_answer}</p>
                                              </div>
                                            </div>
                                            {qa.question_feedback && (
                                              <div className="bg-sky-50/60 rounded-lg p-3">
                                                <span className="text-[10px] font-bold text-sky-500 uppercase">AI Feedback</span>
                                                <p className="text-sm text-slate-700 mt-1">{qa.question_feedback}</p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
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
    </div>
  );
};

export default StudentDetail;