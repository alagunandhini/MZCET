import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateReportPDF } from "../utils/generateReportPDF";

const InterviewCompleted = ({
  answered,
  skipped,
  onNextRound,
  feedback,
  roundLabel,
  isDark,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const navigate = useNavigate();

  const isPass = feedback
    ? feedback.result?.toLowerCase().includes("pass")
    : true;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden font-sans transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-sky-50 via-white to-purple-50"
      }`}
    >
      {/* 🎉 Confetti — only on a pass */}
      {showConfetti && isPass && (
        <Confetti numberOfPieces={180} recycle={false} gravity={0.25} />
      )}

      <div className="relative w-full h-full flex items-center justify-center">
        {/* ================= LEFT SIDE: WELL DONE CARD ================= */}
        <div
          className={`absolute transition-all duration-700 ease-in-out z-20 px-4 w-full flex justify-center
          ${
            showFeedback
              ? "lg:left-0 lg:w-1/3 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto"
              : "left-1/2 -translate-x-1/2"
          }`}
        >
          <div
            className={`rounded-3xl border p-6 md:p-10 w-full max-w-[440px] text-center shadow-xl scale-90 md:scale-100 transition-colors duration-500 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/80"
                : "bg-white border-sky-100"
            }`}
          >
            <img
              src={isPass ? "completed logo.png" : "failed logo.png"}
              alt={isPass ? "Completed" : "Failed"}
              className="w-40 md:w-56 mx-auto -mt-20 md:-mt-28 mb-2 animate-float drop-shadow-md"
            />

            {(() => {
              return (
                <>
                  <h1
                    className={`text-2xl md:text-3xl font-bold mb-1 transition-colors duration-500 ${
                      isDark ? "text-slate-100" : "text-gray-800"
                    }`}
                  >
                    {isPass ? "Well Done 🎉" : "Try Again :("}
                  </h1>

                  <p
                    className={`mb-6 md:mb-8 text-sm md:text-base transition-colors duration-500 ${
                      isDark ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {isPass
                      ? "You've completed your Interview"
                      : "Don't worry — you can retry this round."}
                  </p>
                </>
              );
            })()}

            <div className="grid grid-cols-2 gap-2 md:gap-4 mb-8">
              <StatCard
                label="Score"
                value={feedback ? `${feedback.overallScore}` : "--"}
                isDark={isDark}
              />
              <StatCard
                label="Result"
                value={feedback ? feedback.result : "--"}
                color={isDark ? "text-sky-400" : "text-sky-500"}
                isDark={isDark}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-5 justify-center">
              <button
                onClick={() => setShowFeedback((prev) => !prev)}
                className={`py-3 px-6 md:px-10 rounded-full text-white text-sm font-semibold transition shadow-sm ${
                  isDark ? "bg-sky-500 hover:bg-sky-400" : "bg-sky-400 hover:bg-sky-500"
                }`}
              >
                {showFeedback ? "Hide Feedback" : "View Feedback"}
              </button>

              <button
                onClick={onNextRound}
                className={`py-3 px-6 md:px-10 rounded-full border text-sm font-semibold transition ${
                  isDark
                    ? "border-sky-500/50 text-sky-400 hover:bg-slate-700/50"
                    : "border-sky-300 text-sky-500 hover:bg-sky-50"
                }`}
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: FEEDBACK PANEL ================= */}
        <div
          className={`absolute right-0 top-0 h-full w-full lg:w-[70%] xl:w-[980px] shadow-2xl
          transition-transform duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-30 flex flex-col ${
            isDark ? "bg-slate-900" : "bg-white"
          }
          ${showFeedback ? "translate-x-0" : "translate-x-full"}`}
        >
          {!feedback ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="relative w-12 h-12">
                <div
                  className={`absolute inset-0 border-4 rounded-full ${
                    isDark ? "border-slate-700" : "border-gray-100"
                  }`}
                ></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p
                className={`text-sm font-medium animate-pulse ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Generating report...
              </p>
            </div>
          ) : (
            <>
              {/* ----- HEADER ----- */}
              <div
                className={`px-5 md:px-8 py-4 md:py-6 border-b sticky top-0 z-40 flex items-center justify-between backdrop-blur-md transition-colors duration-500 ${
                  isDark
                    ? "border-slate-700/80 bg-slate-900/80"
                    : "border-gray-100 bg-white/80"
                }`}
              >
                <div className="pr-2">
                  <h2
                    className={`text-lg md:text-xl font-bold transition-colors duration-500 ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    Performance Report
                  </h2>
                  <p
                    className={`text-[10px] font-medium uppercase tracking-wider transition-colors duration-500 ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    AI Evaluator
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const user = JSON.parse(
                        localStorage.getItem("user") || "{}",
                      );
                      await generateReportPDF(feedback, user, roundLabel);
                    }}
                    title="Download report as PDF"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs md:text-sm font-semibold transition ${
                      isDark
                        ? "border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
                        : "border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100"
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs md:text-sm
                        ${
                          feedback.performance_label === "Bad"
                            ? isDark
                              ? "bg-red-500/15 border-red-500/30 text-red-400"
                              : "bg-red-50 border-red-100 text-red-700"
                            : feedback.performance_label === "Average"
                              ? isDark
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                                : "bg-amber-50 border-amber-100 text-amber-700"
                              : isDark
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : "bg-emerald-50 border-emerald-100 text-emerald-700"
                        }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${feedback.performance_label === "Bad" ? "bg-red-500" : feedback.performance_label === "Average" ? "bg-amber-500" : "bg-emerald-500"}`}
                    ></div>
                    <span className="font-bold uppercase">
                      {feedback.performance_label}
                    </span>
                  </div>
                  {/* Mobile Close Button */}
                  <button
                    onClick={() => setShowFeedback(false)}
                    className={`lg:hidden p-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* ----- CONTENT ----- */}
              <div
                className={`flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar transition-colors duration-500 ${
                  isDark ? "bg-slate-900/60" : "bg-gray-50/50"
                }`}
              >
                {/* 1. Dashboard Grid */}
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
                  <div
                    className={`md:col-span-2 rounded-2xl p-5 md:p-6 border shadow-sm relative overflow-hidden transition-colors duration-500 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/80"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <h3
                      className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 transition-colors duration-500 ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      <IconSummary /> Summary
                    </h3>
                    <p
                      className={`leading-relaxed text-sm md:text-[15px] transition-colors duration-500 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {feedback.overall_feedback}
                    </p>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-5 md:p-6 shadow-lg text-white flex flex-row md:flex- justify-around md:justify-between items-center md:items-start border border-slate-700/50">
                    <CircularScore
                      label="Confidence"
                      value={feedback.communication.confidence_percentage}
                      color="#ec4899"
                    />
                    {/* <div className="hidden md:block w-full h-[1px] bg-slate-700 my-4"></div> */}
                    <div className="md: h-20 w-[1px] h-10 bg-slate-700 mx-2"></div>
                    <CircularScore
                      label="Clarity"
                      value={feedback.communication.clarity_percentage}
                      color="#8b5cf6"
                    />
                  </div>
                </div>

                {/* 2. Key Insights */}
                <div className="mb-10">
                  <h3
                    className={`text-base font-bold mb-4 transition-colors duration-500 ${
                      isDark ? "text-slate-100" : "text-slate-800"
                    }`}
                  >
                    Key Improvements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feedback.motivation_message.map((msg, i) => (
                      <div
                        key={i}
                        className={`border-l-4 border-amber-400 rounded-r-xl p-4 shadow-sm flex items-start gap-3 transition-colors duration-500 ${
                          isDark ? "bg-slate-800/90" : "bg-white"
                        }`}
                      >
                        <span className="text-amber-500 shrink-0">
                          <IconBulb />
                        </span>
                        <p
                          className={`text-xs md:text-sm font-medium transition-colors duration-500 ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          {msg}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Question Timeline */}
                <div className="relative">
                  <h3
                    className={`text-base font-bold mb-6 transition-colors duration-500 ${
                      isDark ? "text-slate-100" : "text-slate-800"
                    }`}
                  >
                    Detailed Q&A
                  </h3>
                  <div
                    className={`absolute left-3 md:left-4 top-10 bottom-0 w-0.5 transition-colors duration-500 ${
                      isDark ? "bg-slate-700" : "bg-gray-200"
                    }`}
                  ></div>

                  <div className="space-y-8 md:space-y-12">
                    {feedback.qa_feedback.map((item, index) => (
                      <div key={index} className="relative pl-10 md:pl-12">
                        <div
                          className={`absolute left-0 top-1 w-7 h-7 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center text-[10px] md:text-xs font-bold z-10 shadow-sm transition-colors duration-500 ${
                            isDark
                              ? "bg-slate-800 border-indigo-500/40 text-indigo-400"
                              : "bg-white border-indigo-100 text-indigo-600"
                          }`}
                        >
                          Q{index + 1}
                        </div>

                        <div>
                          <h4
                            className={`text-sm md:text-base font-semibold mb-4 pt-1 transition-colors duration-500 ${
                              isDark ? "text-slate-100" : "text-slate-900"
                            }`}
                          >
                            {item.question}
                          </h4>

                          <div className="grid grid-cols-1 gap-3 md:gap-4">
                            <div
                              className={`rounded-xl p-4 border shadow-sm transition-colors duration-500 ${
                                isDark
                                  ? "bg-slate-800/90 border-slate-700/80"
                                  : "bg-white border-slate-100"
                              }`}
                            >
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block transition-colors duration-500 ${
                                  isDark
                                    ? "bg-slate-700 text-slate-300"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                You Said
                              </span>
                              <p
                                className={`text-xs md:text-sm italic transition-colors duration-500 ${
                                  isDark ? "text-slate-300" : "text-slate-600"
                                }`}
                              >
                                "{item.user_answer}"
                              </p>
                            </div>

                            <div
                              className={`rounded-xl p-4 border shadow-sm transition-colors duration-500 ${
                                isDark
                                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30"
                                  : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100"
                              }`}
                            >
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block transition-colors duration-500 ${
                                  isDark
                                    ? "bg-indigo-500/20 text-indigo-300"
                                    : "bg-indigo-100 text-indigo-700"
                                }`}
                              >
                                AI Recommendation
                              </span>
                              <p
                                className={`text-xs md:text-sm font-medium transition-colors duration-500 ${
                                  isDark ? "text-slate-200" : "text-slate-800"
                                }`}
                              >
                                {item.improved_answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-10"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, isDark }) => (
  <div
    className={`rounded-xl border py-2 md:py-4 transition-colors duration-500 ${
      isDark ? "border-slate-700/80 bg-slate-700/30" : "border-sky-100 bg-sky-50/50"
    }`}
  >
    <p
      className={`text-[10px] md:text-xs font-medium transition-colors duration-500 ${
        isDark ? "text-slate-400" : "text-gray-500"
      }`}
    >
      {label}
    </p>
    <p className={`text-lg md:text-xl font-bold ${color || (isDark ? "text-sky-400" : "text-sky-500")}`}>
      {value}
    </p>
  </div>
);

const CircularScore = ({ label, value, color }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1 md:gap-2">
      <div className="relative w-12 h-12 md:w-16 md:h-16">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#334155"
            strokeWidth="3"
            fill="transparent"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-white">
          {value}%
        </div>
      </div>
      <span className="text-[10px] md:text-xs text-slate-400 font-medium uppercase">
        {label}
      </span>
    </div>
  );
};

const IconSummary = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconBulb = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.5 1.5-4.1 0-3.6-3.2-6.5-7-6.5C7.5 0.9 4.3 3.8 4.3 7.4c0 1.7.5 3.1 1.5 4.1.8.8 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
  </svg>
);

export default InterviewCompleted;