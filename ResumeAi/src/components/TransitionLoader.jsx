const TransitionLoader = ({ text }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">

      {/* Robot Animation */}
      <img
        src="/robot.png"   // your Pinkyy robot image
        alt="Pinkyy"
        className="w-32 h-32 animate-bounceSlow drop-shadow-xl"
      />

      {/* Spinner Circle */}
      {/* <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-pink-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-pink-400 border-t-transparent animate-spin-slow"></div>
      </div> */}

      {/* Pulsing Text */}
      <p className="mt-0 text-lg font-semibold text-pink-500 animate-pulse text-center">
        {text || "Pinkyy is thinking...💗"}
      </p>

      {/* Bouncing Dots */}
      {/* <div className="flex gap-2 mt-2">
        <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-0"></span>
        <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-150"></span>
        <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-300"></span>
      </div> */}
    </div>
  );
};

export default TransitionLoader;

