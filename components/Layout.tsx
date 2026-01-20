
import React from 'react';
import { AppTab, User } from '../types';
import { 
  HomeIcon, 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon, 
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  AcademicCapIcon as AcademicCapIconSolid, 
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  CommandLineIcon as CommandLineIconSolid
} from '@heroicons/react/24/solid';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenSettings?: () => void;
  children: React.ReactNode;
  user?: User | null;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, onOpenSettings, children, user }) => {
  const isChat = activeTab === AppTab.CHATBOT;
  const isCompile = activeTab === AppTab.COMPILE;
  const userInitials = user ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'U';

  return (
    <div className={`flex flex-col bg-white ${(isChat || isCompile) ? 'h-[100dvh] overflow-hidden' : 'min-h-screen pb-20'}`}>
      {/* Top Header */}
      <header className={`z-50 bg-white/80 backdrop-blur-md border-b-[3px] border-brand-teal px-4 h-16 flex items-center justify-between shadow-sm ${(isChat || isCompile) ? 'shrink-0' : 'sticky top-0'}`}>
        <div className="flex items-center">
          <span className="text-2xl font-bold font-poppins text-gray-900 tracking-tight">RAGYU</span>
          <div className="ml-2 h-2 w-2 rounded-full bg-brand-orange animate-pulse"></div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={onOpenSettings}
            className="p-2 text-gray-500 hover:text-brand-teal transition-colors"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
          <button className="p-1 rounded-full border-2 border-transparent hover:border-brand-teal transition-all">
            <div className="w-8 h-8 rounded-full bg-brand-lightcyan flex items-center justify-center text-xs font-bold text-brand-teal">
               {userInitials}
            </div>
          </button>
        </div>
      </header>

      {/* Main Content - Increased max-width for Compile tab to fit PC views better */}
      <main className={`flex-1 w-full ${isCompile ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-4 ${(isChat || isCompile) ? 'overflow-hidden flex flex-col pt-2 pb-20' : 'py-6'}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 bottom-nav-shadow flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab(AppTab.HOME)}
          className={`flex flex-col items-center relative transition-all duration-300 w-20`}
        >
          {activeTab === AppTab.HOME ? <HomeIconSolid className="w-6 h-6 text-brand-teal" /> : <HomeIcon className="w-6 h-6 text-gray-400" />}
          <span className={`text-[9px] mt-1 font-black uppercase tracking-widest ${activeTab === AppTab.HOME ? 'text-brand-teal' : 'text-gray-400'}`}>Home</span>
          {activeTab === AppTab.HOME && <div className="absolute -bottom-2 w-10 h-1 bg-brand-teal rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.QUIZ)}
          className={`flex flex-col items-center relative transition-all duration-300 w-20`}
        >
          {activeTab === AppTab.QUIZ ? <AcademicCapIconSolid className="w-6 h-6 text-brand-teal" /> : <AcademicCapIcon className="w-6 h-6 text-gray-400" />}
          <span className={`text-[9px] mt-1 font-black uppercase tracking-widest ${activeTab === AppTab.QUIZ ? 'text-brand-teal' : 'text-gray-400'}`}>Quiz</span>
          {activeTab === AppTab.QUIZ && <div className="absolute -bottom-2 w-10 h-1 bg-brand-teal rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.COMPILE)}
          className={`flex flex-col items-center relative transition-all duration-300 w-20`}
        >
          {activeTab === AppTab.COMPILE ? <CommandLineIconSolid className="w-6 h-6 text-brand-teal" /> : <CommandLineIcon className="w-6 h-6 text-gray-400" />}
          <span className={`text-[9px] mt-1 font-black uppercase tracking-widest ${activeTab === AppTab.COMPILE ? 'text-brand-teal' : 'text-gray-400'}`}>Code</span>
          {activeTab === AppTab.COMPILE && <div className="absolute -bottom-2 w-10 h-1 bg-brand-teal rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.CHATBOT)}
          className={`flex flex-col items-center relative transition-all duration-300 w-20`}
        >
          {activeTab === AppTab.CHATBOT ? <ChatBubbleLeftRightIconSolid className="w-6 h-6 text-brand-teal" /> : <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-400" />}
          <span className={`text-[9px] mt-1 font-black uppercase tracking-widest ${activeTab === AppTab.CHATBOT ? 'text-brand-teal' : 'text-gray-400'}`}>Libra</span>
          {activeTab === AppTab.CHATBOT && <div className="absolute -bottom-2 w-10 h-1 bg-brand-teal rounded-full" />}
        </button>
      </nav>
    </div>
  );
};

export default Layout;
