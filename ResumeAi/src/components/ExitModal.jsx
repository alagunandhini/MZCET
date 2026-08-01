const ExitModal = ({
  showExitModal,
  onCancel,
  onExit,
  isDark,
}) => {
  if (!showExitModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5 md:p-0">
      <div
        className={`p-8 rounded-xl shadow-2xl text-center max-w-md w-full border transition-colors duration-500 ${
          isDark
            ? "bg-slate-800 border-sky-500/30"
            : "bg-white border-sky-300"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-4 transition-colors duration-500 ${
            isDark ? "text-slate-100" : "text-gray-800"
          }`}
        >
          Exit Practice?
        </h2>

        <p
          className={`mb-8 transition-colors duration-500 ${
            isDark ? "text-slate-400" : "text-gray-600"
          }`}
        >
          Are you sure you want to exit the practice session?
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={onCancel}
            className={`px-6 py-2 rounded-full border transition ${
              isDark
                ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                : "border-gray-400 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={onExit}
            className={`px-6 py-2 rounded-full text-white transition ${
              isDark ? "bg-sky-500 hover:bg-sky-400" : "bg-sky-300 hover:bg-sky-400"
            }`}
          >
            Yes, Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitModal;