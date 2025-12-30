
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getLibraResponse } from '../services/geminiService';
import FormattedText from './FormattedText';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';

const SUGGESTIONS = [
  "Shortcut for Profit & Loss",
  "Important Articles of Constitution",
  "Explain Syllogism Rules",
  "Time & Work Formulas",
  "Latest Current Affairs",
  "Banking Terms: Repo Rate"
];

const LibraChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "[BLUE]Hello! I'm Libra, your RAGYU mentor.[/BLUE]\n\nI can help you with Railway and Bank exam preparation. Whether it's a [ORANGE]shortcut for quantitative aptitude[/ORANGE] or a tricky [ORANGE]reasoning puzzle[/ORANGE], just ask!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const content = textOverride || input;
    if (!content.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: content });

    const response = await getLibraResponse(history);

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-500">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-4 flex items-center shrink-0">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3 shadow-sm">
          <span className="text-xl">⚖️</span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-blue-900">Libra AI Mentor</h2>
          <span className="text-[10px] text-blue-500 font-medium flex items-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
            Online • Ready to assist
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-1 pb-4"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-100 rounded-tl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="text-sm">{msg.content}</p>
              ) : (
                <FormattedText content={msg.content} />
              )}
              <span className={`text-[9px] mt-1 block opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Area */}
      <div className="py-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
        <div className="flex space-x-2 px-1">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              disabled={isTyping}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-blue-100 rounded-full text-xs font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <SparklesIcon className="w-3 h-3 text-amber-500" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="mt-2 flex space-x-2 shrink-0">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Libra anything..."
          className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button 
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="w-12 h-12 blue-gradient text-white rounded-2xl flex items-center justify-center shadow-md disabled:opacity-50 active:scale-90 transition-all"
        >
          <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
        </button>
      </div>
    </div>
  );
};

export default LibraChat;
