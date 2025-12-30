
import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser, signInWithGoogle, signInGuest } from '../services/db';
import { EnvelopeIcon, LockClosedIcon, UserIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
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
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInGuest();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Guest login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-blue-600 rounded-b-[4rem] z-0"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl z-0"></div>
      <div className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-xl z-0"></div>

      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black font-poppins text-blue-900 mb-2 tracking-tight">RAGYU</h1>
          <p className="text-gray-500 font-medium">Government Job Preparation</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Log In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-medium text-rose-600 flex items-start">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Start Learning' : 'Create Account'}
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 border-2 border-gray-100 rounded-2xl flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.52 12.32C23.52 11.532 23.456 10.744 23.328 10H12V14.64H18.456C18.176 16.128 17.336 17.392 16.072 18.24V21.232H19.944C22.208 19.144 23.52 16.032 23.52 12.32Z" fill="#4285F4"/>
              <path d="M12 24C15.24 24 17.96 22.928 19.944 21.232L16.072 18.24C14.992 18.96 13.608 19.392 12 19.392C8.872 19.392 6.224 17.28 5.28 14.456H1.272V17.56C3.256 21.504 7.336 24 12 24Z" fill="#34A853"/>
              <path d="M5.28 14.456C5.032 13.728 4.888 12.96 4.888 12.16C4.888 11.36 5.032 10.592 5.28 9.864V6.76H1.272C0.464 8.36 0 10.192 0 12.16C0 14.128 0.464 15.96 1.272 17.56L5.28 14.456Z" fill="#FBBC05"/>
              <path d="M12 4.936C13.76 4.936 15.344 5.544 16.584 6.728L19.992 3.32C17.952 1.416 15.232 0.328 12 0.328C7.336 0.328 3.256 2.824 1.272 6.76L5.28 9.864C6.224 7.04 8.872 4.936 12 4.936Z" fill="#EA4335"/>
            </svg>
            <span className="font-bold text-gray-700">Google</span>
          </button>
          
          <button 
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3.5 border border-transparent bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 text-sm font-bold hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98]"
          >
             <SparklesIcon className="w-5 h-5 mr-2 text-amber-500" />
             Continue as Guest
          </button>
        </div>

        <p className="text-center mt-8 text-xs text-gray-400">
          By continuing, you agree to RAGYU's Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;
