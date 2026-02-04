import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const Chat = ({ messages, onSendMessage, isJamieTyping, isThomasTyping, agentState }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isJamieTyping, isThomasTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.message;
    if (input.value.trim()) {
      onSendMessage(input.value);
      input.value = '';
    }
  };

  const getStatusStyles = (charId) => {
    const status = agentState[charId]?.status || 'RED';
    if (status === 'GREEN') return 'border-green-500/50 shadow-[0_0_12px_rgba(34,197,94,0.5)]';
    if (status === 'YELLOW') return 'border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.5)]';
    return 'border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="flex flex-col flex-1 bg-white min-h-0">
      {/* Chat Header */}
      <div className="p-5 border-b border-gray-100 flex items-center space-x-4">
        <div className="flex -space-x-4">
          <div className={`w-14 h-14 rounded-full border-4 ${getStatusStyles('jamie')} overflow-hidden bg-orange-100 z-10 transition-all duration-500`}>
            <img src="/assets/jamie_beaver.png" alt="Jamie" className="w-full h-full object-cover" />
          </div>
          <div className={`w-14 h-14 rounded-full border-4 ${getStatusStyles('thomas')} overflow-hidden bg-blue-100 transition-all duration-500`}>
            <img src="/assets/thomas_goose.png" alt="Thomas" className="w-full h-full object-cover" />
          </div>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base leading-tight">Thomas & Jamie</h2>
          <div className="flex items-center mt-0.5">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
            <span className="text-xs text-gray-500 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start space-x-3'}`}>
            {msg.role === 'assistant' && (
              <div className={`w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0 ${msg.character === 'jamie' ? 'bg-orange-100' : 'bg-blue-100'} shadow-sm`}>
                 <img src={`/assets/${msg.character === 'jamie' ? 'jamie_beaver.png' : 'thomas_goose.png'}`} alt={msg.character} className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-[#2563eb] text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {(isJamieTyping || isThomasTyping) && (
          <div className="flex items-start space-x-3">
             <div className={`w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0 ${isJamieTyping ? 'bg-orange-100' : 'bg-blue-100'} shadow-sm animate-pulse`}>
                <img src={`/assets/${isJamieTyping ? 'jamie_beaver.png' : 'thomas_goose.png'}`} alt="typing" className="w-full h-full object-cover opacity-50" />
             </div>
             <div className="bg-white text-gray-400 shadow-sm border border-gray-100 rounded-xl rounded-tl-none px-4 py-2 text-[10px] font-medium animate-pulse">
                {isJamieTyping ? 'Jamie is thinking...' : 'Thomas is reflecting...'}
             </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            name="message"
            autoComplete="off"
            placeholder="Engage in the conversation here..."
            className="flex-1 p-3 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-400"
          />
          <button type="submit" className="p-3 border border-gray-200 text-gray-400 rounded-lg hover:text-blue-600 transition-all active:scale-95">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
