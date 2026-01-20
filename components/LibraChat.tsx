
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getLibraResponseStream } from '../services/geminiService';
import FormattedText from './FormattedText';
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  StopIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  CheckIcon
} from '@heroicons/react/24/solid';

const SUGGESTIONS = [
  "Java Multi-threading",
  "Python Decorators",
  "OOPs Pillars",
  "React Hooks",
  "Database ACID",
  "AI/ML Foundational",
  "SSC CGL Strategy",
  "GATE Math"
];

const LibraChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isStoppingRef = useRef(false);

  // Use MutationObserver to scroll to bottom when content changes (perfect for streaming)
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };
    
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleStop = () => {
    isStoppingRef.current = true;
  };

  const handleSend = async (textOverride?: string) => {
    const content = textOverride || input;
    if (!content.trim() || isTyping) return;
    
    isStoppingRef.current = false;
    const userMessage: ChatMessage = { role: 'user', content, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    const history = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
    
    const assistantMessage: ChatMessage = { 
      role: 'assistant', 
      content: '', 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    try {
      let accumulatedResponse = '';
      const stream = getLibraResponseStream(history);

      for await (const chunk of stream) {
        if (isStoppingRef.current) {
          // Send a final indicator that it was stopped if needed
          break;
        }
        accumulatedResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = {
              ...assistantMessage,
              content: accumulatedResponse
            };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Stream failed:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            ...assistantMessage,
            content: "I apologize, but I encountered a transmission error. Please try again."
          };
        }
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadResponse = (text: string) => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `libra-response-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAction = (type: 'shorter' | 'longer' | 'retry' | 'edit', msgContent: string, idx: number) => {
    if (isTyping) return;
    
    switch (type) {
      case 'shorter':
        handleSend("Please summarize the previous point more concisely.");
        break;
      case 'longer':
        handleSend("Could you provide more detail and specific examples for that?");
        break;
      case 'retry':
        const lastUserMsg = messages.slice(0, idx).reverse().find(m => m.role === 'user');
        if (lastUserMsg) handleSend(lastUserMsg.content);
        break;
      case 'edit':
        setInput(msgContent);
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 max-w-full overflow-hidden overscroll-none">
      {/* Header - Minimalist */}
      <div className="bg-brand-lightcyan/20 border border-brand-lightcyan/40 rounded-full px-3 py-1.5 mb-4 flex items-center shrink-0 w-fit mx-auto shadow-sm">
        <div className="w-7 h-7 brand-gradient rounded-lg flex items-center justify-center text-white mr-2.5 shadow-sm shrink-0">
          <span className="text-xs">⚖️</span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-[9px] font-black text-brand-teal uppercase tracking-widest leading-none">Libra Intelligence</h2>
          <span className="text-[7px] text-brand-teal/50 font-black flex items-center uppercase tracking-tighter mt-0.5">
            <span className="w-1 h-1 bg-brand-teal rounded-full mr-1 animate-pulse"></span>
            Active Mentor
          </span>
        </div>
      </div>

      {/* Messages Area - Added overscroll-behavior and solid background to fix white flashes */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto space-y-6 px-1 pb-4 scroll-smooth scrollbar-hide bg-white overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-30 select-none">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <ChatBubbleLeftRightIcon className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">
              Consult with RAGYU Intelligence
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[95%] md:max-w-[85%] px-4 py-3 rounded-2xl md:rounded-[2rem] shadow-sm relative ${
                  msg.role === 'user' 
                  ? 'brand-gradient text-white rounded-tr-none' 
                  : 'bg-white border-2 border-gray-50 rounded-tl-none'
                }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                ) : (
                  <FormattedText content={msg.content} />
                )}
                
                <span className={`text-[7px] mt-2 block font-black uppercase opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Action Toolbar for AI Responses */}
              {msg.role === 'assistant' && msg.content && (
                <div className="mt-2 flex items-center space-x-1 overflow-x-auto scrollbar-hide max-w-full px-1 py-1">
                  <button 
                    onClick={() => copyToClipboard(msg.content, idx)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-gray-100 rounded-xl text-[8px] font-black uppercase text-gray-400 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all shrink-0"
                  >
                    {copiedId === idx ? <CheckIcon className="w-3 h-3 text-brand-teal" /> : <DocumentDuplicateIcon className="w-3 h-3" />}
                    <span>{copiedId === idx ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button 
                    onClick={() => handleAction('retry', msg.content, idx)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-gray-100 rounded-xl text-[8px] font-black uppercase text-gray-400 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all shrink-0"
                  >
                    <ArrowPathIcon className="w-3 h-3" />
                    <span>Retry</span>
                  </button>

                  <button 
                    onClick={() => handleAction('shorter', msg.content, idx)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-gray-100 rounded-xl text-[8px] font-black uppercase text-gray-400 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all shrink-0"
                  >
                    <ArrowsPointingInIcon className="w-3 h-3" />
                    <span>Shorter</span>
                  </button>

                  <button 
                    onClick={() => handleAction('longer', msg.content, idx)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-gray-100 rounded-xl text-[8px] font-black uppercase text-gray-400 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all shrink-0"
                  >
                    <ArrowsPointingOutIcon className="w-3 h-3" />
                    <span>Longer</span>
                  </button>

                  <button 
                    onClick={() => handleAction('edit', msg.content, idx)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-gray-100 rounded-xl text-[8px] font-black uppercase text-gray-400 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all shrink-0"
                  >
                    <PencilSquareIcon className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button 
                    onClick={() => downloadResponse(msg.content)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white border border-gray-100 rounded-xl text-[8px] font-black uppercase text-gray-400 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all shrink-0"
                  >
                    <ArrowDownTrayIcon className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {isTyping && messages[messages.length-1]?.content === '' && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-brand-lightcyan/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-brand-lightcyan/20">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-brand-teal rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-brand-teal rounded-full animate-bounce delay-100"></div>
                <div className="w-1 h-1 bg-brand-teal rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Area */}
      <div className="py-3 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0 -mx-1 px-1 border-t border-gray-50">
        <div className="flex space-x-2">
          {SUGGESTIONS.map((s, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(s)} 
              disabled={isTyping} 
              className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-100 rounded-full text-[8px] font-black uppercase tracking-wider text-gray-400 hover:text-brand-teal hover:border-brand-teal hover:shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <SparklesIcon className="w-2.5 h-2.5 text-brand-orange" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area - Cleaner, no black outline */}
      <div className="mt-1 shrink-0 pb-6 md:pb-4">
        <div className="flex items-center bg-gray-50 border-2 border-transparent focus-within:border-brand-teal focus-within:bg-white rounded-[2rem] p-1.5 shadow-sm transition-all duration-300">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()} 
            placeholder="Ask Libra anything..." 
            className="flex-1 bg-transparent border-none focus:ring-0 px-5 py-2.5 text-sm font-medium placeholder:text-gray-300 outline-none" 
          />
          {isTyping ? (
            <button 
              onClick={handleStop}
              className="w-11 h-11 bg-rose-500 text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-rose-200 active:scale-90 transition-all shrink-0 ml-1"
            >
              <StopIcon className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim()} 
              className="w-11 h-11 brand-gradient text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-brand-lightcyan/40 disabled:opacity-50 disabled:grayscale active:scale-90 transition-all shrink-0 ml-1"
            >
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
            </button>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        /* Prevent scroll chaining for better mobile feel */
        .overscroll-contain { overscroll-behavior-y: contain; }
      `}} />
    </div>
  );
};

export default LibraChat;
