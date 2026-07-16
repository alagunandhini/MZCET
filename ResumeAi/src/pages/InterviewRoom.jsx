import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";



const InterviewRoom = ({
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
  SetActiveSection
}) => {

  const totalQuestions = questions[computedSection]?.length || 0;

  const progress =
    totalQuestions > 0
      ? ((currentIndex + 1) / totalQuestions) * 100
      : 0;

  return (

    <>
      {/* Page 3 - Practice Question */}

      <div className="w-full min-h-screen flex flex-col items-center justify-between  ">
        <div className="w-full text-center">
          <p className="  text-xl font-bold bg-sky-300 p-2 text-gray-50">
            {activeSection} Round
          </p>
        </div>

        {/* TOP SECTION - Progress bar (75%) + buttons (25%) parallel */}
        <div className="w-full flex items-center px-4 md:px-10 pt-4 gap-3">
          {/* Progress Bar - 75% */}
          <div className="w-[75%]">
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <p className="font-semibold text-gray-700 text-xs sm:text-sm md:text-base">
                Question {currentIndex + 1} of {totalQuestions}
              </p>
              <p className="font-bold text-sky-500 text-xs sm:text-sm md:text-base">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="w-full h-2.5 md:h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Buttons - 25% */}
          <div className="w-[25%] flex justify-end gap-2">
            {/* <button
                  onClick={() => {
                    // stop recording if active
                    if (isRecording) {
                      mediaRecorderRef.current?.stop();
                      setIsRecording(false);
                    }

                    // stop any speaking voice
                    window.speechSynthesis.cancel();

                    // NEW interview session
                    setSessionId(uuidv4());

                    // reset practice state
                    setCurrentIndex(0);
                    SetActiveSection(activeSection); // optional but recommended
                  }}
                  className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-white bg-sky-300 shadow hover:bg-sky-200 transition text-xs sm:text-sm md:text-base whitespace-nowrap"
                >
                  Start Again
                </button> */}

            <button
              onClick={() => setShowExitModal(true)}
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-white bg-sky-300 shadow hover:bg-sky-200 transition text-xs sm:text-sm md:text-base"
              title="Go Home"
            >
              Exit
            </button>
          </div>
        </div>

        {/* LEFT SECTION */}
        <div className="flex flex-col md:flex-row w-full px-6 md:px-10 mt-3 md:mt-5 gap-2 md:gap-4">
          {/* ROBOT */}
          <div className="flex justify-center md:w-1/4 w-full">
            <div className="flex flex-col items-center">
              <motion.img
                src="mzlogo.png"
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
                      className="w-2 h-6 bg-sky-300 rounded-full"
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
                  className="text-center mt-1 font-medium text-gray-600 text-sm md:text-base"
                >
                  Hi,I'm your interviewer! <br />
                  <span className="text-gray-600">
                    Start speaking When You Are Ready{" "}
                  </span>
                </motion.p>
              )}
            </div>
          </div>

          {/* QUESTION BOX */}
          <div className="flex flex-col md:w-200 w-full md:mt-6">
            <div
              className="
    border border-gray-300
    rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-md
    px-4 sm:px-8 lg:px-20
    py-3 md:py-4
    w-full
    min-h-[60px] md:min-h-[80px]
    text-center
    shadow-sm
    bg-white
    overflow-hidden
  "
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-sm sm:text-base md:text-xl font-semibold text-gray-800"
                >
                  Q{currentIndex + 1}.{" "}
                  {questions[computedSection]?.[currentIndex]?.q}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Voice Wave Animation */}
            {isRecording && (
              <div className="voice-wave md:mt-50 md:me-20 mt-4 flex justify-center ">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="wave-bar"></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex flex-col items-center justify-center mt-4 md:mt-10 gap-3 md:gap-6 mb-4 md:mb-5">
          {/* SPEAK NOW BUTTON */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all border-none outline-none focus:outline-none appearance-none
${isRecording
                ? "bg-sky-400 animate-pulse ring-8 ring-sky-300/50"
                : "bg-sky-300 hover:bg-sky-400"
              }
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
            className={`px-8 md:px-10 py-2 md:py-3 border rounded-xl text-gray-700 text-sm md:text-base
    ${isRecording
                ? "opacity-40 cursor-not-allowed bg-gray-100"
                : "hover:bg-gray-100"
              }`}
          >
            Skip
          </button>
        </div>
      </div>



    </>

  )

}


export default InterviewRoom;
