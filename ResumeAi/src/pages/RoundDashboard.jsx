import { motion } from "framer-motion";

const RoundDashboard = ({
    questions,
  completedRounds,
  setCurrentIndex,
  setTransitionLoading,
  setTransitionText,
  setStartPractice,
  setSectionIndex,
  setShowQuestionsUI,
}) => {
  
  const rounds = Object.keys(questions).map((key,index)=>({
  id:index,
  key:key,
  title:`Round ${index+1}`,
  name:questions[key].name,
  questions:questions[key].questions.length,
  time:"10 Minutes",
  attempts:3
}));
  const startRound = (round) => {
    //check whether completed rounds are in array , if not then it is locked
    const isLocked = round.id !== 0 && !completedRounds.includes(round.id - 1);
    if (isLocked) return;
    setSectionIndex(round.id);
    setCurrentIndex(0);

    setTransitionText(`${round.title} Starting...`);

    setTransitionLoading(true);

    setTimeout(() => {
      setTransitionLoading(false);

      setStartPractice(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 h-full">
        {/* LEFT ROBOT SECTION */}

        <div className="w-full md:w-[25%] bg-white rounded-2xl shadow-sm flex flex-row md:flex-col items-center justify-start md:justify-center p-4 md:p-5 gap-3 md:gap-0">
          <motion.img
            src="/robot.png"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-60 md:h-60 object-contain"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          <div className="text-left md:text-center md:mt-5">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700">
              Hi, I'm Pinkyy 💗
            </h2>

            <p className="text-gray-500 text-sm md:text-base md:mt-2">
              Your interview preparation partner.
            </p>
          </div>
        </div>

        {/* RIGHT DASHBOARD */}

        <div className="w-full md:w-[75%]">
          {/* HEADER */}

          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700">
                Interview Dashboard
              </h1>

              <p className="text-gray-500 text-xs sm:text-sm md:text-base">
                Complete your rounds and improve your score
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="
px-3 sm:px-5 py-1.5 sm:py-2 
text-xs sm:text-sm
rounded-xl
border
border-gray-200
hover:bg-gray-100
"
              >
                Progress
              </button>

              <button
                className="
px-3 sm:px-5 py-1.5 sm:py-2 
text-xs sm:text-sm
rounded-xl
border
border-gray-200
hover:bg-gray-100
"
              >
                Profile
              </button>

              <div
                className="
px-3 sm:px-5 py-1.5 sm:py-2 
text-xs sm:text-sm
rounded-xl
bg-pink-100
text-pink-500
font-bold
whitespace-nowrap
"
              >
                ⭐ 320
              </div>
            </div>
          </div>

          {/* ROUND CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {rounds.map((round) => 
            {

  const isLocked =
    round.id !== 0 &&
    !completedRounds.includes(round.id - 1);

    return(
              
              <div
                key={round.id}
                className={`
bg-white
rounded-2xl
p-4 md:p-6
shadow-sm
border
hover:shadow-lg
transition
${isLocked ? "opacity-70" : ""}
`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-bold text-gray-700">
                    {round.title}
                  </h2>

               

                  {!isLocked && (
                    <span className="text-green-500 font-semibold text-xs sm:text-sm">
                      🟢 Ready
                    </span>
                  )}

                  {isLocked && (
                    <span className="text-gray-400 text-xs sm:text-sm">🔒 Locked</span>
                  )}

                </div>

                <p className="mt-2 md:mt-3 text-gray-600 text-sm md:text-base">{round.name}</p>

                <div className="mt-4 md:mt-5 space-y-1.5 md:space-y-2 text-xs sm:text-sm text-gray-600">
                  <p>
                    ⏱ Duration :
                    <span className="font-semibold">{round.time}</span>
                  </p>

                  <p>
                    ❓ Questions :
                    <span className="font-semibold">{round.questions}</span>
                  </p>

                  <p>
                    Attempts Left :
                    <span className="font-semibold text-pink-400">
                      {round.attempts}
                    </span>
                  </p>
                </div>

                <button
                  disabled={isLocked}
                  onClick={() => startRound(round)}
                  className={`
mt-4 md:mt-6
w-full
py-2.5 md:py-3
text-sm md:text-base
rounded-xl
font-semibold
transition

${
  round.status === "Locked"
    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
    : "bg-pink-300 text-white hover:bg-pink-400"
}

`}
                >
                  {isLocked? "Locked" : "Start Round"}
                </button>
              </div>
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
              className="
px-6 md:px-8
py-2.5 md:py-3
text-sm md:text-base
rounded-full
border-2
border-pink-200
text-pink-400
"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundDashboard;
