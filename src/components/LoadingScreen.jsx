import React from 'react';

const StarIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-[30px]">
    <path
      d="M16 2L19.09 11.26L29 11.44L21.18 17.14L24.09 26.56L16 21.12L7.91 26.56L10.82 17.14L3 11.44L12.91 11.26L16 2Z"
      fill="#FDB022"
    />
  </svg>
);

const LoadingScreen = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col">
      {/* Navbar */}
      <header className="bg-[#1a1a1a] h-[52px] flex items-center justify-between px-8">
        <div className="flex items-center gap-1 px-3 cursor-pointer" onClick={onGoHome}>
          <StarIcon />
          <span className="text-white text-lg font-bold font-karla">Curiosity</span>
        </div>
        <div className="flex items-center gap-5 text-white text-sm font-mulish">
          <span className="cursor-pointer">Login</span>
          <span className="cursor-pointer">Signup</span>
        </div>
      </header>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Loader icon */}
          <svg className="w-10 h-10 animate-spin" viewBox="0 0 40 40" fill="none" style={{ animationDuration: '2s' }}>
            <line x1="20" y1="2" x2="20" y2="10" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="30" x2="20" y2="38" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="2" y1="20" x2="10" y2="20" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="30" y1="20" x2="38" y2="20" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="7.27" y1="7.27" x2="12.93" y2="12.93" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="27.07" y1="27.07" x2="32.73" y2="32.73" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="7.27" y1="32.73" x2="12.93" y2="27.07" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="27.07" y1="12.93" x2="32.73" y2="7.27" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          <div className="text-center text-black">
            <h2 className="text-[32px] font-semibold font-karla leading-tight">
              Generating questions
            </h2>
            <p className="text-base font-mulish mt-3">
              Please choose one you would like to explore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
