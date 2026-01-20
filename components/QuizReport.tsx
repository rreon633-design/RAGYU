
import React, { useEffect, useState } from 'react';
import { QuizResult, QuizConfig as IQuizConfig, QuizMode } from '../types';
import FormattedText from './FormattedText';
import { calculateStreak, getHistoryFromDB } from '../services/db';
import StreakBanner from './streak/StreakBanner';
import VisualExplanation from './quiz/VisualExplanation';
import PrimaryButton from './common/PrimaryButton';

interface QuizReportProps {
  result: QuizResult;
  config: IQuizConfig;
  onDone: () => void;
  userId?: string;
}

const QuizReport: React.FC<QuizReportProps> = ({ result, config, onDone, userId }) => {
  const [streak, setStreak] = useState(0);
  const isVersus = result.mode === QuizMode.VERSUS;

  useEffect(() => {
    const updateStreak = async () => {
      if (userId) {
        const history = await getHistoryFromDB(userId);
        setStreak(calculateStreak(history));
      }
    };
    updateStreak();
  }, [userId]);

  const winner = isVersus 
    ? (result.player1.score > (result.player2?.score || 0) ? result.player1 : result.player2)
    : null;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-16">
      <StreakBanner streak={streak} />

      <header className="text-center pt-4">
        {isVersus && (
          <div className="inline-block px-5 py-2 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-5 border-2 border-amber-200 shadow-sm">
            🏆 {winner?.name} Secured Victory!
          </div>
        )}
        <h1 className="text-4xl font-black font-poppins text-gray-900 tracking-tight leading-none mb-3">Performance Recap</h1>
        <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.25em]">{config.exam} • {config.subject}</p>
      </header>

      {/* Player Stats Grid */}
      <div className={`grid gap-6 ${isVersus ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        <section className={`bg-white border-2 ${isVersus && winner === result.player1 ? 'border-amber-300 shadow-2xl shadow-amber-50' : 'border-blue-50'} rounded-[2.8rem] p-10 transition-all`}>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black font-poppins text-blue-900">{result.player1.name}</h2>
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full uppercase tracking-widest">Player 1</span>
          </div>
          <div className="grid grid-cols-2 gap-5 text-center">
            <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
              <span className="block text-3xl font-black text-gray-900 leading-none mb-2">{result.player1.score}/{result.totalQuestions}</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Correct Answers</span>
            </div>
            <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
              <span className="block text-3xl font-black text-blue-600 leading-none mb-2">{Math.round(result.player1.accuracy)}%</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Final Accuracy</span>
            </div>
          </div>
        </section>

        {isVersus && result.player2 && (
          <section className={`bg-white border-2 ${winner === result.player2 ? 'border-amber-300 shadow-2xl shadow-amber-50' : 'border-rose-50'} rounded-[2.8rem] p-10 transition-all`}>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black font-poppins text-rose-900">{result.player2.name}</h2>
              <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-4 py-1.5 rounded-full uppercase tracking-widest">Player 2</span>
            </div>
            <div className="grid grid-cols-2 gap-5 text-center">
              <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                <span className="block text-3xl font-black text-gray-900 leading-none mb-2">{result.player2.score}/{result.totalQuestions}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Correct Answers</span>
              </div>
              <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                <span className="block text-3xl font-black text-rose-600 leading-none mb-2">{Math.round(result.player2.accuracy)}%</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Final Accuracy</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Battle Breakdown */}
      {isVersus && (
        <section className="bg-white border-2 border-gray-50 rounded-[2.8rem] overflow-hidden shadow-sm">
          <div className="bg-gray-50/40 px-10 py-6 border-b border-gray-100">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Round Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50/20">
                  <th className="px-10 py-5 text-left font-black text-gray-400 uppercase tracking-widest">No.</th>
                  <th className="px-10 py-5 text-center font-black text-blue-600 uppercase tracking-widest">{result.player1.name}</th>
                  <th className="px-10 py-5 text-center font-black text-rose-600 uppercase tracking-widest">{result.player2?.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: result.totalQuestions }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-10 py-5 text-gray-400 font-black">#{i+1}</td>
                    <td className="px-10 py-5 text-center">
                      {result.player1.answers[i].isCorrect ? <span className="text-xl">✅</span> : <span className="text-xl">❌</span>}
                    </td>
                    <td className="px-10 py-5 text-center">
                      {result.player2?.answers[i].isCorrect ? <span className="text-xl">✅</span> : <span className="text-xl">❌</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Review Section */}
      <section className="space-y-10">
        <h2 className="text-2xl font-black font-poppins text-gray-900 border-l-[12px] border-blue-600 pl-6 py-2 tracking-tighter">Detailed Analysis</h2>
        {result.questions.map((question, idx) => {
          const ans = result.player1.answers[idx];
          if (!question) return null;

          return (
            <div key={idx} className="bg-white border border-gray-100 rounded-[3rem] p-10 space-y-8 shadow-sm hover:shadow-2xl hover:shadow-gray-100 transition-all group overflow-hidden relative">
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black bg-gray-900 text-white px-4 py-1.5 rounded-xl tracking-widest uppercase">Question {idx + 1}</span>
                {ans.isCorrect ? (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">Mastered</span>
                ) : (
                  <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 uppercase tracking-widest">Needs Review</span>
                )}
              </div>
              
              <div className="bg-gray-50/50 rounded-[2.5rem] p-10 border border-gray-100 group-hover:bg-white transition-colors">
                 <FormattedText content={question.text} />
                 <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-8 rounded-[2rem] border-2 ${ans.isCorrect ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Your Selection</p>
                      <p className={`text-base font-black ${ans.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {ans.selectedOption !== null ? question.options[ans.selectedOption] : 'No Answer Provided'}
                      </p>
                    </div>
                    {!ans.isCorrect && (
                      <div className="p-8 rounded-[2rem] border-2 bg-emerald-50/30 border-emerald-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Valid Answer</p>
                        <p className="text-base font-black text-emerald-800">{question.options[question.correctIndex]}</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Libra Insight Box */}
              <div className="blue-gradient rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-100">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-2xl border border-white/20">💡</div>
                  <h3 className="font-black uppercase tracking-widest text-sm">Libra's Expert Breakdown</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className={`${question.explanation.visualAid ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                      <div className="text-base leading-relaxed text-blue-50/90 font-medium">
                        <FormattedText 
                          content={`**Concept:** ${question.explanation.concept}\n\n**Steps:**\n${question.explanation.steps.map(s => `- ${s}`).join('\n')}\n\n[ORANGE]Strategic Tip: ${question.explanation.tricks.join('. ')}[/ORANGE]`} 
                        />
                      </div>
                   </div>

                   {/* Visual Aid Column */}
                   {question.explanation.visualAid && (
                     <div className="lg:col-span-1">
                        <VisualExplanation svgString={question.explanation.visualAid} />
                     </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <footer className="pt-12 flex flex-col space-y-5">
        <PrimaryButton onClick={onDone} variant="blue" className="py-7 text-xl">
          Back to Dashboard
        </PrimaryButton>
        <PrimaryButton variant="white" className="py-5 text-sm">
          Share Results
        </PrimaryButton>
      </footer>
    </div>
  );
};

export default QuizReport;
