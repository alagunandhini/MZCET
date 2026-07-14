import { motion } from "framer-motion";

const QuestionPreview = ({
  sections,
  activeSection,
  SetActiveSection,
  questions,
  isSpeaking,
  setMode,
  setCurrentIndex,
  setTransitionLoading,
  setTransitionText,
  setStartPractice,
  setSectionIndex,
  sectionIndex,
  showQuestionsUI,
  setShowQuestionsUI,
}) => {
  return (
    <div className="col-span-6 min-h-screen bg-white p-6 md:pb-0">

      {/* TOP TABS */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center md:justify-between mb-6">
        <div className="flex justify-center gap-2 bg-pink-50 px-2 md:px-4 py-2 rounded-2xl shadow-inner">
          {sections.map((tab) => (
            <button
              key={tab}
              onClick={() => SetActiveSection(tab)}
              className={`px-3 sm:px-6 md:px-36 py-2 rounded-xl font-semibold transition-all
              ${
                activeSection === tab
                  ? "bg-pink-300 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-pink-200"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Question Area */}
      <div className="mt-3 md:mt-10 flex flex-col md:flex-row items-center justify-center md:gap-10">

        {/* Left Panel */}
        <div className="h-[50vh] md:h-[72vh] flex flex-col items-center justify-center">

          <motion.img
            src="robot.png"
            className="w-50 h-50 md:w-70 md:h-70 me-4"
            initial={{ opacity: 0, x: -40 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: isSpeaking ? [1, 1.08, 1] : 1,
            }}
            transition={{
              duration: 0.6,
              repeat: isSpeaking ? Infinity : 0,
            }}
          />

          {isSpeaking ? (
            <div className="flex gap-2 mt-1 mb-4">
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="w-2 h-6 bg-pink-300 rounded-full"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-1 font-medium text-gray-600"
            >
              Hi, Pinkyy here! 💗
              <br />
              <span className="text-pink-400">
                Ready to start?
              </span>
            </motion.p>
          )}

          <button
            onClick={() => {
              setMode("practice");
              setCurrentIndex(0);

              setTransitionText("Preparing practice mode...");
              setTransitionLoading(true);

              setTimeout(() => {
                setTransitionLoading(false);
                setStartPractice(true);
              }, 3000);
            }}
            className="bg-pink-300 text-white px-8 py-4 rounded-full mt-5 hover:bg-pink-400"
          >
            Start Practice
          </button>

        </div>

        {/* Right Panel */}
        <div className="md:w-[75%] h-[72vh] border-2 border-gray-400 rounded-xl p-6 overflow-y-scroll bg-white shadow-md">

          <h2 className="text-2xl font-bold text-pink-400 mb-4 text-center">
            {activeSection} Questions
          </h2>

          {(questions[activeSection] || []).map((item, idx) => (
            <div key={idx} className="mb-6">
              <p className="font-bold">
                Q{idx + 1}. {item.q}
              </p>

              <p className="mt-2 text-gray-600 pl-4">
                {item.a}
              </p>
            </div>
          ))}

        </div>

      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-center md:justify-end gap-4 mt-5">

        <button
          onClick={() => {
            setMode("interview");
            setSectionIndex(0);
            SetActiveSection(sections[0]);
            setCurrentIndex(0);

            setTransitionText("Starting Mock Interview");
            setTransitionLoading(true);

            setTimeout(() => {
              setTransitionLoading(false);
              setStartPractice(true);
            }, 3000);
          }}
          className="px-6 py-2 rounded-full bg-pink-300 text-white"
        >
          Start Interview
        </button>

        <button
          onClick={() => {
            setTransitionText("Back To Upload Page...");
            setTransitionLoading(true);

            setTimeout(() => {
              setTransitionLoading(false);
              setShowQuestionsUI(false);
            }, 2000);
          }}
          className="px-8 py-3 rounded-full border-2 border-pink-200 text-pink-400"
        >
          Back
        </button>

      </div>

    </div>
  );
};

export default QuestionPreview;