
import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser, signInWithGoogle } from '../services/db';
import { EnvelopeIcon, LockClosedIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import GuestLogin from './auth/GuestLogin';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showFullAuth, setShowFullAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let user: User;
      if (isLogin) {
        user = await loginUser(email, password);
      } else {
        if (!name.trim()) throw new Error("Name is required");
        user = await registerUser(email, password, name);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[45vh] brand-gradient rounded-b-[5rem] z-0"></div>
      
      <div className="bg-white w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-12 duration-700 border border-gray-50 flex flex-col">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-brand-lightcyan/50 text-brand-teal rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
            India's Elite Prep Platform
          </div>
          <h1 className="text-6xl font-black font-poppins text-brand-teal mb-2 tracking-tighter">RAGYU</h1>
          <p className="text-gray-300 font-bold uppercase tracking-[0.4em] text-[10px]">Railway & Bank Mastery</p>
        </div>

        {/* Primary Guest Entry */}
        {!showFullAuth ? (
          <div className="space-y-12">
            <GuestLogin onLogin={onLogin} setLoading={setLoading} />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[9px] font-black uppercase text-gray-300 tracking-[0.4em]">
                <span className="px-6 bg-white">Professional Access</span>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={signInWithGoogle} 
                className="w-full py-5 border-2 border-gray-100 rounded-[1.8rem] flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all active:scale-95 font-black text-xs uppercase tracking-widest text-gray-500"
              >
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pwa/google.svg" className="w-4 h-4" alt="Google" />
                 <span>Sync with Google</span>
              </button>
              
              <button 
                onClick={() => setShowFullAuth(true)}
                className="w-full py-5 bg-gray-50 text-gray-400 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:text-brand-teal transition-all"
              >
                Log In with Email
              </button>
            </div>
          </div>
        ) : (
          /* Detailed Email Auth Form */
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${isLogin ? 'bg-white text-brand-teal shadow-md' : 'text-gray-400'}`}>Log In</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${!isLogin ? 'bg-white text-brand-teal shadow-md' : 'text-gray-400'}`}>Sign Up</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center"><UserIcon className="h-5 w-5 text-brand-teal opacity-30" /></div>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full pl-12 pr-4 py-4 border-2 border-gray-50 rounded-2xl focus:border-brand-teal focus:outline-none transition-all font-medium text-sm" placeholder="Candidate Name" />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center"><EnvelopeIcon className="h-5 w-5 text-brand-teal opacity-30" /></div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-12 pr-4 py-4 border-2 border-gray-50 rounded-2xl focus:border-brand-teal focus:outline-none transition-all font-medium text-sm" placeholder="exam@portal.com" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Secret Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center"><LockClosedIcon className="h-5 w-5 text-brand-teal opacity-30" /></div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-12 pr-4 py-4 border-2 border-gray-50 rounded-2xl focus:border-brand-teal focus:outline-none transition-all font-medium text-sm" placeholder="••••••••" />
                </div>
              </div>

              {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-bold text-rose-600 uppercase tracking-tight">{error}</div>}

              <button type="submit" disabled={loading} className="w-full mt-6 py-5 brand-gradient text-white font-black rounded-2xl shadow-xl shadow-brand-lightcyan hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center uppercase tracking-widest text-[10px]">
                {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isLogin ? 'Verify & Enter' : 'Create Credentials'} <ArrowRightIcon className="w-4 h-4 ml-2" /></>}
              </button>
            </form>
            
            <button 
              onClick={() => setShowFullAuth(false)}
              className="w-full text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-brand-teal transition-colors"
            >
              Back to Guest Entrance
            </button>
          </div>
        )}

        {loading && !showFullAuth && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-[3.5rem] flex items-center justify-center z-50">
             <div className="w-10 h-10 border-4 border-brand-lightcyan border-t-brand-teal rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
