
import React, { useState, useEffect, useMemo } from 'react';
import { EXAM_CATEGORIES, SYLLABUS } from '../constants';
import { Difficulty, QuizMode, QuizConfig as IQuizConfig, UserSettings, ExamTrack } from '../types';
import { 
  UserIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  MagnifyingGlassIcon,
  TagIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  HashtagIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  BriefcaseIcon
} from '@heroicons/react/24/solid';

interface QuizConfigProps {
  onStart: (config: IQuizConfig) => void;
  userSettings: UserSettings;
}

const QuizConfig: React.FC<QuizConfigProps> = ({ onStart, userSettings }) => {
  // Determine initial exam track based on last used or preferences
  const [activeTrack, setActiveTrack] = useState<ExamTrack>(() => {
    const lastExam = userSettings.lastUsedExam;
    if (lastExam) {
      const found = EXAM_CATEGORIES.find(c => c.exams.includes(lastExam));
      if (found) return found.track;
    }
    return ExamTrack.GOVERNMENT;
  });

  const initialExam = userSettings.lastUsedExam || (userSettings.preferredExams.length > 0 ? userSettings.preferredExams[0] : EXAM_CATEGORIES[0].exams[0]);
  const initialSubject = userSettings.lastUsedSubject || (userSettings.preferredSubjects.length > 0 ? userSettings.preferredSubjects[0] : SYLLABUS[0].name);

  const [config, setConfig] = useState<IQuizConfig>({
    exam: initialExam,
    subject: initialSubject,
    topics: [],
    questionCount: 5,
    difficulty: Difficulty.MEDIUM,
    mode: QuizMode.SOLO,
    player1Name: 'Scholar 1',
    player2Name: 'Scholar 2'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Categories by Active Track
  const filteredCategories = useMemo(() => {
    return EXAM_CATEGORIES.filter(cat => cat.track === activeTrack);
  }, [activeTrack]);

  // Find category ID for current exam
  const currentCategory = useMemo(() => {
    return EXAM_CATEGORIES.find(cat => cat.exams.includes(config.exam));
  }, [config.exam]);

  // Filter SYLLABUS based on current category
  const filteredSyllabus = useMemo(() => {
    if (!currentCategory) return SYLLABUS;
    return SYLLABUS.filter(item => 
      !item.examCategoryIds || item.examCategoryIds.includes(currentCategory.id)
    );
  }, [currentCategory]);

  // If track changes, auto-select the first exam of that track
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.some(c => c.exams.includes(config.exam))) {
      setConfig(prev => ({ ...prev, exam: filteredCategories[0].exams[0] }));
    }
  }, [activeTrack, filteredCategories]);

  // Reset topics when subject changes
  useEffect(() => {
    setConfig(prev => ({ ...prev, topics: [] }));
    setSearchTerm('');
  }, [config.subject]);

  // Ensure subject is valid for the current exam category
  useEffect(() => {
    const isSubjectValid = filteredSyllabus.some(s => s.name === config.subject);
    if (!isSubjectValid && filteredSyllabus.length > 0) {
      setConfig(prev => ({ ...prev, subject: filteredSyllabus[0].name }));
    }
  }, [filteredSyllabus, config.subject]);

  const activeSyllabusItem = useMemo(() => 
    SYLLABUS.find(s => s.name === config.subject), 
    [config.subject]
  );

  const filteredTopics = useMemo(() => {
    if (!activeSyllabusItem) return [];
    if (!searchTerm) return activeSyllabusItem.subtopics;
    return activeSyllabusItem.subtopics.filter(t => 
      t.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeSyllabusItem, searchTerm]);

  const handleStart = () => {
    if (config.topics.length === 0) {
      alert("Please select at least one topic to begin.");
      return;
    }
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

  const selectAll = () => {
    if (!activeSyllabusItem) return;
    setConfig(prev => ({ ...prev, topics: [...activeSyllabusItem.subtopics] }));
  };

  const clearAll = () => {
    setConfig(prev => ({ ...prev, topics: [] }));
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-24">
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-4xl font-black font-poppins text-gray-900 tracking-tight text-brand-teal">Practice Arena</h1>
          <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1">Configure your personalized session</p>
        </div>
        <div className="w-14 h-14 bg-brand-lightcyan/50 text-brand-teal rounded-2xl flex items-center justify-center shadow-inner border border-brand-teal/10">
          <AdjustmentsHorizontalIcon className="w-7 h-7" />
        </div>
      </header>

      {/* TRACK SELECTOR */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Select Study Track</label>
        </div>
        <div className="flex p-1.5 bg-gray-100 rounded-[2.5rem] border-2 border-transparent">
          {[
            { id: ExamTrack.GOVERNMENT, label: 'Govt. Exams', icon: BriefcaseIcon },
            { id: ExamTrack.CODING, label: 'Coding & Tech', icon: CodeBracketIcon },
            { id: ExamTrack.ACADEMIC, label: 'Entrance / Boards', icon: AcademicCapIcon }
          ].map((track) => (
            <button
              key={track.id}
              onClick={() => setActiveTrack(track.id)}
              className={`flex-1 py-4 px-2 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${
                activeTrack === track.id 
                ? 'bg-white text-brand-teal shadow-xl shadow-brand-lightcyan/40 scale-[1.02]' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <track.icon className={`w-4 h-4 ${activeTrack === track.id ? 'text-brand-teal' : 'text-gray-300'}`} />
              <span className="hidden sm:inline">{track.label}</span>
              <span className="sm:hidden">{track.id === ExamTrack.GOVERNMENT ? 'Govt' : track.id === ExamTrack.CODING ? 'Code' : 'Acad'}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Mode Selection */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Training Mode</label>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <button 
            onClick={() => setConfig({ ...config, mode: QuizMode.SOLO })}
            className={`flex flex-col items-center p-7 rounded-[2.8rem] border-2 transition-all relative group ${
              config.mode === QuizMode.SOLO 
              ? 'border-brand-teal bg-brand-lightcyan/30 shadow-xl shadow-brand-lightcyan/40' 
              : 'border-gray-50 bg-white hover:border-brand-teal/20'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${config.mode === QuizMode.SOLO ? 'bg-brand-teal text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>
              <UserIcon className="w-8 h-8" />
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${config.mode === QuizMode.SOLO ? 'text-brand-teal' : 'text-gray-400'}`}>Solo Focus</span>
          </button>

          <button 
            onClick={() => setConfig({ ...config, mode: QuizMode.VERSUS })}
            className={`flex flex-col items-center p-7 rounded-[2.8rem] border-2 transition-all relative group ${
              config.mode === QuizMode.VERSUS 
              ? 'border-brand-orange bg-brand-peach/10 shadow-xl shadow-brand-peach/20' 
              : 'border-gray-50 bg-white hover:border-brand-orange/20'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${config.mode === QuizMode.VERSUS ? 'bg-brand-orange text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>
              <UsersIcon className="w-8 h-8" />
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${config.mode === QuizMode.VERSUS ? 'text-brand-orange' : 'text-gray-400'}`}>1v1 Challenge</span>
          </button>
        </div>

        {config.mode === QuizMode.VERSUS && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Player 1 Name</label>
              <input 
                type="text" 
                value={config.player1Name} 
                onChange={(e) => setConfig({...config, player1Name: e.target.value})}
                className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-brand-teal outline-none text-sm font-bold text-gray-700"
                placeholder="Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Player 2 Name</label>
              <input 
                type="text" 
                value={config.player2Name} 
                onChange={(e) => setConfig({...config, player2Name: e.target.value})}
                className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-brand-orange outline-none text-sm font-bold text-gray-700"
                placeholder="Name"
              />
            </div>
          </div>
        )}
      </section>

      {/* Intensity & Scale */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="flex items-center space-x-2 ml-1">
            <ChartBarIcon className="w-4 h-4 text-brand-teal" />
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Difficulty Level</label>
          </div>
          <div className="flex p-1.5 bg-gray-50 border border-gray-100 rounded-[2rem]">
            {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((level) => (
              <button
                key={level}
                onClick={() => setConfig({ ...config, difficulty: level })}
                className={`flex-1 py-4 text-[10px] font-black rounded-[1.5rem] transition-all uppercase tracking-widest ${
                  config.difficulty === level 
                  ? 'bg-white text-brand-teal shadow-md border border-brand-teal/10' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center space-x-2 ml-1">
            <HashtagIcon className="w-4 h-4 text-brand-teal" />
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Question Count ({config.questionCount})</label>
          </div>
          <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-6">
            <input 
              type="range" 
              min="5" 
              max="100" 
              step="5"
              value={config.questionCount}
              onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-teal"
            />
            <div className="flex justify-between mt-3 text-[10px] font-black text-gray-300 uppercase tracking-tighter">
              <span>Min: 5</span>
              <span>Max: 100</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Examination */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Target Examination ({activeTrack.toUpperCase()})</label>
        </div>
        <div className="flex flex-wrap gap-3">
          {filteredCategories.flatMap(c => c.exams).map(exam => (
            <button
              key={exam}
              onClick={() => setConfig({ ...config, exam })}
              className={`px-6 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                config.exam === exam 
                ? 'bg-brand-teal text-white border-brand-teal shadow-lg shadow-brand-lightcyan/50 scale-[1.03]' 
                : 'bg-white text-gray-500 border-gray-100 hover:border-brand-teal/30 hover:bg-gray-50'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>
      </section>

      {/* Core Domain - FILTERED */}
      <section className="space-y-5">
        <div className="flex items-center space-x-2 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Relevant Core Domains</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSyllabus.map(item => (
            <button
              key={item.id}
              onClick={() => setConfig({ ...config, subject: item.name })}
              className={`px-8 py-6 rounded-[2.2rem] border-2 text-[11px] font-black uppercase tracking-widest transition-all text-left flex justify-between items-center group ${
                config.subject === item.name 
                ? 'bg-brand-teal text-white border-brand-teal shadow-xl shadow-brand-lightcyan/40' 
                : 'bg-white text-gray-500 border-gray-100 hover:border-brand-teal/20 shadow-sm'
              }`}
            >
              <div className="flex flex-col">
                <span>{item.name}</span>
                <span className={`text-[8px] mt-1 font-bold ${config.subject === item.name ? 'text-white/70' : 'text-gray-300'}`}>
                  {item.subtopics.length} Specializations
                </span>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${config.subject === item.name ? 'bg-white/20' : 'bg-gray-50 text-gray-300'}`}>
                {config.subject === item.name ? <CheckCircleIcon className="w-5 h-5" /> : <TagIcon className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Curriculum Breakdown */}
      {activeSyllabusItem && (
        <section className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-gray-50/50 rounded-[3.5rem] border-2 border-gray-100 p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Curriculum Breakdown</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Master specific sub-topics for {config.subject}</p>
              </div>
              <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 w-full sm:w-72 group focus-within:border-brand-teal transition-all">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-300 group-focus-within:text-brand-teal" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter topics..." 
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-gray-300 w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center space-x-3">
                <div className="bg-brand-teal text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-lightcyan">
                  {config.topics.length} Selected
                </div>
                {config.topics.length > 0 && (
                  <button onClick={clearAll} className="text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest flex items-center space-x-1">
                    <XCircleIcon className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <button onClick={selectAll} className="text-[10px] font-black text-brand-teal hover:underline uppercase tracking-[0.2em]">Select All</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTopics.length > 0 ? (
                filteredTopics.map((topic, idx) => {
                  const isSelected = config.topics.includes(topic);
                  const originalIndex = activeSyllabusItem.subtopics.indexOf(topic) + 1;
                  
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`flex items-center text-left p-5 rounded-[1.8rem] border-2 transition-all group ${
                        isSelected
                        ? 'bg-white border-brand-teal shadow-lg shadow-brand-lightcyan/30'
                        : 'bg-white border-transparent text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-[11px] mr-5 transition-all ${
                        isSelected ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}>
                        {originalIndex.toString().padStart(2, '0')}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-tight flex-1 leading-snug ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                        {topic}
                      </span>
                      {isSelected && <CheckCircleIcon className="w-6 h-6 text-brand-teal ml-2" />}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-300">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <MagnifyingGlassIcon className="w-8 h-8 opacity-20" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest">No matching topics found</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Deployment Action */}
      <div className="fixed bottom-20 left-0 right-0 px-6 sm:static sm:px-0 sm:pt-6 z-40 pointer-events-none">
        <button 
          onClick={handleStart}
          disabled={isLoading || config.topics.length === 0}
          className={`pointer-events-auto w-full max-w-4xl mx-auto py-7 text-white font-black rounded-[2.8rem] shadow-2xl transition-all flex items-center justify-center text-xl uppercase tracking-tighter ${
            config.topics.length === 0 
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
            : 'brand-gradient shadow-brand-lightcyan hover:scale-[1.01] active:scale-95'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-3">
               <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
               <span className="text-sm font-black uppercase tracking-[0.2em]">Deploying Mission</span>
            </div>
          ) : (
            <>
              {config.mode === QuizMode.SOLO ? 'Initiate Solo Mastery' : 'Commence 1v1 Battle'}
            </>
          )}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default QuizConfig;
