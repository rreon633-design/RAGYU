
import React, { useEffect, useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { User, UserSettings, QuizMode, Difficulty } from '../types';
import { getHistoryFromDB, calculateStreak } from '../services/db';
import { AcademicCapIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import StreakCounter from './streak/StreakCounter';
import ActivityItem from './dashboard/ActivityItem';

interface DashboardProps {
  onStartQuiz: (config?: any) => void;
  user: User;
  settings: UserSettings;
}

interface HistoryItem {
  timestamp: string;
  examName: string;
  subjectName: string;
  player1: {
    score: number;
    accuracy: number;
  };
  totalQuestions: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, user, settings }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const dbHistory = await getHistoryFromDB(user.id);
        setHistory(dbHistory);
        setStreak(calculateStreak(dbHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) loadData();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [user.id]);

  const stats = useMemo(() => {
    if (history.length === 0) return { totalQuizzes: 0, avgAccuracy: 0, xp: 0, level: 1 };
    const totalQuizzes = history.length;
    const avgAccuracy = Math.round(history.reduce((acc, curr) => acc + (curr.player1.accuracy || 0), 0) / totalQuizzes);
    const xp = (totalQuizzes * 10) + (history.reduce((acc, curr) => acc + (curr.player1.score || 0), 0) * 5);
    return { totalQuizzes, avgAccuracy, xp, level: Math.floor(xp / 100) + 1 };
  }, [history]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString();
      const quizzes = history.filter(h => new Date(h.timestamp).toLocaleDateString() === dateStr);
      const score = quizzes.length > 0 ? Math.round(quizzes.reduce((acc, curr) => acc + (curr.player1.accuracy || 0), 0) / quizzes.length) : 0;
      return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), score };
    });
  }, [history]);

  const getRelativeTime = (isoString: string) => {
    const diff = new Date().getTime() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return days === 1 ? 'Yesterday' : `${days}d ago`;
  };

  const hasPreferences = settings.preferredExams.length > 0 || settings.preferredSubjects.length > 0;

  const quickStart = (exam?: string, subject?: string) => {
    onStartQuiz({
      exam: exam || (settings.preferredExams[0] || 'RRB NTPC'),
      subject: subject || (settings.preferredSubjects[0] || 'General Awareness'),
      topics: [],
      questionCount: 10,
      difficulty: Difficulty.MEDIUM,
      mode: QuizMode.SOLO,
      player1Name: user.name || 'Scholar'
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Welcome Section */}
      <section className="brand-gradient rounded-[3rem] p-10 text-white shadow-2xl shadow-brand-lightcyan/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-black font-poppins mb-1 leading-tight">{greeting}, {user.name ? user.name.split(' ')[0] : 'Scholar'}! 👋</h1>
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Lvl {stats.level} Mastery</span>
                <span className="text-[10px] font-black text-brand-lightcyan uppercase tracking-widest opacity-80">{stats.xp} Experience Points</span>
              </div>
            </div>
            <StreakCounter streak={streak} />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-[2.2rem] p-6 border border-white/10 shadow-inner">
              <span className="block text-[9px] uppercase font-black tracking-[0.2em] opacity-60 mb-2">Total Sessions</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black tracking-tighter">{stats.totalQuizzes}</span>
                <span className="text-[10px] font-bold opacity-40 uppercase">Battles</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-[2.2rem] p-6 border border-white/10 shadow-inner">
              <span className="block text-[9px] uppercase font-black tracking-[0.2em] opacity-60 mb-2">Avg Accuracy</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black tracking-tighter">{stats.avgAccuracy}%</span>
                <span className="text-[10px] font-bold opacity-40 uppercase">Precision</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-brand-orange" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Personalized Missions</h2>
          </div>
          {hasPreferences && (
            <button onClick={() => onStartQuiz()} className="text-[9px] font-black text-brand-teal uppercase tracking-widest hover:underline">Customize All</button>
          )}
        </div>

        {hasPreferences ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings.preferredExams.slice(0, 2).map((exam, i) => (
              <button 
                key={`exam-${i}`}
                onClick={() => quickStart(exam)}
                className="flex items-center justify-between p-6 bg-white border-2 border-gray-50 rounded-[2.2rem] hover:border-brand-teal hover:shadow-xl hover:shadow-brand-lightcyan/30 transition-all group text-left active:scale-[0.98]"
              >
                <div className="flex items-center space-x-5">
                   <div className="w-12 h-12 bg-brand-lightcyan/40 rounded-2xl flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-all shadow-sm">
                      <AcademicCapIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight">{exam}</h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Quick Session</p>
                   </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
              </button>
            ))}
            {settings.preferredSubjects.slice(0, 2).map((subj, i) => (
              <button 
                key={`subj-${i}`}
                onClick={() => quickStart(undefined, subj)}
                className="flex items-center justify-between p-6 bg-white border-2 border-gray-50 rounded-[2.2rem] hover:border-brand-orange hover:shadow-xl hover:shadow-brand-peach/20 transition-all group text-left active:scale-[0.98]"
              >
                <div className="flex items-center space-x-5">
                   <div className="w-12 h-12 bg-brand-peach/10 rounded-2xl flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all shadow-sm">
                      <span className="text-xl">📚</span>
                   </div>
                   <div>
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight">{subj}</h3>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Domain Mastery</p>
                   </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[2.5rem] p-10 text-center">
             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <SparklesIcon className="w-8 h-8 text-gray-200" />
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed mb-6">
               Set your preferences in Settings to see<br/>tailored exam recommendations here.
             </p>
             <button onClick={() => (window as any).openRAGYUSettings?.()} className="text-[9px] font-black text-brand-teal uppercase tracking-[0.2em] hover:underline">Open Personalization</button>
          </div>
        )}
      </section>

      {/* Progress Chart */}
      <section className="bg-white p-10 border border-gray-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-center mb-10">
           <div>
             <h2 className="text-lg font-black font-poppins text-gray-900 tracking-tight uppercase">Performance Analytics</h2>
             <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Growth over the last 7 sessions</p>
           </div>
           <div className="flex items-center space-x-3">
              <span className="text-[10px] text-gray-300 font-black uppercase tracking-tighter">Live Insight</span>
              <div className="w-2.5 h-2.5 rounded-full bg-brand-teal animate-pulse"></div>
           </div>
        </div>
        
        <div className="h-64 w-full">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-200">
                <div className="w-12 h-12 border-4 border-gray-50 border-t-brand-teal rounded-full animate-spin mb-4"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Synthesizing Metrics</span>
             </div>
          ) : stats.totalQuizzes > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ec4b6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2ec4b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 900}} dy={15} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', backgroundColor: '#0f172a', padding: '20px' }}
                  itemStyle={{ color: '#2ec4b6', fontSize: '14px', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: number) => [`${value}% Accuracy`, 'Mastery']}
                />
                <Area type="monotone" dataKey="score" stroke="#2ec4b6" strokeWidth={6} fillOpacity={1} fill="url(#colorScore)" animationDuration={1800} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/20">
              <AcademicCapIcon className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Session History Required</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent History */}
      <section>
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-4 bg-gray-900 rounded-full"></div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Chronicle</h2>
          </div>
          <button className="text-[10px] font-black text-brand-teal uppercase tracking-widest hover:underline">Detailed Log</button>
        </div>
        
        <div className="space-y-4">
          {loading ? (
             <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-50/50 rounded-[2.5rem] animate-pulse border border-gray-100"></div>)}
             </div>
          ) : history.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-20 text-center shadow-sm">
              <div className="w-24 h-24 bg-brand-lightcyan/40 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <AcademicCapIcon className="w-12 h-12 text-brand-teal" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Begin Your Legend</h3>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-10">Your first performance data awaits creation</p>
              <button 
                onClick={() => onStartQuiz()}
                className="px-12 py-5 brand-gradient text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-lightcyan/60"
              >
                Engage First Mission
              </button>
            </div>
          ) : (
            history.slice(0, 5).map((item, idx) => (
              <ActivityItem 
                key={idx}
                subject={item.subjectName}
                exam={item.examName}
                accuracy={item.player1.accuracy}
                score={item.player1.score}
                total={item.totalQuestions}
                timeLabel={getRelativeTime(item.timestamp)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
