import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import ReadingViewer from './components/ReadingViewer';
import QuestionSection from './components/QuestionSection';

function App() {
  const [activeStep, setActiveStep] = useState('reading'); // 'reading' or 'question'
  const [showPdfReference, setShowPdfReference] = useState(false); // when on question step, toggle main area to PDF
  const [messages, setMessages] = useState([]);
  const [isJamieTyping, setIsJamieTyping] = useState(false);
  const [isThomasTyping, setIsThomasTyping] = useState(false);
  const [agentState, setAgentState] = useState({
    jamie: {
      opinion: "The drought affected crops like wheat, canola, and barley. People at the ranch faced barren pastures and sold off cattle, and turned to irrigation but due to scarce water supplies it became too expensive.",
      status: "RED"
    },
    thomas: {
      opinion: "The drought affected forests by making trees dry and unhealthy, which caused problems for animals living there. It impacted non-farming communities because some people had to change their routines and deal with environmental challenges. Overall, the drought made life harder outside of farming areas as nature was damaged.",
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
          content: "Wait—I kept thinking crops and ranchers! But the question's about forests and non-farming. What did you get, Fiona?",
          timestamp: new Date()
        },
        {
          role: 'assistant',
          character: 'thomas',
          content: "I don't have strong evidence yet. Fiona, what did the reading say we should use?",
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

        {/* Main Workspace - Reading, or Question + optional PDF reference */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
          {activeStep === 'reading' ? (
            <ReadingViewer onComplete={() => setActiveStep('question')} />
          ) : (
            <>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {showPdfReference ? (
                  <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Reference: Drought Reading</span>
                    </div>
                    <iframe
                      src="/assets/Drought_Reading.pdf"
                      title="Drought Reading"
                      className="flex-1 w-full min-h-0 rounded-lg border border-gray-200 bg-gray-50"
                    />
                  </div>
                ) : (
                  <QuestionSection onBack={() => setActiveStep('reading')} agentState={agentState} />
                )}
              </div>
              {/* Arrow tab: collapse into PDF reading / back to discussion */}
              <button
                type="button"
                onClick={() => setShowPdfReference((v) => !v)}
                className="absolute top-1/2 -translate-y-1/2 right-0 w-8 h-16 flex items-center justify-center bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-l-lg shadow-sm transition-colors z-10"
                title={showPdfReference ? 'Back to discussion' : 'View reading'}
                aria-label={showPdfReference ? 'Back to discussion' : 'View reading'}
              >
                {showPdfReference ? (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
