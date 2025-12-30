
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import QuizConfig from './components/QuizConfig';
import QuizSession from './components/QuizSession';
import QuizReport from './components/QuizReport';
import LibraChat from './components/LibraChat';
import SettingsModal from './components/SettingsModal';
import { AppTab, QuizConfig as IQuizConfig, QuizResult, UserSettings } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    preferredExams: [],
    preferredSubjects: [],
    preferredTopics: [],
    theme: 'light'
  });
  
  // Quiz states
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizConfig, setQuizConfig] = useState<IQuizConfig | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Load settings from local storage
  useEffect(() => {
    const saved = localStorage.getItem('ragyu_settings');
    if (saved) setUserSettings(JSON.parse(saved));
  }, []);

  const saveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    localStorage.setItem('ragyu_settings', JSON.stringify(newSettings));
  };

  const startQuiz = (config: IQuizConfig) => {
    setQuizConfig(config);
    setQuizResult(null);
    setIsQuizActive(true);
  };

  const completeQuiz = (result: QuizResult) => {
    setQuizResult(result);
    setIsQuizActive(false);

    // Save result to history for Dashboard
    try {
      const historyStr = localStorage.getItem('ragyu_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      
      // Add timestamp and config details to the history record
      const historyEntry = {
        ...result,
        timestamp: new Date().toISOString(),
        examName: quizConfig?.exam || 'General',
        subjectName: quizConfig?.subject || 'Practice'
      };
      
      const updatedHistory = [...history, historyEntry];
      localStorage.setItem('ragyu_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const resetQuizFlow = () => {
    setQuizResult(null);
    setQuizConfig(null);
    setIsQuizActive(false);
  };

  const renderTabContent = () => {
    if (activeTab === AppTab.QUIZ && quizResult) {
      return (
        <QuizReport 
          result={quizResult} 
          config={quizConfig!} 
          onDone={resetQuizFlow} 
        />
      );
    }

    switch (activeTab) {
      case AppTab.HOME:
        return <Dashboard onStartQuiz={() => setActiveTab(AppTab.QUIZ)} />;
      case AppTab.QUIZ:
        return <QuizConfig onStart={startQuiz} />;
      case AppTab.CHATBOT:
        return <LibraChat />;
      default:
        return <Dashboard onStartQuiz={() => setActiveTab(AppTab.QUIZ)} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onOpenSettings={() => setIsSettingsOpen(true)}
    >
      {renderTabContent()}
      
      {/* Quiz Overlay Session */}
      {isQuizActive && quizConfig && (
        <QuizSession 
          config={quizConfig} 
          userSettings={userSettings}
          onComplete={completeQuiz} 
          onCancel={resetQuizFlow}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSave={saveSettings}
      />
    </Layout>
  );
};

export default App;
