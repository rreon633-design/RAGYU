
import React, { useState, useEffect } from 'react';
import { EXAM_CATEGORIES, SYLLABUS } from '../constants';
import { Difficulty, QuizMode, QuizConfig as IQuizConfig } from '../types';
import { UserIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface QuizConfigProps {
  onStart: (config: IQuizConfig) => void;
}

const QuizConfig: React.FC<QuizConfigProps> = ({ onStart }) => {
  const [config, setConfig] = useState<IQuizConfig>({
    exam: EXAM_CATEGORIES[0].exams[0],
    subject: SYLLABUS[0].name,
    topics: [],
    questionCount: 5,
    difficulty: Difficulty.MEDIUM,
    mode: QuizMode.SOLO,
    player1Name: 'Player 1',
    player2Name: 'Player 2'
  });

  const [isLoading, setIsLoading] = useState(false);

  // Reset topics when subject changes
  useEffect(() => {
    setConfig(prev => ({ ...prev, topics: [] }));
  }, [config.subject]);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      onStart(config);
      setIsLoading(false);
    }, 1500);
  };

  const toggleTopic = (topic: string) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const selectAllTopics = (subtopics: string[]) => {
    setConfig(prev => ({
      ...prev,
      topics: subtopics
    }));
  };

  const handleSurpriseMe = () => {
    const randomExamCat = EXAM_CATEGORIES[Math.floor(Math.random() * EXAM_CATEGORIES.length)];
    const randomExam = randomExamCat.exams[Math.floor(Math.random() * randomExamCat.exams.length)];
    const randomSyllabus = SYLLABUS[Math.floor(Math.random() * SYLLABUS.length)];
    const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];
    
    setConfig({
      ...config,
      exam: randomExam,
      subject: randomSyllabus.name,
      topics: [randomSyllabus.subtopics[Math.floor(Math.random() * randomSyllabus.subtopics.length)]],
      questionCount: Math.floor(Math.random() * (120 - 5) + 5),
      difficulty: difficulties[Math.floor(Math.random() * 3)],
    });
  };

  const activeSyllabus = SYLLABUS.find(s => s.name === config.subject);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-gray-900">Quiz Setup</h1>
          <p className="text-sm text-gray-500">Customize your practice session</p>
        </div>
        <button 
          onClick={handleSurpriseMe}
          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          title="Surprise Me"
        >
          🎲
        </button>
      </header>

      {/* Mode Selection - High Impact UI */}
      <section className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Mode</label>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setConfig({ ...config, mode: QuizMode.SOLO })}
            className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all relative ${
              config.mode === QuizMode.SOLO 
              ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100' 
              : 'border-gray-100 bg-white hover:border-blue-200 shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${config.mode === QuizMode.SOLO ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
              <UserIcon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-bold ${config.mode === QuizMode.SOLO ? 'text-blue-900' : 'text-gray-500'}`}>Solo Practice</span>
            {config.mode === QuizMode.SOLO && <CheckCircleIcon className="absolute top-3 right-3 w-5 h-5 text-blue-600" />}
          </button>

          <button 
            onClick={() => setConfig({ ...config, mode: QuizMode.VERSUS })}
            className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all relative ${
              config.mode === QuizMode.VERSUS 
              ? 'border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-100' 
              : 'border-gray-100 bg-white hover:border-rose-200 shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${config.mode === QuizMode.VERSUS ? 'bg-rose-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
              <UsersIcon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-bold ${config.mode === QuizMode.VERSUS ? 'text-rose-900' : 'text-gray-500'}`}>1 vs 1 Battle</span>
            {config.mode === QuizMode.VERSUS && <CheckCircleIcon className="absolute top-3 right-3 w-5 h-5 text-rose-500" />}
          </button>
        </div>
      </section>

      {/* 1vs1 Inputs - Light & Clean UI */}
      {config.mode === QuizMode.VERSUS && (
        <section className="space-y-4 p-4 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Player 1 Name</label>
              <input 
                type="text" 
                value={config.player1Name} 
                onChange={(e) => setConfig({ ...config, player1Name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Player 2 Name</label>
              <input 
                type="text" 
                value={config.player2Name} 
                onChange={(e) => setConfig({ ...config, player2Name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-rose-200 rounded-2xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter Name"
              />
            </div>
          </div>
        </section>
      )}

      {/* Exam Category */}
      <section className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Target Exam</label>
        <div className="flex flex-wrap gap-2">
          {EXAM_CATEGORIES.flatMap(c => c.exams).map(exam => (
            <button
              key={exam}
              onClick={() => setConfig({ ...config, exam })}
              className={`px-4 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                config.exam === exam 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>
      </section>

      {/* Subject Area */}
      <section className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject Area</label>
        <div className="grid grid-cols-2 gap-3">
          {SYLLABUS.map(item => (
            <button
              key={item.id}
              onClick={() => setConfig({ ...config, subject: item.name })}
              className={`px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all text-left flex justify-between items-center ${
                config.subject === item.name 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
              }`}
            >
              {item.name}
              {config.subject === item.name && <CheckCircleIcon className="w-5 h-5 text-blue-200" />}
            </button>
          ))}
        </div>
      </section>

      {/* Sub-topics - LIST ALL CLEARLY */}
      {activeSyllabus && (
        <section className="space-y-3 p-5 bg-blue-50/30 rounded-3xl border border-blue-100 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-blue-800 uppercase tracking-widest">Select Topics</label>
            <button 
              onClick={() => selectAllTopics(activeSyllabus.subtopics)}
              className="text-[10px] font-bold text-blue-600 hover:underline"
            >
              Select All
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {activeSyllabus.subtopics.map(topic => {
              const isSelected = config.topics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`flex items-center px-4 py-3 rounded-2xl border-2 transition-all ${
                    isSelected
                    ? 'bg-white border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-white/50 border-transparent text-gray-500 hover:bg-white hover:border-blue-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-gray-600'}`}>
                    {topic}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Sliders and Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question Count</label>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{config.questionCount}</span>
          </div>
          <input 
            type="range" min="5" max="120" step="5"
            value={config.questionCount}
            onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </section>

        <section className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Difficulty</label>
          <div className="flex p-1 bg-gray-100 rounded-2xl">
            {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map(d => (
              <button 
                key={d}
                onClick={() => setConfig({ ...config, difficulty: d })}
                className={`flex-1 py-2.5 text-[10px] font-bold rounded-xl transition-all capitalize ${
                  config.difficulty === d 
                  ? (d === Difficulty.EASY ? 'bg-emerald-500' : d === Difficulty.MEDIUM ? 'bg-amber-500' : 'bg-rose-500') + ' text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Start Button */}
      <div className="pt-4">
        <button 
          onClick={handleStart}
          disabled={isLoading}
          className="w-full py-5 blue-gradient text-white font-bold rounded-3xl shadow-2xl shadow-blue-200 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center text-lg tracking-tight"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              {config.mode === QuizMode.SOLO ? 'Start Practice' : 'Start Battle'}
              <span className="ml-2 opacity-50 text-sm font-normal">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizConfig;
