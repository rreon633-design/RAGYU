
import React from 'react';
import { UserSettings } from '../types';
import { EXAM_CATEGORIES, SYLLABUS } from '../constants';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  if (!isOpen) return null;

  const toggleItem = (list: string[], item: string) => {
    return list.includes(item) 
      ? list.filter(i => i !== item) 
      : [...list, item];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <header className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-poppins text-gray-900">Personalization</h2>
            <p className="text-xs text-gray-500">Tailor your RAGYU experience</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Preferred Exams */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Preferred Exams</h3>
            <div className="flex flex-wrap gap-2">
              {EXAM_CATEGORIES.flatMap(c => c.exams).map(exam => (
                <button
                  key={exam}
                  onClick={() => onSave({ ...settings, preferredExams: toggleItem(settings.preferredExams, exam) })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    settings.preferredExams.includes(exam)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </section>

          {/* Preferred Subjects */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Preferred Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {SYLLABUS.map(subj => (
                <button
                  key={subj.name}
                  onClick={() => onSave({ ...settings, preferredSubjects: toggleItem(settings.preferredSubjects, subj.name) })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    settings.preferredSubjects.includes(subj.name)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {subj.name}
                </button>
              ))}
            </div>
          </section>

          {/* Preferred Topics */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Preferred Topics</h3>
            <div className="flex flex-wrap gap-2">
              {SYLLABUS.flatMap(s => s.subtopics).map(topic => (
                <button
                  key={topic}
                  onClick={() => onSave({ ...settings, preferredTopics: toggleItem(settings.preferredTopics, topic) })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    settings.preferredTopics.includes(topic)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 blue-gradient text-white font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Save Preferences
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
