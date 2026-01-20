
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import QuizConfig from './components/QuizConfig';
import QuizSession from './components/QuizSession';
import QuizReport from './components/QuizReport';
import LibraChat from './components/LibraChat';
import CompileScreen from './components/CompileScreen';
import SettingsModal from './components/SettingsModal';
import Auth from './components/Auth';
import { AppTab, QuizConfig as IQuizConfig, QuizResult, UserSettings, User } from './types';
import { initDB, saveQuizResultToDB } from './services/db';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  // Expose settings opening globally for dashboard deep links
  useEffect(() => {
    (window as any).openRAGYUSettings = () => setIsSettingsOpen(true);
    return () => { delete (window as any).openRAGYUSettings; };
  }, []);

  // Initialize DB and Load User/Settings
  useEffect(() => {
    initDB();
    
    // Load Settings
    const savedSettings = localStorage.getItem('ragyu_settings');
    if (savedSettings) setUserSettings(JSON.parse(savedSettings));

    // Load Session
    const savedUser = localStorage.getItem('ragyu_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ragyu_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ragyu_user');
    setActiveTab(AppTab.HOME);
    setQuizResult(null);
    setIsQuizActive(false);
  };

  const saveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    localStorage.setItem('ragyu_settings', JSON.stringify(newSettings));
  };

  const startQuiz = (config?: IQuizConfig) => {
    if (config) {
      setQuizConfig(config);
      setQuizResult(null);
      setIsQuizActive(true);
      
      // Persist last used exam and subject
      const updatedSettings: UserSettings = {
        ...userSettings,
        lastUsedExam: config.exam,
        lastUsedSubject: config.subject
      };
      saveSettings(updatedSettings);
    } else {
      setActiveTab(AppTab.QUIZ);
    }
  };

  const completeQuiz = (result: QuizResult) => {
    setQuizResult(result);
    setIsQuizActive(false);

    if (currentUser) {
      const exam = quizConfig?.exam || 'General';
      const subject = quizConfig?.subject || 'Practice';
      saveQuizResultToDB(result, exam, subject, currentUser.id);
    }
  };

  const resetQuizFlow = () => {
    setQuizResult(null);
    setQuizConfig(null);
    setIsQuizActive(false);
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderTabContent = () => {
    if (activeTab === AppTab.QUIZ && quizResult) {
      return (
        <QuizReport 
          result={quizResult} 
          config={quizConfig!} 
          onDone={resetQuizFlow} 
          userId={currentUser.id}
        />
      );
    }

    switch (activeTab) {
      case AppTab.HOME:
        return <Dashboard user={currentUser} settings={userSettings} onStartQuiz={startQuiz} />;
      case AppTab.QUIZ:
        return <QuizConfig onStart={startQuiz} userSettings={userSettings} />;
      case AppTab.COMPILE:
        return <CompileScreen />;
      case AppTab.CHATBOT:
        return <LibraChat />;
      default:
        return <Dashboard user={currentUser} settings={userSettings} onStartQuiz={startQuiz} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onOpenSettings={() => setIsSettingsOpen(true)}
      user={currentUser}
    >
      {renderTabContent()}
      
      {isQuizActive && quizConfig && (
        <QuizSession 
          config={quizConfig} 
          userSettings={userSettings}
          onComplete={completeQuiz} 
          onCancel={resetQuizFlow}
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSave={saveSettings}
        onLogout={handleLogout}
      />
    </Layout>
  );
};

export default App;
