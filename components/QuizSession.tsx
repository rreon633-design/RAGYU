
import React, { useState, useEffect, useCallback } from 'react';
import { QuizConfig as IQuizConfig, Question, QuizResult, QuizMode, PlayerResult, UserSettings } from '../types';
import FormattedText from './FormattedText';
import { generateQuizQuestions } from '../services/geminiService';
import { UserIcon, UsersIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon, UsersIcon as UsersIconSolid } from '@heroicons/react/24/solid';

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

  // Versus Mode Name Entry Step
  const [isReadyToStart, setIsReadyToStart] = useState(config.mode === QuizMode.SOLO);
  const [p1Name, setP1Name] = useState(config.player1Name || 'Scholar 1');
  const [p2Name, setP2Name] = useState(config.player2Name || 'Scholar 2');

  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [p1Answers, setP1Answers] = useState<(number | null)[]>([]);
  const [p2Answers, setP2Answers] = useState<(number | null)[]>([]);
  const [p1Time, setP1Time] = useState(0);
  const [p2Time, setP2Time] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const generatedQuestions = await generateQuizQuestions(config, userSettings);
        setQuestions(generatedQuestions);
        const count = generatedQuestions.length;
        setP1Answers(new Array(count).fill(null));
        setP2Answers(new Array(count).fill(null));
        setTimeLeft(60);
      } catch (err) {
        setError("Generation failed. Check connection.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [config, userSettings]);

  const currentAnswers = activePlayer === 1 ? p1Answers : p2Answers;
  const setAnswers = activePlayer === 1 ? setP1Answers : setP2Answers;

  useEffect(() => {
    if (isLoading || questions.length === 0 || !isReadyToStart) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleNextOrFinish(); return 0; }
        return prev - 1;
      });
      if (activePlayer === 1) setP1Time(t => t + 1);
      else setP2Time(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activePlayer, isLoading, questions.length, isReadyToStart]);

  const handleOptionSelect = (optionIdx: number) => {
    const newAnswers = [...currentAnswers];
    newAnswers[currentIndex] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNextOrFinish = () => {
    if (config.mode === QuizMode.SOLO) {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setTimeLeft(60);
      } else finalizeResults();
    } else {
      if (activePlayer === 1) { setActivePlayer(2); setTimeLeft(60); }
      else {
        if (currentIndex < questions.length - 1) {
          setActivePlayer(1);
          setCurrentIndex(prev => prev + 1);
          setTimeLeft(60);
        } else finalizeResults();
      }
    }
  };

  const finalizeResults = useCallback(() => {
    const getPlayerResult = (name: string, answers: (number | null)[], time: number): PlayerResult => {
      let score = 0;
      const processedAnswers = questions.map((q, idx) => {
        const isCorrect = answers[idx] === q.correctIndex;
        if (isCorrect) score++;
        return { questionId: q.id, selectedOption: answers[idx], isCorrect };
      });
      return { name, score, accuracy: (score / questions.length) * 100, timeTaken: time, answers: processedAnswers };
    };

    onComplete({
      mode: config.mode,
      totalQuestions: questions.length,
      questions: questions,
      player1: getPlayerResult(p1Name, p1Answers, p1Time),
      ...(config.mode === QuizMode.VERSUS ? { player2: getPlayerResult(p2Name, p2Answers, p2Time) } : {})
    });
  }, [questions, p1Answers, p2Answers, p1Time, p2Time, config, onComplete, p1Name, p2Name]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 border-[6px] border-brand-lightcyan rounded-full"></div>
          <div className="absolute inset-0 border-[6px] border-brand-teal rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">⚖️</div>
        </div>
        <h2 className="text-3xl font-black font-poppins text-gray-900 mb-2 tracking-tighter uppercase">Libra is Preparing</h2>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Synthesizing {config.questionCount} Questions...</p>
      </div>
    );
  }

  // Name Entry Overlay for 1vs1
  if (!isReadyToStart && config.mode === QuizMode.VERSUS) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-500">
        <div className="w-full max-w-lg bg-white border-2 border-gray-100 p-12 rounded-[3.5rem] shadow-2xl shadow-brand-lightcyan/20 flex flex-col items-center text-center">
          <div className="w-20 h-20 brand-gradient rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-brand-lightcyan">
             <UsersIconSolid className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black font-poppins text-gray-900 mb-2 tracking-tighter uppercase">Rivalry Awaits</h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-10">Enter contender identities to begin</p>

          <div className="w-full space-y-6 mb-10">
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-brand-teal uppercase tracking-widest ml-1">Player 1 (Defender)</label>
              <input 
                type="text" 
                value={p1Name} 
                onChange={(e) => setP1Name(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-brand-teal outline-none rounded-2xl font-bold text-gray-700 transition-all"
                placeholder="Defender Name"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-brand-orange uppercase tracking-widest ml-1">Player 2 (Challenger)</label>
              <input 
                type="text" 
                value={p2Name} 
                onChange={(e) => setP2Name(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-brand-orange outline-none rounded-2xl font-bold text-gray-700 transition-all"
                placeholder="Challenger Name"
              />
            </div>
          </div>

          <button 
            onClick={() => setIsReadyToStart(true)}
            className="w-full py-6 brand-gradient text-white font-black rounded-2xl shadow-xl shadow-brand-lightcyan uppercase tracking-widest text-xs flex items-center justify-center active:scale-95 transition-all"
          >
            Commence Battle <ArrowRightIcon className="w-5 h-5 ml-3" />
          </button>
          
          <button 
            onClick={onCancel}
            className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-rose-500 transition-colors"
          >
            Retreat to Base
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalProgress = config.mode === QuizMode.VERSUS ? ((currentIndex * 2 + (activePlayer === 2 ? 1 : 0)) / (questions.length * 2)) * 100 : ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      <header className="bg-white/80 backdrop-blur-md border-b-[3px] border-brand-teal flex flex-col sticky top-0 z-[65]">
        <div className="px-4 h-16 flex items-center justify-between">
          <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-gray-50 rounded-full transition-all">
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 max-w-sm mx-4">
             <div className="bg-gray-50 p-1 rounded-2xl flex items-center h-12 border border-gray-100">
                <div className={`flex-1 h-full flex items-center justify-center rounded-xl transition-all duration-500 ${activePlayer === 1 ? 'bg-white shadow-lg text-brand-teal ring-1 ring-brand-lightcyan font-black' : 'text-gray-300 opacity-30 grayscale'}`}>
                  <span className="text-[10px] uppercase tracking-widest truncate px-2">{p1Name}</span>
                </div>
                {config.mode === QuizMode.VERSUS && (
                  <div className={`flex-1 h-full flex items-center justify-center rounded-xl transition-all duration-500 ${activePlayer === 2 ? 'bg-white shadow-lg text-brand-orange ring-1 ring-brand-peach/20 font-black' : 'text-gray-300 opacity-30 grayscale'}`}>
                    <span className="text-[10px] uppercase tracking-widest truncate px-2">{p2Name}</span>
                  </div>
                )}
             </div>
          </div>

          <div className="w-16 flex justify-end">
            <div className={`px-3 py-1.5 rounded-xl font-black text-[11px] tracking-widest ${timeLeft < 15 ? 'bg-brand-orange text-white animate-pulse' : 'bg-brand-lightcyan text-brand-teal'}`}>
              {timeLeft}s
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-10 md:px-12 max-w-4xl mx-auto w-full pb-48">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
             <div className="flex items-center space-x-2">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] ${activePlayer === 1 ? 'bg-brand-teal text-white' : 'bg-brand-orange text-white'}`}>
                  Mission Part {currentIndex + 1}
                </span>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest truncate max-w-[150px]">{config.subject} • {config.difficulty}</span>
             </div>
             <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">Query #{currentIndex + 1}</h3>
          </div>
          <div className="flex flex-col items-end shrink-0">
             <div className="text-2xl md:text-3xl font-black text-brand-teal tracking-tighter">{Math.round(totalProgress)}%</div>
             <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Total Course</span>
          </div>
        </div>

        <div className="w-full h-3 bg-gray-50 rounded-full mb-10 overflow-hidden border border-gray-100 p-1">
          <div className={`h-full rounded-full transition-all duration-700 ${activePlayer === 1 ? 'bg-brand-teal' : 'bg-brand-orange'}`} style={{ width: `${totalProgress}%` }} />
        </div>

        {/* Question Area */}
        <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border-[4px] border-gray-50 p-8 md:p-12 mb-10 shadow-xl shadow-gray-100/50 relative group overflow-hidden transition-all hover:border-brand-teal/10">
          <div className={`absolute top-0 left-0 w-2.5 h-full transition-colors duration-500 ${activePlayer === 1 ? 'bg-brand-teal' : 'bg-brand-orange'}`} />
          <div className="relative z-10">
            <FormattedText 
              content={currentQuestion.text} 
              className="text-lg md:text-xl font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Options Area */}
        <div className="grid grid-cols-1 gap-4 md:gap-5">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = currentAnswers[currentIndex] === idx;
            return (
              <button 
                key={idx} 
                onClick={() => handleOptionSelect(idx)} 
                className={`w-full p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-[3px] transition-all duration-300 flex items-start text-left group relative overflow-hidden active:scale-[0.98] ${
                  isSelected
                  ? (activePlayer === 1 ? 'border-brand-teal bg-brand-lightcyan/10 shadow-xl shadow-brand-lightcyan/20' : 'border-brand-orange bg-brand-peach/5 shadow-xl shadow-brand-peach/10')
                  : 'border-gray-50 bg-white hover:border-brand-teal/20 hover:shadow-lg'
                }`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm md:text-base mr-5 md:mr-6 transition-all shadow-sm ${
                  isSelected ? (activePlayer === 1 ? 'bg-brand-teal text-white' : 'bg-brand-orange text-white') : 'bg-gray-50 text-gray-400 group-hover:bg-brand-teal group-hover:text-white'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-1 pt-1.5 md:pt-2.5">
                  <FormattedText 
                    content={option} 
                    className={`text-sm md:text-lg font-black tracking-tight ${isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="p-6 md:p-8 bg-white/90 backdrop-blur-xl border-t border-gray-100 fixed bottom-0 left-0 right-0 z-[65] shadow-inner">
        <div className="max-w-4xl mx-auto w-full flex space-x-4 md:space-x-6">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} 
            disabled={currentIndex === 0 || config.mode === QuizMode.VERSUS} 
            className="w-16 h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center bg-gray-50 text-gray-300 rounded-2xl md:rounded-[2rem] disabled:opacity-10 border border-gray-100 hover:bg-gray-100 transition-all active:scale-95"
          >
            <ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <button 
            onClick={handleNextOrFinish} 
            className={`flex-1 h-16 md:h-20 text-white font-black rounded-2xl md:rounded-[2rem] text-xs md:text-sm tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center uppercase ${
              activePlayer === 1 ? 'brand-gradient shadow-brand-lightcyan/40' : 'orange-gradient shadow-brand-peach/20'
            }`}
          >
            {currentIndex === questions.length - 1 && (config.mode === QuizMode.SOLO || activePlayer === 2) ? 'Finalize Mission' : 'Advance Stage'}
            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 ml-2" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default QuizSession;
