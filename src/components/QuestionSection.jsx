import React, { useState } from 'react';
import { X, Shield, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';

const QuestionSection = ({ onClose, agentState, prefillAnswer = '', checklist = [] }) => {
  const [answer, setAnswer] = useState(prefillAnswer);
  const [showFeedback, setShowFeedback] = useState(null); // 'correct' or 'incorrect'
  const [isChecking, setIsChecking] = useState(false);
  const [apiFeedback, setApiFeedback] = useState({ title: '', desc: '' });

  const isJamieConvinced = agentState.jamie.status === 'GREEN';
  const isThomasConvinced = agentState.thomas.status === 'GREEN';
  const bothConvinced = isJamieConvinced && isThomasConvinced;

  const checkAnswer = async () => {
    if (!answer.trim()) return;

    setIsChecking(true);
    try {
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer })
      }).then(res => res.json());

      let title = response.feedbackTitle;
      let desc = response.feedbackDesc;

      if (response.isCorrect && !bothConvinced) {
        title = "Factually Correct, but Peers Unconvinced";
        desc = "Your analysis is spot on, but Jamie and Thomas still aren't fully convinced by your arguments in the chat. You need to persuade them before you can move on!";
        setShowFeedback('incorrect');
      } else if (response.isCorrect && bothConvinced) {
        setShowFeedback('correct');
      } else {
        setShowFeedback('incorrect');
      }

      setApiFeedback({
        title: title || (response.isCorrect ? 'Analysis Complete' : 'Incomplete Reflection'),
        desc: desc || ''
      });

    } catch (error) {
      console.error('Error checking answer:', error);
      setApiFeedback({
        title: 'Good effort!',
        desc: "I'm having trouble connecting to the review service, but let's keep discussing! Did you mention wildfires, air quality, or effects on non-farming communities?"
      });
      setShowFeedback('correct');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-6">
      {/* Feedback Overlay */}
      {showFeedback ? (
        <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transform transition-all animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-4 leading-tight text-gray-900">
              {apiFeedback.title}
            </h2>
            <p className="text-gray-500 font-medium mb-10 text-sm leading-relaxed text-center max-w-md mx-auto">
              {apiFeedback.desc}
            </p>

            <div className="w-full space-y-6 mb-10 text-left">
              <div className="flex space-x-4 mb-6">
                {['jamie', 'thomas'].map(charId => {
                  const status = agentState[charId].status;
                  const isGreen = status === 'GREEN';
                  const isYellow = status === 'YELLOW';
                  const Icon = isGreen ? ShieldCheck : isYellow ? ShieldAlert : Shield;
                  return (
                    <div key={charId} className={`flex-1 p-3 rounded-xl border flex items-center space-x-3 ${
                      isGreen ? 'bg-green-50 border-green-200 text-green-700' :
                      isYellow ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                      'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{charId}</span>
                        <span className="text-[11px] font-medium">{isGreen ? 'Convinced' : 'Not Convinced'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Your reflection:</label>
                <div className={`p-6 rounded-2xl border-2 flex flex-col font-medium text-sm leading-relaxed ${
                  showFeedback === 'correct'
                    ? 'bg-green-50 border-green-500/20 text-green-800'
                    : 'bg-orange-50 border-orange-500/20 text-orange-800'
                }`}>
                  {answer}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFeedback(null)}
              className={`w-full py-4 ${showFeedback === 'correct' ? 'bg-[#16a34a] shadow-green-200/50' : 'bg-[#2563eb] shadow-blue-200/50'} text-white font-bold text-lg rounded-[20px] hover:opacity-90 transition-all flex items-center justify-center shadow-lg`}
            >
              {showFeedback === 'correct' ? 'Continue' : 'Back to Discussion'}
              <span className="ml-2 text-xl">→</span>
            </button>
          </div>
        </div>
      ) : (
        /* Finish Conversation Modal */
        <div className="bg-white rounded flex flex-col gap-6" style={{ width: '714px', padding: '24px' }}>
          {/* Header */}
          <div className="flex items-center gap-6">
            <h2 className="flex-1 font-mulish font-bold text-black" style={{ fontSize: '24px', lineHeight: '30px' }}>
              Type out your final answer to finish your conversation
            </h2>
            <button onClick={onClose} className="text-[#374957] hover:text-black transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Question display */}
          <div className="flex flex-col gap-3">
            <p className="font-mulish text-black/50" style={{ fontSize: '16px', lineHeight: '20px' }}>Thomas and Jamie&apos;s question:</p>
            <div className="bg-[#F0F6FF] rounded flex items-start gap-3" style={{ padding: '15px 16px' }}>
              <div className="flex -space-x-2 flex-shrink-0">
                <img src="/assets/jamiechat.png" alt="Jamie" className="w-9 h-9 rounded-full border-2 border-[#F0F6FF]" />
                <img src="/assets/thomaschat.png" alt="Thomas" className="w-9 h-9 rounded-full border-2 border-[#F0F6FF]" />
              </div>
              <p className="font-mulish text-black" style={{ fontSize: '16px', lineHeight: '20px' }}>
                &ldquo;How did the drought affect forests and other non-farming communities across Canada?&rdquo;
              </p>
            </div>
          </div>

          {/* Conversation checklist */}
          <div className="flex flex-col gap-3">
            <p className="font-mulish text-black/50" style={{ fontSize: '16px', lineHeight: '20px' }}>Your conversation so far:</p>
            <div className="flex flex-wrap gap-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex-shrink-0">
                    {item.completed ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect width="20" height="20" rx="2" fill="#0C8E3F" />
                        <path d="M5 10L8.5 13.5L15 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="0.5" y="0.5" width="19" height="19" rx="1.5" stroke="#966503" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="font-mulish"
                    style={{ fontSize: '16px', lineHeight: '20px', color: item.completed ? '#0C8E3F' : '#966503' }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/35"></div>

          {/* Answer area */}
          <div className="flex flex-col gap-3 flex-1">
            <p className="font-mulish text-black/50" style={{ fontSize: '16px', lineHeight: '20px' }}>Final answer:</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type out your final answer to Thomas's question here:"
              className="flex-1 bg-white border border-black/50 rounded font-mulish outline-none focus:border-black/70 transition-all text-black/50 resize-none"
              style={{ padding: '16px', fontSize: '16px', lineHeight: '20px', minHeight: '160px' }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-3">
            <button
              onClick={onClose}
              className="bg-white border border-black/20 rounded font-mulish text-black hover:bg-gray-50 transition-colors"
              style={{ padding: '12px 24px', fontSize: '16px', lineHeight: '20px' }}
            >
              Cancel
            </button>
            <button
              onClick={checkAnswer}
              disabled={isChecking}
              className={`${isChecking ? 'bg-gray-300 text-gray-500' : 'bg-[#0c8e3f] hover:bg-[#0a7534] text-white'} rounded font-mulish transition-colors flex items-center justify-center gap-6`}
              style={{ padding: '12px 24px', width: '210px', height: '48px', fontSize: '16px', lineHeight: '20px' }}
            >
              {isChecking ? 'Submitting...' : 'Submit Answer'}
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionSection;
