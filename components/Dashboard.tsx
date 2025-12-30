
import React, { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { AppTab, User } from '../types';
import { getHistoryFromDB } from '../services/db';

interface DashboardProps {
  onStartQuiz: () => void;
  user: User;
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

const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, user }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);

  // Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const dbHistory = await getHistoryFromDB(user.id);
        setHistory(dbHistory);
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
        loadData();
    }

    // Set dynamic greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [user.id]);

  // Compute Stats
  const stats = useMemo(() => {
    if (history.length === 0) return {
      totalQuizzes: 0,
      avgAccuracy: 0,
      xp: 0,
      level: 1
    };

    const totalQuizzes = history.length;
    const totalAccuracy = history.reduce((acc, curr) => acc + (curr.player1.accuracy || 0), 0);
    const avgAccuracy = Math.round(totalAccuracy / totalQuizzes);
    
    // XP Calculation: 10 XP per quiz + 5 XP per correct answer (approx based on score)
    const totalScore = history.reduce((acc, curr) => acc + (curr.player1.score || 0), 0);
    const xp = (totalQuizzes * 10) + (totalScore * 5);
    const level = Math.floor(xp / 100) + 1;

    return { totalQuizzes, avgAccuracy, xp, level };
  }, [history]);

  // Compute Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const dateStr = date.toLocaleDateString();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Find quizzes for this day
      const daysQuizzes = history.filter(h => 
        new Date(h.timestamp).toLocaleDateString() === dateStr
      );

      // Calculate avg score percentage for that day
      let dayScore = 0;
      if (daysQuizzes.length > 0) {
        const totalPct = daysQuizzes.reduce((acc, curr) => acc + (curr.player1.accuracy || 0), 0);
        dayScore = Math.round(totalPct / daysQuizzes.length);
      }

      return { name: dayName, score: dayScore };
    });
  }, [history]);

  // Format relative time helper
  const getRelativeTime = (isoString: string) => {
    const diff = new Date().getTime() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Welcome Section */}
      <section className="blue-gradient rounded-3xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold font-poppins mb-1">{greeting}, {user.name.split(' ')[0]}! 👋</h1>
              <p className="opacity-90 text-sm font-medium text-blue-100">
                {stats.xp > 0 ? `Level ${stats.level} Scholar • ${stats.xp} XP` : 'Start your journey today!'}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
               <span className="text-xs font-bold uppercase tracking-wider">Rank</span>
               <div className="text-lg font-black leading-none">{stats.level < 5 ? 'Novice' : stats.level < 10 ? 'Aspirant' : 'Master'}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors">
              <span className="block text-[10px] uppercase tracking-wider opacity-80 mb-1">Quizzes Taken</span>
              <span className="text-2xl font-bold tracking-tight">{stats.totalQuizzes}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors">
              <span className="block text-[10px] uppercase tracking-wider opacity-80 mb-1">Avg. Accuracy</span>
              <span className="text-2xl font-bold tracking-tight">{stats.avgAccuracy}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={onStartQuiz}
          className="flex flex-col items-center justify-center p-5 bg-white border border-blue-100 rounded-[2rem] hover:shadow-lg hover:shadow-blue-50 transition-all group active:scale-95"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <span className="text-3xl font-light">+</span>
          </div>
          <span className="text-sm font-bold text-gray-800">New Quiz</span>
        </button>
        <div className="flex flex-col items-center justify-center p-5 bg-white border border-emerald-100 rounded-[2rem] hover:shadow-lg hover:shadow-emerald-50 transition-all cursor-pointer active:scale-95">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-3">
            <span className="text-2xl">🏆</span>
          </div>
          <span className="text-sm font-bold text-gray-800">Leaderboard</span>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="bg-white p-6 border border-gray-100 rounded-[2rem] shadow-sm">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-lg font-bold font-poppins text-gray-900">Weekly Progress</h2>
           <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded-lg font-bold uppercase">Last 7 Days</span>
        </div>
        
        <div className="h-48 w-full">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                <span className="text-xs">Loading stats...</span>
             </div>
          ) : stats.totalQuizzes > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 600}} 
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#1e3a8a',
                    color: 'white'
                  }}
                  itemStyle={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: number) => [`${value}%`, 'Accuracy']}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-2xl">
              <span className="text-4xl mb-2">📊</span>
              <span className="text-xs font-medium">No data yet</span>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-bold font-poppins text-gray-900">Recent Activity</h2>
          {history.length > 0 && <span className="text-xs font-bold text-blue-600">View All</span>}
        </div>
        
        <div className="space-y-3">
          {loading ? (
             <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-50 rounded-3xl animate-pulse"></div>
                ))}
             </div>
          ) : history.length === 0 ? (
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 text-center">
              <p className="text-gray-500 text-sm mb-4">You haven't taken any quizzes yet.</p>
              <button 
                onClick={onStartQuiz}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Start First Quiz
              </button>
            </div>
          ) : (
            history.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-3xl hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${
                    item.player1.accuracy >= 80 ? 'bg-emerald-100 text-emerald-600' : 
                    item.player1.accuracy >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {Math.round(item.player1.accuracy)}%
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{item.subjectName}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.examName}</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="flex flex-col items-end">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mb-1 ${
                        item.player1.accuracy >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.player1.score}/{item.totalQuestions}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{getRelativeTime(item.timestamp)}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
