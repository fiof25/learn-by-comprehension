import React, { useState } from 'react';
import { ArrowLeft, Check, X, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const QuestionSection = ({ onBack, agentState }) => {
  const [answer, setAnswer] = useState('');
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
        setShowFeedback('incorrect'); // Use incorrect style to indicate they need to keep going
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
        desc: "I'm having trouble connecting to the review service, but let's keep discussing! Did you mention Chaturanga or the evolution of the pieces?"
      });
      setShowFeedback('correct');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discussion Prompt</span>
            <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-[#22c55e] rounded-full"></div>
            </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Reflecting on the History of Chess</h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">Think about how chess evolved from a battle simulation to a modern game.</p>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-8 py-6 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
           <div className="h-48 w-full overflow-hidden relative">
             <img 
              src="/assets/chess_bg_new.png" 
              alt="Chess History" 
              className="w-full h-full object-cover"
             />
           </div>
           <div className="p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-3 leading-tight">What was the single most significant rule change in 15th-century Europe that created modern chess, and why was this change made?</h2>
             <p className="text-gray-500 text-sm leading-relaxed mb-6">
               Think about the piece that was recast and what cultural shift might have inspired its new, more powerful role.
             </p>

             <div className="relative">
               <textarea 
                 value={answer}
                 onChange={(e) => setAnswer(e.target.value)}
                 placeholder="Share your thoughts on the global evolution of chess..."
                 rows={4}
                 className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all text-sm text-gray-600 resize-none"
               />
             </div>
           </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="px-8 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
        <button 
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous page
        </button>
        <button 
          onClick={checkAnswer}
          disabled={isChecking}
          className={`px-8 py-2.5 ${isChecking ? 'bg-gray-200 text-gray-400' : 'bg-[#86efac] text-[#166534] hover:bg-[#4ade80]'} text-sm font-bold rounded-lg transition-all flex items-center shadow-sm`}
        >
          {isChecking ? 'Reviewing...' : 'Check answer'}
          <span className="ml-2">→</span>
        </button>
      </div>

      {/* Feedback Overlay */}
      {showFeedback && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <h2 className={`text-2xl font-bold mb-4 leading-tight text-gray-900`}>
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
        </div>
      )}
    </div>
  );
};

export default QuestionSection;
