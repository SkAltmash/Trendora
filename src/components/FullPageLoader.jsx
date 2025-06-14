const FullPageLoader = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <div className="relative flex flex-col items-center space-y-6">
        {/* Pulsing glow ring */}
        <div className="absolute w-36 h-36 bg-blue-100 rounded-full blur-2xl opacity-60 animate-ping"></div>

        {/* Dual rotating rings */}
        <div className="relative w-24 h-24">
          {/* Outer spinner */}
          <div className="absolute inset-0 border-8 border-blue-500 border-dashed rounded-full animate-spin-slow"></div>
          {/* Inner spinner */}
          <div className="absolute inset-3 border-4 border-t-transparent border-blue-400 rounded-full animate-spin-reverse-slower"></div>
        </div>

        {/* Shimmering text */}
        <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-900 to-gray-400 animate-text">
          Loading stats...
        </p>
      </div>
    </div>
  );
};

export default FullPageLoader;
