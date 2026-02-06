import React from 'react';

const StarIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-[30px]">
    <path
      d="M16 2L19.09 11.26L29 11.44L21.18 17.14L24.09 26.56L16 21.12L7.91 26.56L10.82 17.14L3 11.44L12.91 11.26L16 2Z"
      fill="#FDB022"
    />
  </svg>
);

const fileInfo = {
  title: 'Drought on the Prairies',
  thumbnail: '/assets/drought_banner.png',
  topics: ['Wildfires', 'Air Quality', 'Health Risks', 'Evacuations', 'Forests', 'Eastern Canada'],
};

const questions = [
  {
    id: 1,
    text: 'How did the drought affect forests and other non-farming communities across Canada?',
    askedBy: 'Jamie and Thomas',
  },
];

const QuestionSelectionView = ({ onQuestionSelect, onGoHome }) => {
  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col">
      {/* Navbar */}
      <header className="bg-[#1a1a1a] h-[52px] flex items-center justify-between px-8">
        <div className="flex items-center gap-1 px-3 cursor-pointer" onClick={onGoHome}>
          <StarIcon />
          <span className="text-white text-lg font-bold font-karla">Protégé</span>
        </div>
        <div className="flex items-center gap-5 text-white text-sm font-mulish">
          <span className="cursor-pointer">Login</span>
          <span className="cursor-pointer">Signup</span>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden" style={{ height: 'calc(100vh - 52px)' }}>
        {/* Left panel - file info */}
        <div className="w-[523px] bg-white rounded p-9 flex flex-col gap-8 shrink-0 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <div className="aspect-[384/204] w-full rounded overflow-hidden">
              <img
                src={fileInfo.thumbnail}
                alt={fileInfo.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-base font-karla text-black mt-2">Chosen file:</p>
            <h2 className="text-2xl font-semibold font-karla text-black">{fileInfo.title}</h2>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-base font-mulish text-black">Chosen Topics</p>
            <div className="flex flex-wrap gap-4">
              {fileInfo.topics.map((topic, i) => (
                <span key={i} className="bg-[#e6e6e6] px-6 py-2 rounded-[20px] text-base font-mulish text-black">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - questions */}
        <div className="flex-1 bg-white rounded p-9 flex flex-col gap-9 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <h1 className="text-[32px] font-semibold font-karla text-black">Your list of questions</h1>
            <p className="text-base font-mulish text-black">
              Topics will influence what kinds of problems and questions we will come up for you.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((q) => (
              <div key={q.id} className="border border-black/15 rounded p-4 flex items-end justify-between gap-6">
                <div className="flex flex-col gap-3 flex-1">
                  <p className="text-2xl font-medium font-karla text-black leading-tight">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <img src="/assets/jamie_beaver.png" alt="Jamie" className="w-10 h-10 rounded-full object-cover" />
                    <img src="/assets/thomas_goose.png" alt="Thomas" className="w-10 h-10 rounded-full object-cover border-2 border-white -ml-4" />
                    <span className="text-base font-mulish text-black/70 ml-1">Asked by {q.askedBy}</span>
                  </div>
                </div>

                <button
                  onClick={() => onQuestionSelect(q.id)}
                  className="bg-[#0c8e3f] hover:bg-[#0a7534] transition-colors text-white px-6 py-3 rounded flex items-center gap-4 whitespace-nowrap shrink-0"
                >
                  <span className="text-base font-mulish">Start learning</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelectionView;
