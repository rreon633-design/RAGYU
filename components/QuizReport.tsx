
import React from 'react';
import { QuizResult, QuizConfig as IQuizConfig, QuizMode } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import FormattedText from './FormattedText';

interface QuizReportProps {
  result: QuizResult;
  config: IQuizConfig;
  onDone: () => void;
}

const QuizReport: React.FC<QuizReportProps> = ({ result, config, onDone }) => {
  const isVersus = result.mode === QuizMode.VERSUS;

  const winner = isVersus 
    ? (result.player1.score > (result.player2?.score || 0) ? result.player1 : result.player2)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="text-center">
        {isVersus && (
          <div className="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-200">
            🏆 {winner?.name} Wins the Battle!
          </div>
        )}
        <h1 className="text-3xl font-bold font-poppins text-gray-900">Battle Summary</h1>
        <p className="text-xs text-gray-500 uppercase tracking-tighter">{config.exam} • {config.subject}</p>
      </header>

      <div className={`grid gap-4 ${isVersus ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Player 1 Stats */}
        <section className={`bg-white border-2 ${isVersus && winner === result.player1 ? 'border-amber-400 shadow-amber-50' : 'border-blue-100'} rounded-3xl p-6 shadow-sm transition-all`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold font-poppins text-blue-900">{result.player1.name}</h2>
            <span className="text-[10px] font-bold text-blue-400 border border-blue-100 px-2 py-0.5 rounded-full uppercase">Player 1</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
              <span className="block text-xl font-bold text-blue-600">{result.player1.score}/{result.totalQuestions}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
              <span className="block text-xl font-bold text-blue-600">{Math.round(result.player1.accuracy)}%</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Accuracy</span>
            </div>
          </div>
        </section>

        {/* Player 2 Stats */}
        {isVersus && result.player2 && (
          <section className={`bg-white border-2 ${winner === result.player2 ? 'border-amber-400 shadow-amber-50' : 'border-rose-100'} rounded-3xl p-6 shadow-sm transition-all`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-poppins text-rose-900">{result.player2.name}</h2>
              <span className="text-[10px] font-bold text-rose-400 border border-rose-100 px-2 py-0.5 rounded-full uppercase">Player 2</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                <span className="block text-xl font-bold text-rose-600">{result.player2.score}/{result.totalQuestions}</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
              </div>
              <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100">
                <span className="block text-xl font-bold text-rose-600">{Math.round(result.player2.accuracy)}%</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Accuracy</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Comparison Question Table */}
      {isVersus && (
        <section className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 font-poppins">Head-to-Head Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50/30">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-400 uppercase tracking-wider">No.</th>
                  <th className="px-6 py-3 text-center font-bold text-blue-600 uppercase tracking-wider">{result.player1.name}</th>
                  <th className="px-6 py-3 text-center font-bold text-rose-600 uppercase tracking-wider">{result.player2?.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: result.totalQuestions }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 text-gray-500 font-medium">Q{i+1}</td>
                    <td className="px-6 py-3 text-center text-lg">
                      {result.player1.answers[i].isCorrect ? '✅' : '❌'}
                    </td>
                    <td className="px-6 py-3 text-center text-lg">
                      {result.player2?.answers[i].isCorrect ? '✅' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Solutions Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-poppins text-gray-900 border-l-4 border-blue-600 pl-3">Review Performance</h2>
        {result.player1.answers.map((ans, idx) => {
          // Use index to fallback if ID lookup fails (which shouldn't happen with proper logic)
          const question = result.questions[idx]; 
          
          if (!question) return null;

          return (
            <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-0.5 rounded">QUESTION {idx + 1}</span>
                {ans.isCorrect ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">CORRECT</span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">INCORRECT</span>
                )}
              </div>
              
              <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                 <FormattedText content={question.text} />
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${ans.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Answer</p>
                      <p className={`font-bold ${ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {ans.selectedOption !== null ? question.options[ans.selectedOption] : 'Skipped'}
                      </p>
                    </div>
                    {!ans.isCorrect && (
                      <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Correct Answer</p>
                        <p className="font-bold text-emerald-700">{question.options[question.correctIndex]}</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="bg-blue-50/40 rounded-2xl p-5 text-sm text-blue-900 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center space-x-2">
                     <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px]">💡</div>
                     <span className="font-bold text-blue-900 uppercase tracking-tighter text-xs">Expert Solution</span>
                   </div>
                   {question.explanation.visualAid && (
                     <span className="text-[10px] font-bold text-blue-400 bg-white px-2 py-1 rounded border border-blue-100">Visual Solution Included</span>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* Text Explanation */}
                   <div className={`${question.explanation.visualAid ? 'md:col-span-2' : 'md:col-span-3'}`}>
                      <FormattedText 
                        content={`**Concept:** ${question.explanation.concept}\n\n**Steps:**\n${question.explanation.steps.map(s => `- ${s}`).join('\n')}\n\n[ORANGE]Pro-Tip: ${question.explanation.tricks.join('. ')}[/ORANGE]`} 
                      />
                   </div>

                   {/* Visual Aid Column */}
                   {question.explanation.visualAid && (
                     <div className="md:col-span-1 bg-white rounded-xl border-2 border-dashed border-blue-200 p-2 flex flex-col items-center justify-center">
                        <p className="text-[9px] text-blue-400 uppercase font-bold tracking-widest mb-2 w-full text-center">Visual Aid</p>
                        <div 
                           className="w-full h-auto max-h-48 flex items-center justify-center svg-container"
                           dangerouslySetInnerHTML={{ __html: question.explanation.visualAid }}
                        />
                     </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <footer className="pt-8 flex flex-col space-y-3">
        <button onClick={onDone} className="w-full py-5 blue-gradient text-white font-bold rounded-2xl shadow-2xl shadow-blue-100 hover:scale-[1.01] active:scale-95 transition-all text-lg">
          Back to Dashboard
        </button>
        <button className="w-full py-4 bg-white border-2 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm">
          Download PDF Report
        </button>
      </footer>
    </div>
  );
};

export default QuizReport;
