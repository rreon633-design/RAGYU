
import React, { useState, useEffect, useRef } from 'react';
import { executeCode, PistonResponse, PistonFile } from '../services/pistonService';
import { 
  CommandLineIcon, 
  PlayIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  CheckIcon,
  PlusIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/solid';

const DEFAULT_CODE: Record<string, string> = {
  python: 'print("Hello, RAGYU Scholar!")\n\n# Try solving a problem\ndef greet(name):\n    return f"Welcome to India\'s Elite Prep, {name}!"\n\nprint(greet("Explorer"))',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, RAGYU Scholar!");\n    }\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, RAGYU Scholar!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, RAGYU Scholar!" << std::endl;\n    return 0;\n}'
};

const CompileScreen: React.FC = () => {
  const [language, setLanguage] = useState('python');
  const [files, setFiles] = useState<PistonFile[]>([
    { name: 'main.py', content: DEFAULT_CODE['python'] }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [output, setOutput] = useState<PistonResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const activeFile = files[activeFileIndex];
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll output when it changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isRunning]);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await executeCode(language, files);
      setOutput(res);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    const ext = lang === 'python' ? 'py' : lang === 'cpp' ? 'cpp' : lang;
    setFiles([{ name: `main.${ext}`, content: DEFAULT_CODE[lang] }]);
    setActiveFileIndex(0);
    setOutput(null);
  };

  const updateCode = (content: string) => {
    const updated = [...files];
    updated[activeFileIndex].content = content;
    setFiles(updated);
  };

  const addNewFile = () => {
    const ext = language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language;
    const newFileName = `module_${files.length}.${ext}`;
    setFiles([...files, { name: newFileName, content: '' }]);
    setActiveFileIndex(files.length);
  };

  const deleteFile = (index: number) => {
    if (files.length === 1) return;
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (activeFileIndex >= updated.length) {
      setActiveFileIndex(updated.length - 1);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 max-w-full overflow-hidden">
      {/* Dynamic Header - Optimized for Laptop View */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-1 mb-2 md:mb-4 shrink-0 space-y-2 md:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black font-poppins text-gray-900 tracking-tight flex items-center">
            <Square3Stack3DIcon className="w-5 h-5 mr-2 text-brand-teal" />
            Code Arena
          </h1>
          <p className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">Development Environment</p>
        </div>
        <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-1.5 pb-1">
          {['python', 'java', 'c', 'cpp'].map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-3 py-1 md:px-4 md:py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                language === lang 
                ? 'bg-brand-teal text-white border-brand-teal shadow-md shadow-brand-teal/20' 
                : 'bg-white text-gray-400 border-gray-100 hover:border-brand-teal/30 shadow-sm'
              }`}
            >
              {lang === 'cpp' ? 'C++' : lang}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Area: Symmetrical flex containers for desktop */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden md:items-stretch">
        
        {/* Editor Block */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm overflow-hidden relative">
          {/* Enhanced File Explorer */}
          <div className="bg-gray-50/50 px-3 py-1 border-b border-gray-100 flex items-center shrink-0 space-x-1 overflow-x-auto scrollbar-hide">
            {files.map((f, i) => (
              <div 
                key={i}
                onClick={() => setActiveFileIndex(i)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-xl cursor-pointer transition-all border shrink-0 ${
                  activeFileIndex === i 
                  ? 'bg-white border-brand-teal text-brand-teal shadow-sm' 
                  : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <DocumentIcon className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">{f.name}</span>
                {files.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteFile(i); }}
                    className="p-0.5 hover:bg-rose-50 hover:text-rose-500 rounded-md ml-0.5 transition-colors"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addNewFile}
              className="w-7 h-7 flex items-center justify-center bg-brand-lightcyan/40 text-brand-teal rounded-xl hover:bg-brand-teal hover:text-white transition-all shadow-sm shrink-0"
              title="Add New File"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>

          {/* Sub-header for file info */}
          <div className="bg-white/90 px-5 py-1.5 border-b border-gray-50 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]"></div>
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="ml-1.5 text-[8px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[150px]">
                {activeFile.name}
              </span>
            </div>
            <div className="flex space-x-0.5">
              <button onClick={downloadFile} className="p-1.5 text-gray-400 hover:text-brand-teal transition-colors rounded-lg">
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              </button>
              <button onClick={copyCode} className="p-1.5 text-gray-400 hover:text-brand-teal transition-colors rounded-lg">
                {copied ? <CheckIcon className="w-3.5 h-3.5 text-brand-teal" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          
          {/* Main Code Editor */}
          <textarea
            value={activeFile.content}
            onChange={(e) => updateCode(e.target.value)}
            className="flex-1 p-5 md:p-6 font-mono text-xs md:text-sm bg-transparent border-none focus:ring-0 resize-none outline-none leading-relaxed text-gray-800 scrollbar-hide"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="// Begin writing your algorithm..."
          />
          
          {/* Floating Action Container */}
          <div className="absolute bottom-4 right-4 flex space-x-2 pointer-events-none">
             <button 
              onClick={() => updateCode('')}
              className="pointer-events-auto w-9 h-9 bg-white text-gray-400 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95 shadow-md border border-gray-100"
              title="Clear File"
             >
                <TrashIcon className="w-4 h-4" />
             </button>
             <button 
              onClick={handleRun}
              disabled={isRunning}
              className={`pointer-events-auto px-5 h-9 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center space-x-2 transition-all active:scale-95 shadow-lg ${
                isRunning 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'brand-gradient text-white shadow-brand-teal/30'
              }`}
             >
                {isRunning ? (
                  <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlayIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">Run Project</span>
                    <span className="sm:hidden">Run</span>
                  </>
                )}
             </button>
          </div>
        </div>

        {/* Output Block */}
        <div className={`flex-1 flex flex-col min-h-[180px] md:min-h-0 rounded-[2rem] overflow-hidden border-2 transition-all duration-300 ${output?.run.stderr ? 'border-rose-100 bg-rose-50/10' : 'border-gray-50 bg-[#0f172a] shadow-xl shadow-gray-200/50'}`}>
          <div className="px-5 py-2.5 flex items-center space-x-2.5 border-b border-white/5 shrink-0">
            <CommandLineIcon className={`w-3.5 h-3.5 ${output?.run.stderr ? 'text-rose-500' : 'text-emerald-500'}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${output?.run.stderr ? 'text-rose-500' : 'text-gray-400'}`}>Terminal Output</span>
            {output && (
              <div className="ml-auto flex items-center space-x-2">
                <span className={`text-[7px] font-black px-2 py-0.5 rounded bg-white/5 ${output.run.code === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  CODE {output.run.code}
                </span>
                <button onClick={() => setOutput(null)} className="text-[7px] font-black text-gray-600 hover:text-gray-400 transition-colors uppercase">Clear</button>
              </div>
            )}
          </div>
          <div 
            ref={outputRef}
            className="p-5 md:p-6 flex-1 overflow-y-auto scrollbar-hide font-mono text-xs leading-loose"
          >
            {!output && !isRunning && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-20 select-none">
                 <CommandLineIcon className="w-10 h-10 text-gray-500" />
                 <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">Standby for compilation</p>
              </div>
            )}
            {isRunning && (
              <div className="flex items-center space-x-2.5 animate-pulse text-brand-teal">
                 <div className="w-3 h-3 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Compiling source code...</span>
              </div>
            )}
            {output && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {output.run.stdout && (
                  <pre className="text-emerald-400 whitespace-pre-wrap selection:bg-emerald-500/20">{output.run.stdout}</pre>
                )}
                {output.run.stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap bg-rose-500/5 p-3 rounded-xl mt-2 border border-rose-500/10 selection:bg-rose-500/20">{output.run.stderr}</pre>
                )}
                {!output.run.stdout && !output.run.stderr && (
                  <span className="text-gray-500 italic opacity-50">Process finished with no output.</span>
                )}
              </div>
            )}
          </div>
          <div className="bg-black/20 px-5 py-2 shrink-0 flex items-center justify-between">
             <div className="flex items-center space-x-1.5">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Connection Active</span>
             </div>
             <span className="text-[7px] font-black text-gray-700 uppercase">Piston Node v2.0</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default CompileScreen;
