import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import VideoPlayer from './components/VideoPlayer';
import QuestionSection from './components/QuestionSection';
import PositionTracker from './components/PositionTracker';

function App() {
  const [activeStep, setActiveStep] = useState('video'); // 'video' or 'question'
  const [messages, setMessages] = useState([]);
  const [isJamieTyping, setIsJamieTyping] = useState(false);
  const [isThomasTyping, setIsThomasTyping] = useState(false);
  const [agentState, setAgentState] = useState({
    jamie: {
      opinion: "The most significant change was about making the game faster and more aggressive for players who liked battle simulations.",
      status: "RED"
    },
    thomas: {
      opinion: "The most significant change was the introduction of standardized rules across Europe to allow for international play.",
      status: "RED"
    }
  });

  // Initial greeting - Triggered when moving to the question step
  useEffect(() => {
    if (activeStep === 'question' && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          character: 'jamie',
          content: "The video said chess changed a TON in the 15th century! I'm pretty sure it was all about making the game faster for battle simulations. What do you think, Fiona?",
          timestamp: new Date()
        },
        {
          role: 'assistant',
          character: 'thomas',
          content: "I'm inclined to believe the primary driver was the necessity for rule standardization across European territories. Fiona, does the evidence from the video support my conclusion?",
          timestamp: new Date()
        }
      ]);
    }
  }, [activeStep, messages.length]);

  const handleSendMessage = async (text) => {
    if (isJamieTyping || isThomasTyping) return; 

    // Prevent duplicate submission if same text sent within 1 second
    if (messages.length > 0 && 
        messages[messages.length-1].content === text && 
        messages[messages.length-1].role === 'user' &&
        new Date() - new Date(messages[messages.length-1].timestamp) < 1000) {
      return;
    }

    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setIsJamieTyping(true); // Set early to prevent double submission
    
    getAIResponses(newMessages);
  };

  const getAIResponses = async (history) => {
    setIsJamieTyping(true);
    setIsThomasTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: history, 
          agentState: agentState
        })
      }).then(res => res.json());

      if (response.responses) {
        const newMsgs = response.responses.map(r => ({
          role: 'assistant',
          character: r.character,
          content: r.message,
          timestamp: new Date()
        }));

        setMessages(prev => [...prev, ...newMsgs]);
        
        if (response.updatedState) {
          setAgentState(response.updatedState);
        }
      } else if (response.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          character: 'jamie',
          content: "Sorry, we're having trouble thinking right now. (Error: " + response.error + ")",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error getting AI responses:', error);
    } finally {
      setIsJamieTyping(false);
      setIsThomasTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
      {/* Sidebar - Fix to left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat - Only show when on 'question' step */}
        {activeStep === 'question' && (
          <div className="w-96 border-r border-gray-200 bg-white flex flex-col flex-shrink-0 h-full overflow-hidden animate-in slide-in-from-left duration-300">
            <Chat 
              messages={messages} 
              onSendMessage={handleSendMessage}
              isJamieTyping={isJamieTyping}
              isThomasTyping={isThomasTyping}
              agentState={agentState}
            />
          </div>
        )}

        {/* Main Workspace - Video or Question */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
          {activeStep === 'video' ? (
            <VideoPlayer onComplete={() => setActiveStep('question')} />
          ) : (
            <QuestionSection onBack={() => setActiveStep('video')} agentState={agentState} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
