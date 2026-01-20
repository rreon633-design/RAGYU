
import React from 'react';
import { FireIcon } from '@heroicons/react/24/solid';

interface StreakBannerProps {
  streak: number;
}

const StreakBanner: React.FC<StreakBannerProps> = ({ streak }) => {
  if (streak <= 0) return null;

  return (
    <div className="bg-orange-500 rounded-[2.5rem] p-7 text-white flex items-center justify-between shadow-2xl shadow-orange-200 animate-in slide-in-from-top-4 duration-700 mt-4 overflow-hidden relative">
      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
        <FireIcon className="w-40 h-40" />
      </div>
      
      <div className="flex items-center space-x-5 relative z-10">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
          <FireIcon className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black font-poppins leading-tight tracking-tight">{streak} DAY STREAK!</h2>
          <p className="text-xs font-bold text-orange-100 uppercase tracking-widest opacity-90">Your dedication is paying off</p>
        </div>
      </div>
      
      <div className="hidden sm:block text-5xl font-black opacity-30 select-none relative z-10">
        🔥
      </div>
    </div>
  );
};

export default StreakBanner;
