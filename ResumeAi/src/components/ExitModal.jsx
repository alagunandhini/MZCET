const ExitModal = ({
  showExitModal,
  onCancel,
  onExit,
}) => {
  if (!showExitModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5 md:p-0">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full border border-sky-300">

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Exit Practice?
        </h2>

        <p className="text-gray-600 mb-8">
          Are you sure you want to exit the practice session?
        </p>

        <div className="flex justify-center gap-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onExit}
            className="px-6 py-2 rounded-full bg-sky-300 text-white hover:bg-sky-400"
          >
            Yes, Exit
          </button>
        </div>

      </div>
    </div>
  );
};

export default ExitModal;