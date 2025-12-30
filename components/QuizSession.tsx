
import React, { useState, useEffect, useCallback } from 'react';
import { QuizConfig as IQuizConfig, Question, QuizResult, QuizMode, PlayerResult, UserSettings } from '../types';
import FormattedText from './FormattedText';
import { generateQuizQuestions } from '../services/geminiService';
import { UserIcon, UsersIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface QuizSessionProps {
  config: IQuizConfig;
  userSettings?: UserSettings;
  onComplete: (result: QuizResult) => void;
  onCancel: () => void;
}

const QuizSession: React.FC<QuizSessionProps> = ({ config, userSettings, onComplete, onCancel }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [p1Answers, setP1Answers] = useState<(number | null)[]>([]);
  const [p2Answers, setP2Answers] = useState<(number | null)[]>([]);
  const [p1Time, setP1Time] = useState(0);
  const [p2Time, setP2Time] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch Questions on Mount
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const generatedQuestions = await generateQuizQuestions(config, userSettings);
        setQuestions(generatedQuestions);
        
        // Initialize state based on generated count
        const count = generatedQuestions.length;
        setP1Answers(new Array(count).fill(null));
        setP2Answers(new Array(count).fill(null));
        setTimeLeft(60); // 1 minute per question per player default
      } catch (err) {
        setError("Failed to generate questions. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [config, userSettings]);

  const currentAnswers = activePlayer === 1 ? p1Answers : p2Answers;
  const setAnswers = activePlayer === 1 ? setP1Answers : setP2Answers;

  // Timer Logic
  useEffect(() => {
    if (isLoading || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit if time runs out
          handleNextOrFinish();
          return 0;
        }
        return prev - 1;
      });
      if (activePlayer === 1) setP1Time(t => t + 1);
      else setP2Time(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activePlayer, isLoading, questions.length]); // Removed isIntermission dependency

  const handleOptionSelect = (optionIdx: number) => {
    const newAnswers = [...currentAnswers];
    newAnswers[currentIndex] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNextOrFinish = () => {
    if (config.mode === QuizMode.SOLO) {
      // SOLO FLOW
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setTimeLeft(60); // Reset timer for next question
      } else {
        finalizeResults();
      }
    } else {
      // VERSUS FLOW (1 vs 1)
      // Logic: P1 answers Q1 -> Switch to P2 -> P2 answers Q1 -> Switch to P1 (Next Q)
      
      if (activePlayer === 1) {
        // Switch to Player 2 for the same question
        setActivePlayer(2);
        setTimeLeft(60);
      } else {
        // Player 2 finished their turn for this question.
        if (currentIndex < questions.length - 1) {
          // Switch back to Player 1 for NEXT question.
          setActivePlayer(1);
          setCurrentIndex(prev => prev + 1);
          setTimeLeft(60);
        } else {
          // Both players finished the last question.
          finalizeResults();
        }
      }
    }
  };

  const finalizeResults = useCallback(() => {
    const getPlayerResult = (name: string, answers: (number | null)[], time: number): PlayerResult => {
      let score = 0;
      const processedAnswers = questions.map((q, idx) => {
        const isCorrect = answers[idx] === q.correctIndex;
        if (isCorrect) score++;
        return {
          questionId: q.id,
          selectedOption: answers[idx],
          isCorrect
        };
      });
      return {
        name,
        score,
        accuracy: (score / questions.length) * 100,
        timeTaken: time,
        answers: processedAnswers
      };
    };

    const result: QuizResult = {
      mode: config.mode,
      totalQuestions: questions.length,
      questions: questions,
      player1: getPlayerResult(config.player1Name || 'Player 1', p1Answers, p1Time),
      ...(config.mode === QuizMode.VERSUS ? {
        player2: getPlayerResult(config.player2Name || 'Player 2', p2Answers, p2Time)
      } : {})
    };

    onComplete(result);
  }, [questions, p1Answers, p2Answers, p1Time, p2Time, config, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
        </div>
        <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-2">Curating Your Exam</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Libra is generating {config.questionCount} custom questions for {config.exam} ({config.subject})...
        </p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
          <XMarkIcon className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold font-poppins text-gray-900 mb-2">Generation Failed</h2>
        <p className="text-gray-500 text-sm max-w-xs mb-8">
          {error || "We couldn't generate the questions. Please try again."}
        </p>
        <div className="flex space-x-4">
          <button onClick={onCancel} className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center">
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  // Progress depends on index + player turn to show granular progress
  const baseProgress = (currentIndex / questions.length) * 100;
  const turnProgress = (1 / questions.length) * 100 * (config.mode === QuizMode.VERSUS && activePlayer === 2 ? 1 : 0.5);
  const totalProgress = config.mode === QuizMode.VERSUS ? baseProgress + turnProgress : ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Tab-Shifting Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex flex-col sticky top-0 z-[65]">
        <div className="px-4 h-16 flex items-center justify-between">
          <button 
            onClick={onCancel} 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-full transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          {/* Tab Control */}
          <div className="flex-1 max-w-md mx-4">
             <div className="bg-gray-100/80 p-1 rounded-2xl flex items-center h-11 border border-gray-200/50">
                <div className={`flex-1 h-full flex items-center justify-center rounded-xl transition-all duration-500 ease-out ${activePlayer === 1 ? 'bg-white shadow-lg shadow-blue-100/50 text-blue-600 ring-1 ring-blue-50' : 'text-gray-400 opacity-40 grayscale'}`}>
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span className="text-[11px] font-black truncate max-w-[80px] uppercase tracking-tighter">{config.player1Name}</span>
                </div>
                {config.mode === QuizMode.VERSUS && (
                  <div className={`flex-1 h-full flex items-center justify-center rounded-xl transition-all duration-500 ease-out ${activePlayer === 2 ? 'bg-white shadow-lg shadow-rose-100/50 text-rose-600 ring-1 ring-rose-50' : 'text-gray-400 opacity-40 grayscale'}`}>
                    <UsersIcon className="w-4 h-4 mr-2" />
                    <span className="text-[11px] font-black truncate max-w-[80px] uppercase tracking-tighter">{config.player2Name}</span>
                  </div>
                )}
             </div>
          </div>

          {/* Timer Display */}
          <div className="w-16 flex justify-end">
            <div className={`px-2.5 py-1.5 rounded-xl border-2 font-mono text-[11px] font-black tracking-widest ${timeLeft < 20 ? 'border-rose-100 bg-rose-50 text-rose-600 animate-pulse' : 'border-blue-50 bg-blue-50/50 text-blue-600'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Dynamic Tab Underline */}
        <div className="w-full h-0.5 bg-gray-50 flex">
          <div className={`h-full flex-1 transition-all duration-700 ease-in-out ${activePlayer === 1 ? 'bg-blue-600 scale-x-100' : 'bg-transparent scale-x-0'}`} />
          {config.mode === QuizMode.VERSUS && (
            <div className={`h-full flex-1 transition-all duration-700 ease-in-out ${activePlayer === 2 ? 'bg-rose-600 scale-x-100' : 'bg-transparent scale-x-0'}`} />
          )}
        </div>
      </header>

      {/* Main Quiz Content */}
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-10 max-w-3xl mx-auto w-full pb-32">
        {/* Visual Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
             <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${activePlayer === 1 ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {config.mode === QuizMode.VERSUS ? `${activePlayer === 1 ? config.player1Name : config.player2Name}'s Turn` : 'Solo Run'}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{config.subject}</span>
             </div>
             <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                Question {currentIndex + 1}
                <span className="text-gray-200 ml-2 font-normal">/ {questions.length}</span>
             </h3>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-gray-300 uppercase mb-1">Total Progress</span>
             <div className="text-xl font-bold text-gray-900">{Math.round(totalProgress)}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-gray-100 rounded-full mb-12 overflow-hidden ring-4 ring-gray-50">
          <div 
            className={`h-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) ${activePlayer === 1 ? 'bg-blue-600' : 'bg-rose-600'}`} 
            style={{ width: `${totalProgress}%` }} 
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[3rem] border border-gray-100 p-10 mb-10 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-2 h-full transition-colors duration-500 ${activePlayer === 1 ? 'bg-blue-600' : 'bg-rose-600'}`} />
          <div className="relative z-10">
            <FormattedText content={currentQuestion.text} />
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-5">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = currentAnswers[currentIndex] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full p-6 rounded-[2.5rem] border-2 transition-all duration-300 flex items-center group text-left relative overflow-hidden active:scale-[0.98] ${
                  isSelected
                  ? (activePlayer === 1 ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100 shadow-lg shadow-blue-50' : 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-100 shadow-lg shadow-rose-50')
                  : 'border-gray-50 bg-white hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center font-black text-sm mr-5 transition-all shadow-sm ${
                  isSelected
                  ? (activePlayer === 1 ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white')
                  : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 border border-gray-100'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={`text-base font-bold tracking-tight transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-800'}`}>
                  {option}
                </span>
                {isSelected && (
                  <div className={`absolute right-6 w-3 h-3 rounded-full animate-ping ${activePlayer === 1 ? 'bg-blue-400' : 'bg-rose-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Bar */}
      <footer className="p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex items-center space-x-4 fixed bottom-0 left-0 right-0 z-[65]">
        <div className="max-w-3xl mx-auto w-full flex space-x-4">
          <button
            onClick={() => {
                // Only allow going back if in Solo mode
                if(config.mode === QuizMode.SOLO) setCurrentIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={currentIndex === 0 || config.mode === QuizMode.VERSUS}
            className="w-16 h-16 flex items-center justify-center bg-gray-50 text-gray-400 font-bold rounded-3xl disabled:opacity-20 border border-gray-100 hover:bg-gray-100 active:scale-90 transition-all"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextOrFinish}
            className={`flex-1 h-16 text-white font-black rounded-3xl text-sm tracking-[0.15em] shadow-2xl transition-all active:scale-[0.97] flex items-center justify-center ${
              activePlayer === 1 
              ? 'bg-gradient-to-r from-blue-700 to-blue-500 shadow-blue-200' 
              : 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-rose-200'
            }`}
          >
            {config.mode === QuizMode.VERSUS 
              ? (currentIndex === questions.length - 1 && activePlayer === 2 ? 'FINISH BATTLE' : (activePlayer === 1 ? 'NEXT PLAYER' : 'NEXT QUESTION')) 
              : (currentIndex === questions.length - 1 ? 'SEE RESULTS' : 'PROCEED TO NEXT')
            }
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default QuizSession;
