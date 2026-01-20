
import React from 'react';

interface VisualExplanationProps {
  svgString?: string;
}

const VisualExplanation: React.FC<VisualExplanationProps> = ({ svgString }) => {
  if (!svgString) return null;

  return (
    <div className="bg-white rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-inner border-2 border-dashed border-blue-100 transition-all hover:border-blue-300">
      <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest mb-4 opacity-70">Visual Diagram</p>
      <div 
        className="w-full h-auto max-h-56 flex items-center justify-center svg-container overflow-hidden"
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    </div>
  );
};

export default VisualExplanation;
