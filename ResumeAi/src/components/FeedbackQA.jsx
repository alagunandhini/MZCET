const FeedbackQA = ({ sessionId }) => {
  return (
    <div className="h-full p-10 overflow-y-auto">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Interview Feedback
      </h2>

      {/* Question Card */}
      <div className="bg-gray-50 p-6 rounded-xl mb-6 shadow-sm">
        <p className="font-semibold mb-2">
          Q1. Tell me about yourself
        </p>

        <p className="text-sm text-gray-500 mb-1">Your Answer</p>
        <div className="bg-white border p-3 rounded-md mb-4">
          I am a frontend developer...
        </div>

        <p className="text-sm text-gray-500 mb-1">Improved Answer</p>
        <div className="bg-pink-50 border border-pink-200 p-3 rounded-md">
          I am a passionate frontend developer with experience in React...
        </div>
      </div>

    </div>
  );
};

export default FeedbackQA;
