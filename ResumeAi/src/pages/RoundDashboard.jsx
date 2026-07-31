import { useState } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import {  AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Clock,
  HelpCircle,
  RotateCcw,
  Star,
  Lock,
  CheckCircle2,
  ChevronLeft,
  XCircle,
  User,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

const MAX_ATTEMPTS = 3;
const display = { fontFamily: "'Sora', system-ui, sans-serif" };

const RoundDashboard = ({
  questions,
  completedRounds,
  roundAttempts,
  setCurrentIndex,
  setTransitionLoading,
  setTransitionText,
  setStartPractice,
  setSectionIndex,
  setShowQuestionsUI,
  setSessionId,
  username,
  handleLogout,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const rounds = Object.keys(questions).map((key, index) => ({
    id: index,
    key: key,
    title: `Round ${index + 1}`,
    name: questions[key].name,
    questions: questions[key].questions.length,
    // Was hardcoded to "10 Minutes" — didn't match the actual 30-minute
    // round limit (ROUND_TIME_LIMIT_SECONDS in Resume.jsx).
    time: "30 Minutes",
  }));

  const isRoundFinalized = (roundKey) => {
    const isPassed = completedRounds.includes(roundKey);
    const attemptsUsed = roundAttempts?.[roundKey] || 0;
    return isPassed || attemptsUsed >= MAX_ATTEMPTS;
  };

  const getRoundState = (round) => {
    const isPassed = completedRounds.includes(round.key);
    const attemptsUsed = roundAttempts?.[round.key] || 0;
    const attemptsLeft = Math.max(MAX_ATTEMPTS - attemptsUsed, 0);
    const isOutOfAttempts = !isPassed && attemptsUsed >= MAX_ATTEMPTS;

    const isCompleted = isPassed || isOutOfAttempts;

    const prevRoundLocked =
      round.id !== 0 && !isRoundFinalized(rounds[round.id - 1]?.key);

    return { isPassed, attemptsUsed, attemptsLeft, isOutOfAttempts, isCompleted, prevRoundLocked };
  };

  const startRound = (round) => {
    const { prevRoundLocked, isOutOfAttempts, isPassed } = getRoundState(round);
    if (prevRoundLocked || isOutOfAttempts || isPassed) return;
    document.documentElement.requestFullscreen?.().catch((err) => {
      console.warn("Fullscreen request failed/denied:", err);
    });

    // Always mint a brand new session for this attempt, right here at the
    // moment it starts — not just when leaving a finished round. If a stale
    // sessionId from a previous attempt ever carried over (e.g. via a page
    // refresh before the post-round regeneration ran), endSession's
    // "already has feedback for this session" check would short-circuit
    // and return the OLD attempt's cached scorecard instead of grading a
    // new one — and attemptsUsed would never increment. Regenerating here
    // guarantees every attempt gets a genuinely fresh session regardless of
    // how the previous one ended.
    setSessionId(uuidv4());

    setSectionIndex(round.id);
    setCurrentIndex(0);

    setTransitionText(`${round.title} Starting...`);
    setTransitionLoading(true);

    setTimeout(() => {
      setTransitionLoading(false);
      setStartPractice(true);
    }, 2000);
  };

  const onLogoutClick = () => {
    setShowProfileMenu(false);
    handleLogout?.();
  };

  const cardVariants = (isLocked) => ({
    rest: { y: 0 },
    hover: { y: isLocked ? 0 : -4 },
  });

  const lockIconVariants = {
    rest: { rotate: 0 },
    hover: {
      rotate: [0, -18, 15, -10, 6, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <div
      className={`min-h-screen p-3 sm:p-4 md:p-6 transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100"
          : "bg-gradient-to-br from-sky-50 via-white to-sky-50 text-gray-800"
      }`}
    >
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
        {/* LEFT ROBOT SECTION */}
        <div className="w-full md:w-[26%] md:sticky md:top-6 flex flex-col gap-4">
          <div
            className={`rounded-2xl shadow-sm border flex flex-row md:flex-col items-center justify-start md:justify-center p-4 md:p-6 gap-3 md:gap-0 transition-colors duration-500 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/80 shadow-slate-950/20"
                : "bg-white border-sky-100"
            }`}
          >
            <motion.img
              src="/completed logo.png"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-56 md:h-56 object-contain drop-shadow-md"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="text-left md:text-center md:mt-5">
              <h2
                className={`text-base sm:text-lg md:text-xl font-bold leading-snug transition-colors duration-500 ${
                  isDark ? "text-slate-100" : "text-gray-800"
                }`}
                style={display}
              >
                Hi, {username}
              </h2>
              <p
                className={`text-sm md:text-md md:mt-2 transition-colors duration-500 ${
                  isDark ? "text-slate-300" : "text-gray-500"
                }`}
              >
                Let's prepare together for your next interview!
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl shadow-sm border flex flex-col items-center p-5 md:p-6 transition-colors duration-500 ${
              isDark ? "bg-slate-800/90 border-slate-700/80" : "bg-white border-sky-100"
            }`}
          >
            {(() => {
              const totalRounds = rounds.length;
              const completed = new Set(completedRounds).size;
              const percent = totalRounds > 0 ? Math.min((completed / totalRounds) * 100, 100) : 0;
              const radius = 55;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (percent / 100) * circumference;

              return (
                <>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide mb-3 self-start transition-colors duration-500 ${
                      isDark ? "text-slate-400" : "text-gray-400"
                    }`}
                  >
                    Your Progress
                  </p>
                  <div className="relative w-36 h-36 flex items-center justify-center my-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke={isDark ? "#334155" : "#e0f2fe"}
                        strokeWidth="10"
                        fill="transparent"
                        className="transition-colors duration-500"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke={isDark ? "#38bdf8" : "#38bdf8"}
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className={`text-2xl font-bold transition-colors duration-500 ${
                          isDark ? "text-sky-400" : "text-sky-500"
                        }`}
                      >
                        {Math.round(percent)}%
                      </span>
                      <span
                        className={`text-xs font-medium mt-1 transition-colors duration-500 ${
                          isDark ? "text-slate-400" : "text-gray-400"
                        }`}
                      >
                        {completed}/{totalRounds} Rounds
                      </span>
                    </div>
                  </div>
                  {percent === 100 && (
                    <p
                      className={`text-sm font-semibold text-center transition-colors duration-500 mt-2 ${
                        isDark ? "text-slate-300" : "text-gray-500"
                      }`}
                    >
                      🎉 Congrats! You've completed the interview
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* RIGHT DASHBOARD */}
        <div className="w-full md:w-[78%]">
          <div
            className={`rounded-2xl p-4 md:p-5 shadow-sm border flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6 transition-colors duration-500 ${
              isDark ? "bg-slate-800/90 border-slate-700/80" : "bg-white border-sky-100"
            }`}
          >
            <div>
              <h1
                className={`text-lg sm:text-xl md:text-2xl font-bold transition-colors duration-500 ${
                  isDark ? "text-slate-100" : "text-gray-800"
                }`}
              >
                Interview Dashboard
              </h1>
              <p
                className={`text-xs sm:text-sm md:text-base transition-colors duration-500 ${
                  isDark ? "text-slate-300" : "text-gray-500"
                }`}
              >
                Complete your rounds and improve your score
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* DARK MODE TOGGLE */}
              <button
                onClick={() => setIsDark((v) => !v)}
                aria-label="Toggle dark mode"
                className={`relative flex items-center h-8 w-16 sm:h-9 sm:w-[4.5rem] rounded-full border-none transition-colors duration-500 shadow-inner focus:outline-none ${
                  isDark
                    ? "bg-slate-700 focus-visible:ring-2 focus-visible:ring-sky-400"
                    : "bg-gradient-to-r from-amber-100 to-sky-100 focus-visible:ring-sky-400"
                }`}
              >
                <span className="absolute left-1.5 text-amber-500">
                  <Sun size={13} className={isDark ? "opacity-40" : "opacity-100"} />
                </span>
                <span className="absolute right-1.5 text-slate-300">
                  <Moon size={13} className={isDark ? "opacity-100" : "opacity-40"} />
                </span>
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`z-10 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full shadow-md ${
                    isDark ? "bg-sky-500 text-white" : "bg-gradient-to-br from-white to-sky-50"
                  }`}
                  style={{ marginLeft: isDark ? "calc(100% - 1.65rem)" : "0.15rem" }}
                >
                  {isDark ? (
                    <Moon size={13} className="text-white" />
                  ) : (
                    <Sun size={13} className="text-amber-500" />
                  )}
                </motion.span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm transition hover:opacity-90 ${
                    isDark
                      ? "bg-gradient-to-br from-sky-500 to-indigo-600"
                      : "bg-gradient-to-br from-sky-400 to-blue-600"
                  }`}
                >
                  {username ? username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border p-4 shadow-xl transition-colors duration-500 ${
                          isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <span
                            className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${
                              isDark
                                ? "bg-gradient-to-br from-sky-500 to-indigo-600"
                                : "bg-gradient-to-br from-sky-400 to-blue-600"
                            }`}
                          >
                            {username ? username.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                          </span>
                          <p
                            className={`mt-2 text-sm font-bold transition-colors duration-500 ${
                              isDark ? "text-slate-100" : "text-slate-900"
                            }`}
                          >
                            {username || "User"}
                          </p>
                        </div>

                        <button
                          onClick={onLogoutClick}
                          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold transition ${
                            isDark
                              ? "border-slate-700 text-slate-300 hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-300"
                              : "border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                          }`}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ROUND CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {rounds.map((round) => {
              const { isPassed, isOutOfAttempts, isCompleted, attemptsLeft, prevRoundLocked } = getRoundState(round);
              const isLocked = prevRoundLocked;

              return (
                <motion.div
                  key={round.id}
                  initial="rest"
                  whileHover="hover"
                  variants={cardVariants(isLocked)}
                  className={`relative rounded-2xl p-4 md:p-6 shadow-sm border transition-all duration-500 ${
                    isDark
                      ? isLocked
                        ? "bg-slate-800/50 border-slate-700/50 opacity-60"
                        : "bg-slate-800/90 border-slate-700/80 hover:shadow-lg hover:shadow-sky-500/10 hover:border-sky-400/50"
                      : isLocked
                      ? "bg-white border-gray-100 opacity-60"
                      : "bg-white border-sky-100 hover:shadow-lg hover:border-sky-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h2
                      className={`text-lg md:text-xl font-bold transition-colors duration-500 ${
                        isDark ? "text-slate-100" : "text-gray-800"
                      }`}
                    >
                      {round.title}
                    </h2>

                    {isPassed && (
                      <span
                        className={`flex items-center gap-1 font-semibold text-xs sm:text-sm px-2.5 py-1 rounded-full ${
                          isDark ? "text-emerald-400 bg-emerald-500/15" : "text-emerald-500 bg-emerald-50"
                        }`}
                      >
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    )}

                    {isOutOfAttempts && (
                      <span
                        className={`flex items-center gap-1 font-semibold text-xs sm:text-sm px-2.5 py-1 rounded-full ${
                          isDark ? "text-red-400 bg-red-500/15" : "text-red-500 bg-red-50"
                        }`}
                      >
                        <XCircle size={14} /> Failed
                      </span>
                    )}

                    {!isCompleted && !isLocked && (
                      <span
                        className={`flex items-center gap-1 font-semibold text-xs sm:text-sm px-2.5 py-1 rounded-full ${
                          isDark ? "text-sky-400 bg-sky-500/15" : "text-sky-500 bg-sky-50"
                        }`}
                      >
                        <CheckCircle2 size={14} /> Ready
                      </span>
                    )}

                    {!isCompleted && isLocked && (
                      <span
                        className={`flex items-center gap-1 text-xs sm:text-sm px-2.5 py-1 rounded-full ${
                          isDark ? "text-slate-400 bg-slate-700" : "text-gray-400 bg-gray-50"
                        }`}
                      >
                        <Lock size={12} /> Locked
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-2 md:mt-3 text-sm md:text-base transition-colors duration-500 ${
                      isDark ? "text-slate-300" : "text-gray-500"
                    }`}
                  >
                    {round.name}
                  </p>

                  <div
                    className={`mt-4 md:mt-5 space-y-2 md:space-y-2.5 text-xs sm:text-sm transition-colors duration-500 ${
                      isDark ? "text-slate-300" : "text-gray-600"
                    }`}
                  >
                    <p className="flex items-center gap-2">
                      <Clock size={14} className={isDark ? "text-sky-400 shrink-0" : "text-sky-400 shrink-0"} />
                      Duration :{" "}
                      <span className={`font-semibold ${isDark ? "text-slate-100" : "text-gray-700"}`}>
                        {round.time}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <HelpCircle size={14} className={isDark ? "text-sky-400 shrink-0" : "text-sky-400 shrink-0"} />
                      Questions :{" "}
                      <span className={`font-semibold ${isDark ? "text-slate-100" : "text-gray-700"}`}>
                        {round.questions}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <RotateCcw size={14} className={isDark ? "text-sky-400 shrink-0" : "text-sky-400 shrink-0"} />
                      Attempts Left :{" "}
                      <span className={`font-semibold ${isDark ? "text-sky-400" : "text-sky-500"}`}>
                        {isCompleted ? "-" : attemptsLeft}
                      </span>
                    </p>
                  </div>

                  <button
                    disabled={isLocked || isCompleted}
                    onClick={() => startRound(round)}
                    className={`mt-4 md:mt-6 w-full py-2.5 md:py-3 text-sm md:text-base rounded-xl font-semibold border-none transition shadow-sm ${
                      isLocked || isCompleted
                        ? isDark
                          ? "bg-slate-700/60 text-slate-500 cursor-not-allowed shadow-none"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : isDark
                        ? "bg-sky-500 text-white hover:bg-sky-400 hover:shadow-md hover:shadow-sky-500/20"
                        : "bg-sky-400 text-white hover:bg-sky-500 hover:shadow-md"
                    }`}
                  >
                    {isPassed ? "Completed" : isOutOfAttempts ? "Failed" : isLocked ? "Locked" : "Start Round"}
                  </button>

                  {/* Centered overlay — blurred backdrop showing round title + lock icon */}
                  {isLocked && (
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl backdrop-blur-[1.5px] pointer-events-none ${
                        isDark ? "bg-slate-900/60" : "bg-white/50"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-black"}`}>
                        {round.title}
                      </span>
                      <motion.div variants={lockIconVariants}>
                        <Lock size={32} className={isDark ? "text-slate-400" : "text-gray-700"} strokeWidth={1.75} />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* BACK BUTTON */}
          <div className="flex justify-end mt-4 md:mt-6">
            <button
              onClick={() => {
                setTransitionText("Back To Upload Page...");
                setTransitionLoading(true);
                setTimeout(() => {
                  setTransitionLoading(false);
                  setShowQuestionsUI(false);
                }, 2000);
              }}
              className={`flex items-center gap-1.5 px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-medium rounded-full border-none shadow-sm transition-colors duration-500 ${
                isDark
                  ? "bg-slate-800 text-sky-400 hover:bg-slate-700/80"
                  : "bg-white text-sky-500 hover:bg-sky-50"
              }`}
            >
              <ChevronLeft size={16} />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundDashboard;