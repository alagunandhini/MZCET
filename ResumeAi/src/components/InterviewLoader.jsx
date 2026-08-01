const InterviewLoader = ({ isAnalyzing, isDark }) => {
  if (!isAnalyzing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-6 md:p-0 transition-colors duration-500 ${
        isDark ? "bg-slate-900/80" : "bg-sky-100/80"
      }`}
    >
      <div
        className={`rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 animate-fadeIn border transition-colors duration-500 ${
          isDark
            ? "bg-slate-800/90 border-slate-700/80"
            : "bg-white border-sky-100"
        }`}
      >
        <img
          src="completed logo.png"
          alt="Robot"
          className="w-32 animate-bounceSlow"
        />

        <h2
          className={`text-2xl font-bold text-center transition-colors duration-500 ${
            isDark ? "text-slate-100" : "text-black-400"
          }`}
        >
          Analyzing Your Interview
        </h2>

        <div className="flex gap-2">
          <span className={`dot ${isDark ? "bg-sky-400" : ""}`}></span>
          <span className={`dot delay-200 ${isDark ? "bg-sky-400" : ""}`}></span>
          <span className={`dot delay-400 ${isDark ? "bg-sky-400" : ""}`}></span>
        </div>

        <p
          className={`text-sm transition-colors duration-500 ${
            isDark ? "text-slate-400" : "text-gray-500"
          }`}
        >
          Please Wait.....
        </p>
      </div>
    </div>
  );
};

export default InterviewLoader;