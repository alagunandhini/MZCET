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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex gap-8 h-full">
        {/* LEFT ROBOT SECTION */}

        <div className="w-[25%] bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center p-5">
          <motion.img
            src="/robot.png"
            className="w-60 h-60 object-contain"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          <h2 className="text-xl font-semibold text-gray-700 mt-5">
            Hi, I'm Pinkyy 💗
          </h2>

          <p className="text-gray-500 text-center mt-2">
            Your interview preparation partner.
          </p>
        </div>

        {/* RIGHT DASHBOARD */}

        <div className="w-[75%]">
          {/* HEADER */}

          <div className="bg-white rounded-2xl p-5 shadow-sm flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-700">
                Interview Dashboard
              </h1>

              <p className="text-gray-500">
                Complete your rounds and improve your score
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="
px-5 py-2 
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
px-5 py-2 
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
px-5 py-2 
rounded-xl
bg-pink-100
text-pink-500
font-bold
"
              >
                ⭐ 320
              </div>
            </div>
          </div>

          {/* ROUND CARDS */}

          <div className="grid grid-cols-2 gap-6">
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
p-6
shadow-sm
border
hover:shadow-lg
transition
${isLocked ? "opacity-70" : ""}
`}
              >
                <div className="flex justify-between">
                  <h2 className="text-xl font-bold text-gray-700">
                    {round.title}
                  </h2>

               

                  {!isLocked && (
                    <span className="text-green-500 font-semibold">
                      🟢 Ready
                    </span>
                  )}

                  {isLocked && (
                    <span className="text-gray-400">🔒 Locked</span>
                  )}

                </div>

                <p className="mt-3 text-gray-600">{round.name}</p>

                <div className="mt-5 space-y-2 text-sm text-gray-600">
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
mt-6
w-full
py-3
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

          <div className="flex justify-end mt-6">
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
px-8
py-3
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
