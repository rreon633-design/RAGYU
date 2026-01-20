
import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { signInGuest } from '../../services/db';
import { User } from '../../types';

interface GuestLoginProps {
  onLogin: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

const GuestLogin: React.FC<GuestLoginProps> = ({ onLogin, setLoading }) => {
  const handleGuestEntry = async () => {
    setLoading(true);
    try {
      const user = await signInGuest();
      onLogin(user);
    } catch (err) {
      console.error("Guest login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={handleGuestEntry}
        className="w-full py-7 brand-gradient text-white font-black rounded-[2.5rem] shadow-2xl shadow-brand-lightcyan hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        <div className="relative z-10 flex items-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-brand-peach animate-pulse" />
          <span className="text-xl uppercase tracking-tighter">Enter as Guest Explorer</span>
        </div>
        <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] opacity-70 mt-1">Instant Access • No Password Required</span>
      </button>
      
      <div className="px-6 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
          Start practicing immediately. Your progress will be saved locally on this device.
        </p>
      </div>
    </div>
  );
};

export default GuestLogin;
