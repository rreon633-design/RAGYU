
import React from 'react';
import { AppTab } from '../types';
import { 
  HomeIcon, 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon, 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  AcademicCapIcon as AcademicCapIconSolid, 
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid 
} from '@heroicons/react/24/solid';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenSettings?: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, onOpenSettings, children }) => {
  const isChat = activeTab === AppTab.CHATBOT;

  return (
    <div className={`flex flex-col bg-white ${isChat ? 'h-[100dvh] overflow-hidden' : 'min-h-screen pb-20'}`}>
      {/* Top Header */}
      <header className={`z-50 bg-white/80 backdrop-blur-md border-b-[3px] border-blue-500 px-4 h-16 flex items-center justify-between shadow-sm ${isChat ? 'shrink-0' : 'sticky top-0'}`}>
        <div className="flex items-center">
          <span className="text-2xl font-bold font-poppins text-blue-800 tracking-tight">RAGYU</span>
          <div className="ml-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onOpenSettings}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
          <button className="p-1 rounded-full border-2 border-transparent hover:border-blue-500 transition-all">
            <img 
              src="https://picsum.photos/seed/user123/40/40" 
              className="w-8 h-8 rounded-full"
              alt="Profile"
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 w-full max-w-4xl mx-auto px-4 ${isChat ? 'overflow-hidden flex flex-col pt-4 pb-20' : 'py-6'}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 bottom-nav-shadow flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab(AppTab.HOME)}
          className={`flex flex-col items-center relative transition-all duration-300 w-24`}
        >
          {activeTab === AppTab.HOME ? <HomeIconSolid className="w-6 h-6 text-blue-600" /> : <HomeIcon className="w-6 h-6 text-gray-400" />}
          <span className={`text-xs mt-1 font-medium ${activeTab === AppTab.HOME ? 'text-blue-600' : 'text-gray-400'}`}>Home</span>
          {activeTab === AppTab.HOME && <div className="absolute -bottom-2 w-full h-0.5 bg-blue-600 rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.QUIZ)}
          className={`flex flex-col items-center relative transition-all duration-300 w-24`}
        >
          {activeTab === AppTab.QUIZ ? <AcademicCapIconSolid className="w-6 h-6 text-blue-600" /> : <AcademicCapIcon className="w-6 h-6 text-gray-400" />}
          <span className={`text-xs mt-1 font-medium ${activeTab === AppTab.QUIZ ? 'text-blue-600' : 'text-gray-400'}`}>Quiz</span>
          {activeTab === AppTab.QUIZ && <div className="absolute -bottom-2 w-full h-0.5 bg-blue-600 rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.CHATBOT)}
          className={`flex flex-col items-center relative transition-all duration-300 w-24`}
        >
          {activeTab === AppTab.CHATBOT ? <ChatBubbleLeftRightIconSolid className="w-6 h-6 text-blue-600" /> : <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-400" />}
          <span className={`text-xs mt-1 font-medium ${activeTab === AppTab.CHATBOT ? 'text-blue-600' : 'text-gray-400'}`}>Libra</span>
          {activeTab === AppTab.CHATBOT && <div className="absolute -bottom-2 w-full h-0.5 bg-blue-600 rounded-full" />}
        </button>
      </nav>
    </div>
  );
};

export default Layout;
