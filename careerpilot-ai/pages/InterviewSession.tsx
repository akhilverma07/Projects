
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InterviewConfig, ChatTurn, InterviewSessionData } from '../types';
import { startInterview, getNextQuestion, evaluateInterview } from '../services/geminiService';

interface Props {
  config: InterviewConfig;
}

const InterviewSession: React.FC<Props> = ({ config }) => {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const firstQuestion = await startInterview(config);
        setChatHistory([{
          role: 'interviewer',
          content: firstQuestion || "Hello! Let's get started. Could you please introduce yourself and tell me about your background relevant to this role?",
          timestamp: Date.now()
        }]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [config]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userTurn: ChatTurn = {
      role: 'candidate',
      content: input,
      timestamp: Date.now()
    };

    const newHistory = [...chatHistory, userTurn];
    setChatHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      const nextQ = await getNextQuestion(config, newHistory);
      setChatHistory([...newHistory, {
        role: 'interviewer',
        content: nextQ || "That's interesting. Can you elaborate on that?",
        timestamp: Date.now()
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    setLoading(true);
    try {
      const evaluation = await evaluateInterview(config, chatHistory);
      const sessionData: InterviewSessionData = {
        config,
        chatHistory,
        evaluation,
        status: 'completed'
      };

      // Save to local storage
      const existing = JSON.parse(localStorage.getItem('career_pilot_sessions') || '[]');
      localStorage.setItem('career_pilot_sessions', JSON.stringify([...existing, sessionData]));
      
      navigate(`/results/${config.id}`);
    } catch (e) {
      console.error(e);
      setIsFinishing(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-160px)] flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-3xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 leading-tight">{config.role} Session</h2>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{config.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xs font-bold text-green-500 uppercase tracking-wide">Live Simulation</span>
            <span className="text-xs text-gray-400">Interviewer is active</span>
          </div>
          <button 
            onClick={handleFinish}
            disabled={isFinishing || chatHistory.length < 4}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            End & Evaluate
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-grow bg-white overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {chatHistory.map((turn, i) => (
          <div 
            key={i} 
            className={`flex ${turn.role === 'interviewer' ? 'justify-start' : 'justify-end'} animate-slideInUp`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
              turn.role === 'interviewer' 
                ? 'bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200' 
                : 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-100'
            }`}>
              <div className={`text-xs font-bold mb-1 uppercase tracking-widest ${turn.role === 'interviewer' ? 'text-gray-500' : 'text-blue-100'}`}>
                {turn.role}
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{turn.content}</p>
              <div className={`text-[10px] mt-2 text-right opacity-60 ${turn.role === 'interviewer' ? 'text-gray-400' : 'text-blue-50'}`}>
                {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && !isFinishing && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-100 rounded-2xl p-4 rounded-tl-none border border-gray-200 flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        {isFinishing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-center">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin-slow">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 11-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Performance</h2>
              <p className="text-gray-500 mb-6">Our AI is meticulously evaluating your responses across 15 dimensions...</p>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-2/3 animate-progress"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit}
        className="bg-gray-50 p-4 border-t border-gray-100 rounded-b-3xl shadow-inner"
      >
        <div className="relative flex items-end space-x-3">
          <textarea 
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type your answer professionally..."
            className="flex-grow bg-white border border-gray-200 text-gray-900 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none shadow-sm text-sm placeholder:text-gray-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-tighter">
          Press Enter to send • Shift + Enter for new line
        </p>
      </form>
    </div>
  );
};

export default InterviewSession;
