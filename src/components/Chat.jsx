import React, { useRef, useEffect } from 'react';
import { Send, Check } from 'lucide-react';

const Chat = ({ messages, onSendMessage, isJamieTyping, isThomasTyping, onFinish, onSubmitAsAnswer }) => {
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

  return (
    <div className="flex flex-col flex-1 min-h-0 justify-between">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-[20px] px-6 pt-6 pb-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-center gap-2'} ${msg.role === 'user' ? 'group relative' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img src={`/assets/${msg.character === 'jamie' ? 'jamiechat.png' : 'thomaschat.png'}`} alt={msg.character} className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`rounded font-mulish ${
              msg.role === 'user'
                ? 'bg-[#fafafa] border border-[#d7d7d7] text-black'
                : 'bg-[#f5f9ff] border border-[#c2d5f2] text-black'
            }`} style={{
              padding: '10px 14px',
              fontSize: '14px',
              lineHeight: '18px',
              maxWidth: msg.role === 'user' ? '380px' : '500px',
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <button
                onClick={() => onSubmitAsAnswer(msg.content)}
                className="absolute -bottom-6 right-0 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 bg-white border border-black/20 rounded shadow-sm text-xs font-mulish text-black/70 hover:text-black hover:border-black/35 transition-all z-10"
              >
                <Check className="w-3 h-3" />
                Submit as answer
              </button>
            )}
          </div>
        ))}

        {(isJamieTyping || isThomasTyping) && (
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 animate-pulse">
              <img src={`/assets/${isJamieTyping ? 'jamiechat.png' : 'thomaschat.png'}`} alt="typing" className="w-full h-full object-cover opacity-50" />
            </div>
            <div className="bg-[#f5f9ff] border border-[#c2d5f2] text-gray-400 rounded font-mulish animate-pulse" style={{ padding: '10px 14px', fontSize: '14px', lineHeight: '18px' }}>
              {isJamieTyping ? 'Jamie is thinking...' : 'Thomas is reflecting...'}
            </div>
          </div>
        )}
      </div>

      {/* Finish conversation button */}
      <div className="flex justify-end px-6 py-2">
        <button
          onClick={onFinish}
          className="bg-white border border-black/35 rounded flex items-center gap-3 text-sm font-mulish text-black hover:bg-gray-50 transition-colors"
          style={{ padding: '8px 16px', height: '36px', lineHeight: '18px' }}
        >
          Finish conversation
          <Check className="w-5 h-5" />
        </button>
      </div>

      {/* Input area */}
      <div className="border-t border-black/30 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-[10px]">
          <input
            name="message"
            autoComplete="off"
            placeholder="Engage in the conversation here..."
            className="flex-1 bg-white border border-black/50 rounded font-mulish outline-none focus:border-black/70 transition-all placeholder:text-black/50"
            style={{ padding: '10px 14px', fontSize: '14px', lineHeight: '18px', height: '40px' }}
          />
          <button type="submit" className="w-10 h-10 bg-white border border-black/35 rounded flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95">
            <Send className="w-5 h-5 text-black" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
