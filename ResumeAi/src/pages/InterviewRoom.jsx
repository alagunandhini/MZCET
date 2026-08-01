import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";



const InterviewRoom = ({
  sectionName,
  seconds,
  activeSection,
  currentIndex,
  questions,
  computedSection,
  isSpeaking,
  isRecording,
  startRecording,
  stopRecording,
  skipQuestion,
  setShowExitModal,
  setSessionId,
  mediaRecorderRef,
  setIsRecording,
  setCurrentIndex,
  SetActiveSection,
  isDark,
  setIsDark,
}) => {

  const totalQuestions = questions[computedSection]?.questions?.length || 0;

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };
  const progress =
    totalQuestions > 0
      ? ((currentIndex + 1) / totalQuestions) * 100
      : 0;

  // Single timer badge, now shown centered above the question box for all
  // screen sizes (no longer split into a top-row desktop version and a
  // separate mobile version).
  const TimerBadge = () => (
    <div
      className={`flex items-center gap-1 font-mono font-bold tracking-widest text-base sm:text-lg md:text-xl px-3 py-1 sm:px-4 sm:py-1.5 rounded-md shadow-sm border whitespace-nowrap transition-colors duration-500 ${
        isDark
          ? "bg-slate-800 text-slate-100 border-slate-600"
          : "bg-white text-black border-gray-300"
      }`}
    >
      {formatTime(seconds)}
    </div>
  );

  return (

    <>
      {/* Page 3 - Practice Question */}

      <div
        className={`w-full min-h-screen flex flex-col items-center transition-colors duration-500 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100"
            : "bg-gradient-to-br from-sky-50 via-white to-sky-50 text-gray-800"
        }`}
      >


        {/* HEADER - always stays at the very top */}
        <div className="w-full text-center relative">
          <p
            className={`text-xl font-bold p-2 transition-colors duration-500 ${
              isDark ? "bg-slate-800 text-slate-100" : "bg-sky-300 text-gray-50"
            }`}
          >
            {sectionName} Round
          </p>
        </div>

        {/* TOP SECTION - Progress bar + Exit button, back to original layout.
            Mobile top margin trimmed (mt-2, was mt-6) — part of the overall
            mobile spacing tightening below the bottom buttons too. */}
        <div className="w-full flex items-center px-4 md:px-10 pt-3 mt-2 md:mt-6 md:pt-2 gap-3 md:gap-6">
          {/* Progress Bar — back to flex-1, taking all remaining space */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <p
                className={`font-semibold text-xs sm:text-sm md:text-base transition-colors duration-500 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Question {currentIndex + 1} of {totalQuestions}
              </p>
              <p
                className={`font-bold text-xs sm:text-sm md:text-base transition-colors duration-500 ${
                  isDark ? "text-sky-400" : "text-sky-500"
                }`}
              >
                {Math.round(progress)}%
              </p>
            </div>
            <div
              className={`w-full h-2.5 md:h-4 rounded-full overflow-hidden transition-colors duration-500 ${
                isDark ? "bg-slate-700" : "bg-gray-200"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isDark ? "bg-sky-500" : "bg-sky-400"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Exit button — back to original layout */}
          <div className="flex justify-end gap-2 shrink-0">
            <button
              onClick={() => setShowExitModal(true)}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-white shadow transition text-xs sm:text-sm md:text-base ${
                isDark
                  ? "bg-sky-500 hover:bg-sky-400"
                  : "bg-sky-300 hover:bg-sky-200"
              }`}
              title="Go Home"
            >
              Exit
            </button>
          </div>
        </div>

        {/* WRAPPER - only logo, question box, mic, skip go here. This is what moves down / centers on mobile */}
        <div className="w-full flex flex-col items-center ">

          {/* Timer — centered, with enough top margin to clear the progress
              bar above it (mt-1 was too tight and made it look like it was
              overlapping). LEFT SECTION's margin below is trimmed slightly
              to compensate so mobile still fits without scrolling. */}
          <div className="flex justify-center mt-10 mb-1">
            <TimerBadge />
          </div>

          {/* LEFT SECTION — mobile top margin trimmed further (mt-1) to
              offset the timer's added mt-3; desktop margin (md:mt-5) unchanged */}
          <div className="flex flex-col md:flex-row w-full px-6 md:px-10 mt-1 md:mt-5 gap-2 md:gap-4">
            {/* ROBOT */}
            <div className="flex justify-center md:w-1/4 w-full">
              <div className="flex flex-col items-center">
                <motion.img
                  src="completed logo.png"
                  className="w-28 h-28 sm:w-36 sm:h-36 md:w-70 md:h-70 me-4"
                  initial={{}}
                  animate={{
                    scale: isSpeaking ? [1, 1.04, 1] : 1,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: isSpeaking ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                />
                {/* voice wave in bottom of robot */}
                {isSpeaking ? (
                  <div className="flex gap-2 mt-1 mb-4">
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        className={`w-2 h-6 rounded-full transition-colors duration-500 ${
                          isDark ? "bg-sky-400" : "bg-sky-300"
                        }`}
                        animate={{ scaleY: [1, 2, 1] }}
                        transition={{
                          duration: 0.5,

                          repeat: Infinity,

                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center mt-1 font-medium text-sm md:text-base transition-colors duration-500 ${
                      isDark ? "text-slate-300" : "text-gray-600"
                    }`}
                  >
                    Hi,I'm your interviewer! <br />
                    <span className={isDark ? "text-slate-300" : "text-gray-600"}>
                      Start speaking When You Are Ready{" "}
                    </span>
                  </motion.p>
                )}
              </div>
            </div>

            {/* QUESTION BOX */}
            <div className="flex flex-col md:w-200 w-full mt-4 md:mt-6">
              <div
                className={`
    border
    rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-md
    px-4 sm:px-8 lg:px-20
    py-3 md:py-4
    w-full
    min-h-[60px] md:min-h-[80px]
    text-center
    shadow-sm
    overflow-hidden
    transition-colors duration-500
    ${isDark ? "bg-slate-800/90 border-slate-700/80" : "bg-white border-gray-300"}
  `}
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentIndex}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`text-sm sm:text-base md:text-xl font-semibold transition-colors duration-500 ${
                      isDark ? "text-slate-100" : "text-gray-800"
                    }`}
                  >
                    Q{currentIndex + 1}.{" "}
                    {questions[computedSection]?.questions?.[currentIndex]?.q}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Voice Wave Animation */}
              {isRecording && (
                <div className="voice-wave md:mt-50 md:me-20 mt-4 flex justify-center ">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="wave-bar"
                      style={isDark ? { backgroundColor: "#38bdf8" } : undefined}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM BUTTONS — mobile top margin was mt-20 (80px!), trimmed to
              mt-6. Bumped slightly to mt-8 per request to nudge it down a
              touch, still far from the original 80px. */}
          <div className="flex flex-col items-center justify-center mt-8 md:mt-8 gap-3 md:gap-6 mb-4 md:mb-3">
            {/* SPEAK NOW BUTTON */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSpeaking}
              className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-xl transition-all border-none outline-none focus:outline-none appearance-none
${isRecording
                  ? isDark
                    ? "bg-sky-500 animate-pulse ring-8 ring-sky-400/40"
                    : "bg-sky-400 animate-pulse ring-8 ring-sky-300/50"
                  : isDark
                  ? "bg-sky-500 hover:bg-sky-400"
                  : "bg-sky-300 hover:bg-sky-400"
                }
    ${isSpeaking ? "opacity-40 cursor-not-allowed" : ""}
`}
            >
              {isRecording ? (
                <FaStop size={28} className="text-white md:hidden" />
              ) : (
                <FaMicrophone size={28} className="text-white md:hidden" />
              )}
              {isRecording ? (
                <FaStop size={40} className="text-white hidden md:block" />
              ) : (
                <FaMicrophone size={40} className="text-white hidden md:block" />
              )}
            </button>

            <button
              onClick={skipQuestion}
              disabled={isRecording}
              className={`px-8 md:px-10 py-2 md:py-3 border rounded-xl text-sm md:text-base transition-colors duration-500
    ${isRecording
                  ? isDark
                    ? "opacity-40 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500"
                    : "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-700"
                  : isDark
                  ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              Skip
            </button>
          </div>

        </div>
      </div>



    </>

  )

}


export default InterviewRoom;