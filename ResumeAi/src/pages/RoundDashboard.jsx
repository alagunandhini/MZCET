import { motion } from "framer-motion";
import { Clock, HelpCircle, RotateCcw, Star, Lock, CheckCircle2, ChevronLeft } from "lucide-react";

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

  const rounds = Object.keys(questions).map((key, index) => ({
    id: index,
    key: key,
    title: `Round ${index + 1}`,
    name: questions[key].name,
    questions: questions[key].questions.length,
    time: "10 Minutes",
    attempts: 3
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
        {/* LEFT ROBOT SECTION */}

        <div className="w-full md:w-[22%] md:sticky md:top-6 flex flex-col gap-4">

          {/* ROBOT CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 flex flex-row md:flex-col items-center justify-start md:justify-center p-4 md:p-6 gap-3 md:gap-0">
            <motion.img
              src="/completed logo.png"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-56 md:h-56 object-contain drop-shadow-md"
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
                Hi, I'm
              </h2>

              <p className="text-gray-500 text-sm md:text-base md:mt-2">
                Your interview preparation partner.
              </p>
            </div>
          </div>

          {/* PROGRESS CARD - separate box, sized to fit content only */}
          <div className="bg-white rounded-2xl shadow-sm border border-sky-100 flex flex-col items-center p-5 md:p-6">
            {(() => {
              const totalRounds = rounds.length;
              const completed = completedRounds.length;
              const percent = totalRounds > 0 ? (completed / totalRounds) * 100 : 0;
              const radius = 55;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (percent / 100) * circumference;

              return (
                <>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3 self-start">
                    Your Progress
                  </p>
                  <div className="relative w-36 h-60">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="#e0f2fe"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="#38bdf8"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-sky-500">{Math.round(percent)}%</span>
                      <span className="text-xs text-gray-400 font-medium mt-1">
                        {Math.round(percent)}/100
                      </span>
                    </div>
                  </div>

                  {percent === 100 && (
                    <p className="text-gray-500 text-sm font-semibold text-center ">
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
          {/* HEADER */}

          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-sky-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                Interview Dashboard
              </h1>

              <p className="text-gray-500 text-xs sm:text-sm md:text-base">
                Complete your rounds and improve your score
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                className="
px-3 sm:px-5 py-1.5 sm:py-2 
text-xs sm:text-sm
font-medium
text-gray-600
rounded-xl
border-none
bg-gray-50
hover:bg-gray-100
transition
"
              >
                Progress
              </button>

              <button
                className="
px-3 sm:px-5 py-1.5 sm:py-2 
text-xs sm:text-sm
font-medium
text-gray-600
rounded-xl
border-none
bg-gray-50
hover:bg-gray-100
transition
"
              >
                Profile
              </button>

              <div
                className="
flex items-center gap-1.5
px-3 sm:px-5 py-1.5 sm:py-2 
text-xs sm:text-sm
rounded-xl
bg-amber-50
text-amber-600
font-bold
whitespace-nowrap
"
              >
                <Star size={14} className="fill-amber-400 text-amber-400" />
                320
              </div>
            </div>
          </div>

          {/* ROUND CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {rounds.map((round) => {

              const isLocked =
                round.id !== 0 &&
                !completedRounds.includes(round.id - 1);

              return (

                <motion.div
                  key={round.id}
                  whileHover={!isLocked ? { y: -3 } : {}}
                  className={`
bg-white
rounded-2xl
p-4 md:p-6
shadow-sm
border
transition-all
${isLocked ? "border-gray-100 opacity-60" : "border-sky-100 hover:shadow-lg hover:border-sky-200"}
`}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">
                      {round.title}
                    </h2>

                    {!isLocked && (
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold text-xs sm:text-sm bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={14} /> Ready
                      </span>
                    )}

                    {isLocked && (
                      <span className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm bg-gray-50 px-2.5 py-1 rounded-full">
                        <Lock size={12} /> Locked
                      </span>
                    )}

                  </div>

                  <p className="mt-2 md:mt-3 text-gray-500 text-sm md:text-base">{round.name}</p>

                  <div className="mt-4 md:mt-5 space-y-2 md:space-y-2.5 text-xs sm:text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Clock size={14} className="text-sky-400 shrink-0" />
                      Duration : <span className="font-semibold text-gray-700">{round.time}</span>
                    </p>

                    <p className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-sky-400 shrink-0" />
                      Questions : <span className="font-semibold text-gray-700">{round.questions}</span>
                    </p>

                    <p className="flex items-center gap-2">
                      <RotateCcw size={14} className="text-sky-400 shrink-0" />
                      Attempts Left : <span className="font-semibold text-sky-500">{round.attempts}</span>
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
border-none
transition
shadow-sm

${isLocked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-sky-400 text-white hover:bg-sky-500 hover:shadow-md"
                      }

`}
                  >
                    {isLocked ? "Locked" : "Start Round"}
                  </button>
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
              className="
flex items-center gap-1.5
px-6 md:px-8
py-2.5 md:py-3
text-sm md:text-base
font-medium
rounded-full
border-none
bg-white
shadow-sm
text-sky-500
hover:bg-sky-50
transition
"
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
