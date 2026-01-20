
import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ content, className = '' }) => {
  /**
   * Manually render LaTeX segments using katex.renderToString.
   */
  const renderMathContent = (text: string) => {
    const katex = (window as any).katex;
    if (!katex) return text;

    const options = {
      trust: true,
      strict: false,
      throwOnError: false,
      macros: {
        "\\degree": "^\\circ",
        "\\lat": "^{\\circ}#1'N",
        "\\long": "^{\\circ}#1'E"
      }
    };

    // 1. Process Display Math: $$ formula $$
    let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => {
      try {
        return `<div class="katex-display-wrapper my-4 overflow-x-auto flex justify-center py-2 select-all">${katex.renderToString(formula, { ...options, displayMode: true })}</div>`;
      } catch (e) {
        return `$$${formula}$$`;
      }
    });

    // 2. Process Inline Math: $ formula $
    processed = processed.replace(/\$([\s\S]+?)\$/g, (_, formula) => {
      try {
        return `<span class="inline-math whitespace-nowrap">${katex.renderToString(formula, { ...options, displayMode: false })}</span>`;
      } catch (e) {
        return `$${formula}$`;
      }
    });

    return processed;
  };

  /**
   * Custom theme highlighting for code blocks using brand colors.
   * Fixed: replaced $0 with $& (JS standard for full match replacement).
   */
  const highlightCode = (code: string) => {
    // Escape HTML characters first to prevent injection from code
    let escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    return escaped
      // Strings (Orange) - Match text between quotes
      .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-brand-orange">$&</span>')
      // Comments (Gray-500) - Match # or // to end of line
      .replace(/#.*$/gm, '<span class="text-gray-500 italic">$&</span>')
      .replace(/\/\/.*$/gm, '<span class="text-gray-500 italic">$&</span>')
      // Keywords (Teal) - Core language constructs
      .replace(/\b(def|class|return|if|else|elif|for|while|import|from|as|try|except|finally|with|async|await|const|let|var|function|public|private|static|void|int|str|bool|List|Dict)\b/g, '<span class="text-brand-teal font-black">$&</span>')
      // Boolean/Special (Peach)
      .replace(/\b(True|False|None|null|undefined|self|this|true|false)\b/g, '<span class="text-brand-peach">$&</span>')
      // Numbers (Peach)
      .replace(/\b\d+(\.\d+)?\b/g, '<span class="text-brand-peach">$&</span>')
      // Decorators (Teal italic)
      .replace(/@\w+/g, '<span class="text-brand-teal italic opacity-80">$&</span>')
      // Built-in functions (Teal)
      .replace(/\b(print|len|range|enumerate|zip|map|filter|int|str|list|dict|set|super|type)\b/g, '<span class="text-brand-teal opacity-90">$&</span>');
  };

  /**
   * Processes the markdown-like content.
   */
  const processContent = (text: string) => {
    if (!text) return '';

    // 1. Protect Math Blocks
    const mathBlocks: string[] = [];
    let protectedText = text.replace(/(\$\$[\s\S]*?\$\$)|(\$[\s\S]*?\$)|(\\\([\s\S]*?\\\))|(\\\[[\s\S]*?\\\])/g, (match) => {
      mathBlocks.push(match);
      return `___MATH_BLOCK_${mathBlocks.length - 1}___`;
    });

    // 2. Protect Code Blocks
    const codeBlocks: string[] = [];
    protectedText = protectedText.replace(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/g, (_, code) => {
      codeBlocks.push(code);
      return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
    });

    // 3. Process Tables
    protectedText = protectedText.replace(/((?:^|\n)\|[^\n]*\|(?:\n\|[^\n]*\|)+)/g, (match) => {
        const rows = match.trim().split('\n').map(row => row.trim());
        if (rows.length < 2) return match;
        
        const parseRow = (row: string) => {
             return row.split('|')
                .filter((c, i, a) => (i > 0 && i < a.length - 1) || c.trim() !== '')
                .map(c => c.trim());
        };

        const headers = parseRow(rows[0]);
        const bodyRows = rows.slice(2);

        let tableHtml = '<div class="overflow-hidden overflow-x-auto my-6 rounded-2xl border border-gray-100 shadow-sm"><table class="min-w-full divide-y divide-gray-100 bg-white text-sm">';
        tableHtml += '<thead class="bg-gray-50/50"><tr>';
        headers.forEach(h => {
            tableHtml += `<th class="px-5 py-3 text-left font-black text-gray-500 uppercase tracking-widest text-[9px]">${h}</th>`;
        });
        tableHtml += '</tr></thead>';
        tableHtml += '<tbody class="divide-y divide-gray-50">';
        bodyRows.forEach(rowStr => {
            const cells = parseRow(rowStr);
            if (cells.length === 0) return;
            tableHtml += '<tr class="hover:bg-brand-lightcyan/10 transition-colors">';
            cells.forEach(c => {
                 tableHtml += `<td class="px-5 py-4 text-gray-600 whitespace-pre-wrap leading-relaxed">${c}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table></div>';
        return tableHtml;
    });

    // 4. Standard formatting
    let html = protectedText
      .replace(/^---$/gm, '<hr class="my-6 border-gray-100" />')
      .replace(/^### (.*$)/gm, '<h3 class="text-sm md:text-base font-black text-gray-900 mt-6 mb-3 uppercase tracking-widest flex items-center"><span class="w-1 h-4 bg-brand-teal rounded-full mr-3"></span>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg md:text-xl font-black text-gray-900 mt-8 mb-4 tracking-tighter border-b-2 border-brand-teal pb-2">$1</h2>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-brand-peach bg-brand-peach/5 p-4 my-6 rounded-r-2xl text-gray-600 italic leading-relaxed">$1</blockquote>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-black text-gray-900">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-500">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-brand-teal px-1.5 py-0.5 rounded-md font-mono text-[0.9em] font-bold">$1</code>')
      // Color Pills
      .replace(/\[BLUE\](.*?)\[\/BLUE\]/gis, '<span class="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-lightcyan text-brand-teal text-[11px] font-black uppercase tracking-tight border border-brand-teal/20 shadow-sm">$1</span>')
      .replace(/\[GREEN\](.*?)\[\/GREEN\]/gis, '<span class="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-tight border border-emerald-200 shadow-sm">$1</span>')
      .replace(/\[RED\](.*?)\[\/RED\]/gis, '<span class="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-tight border border-rose-200 shadow-sm">$1</span>')
      .replace(/\[ORANGE\](.*?)\[\/ORANGE\]/gis, '<span class="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-peach/10 text-brand-orange text-[11px] font-black uppercase tracking-tight border border-brand-orange/20 shadow-sm">$1</span>')
      // Lists
      .replace(/^\s*-\s+(.*)$/gm, '<div class="flex items-start mb-2.5 pl-1"><span class="mr-3 text-brand-teal mt-2 text-[8px] shrink-0">●</span><span class="text-gray-700 leading-relaxed">$1</span></div>')
      .replace(/^\s*(\d+)\.\s+(.*)$/gm, '<div class="flex items-start mb-2.5 pl-1"><span class="mr-3 text-white font-black text-[9px] mt-1 bg-brand-teal w-5 h-5 flex items-center justify-center rounded-lg shadow-sm shrink-0">$1</span><span class="text-gray-700 leading-relaxed">$2</span></div>')
      .replace(/\n/g, '<br />');

    // Clean up excessive breaks around block elements
    html = html.replace(/<br \/>\s*(<(?:h\d|div|hr|table|thead|tbody|tr|th|td|pre|blockquote))/g, '$1');
    html = html.replace(/(<\/(?:h\d|div|hr|table|thead|tbody|tr|th|td|pre|blockquote)>)\s*<br \/>/g, '$1');

    // 5. Restore Code Blocks
    html = html.replace(/___CODE_BLOCK_(\d+)___/g, (_, id) => {
        const rawCode = codeBlocks[parseInt(id)];
        const highlighted = highlightCode(rawCode);
        return `<div class="relative group my-8">
          <div class="absolute -top-3 left-4 px-3 py-1 bg-gray-900 text-[8px] font-black text-white uppercase tracking-[0.2em] rounded-lg z-10 shadow-lg border border-gray-700">Architecture Log</div>
          <pre class="bg-[#0f172a] text-gray-300 p-8 rounded-[2rem] overflow-x-auto text-[12px] md:text-sm font-mono shadow-2xl ring-1 ring-white/5 leading-relaxed"><code class="block whitespace-pre">${highlighted}</code></pre>
        </div>`;
    });

    // 6. Restore Math Blocks
    html = html.replace(/___MATH_BLOCK_(\d+)___/g, (_, id) => {
      const rawMath = mathBlocks[parseInt(id)];
      return renderMathContent(rawMath);
    });

    return html;
  };

  return (
    <div 
      className={`formatted-content text-gray-800 leading-loose break-words text-sm md:text-base font-inter ${className}`}
      style={{ letterSpacing: '-0.01em' }}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};

export default FormattedText;
