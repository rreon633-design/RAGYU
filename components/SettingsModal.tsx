
import React, { useMemo } from 'react';
import { UserSettings, ExamTrack } from '../types';
import { EXAM_CATEGORIES, SYLLABUS } from '../constants';
import { XMarkIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, SparklesIcon, BriefcaseIcon, CodeBracketIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onLogout?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, onLogout }) => {
  if (!isOpen) return null;

  const toggleItem = (list: string[], item: string) => {
    const newList = list.includes(item) 
      ? list.filter(i => i !== item) 
      : [...list, item];
    return newList;
  };

  const tracks = [
    { id: ExamTrack.GOVERNMENT, label: 'Government Excellence', icon: BriefcaseIcon, color: 'text-brand-teal' },
    { id: ExamTrack.CODING, label: 'Coding & Placement', icon: CodeBracketIcon, color: 'text-blue-500' },
    { id: ExamTrack.ACADEMIC, label: 'Academic & Entrance', icon: AcademicCapIcon, color: 'text-brand-orange' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <SparklesIcon className="w-5 h-5 text-brand-teal" />
              <h2 className="text-2xl font-black font-poppins text-gray-900 tracking-tight">Personalize Arena</h2>
            </div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tailor recommendations to your goals</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          {/* Preferred Exams Grouped by TRACK */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-6 bg-brand-teal rounded-full"></div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Target Exams by Path</h3>
            </div>
            
            <div className="space-y-10">
              {tracks.map(track => {
                const categoriesInTrack = EXAM_CATEGORIES.filter(c => c.track === track.id);
                return (
                  <div key={track.id} className="space-y-4">
                    <div className="flex items-center space-x-3 px-1">
                       <track.icon className={`w-5 h-5 ${track.color}`} />
                       <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${track.color}`}>{track.label}</h4>
                    </div>
                    <div className="space-y-6 pl-4 border-l-2 border-gray-50">
                      {categoriesInTrack.map(category => (
                        <div key={category.id} className="space-y-3">
                          <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{category.name}</h5>
                          <div className="flex flex-wrap gap-2">
                            {category.exams.map(exam => {
                              const isSelected = settings.preferredExams.includes(exam);
                              return (
                                <button
                                  key={exam}
                                  onClick={() => onSave({ ...settings, preferredExams: toggleItem(settings.preferredExams, exam) })}
                                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all flex items-center space-x-2 ${
                                    isSelected
                                    ? 'bg-brand-teal text-white border-brand-teal shadow-lg shadow-brand-lightcyan/50'
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-brand-teal/30 hover:bg-gray-50'
                                  }`}
                                >
                                  <span>{exam}</span>
                                  {isSelected && <CheckCircleIcon className="w-3 h-3" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Preferred Subjects */}
          <section className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-6 bg-brand-orange rounded-full"></div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Domain Expertise</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYLLABUS.map(subj => {
                const isSelected = settings.preferredSubjects.includes(subj.name);
                return (
                  <button
                    key={subj.name}
                    onClick={() => onSave({ ...settings, preferredSubjects: toggleItem(settings.preferredSubjects, subj.name) })}
                    className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-between ${
                      isSelected
                      ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-peach/30'
                      : 'bg-white text-gray-500 border-gray-100 hover:border-brand-orange/30 hover:bg-gray-50'
                    }`}
                  >
                    <span>{subj.name}</span>
                    {isSelected ? <CheckCircleIcon className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-gray-100 rounded-full"></div>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Preferred Topics - Compact */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-6 bg-gray-200 rounded-full"></div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Specific Interests</h3>
              </div>
              <span className="text-[9px] font-black text-gray-400 uppercase">{settings.preferredTopics.length} Selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SYLLABUS.flatMap(s => s.subtopics).map(topic => {
                const isSelected = settings.preferredTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => onSave({ ...settings, preferredTopics: toggleItem(settings.preferredTopics, topic) })}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight border transition-all ${
                      isSelected
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </section>

          {onLogout && (
             <section className="pt-8 border-t border-gray-100 pb-4">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center space-x-3 py-5 bg-rose-50 text-rose-600 font-black text-[11px] uppercase tracking-widest rounded-3xl hover:bg-rose-100 transition-all active:scale-95"
                >
                   <ArrowRightOnRectangleIcon className="w-5 h-5" />
                   <span>Sign Out from RAGYU</span>
                </button>
             </section>
          )}
        </div>

        <footer className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-5 brand-gradient text-white font-black rounded-2xl shadow-xl shadow-brand-lightcyan hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Confirm Selection
          </button>
        </footer>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default SettingsModal;
