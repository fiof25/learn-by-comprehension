import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Chat from './components/Chat';
import ReadingViewer from './components/ReadingViewer';
import QuestionSection from './components/QuestionSection';
import HomePage from './components/HomePage';
import LoadingScreen from './components/LoadingScreen';
import QuestionSelectionView from './components/QuestionSelectionView';

function App() {
  const [activeStep, setActiveStep] = useState('home'); // 'home' | 'loading' | 'questionSelect' | 'reading' | 'question'
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

  // Auto-transition from loading to question selection
  useEffect(() => {
    if (activeStep === 'loading') {
      const timer = setTimeout(() => setActiveStep('questionSelect'), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeStep]);

  // Full-page screens before the learning experience
  if (activeStep === 'home') {
    return <HomePage onStartLearning={() => setActiveStep('loading')} />;
  }
  if (activeStep === 'loading') {
    return <LoadingScreen onGoHome={() => setActiveStep('home')} />;
  }
  if (activeStep === 'questionSelect') {
    return <QuestionSelectionView onQuestionSelect={() => setActiveStep('reading')} onGoHome={() => setActiveStep('home')} />;
  }

  const StarIcon = () => (
    <svg viewBox="0 0 32 32" className="w-6 h-5">
      <path
        d="M16 2L19.09 11.26L29 11.44L21.18 17.14L24.09 26.56L16 21.12L7.91 26.56L10.82 17.14L3 11.44L12.91 11.26L16 2Z"
        fill="#FDB022"
      />
    </svg>
  );

  return (
    <div className="h-screen bg-[#f6f6f6] flex flex-col overflow-hidden">
      {/* Navbar */}
      <header className="bg-[#1a1a1a] h-[52px] flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-1 px-3 cursor-pointer" onClick={() => setActiveStep('home')}>
          <StarIcon />
          <span className="text-white text-lg font-bold font-karla">Curiosity</span>
        </div>
        <div className="flex items-center gap-5 text-white text-sm font-mulish">
          <span className="cursor-pointer">Login</span>
          <span className="cursor-pointer">Signup</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden" style={{ height: 'calc(100vh - 52px)' }}>
        {/* Chat - Only show when on 'question' step */}
        {activeStep === 'question' && (
          <div className="w-96 bg-white rounded flex flex-col flex-shrink-0 h-full overflow-hidden">
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
        <main className="flex-1 flex flex-col relative overflow-hidden bg-white rounded">
          {activeStep === 'reading' ? (
            <ReadingViewer onComplete={() => setActiveStep('question')} onBack={() => setActiveStep('questionSelect')} />
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
