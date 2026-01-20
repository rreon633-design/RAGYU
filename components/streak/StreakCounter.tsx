
import React from 'react';
import { FireIcon } from '@heroicons/react/24/solid';

interface StreakCounterProps {
  streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
  const isActive = streak > 0;
  
  return (
    <div className={`flex flex-col items-center justify-center px-5 py-2.5 rounded-[1.5rem] border-2 transition-all duration-500 ${
      isActive 
      ? 'bg-brand-peach/20 border-brand-orange shadow-lg shadow-brand-peach/50 scale-105' 
      : 'bg-white/10 border-white/20 opacity-60'
    }`}>
      <div className="relative">
        <FireIcon className={`w-7 h-7 transition-colors duration-500 ${isActive ? 'text-brand-orange animate-pulse' : 'text-gray-200'}`} />
        {isActive && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
          </span>
        )}
      </div>
      <span className={`text-[10px] font-black leading-none mt-1 uppercase tracking-tighter ${isActive ? 'text-white' : 'text-gray-300'}`}>
        {streak} DAY STREAK
      </span>
    </div>
  );
};

export default StreakCounter;
