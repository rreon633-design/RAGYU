
import React from 'react';

interface ActivityItemProps {
  subject: string;
  exam: string;
  accuracy: number;
  score: number;
  total: number;
  timeLabel: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ subject, exam, accuracy, score, total, timeLabel }) => {
  const getColors = () => {
    if (accuracy >= 80) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (accuracy >= 50) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-rose-50 text-rose-600 border-rose-100';
  };

  return (
    <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2.2rem] hover:shadow-xl hover:shadow-gray-100/50 transition-all cursor-pointer group active:scale-98">
      <div className="flex items-center space-x-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black border transition-transform group-hover:scale-110 ${getColors()}`}>
          {Math.round(accuracy)}%
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{subject}</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{exam}</p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end">
        <span className={`text-[10px] px-3 py-1.5 rounded-full font-black mb-1.5 border ${
          accuracy >= 70 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          {score}/{total}
        </span>
        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{timeLabel}</span>
      </div>
    </div>
  );
};

export default ActivityItem;
