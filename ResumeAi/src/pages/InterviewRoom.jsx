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
   roundNumber,   
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
      className={`flex items-center gap-2 font-mono font-bold tracking-widest text-base sm:text-lg md:text-xl px-4 py-1.5 sm:px-5 sm:py-2 rounded- border whitespace-nowrap transition-colors duration-500 ${
        isDark
          ? "bg-slate-800/90 text-sky-300 border-slate-600/80 shadow-slate-900/40"
          : "bg-white text-sky-600 border-sky-100 shadow-sky-100"
      }`}
    >
     
      {formatTime(seconds)}
    </div>
  );

  return (

    <>
      {/* Custom keyframes only — font import removed, back to default font */}
      <style>{`
        @keyframes ir-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .ir-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: ir-shimmer 1.8s ease-in-out infinite;
        }

        @keyframes ir-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .ir-float { animation: ir-float 4s ease-in-out infinite; }

        @keyframes ir-ring-pulse {
          0% { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .ir-ring-pulse {
          animation: ir-ring-pulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Page 3 - Practice Question */}

      <div
        className={`w-full min-h-screen flex flex-col items-center transition-colors duration-500 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100"
            : "text-gray-800"
        }`}
      >


        {/* HEADER - always stays at the very top */}
        <div className="w-full text-center relative">
          <p
            className={`text-lg sm:text-xl font-bold p-3 tracking-wide shadow-sm transition-colors duration-500 ${
              isDark
                ? "bg-slate-800/95 text-slate-100 border-b border-slate-700"
                : "bg-sky-400 text-white"
            }`}
          >
            <span className="opacity-75 font-semibold">Round { roundNumber+1 }</span>
            <span className="mx-2 opacity-40">·</span>
            {sectionName}
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
                className={`font-semibold text-xs sm:text-sm md:text-base tracking-wide transition-colors duration-500 ${
                  isDark ? "text-slate-300" : "text-gray-600"
                }`}
              >
                Question {currentIndex + 1} of {totalQuestions}
              </p>
              <p
                className={`font-bold text-xs sm:text-sm md:text-base tabular-nums transition-colors duration-500 ${
                  isDark ? "text-sky-400" : "text-sky-500"
                }`}
              >
                {Math.round(progress)}%
              </p>
            </div>
            <div
              className={`relative w-full h-2.5 md:h-3.5 rounded-full overflow-hidden shadow-inner transition-colors duration-500 ${
                isDark ? "bg-slate-700/80" : "bg-gray-200/80"
              }`}
            >
              <div
                className={`relative h-full rounded-full overflow-hidden transition-all duration-700 ease-out ${
                  isDark
                    ? "bg-gradient-to-r from-sky-600 to-sky-400"
                    : "bg-gradient-to-r from-sky-400 to-sky-300"
                }`}
                style={{ width: `${progress}%` }}
              >
                <div className="ir-shimmer absolute inset-0" />
              </div>
            </div>
          </div>

          {/* Exit button — back to original layout */}
          <div className="flex justify-end gap-2 shrink-0">

            
            <button
              onClick={() => setShowExitModal(true)}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 text-xs sm:text-sm md:text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isDark
                  ? "bg-slate-700 hover:bg-slate-600 focus-visible:ring-sky-400 focus-visible:ring-offset-slate-900"
                  : "bg-sky-400 text-white border border-sky-200  focus-visible:ring-sky-300 focus-visible:ring-offset-sky-50"
              } ${isDark ? "" : "text-sky-500"}`}
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
          <div className="flex justify-center mt-10 mb-1 md:ms-8">
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
                  className={`w-28 h-28 sm:w-36 sm:h-36 md:w-70 md:h-70 drop-shadow-xl ${
                    !isSpeaking ? "ir-float" : ""
                  }`}
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
                {/* voice wave in bottom of robot — now centered under the
                    image since the image's stray right margin was removed */}
                {isSpeaking ? (
                  <div className="flex justify-center gap-2 mt-1 mb-4 w-full">
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        className={`w-2 h-6 rounded-full shadow-sm transition-colors duration-500 ${
                          isDark ? "bg-sky-400" : "bg-sky-400"
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
                    className={`text-center mt-1 font-medium text-sm md:text-base leading-relaxed transition-colors duration-500 ${
                      isDark ? "text-slate-300" : "text-gray-500"
                    }`}
                  >
                    <span className={`font-semibold ${isDark ? "text-slate-100" : "text-gray-700"}`}>
                      Hi, I'm your interviewer!
                    </span>
                    <br />
                    <span className={isDark ? "text-slate-400" : "text-gray-500"}>
                      Start speaking when you are ready
                    </span>
                  </motion.p>
                )}
              </div>
            </div>

            {/* QUESTION BOX */}
            <div className="flex flex-col md:w-200 w-full mt-4 md:mt-6">
              <div
                className={`
    relative
    border
    rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-md
    px-4 sm:px-8 lg:px-20
    py-3 md:py-4
    w-full
    min-h-[60px] md:min-h-[80px]
    text-center
    shadow-lg
    overflow-hidden
    transition-colors duration-500
   
    ${isDark ? "before:bg-sky-500" : "before:bg-sky-400"}
    ${isDark
      ? "bg-slate-800/90 border-slate-700/80 shadow-slate-950/40"
      : "bg-white border-gray-200 shadow-sky-100/60"}
  `}
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentIndex}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`text-sm sm:text-base md:text-xl font-semibold leading-snug transition-colors duration-500 ${
                      isDark ? "text-slate-100" : "text-gray-800"
                    }`}
                  >
                  
                      Q{currentIndex + 1}.{" "}
                
                    {questions[computedSection]?.questions?.[currentIndex]?.q}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* BOTTOM BUTTONS — mobile top margin was mt-20 (80px!), trimmed to
              mt-6. Bumped slightly to mt-8 per request to nudge it down a
              touch, still far from the original 80px. */}
          <div className="flex flex-col items-center justify-center mt-8 md:mt-8 gap-3 md:gap-6 mb-4 md:mb-3">
            {/* SPEAK NOW BUTTON — wrapped in a fixed-size relative container
                so the button's own position never shifts when isRecording
                toggles (only its internal ring/pulse styling changes). */}
            <div className="relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
              {/* Ambient pulse rings while recording — purely decorative,
                  absolutely positioned so they can't affect layout/position */}
              {isRecording && (
                <>
                  <span
                    className={`ir-ring-pulse absolute inset-0 rounded-full ${
                      isDark ? "bg-sky-400/40" : "bg-sky-300/50"
                    }`}
                  />
                  <span
                    className={`ir-ring-pulse absolute inset-0 rounded-full ${
                      isDark ? "bg-sky-400/40" : "bg-sky-300/50"
                    }`}
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              )}

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSpeaking}
                className={`relative z-10 w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl active:scale-95 transition-all border-none outline-none focus:outline-none focus-visible:ring-4 appearance-none
${isRecording
                    ? isDark
                      ? "bg-sky-500 ring-8 ring-sky-400/30 focus-visible:ring-sky-300"
                      : "bg-sky-400 ring-8 ring-sky-300/40 focus-visible:ring-sky-300"
                    : isDark
                    ? "bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 focus-visible:ring-sky-400"
                    : "bg-gradient-to-br from-sky-300 to-sky-400 hover:from-sky-400 hover:to-sky-500 focus-visible:ring-sky-300"
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
            </div>

            <p
              className={`text-xs md:text-sm font-medium tracking-wide -mt-1 transition-colors duration-500 ${
                isDark ? "text-slate-400" : "text-gray-500"
              }`}
            >
              {isRecording ? "Recording — tap to stop" : "Tap to speak"}
            </p>

            <button
              onClick={skipQuestion}
              disabled={isRecording}
              className={`px-8 md:px-10 py-2 md:py-3 border rounded-xl text-sm md:text-base font-medium shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    ${isRecording
                  ? isDark
                    ? "opacity-40 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500"
                    : "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-700"
                  : isDark
                  ? "border-slate-600 text-slate-200 hover:bg-slate-800 focus-visible:ring-sky-400 focus-visible:ring-offset-slate-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-sky-300 focus-visible:ring-offset-sky-50"
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