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


return (

<>
 {/* Page 3 - Practice Question */}

          <div className="w-full min-h-screen flex flex-col items-center justify-between  ">
            <div className="w-full text-center">
              <p className="  text-xl font-bold bg-sky-300 p-2 text-gray-50">
                {activeSection} Round
              </p>
            </div>

            {/* TOP SECTION */}
            <div className="w-full flex items-center justify-between px-10 pt-4 ">
              <p className="text-xl font-semibold text-gray-600">
                {currentIndex + 1}/{questions[computedSection]?.length}
              </p>

              <div className="flex gap-2 md:ms-40  ">
                <button
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
                  className="md:ms-250 mb-2 px-6 py-2 rounded-full text-white bg-sky-300 shadow hover:bg-sky-200 transition"
                >
                  Start Again
                </button>

                <button
                  onClick={() => setShowExitModal(true)}
                  className=" mb-2 px-6 py-2 rounded-full text-white bg-sky-300 shadow hover:bg-sky-200 transition"
                  title="Go Home"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* LEFT SECTION */}
            <div className="flex flex-col md:flex-row w-full px-6 md:px-10 mt-5 gap-4">
              {/* ROBOT */}
              <div className="flex justify-center md:w-1/4 w-full">
                <div className="flex flex-col items-center">
                  <motion.img
                    src="mzlogo.png"
                    className="w-50 h-50 md:w-70 md:h-70 me-4"
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
                      className="text-center mt-1 font-medium text-gray-600"
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
              <div className="flex flex-col md:w-200 w-full">
                <div
                  className="
    border border-gray-300
    rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-md
    px-4 sm:px-8 lg:px-20
    py-4
    w-full
    min-h-[80px]
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
                      className="text-base md:text-xl font-semibold text-gray-800"
                    >
                      Q{currentIndex + 1}.{" "}
                      {questions[computedSection]?.[currentIndex]?.q}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Voice Wave Animation */}
                {isRecording && (
                  <div className="voice-wave md:mt-50 md:me-20 mt-8 flex justify-center ">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="wave-bar"></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM BUTTONS */}
            <div className="flex flex-col items-center justify-center md:ms-6 mt-10 gap-6 mb-5">
              {/* SPEAK NOW BUTTON */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all
    ${
      isRecording
        ? "bg-sky-400 animate-pulse ring-8 ring-sky-300/50"
        : "bg-sky-300 hover:bg-sky-400"
    }
  `}
              >
                {isRecording ? (
                  <FaStop size={40} className="text-white" />
                ) : (
                  <FaMicrophone size={40} className="text-white" />
                )}
              </button>

              <button
                onClick={skipQuestion}
                disabled={isRecording}
                className={`px-10 py-3 border rounded-xl text-gray-700
    ${
      isRecording
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