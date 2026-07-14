const InterviewLoader = ({ isAnalyzing }) => {
  if (!isAnalyzing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-100/80 backdrop-blur-md p-6 md:p-0">
      <div className="rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 animate-fadeIn">

        <img
          src="/robot.png"
          alt="Robot"
          className="w-32 animate-bounceSlow"
        />

        <h2 className="text-2xl font-bold text-pink-400 text-center">
          Analyzing Your Interview
        </h2>

        <div className="flex gap-2">
          <span className="dot"></span>
          <span className="dot delay-200"></span>
          <span className="dot delay-400"></span>
        </div>

        <p className="text-gray-500 text-sm">
          Please Wait.....
        </p>

      </div>
    </div>
  );
};

export default InterviewLoader;