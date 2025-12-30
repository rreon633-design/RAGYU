
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { AppTab } from '../types';

const data = [
  { name: 'Mon', score: 65 },
  { name: 'Tue', score: 72 },
  { name: 'Wed', score: 68 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 78 },
  { name: 'Sat', score: 92 },
  { name: 'Sun', score: 88 },
];

interface DashboardProps {
  onStartQuiz: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <section className="blue-gradient rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold font-poppins mb-1">Hello, Aspirant! 👋</h1>
        <p className="opacity-90 text-sm mb-6">You're 15% more active than last week. Keep it up!</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <span className="block text-xs uppercase tracking-wider opacity-80">Quizzes Taken</span>
            <span className="text-xl font-bold">124</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <span className="block text-xs uppercase tracking-wider opacity-80">Avg. Accuracy</span>
            <span className="text-xl font-bold">78%</span>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={onStartQuiz}
          className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-colors group"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2 shadow-md group-hover:scale-110 transition-transform">
            <span className="text-2xl font-bold">+</span>
          </div>
          <span className="text-sm font-semibold text-blue-900">New Quiz</span>
        </button>
        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-2 shadow-md">
            <span className="text-lg">🏆</span>
          </div>
          <span className="text-sm font-semibold text-emerald-900">Leaderboard</span>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold font-poppins mb-4">Performance Streak</h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg font-bold font-poppins mb-3">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { title: 'RRB NTPC - Quantitative', score: '88%', date: '2h ago', status: 'Passed' },
            { title: 'SBI PO - English Mock', score: '62%', date: 'Yesterday', status: 'Review Needed' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.date}</p>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-blue-600">{item.score}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
