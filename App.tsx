
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import QuizConfig from './components/QuizConfig';
import QuizSession from './components/QuizSession';
import QuizReport from './components/QuizReport';
import LibraChat from './components/LibraChat';
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

  const startQuiz = (config: IQuizConfig) => {
    setQuizConfig(config);
    setQuizResult(null);
    setIsQuizActive(true);
  };

  const completeQuiz = (result: QuizResult) => {
    setQuizResult(result);
    setIsQuizActive(false);

    if (currentUser) {
      // Save result to Firebase for all users (including guests with UIDs)
      // Optional: If you don't want to save guest data, check if (!currentUser.isGuest)
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

  // If not logged in, show Auth screen
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
        />
      );
    }

    switch (activeTab) {
      case AppTab.HOME:
        return <Dashboard user={currentUser} onStartQuiz={() => setActiveTab(AppTab.QUIZ)} />;
      case AppTab.QUIZ:
        return <QuizConfig onStart={startQuiz} />;
      case AppTab.CHATBOT:
        return <LibraChat />;
      default:
        return <Dashboard user={currentUser} onStartQuiz={() => setActiveTab(AppTab.QUIZ)} />;
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
        onLogout={handleLogout}
      />
    </Layout>
  );
};

export default App;
