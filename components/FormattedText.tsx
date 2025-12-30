import React from 'react';

interface FormattedTextProps {
  content: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ content }) => {
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
        return `<div class="katex-display-wrapper my-4 overflow-x-auto flex justify-center py-2">${katex.renderToString(formula, { ...options, displayMode: true })}</div>`;
      } catch (e) {
        return `$$${formula}$$`;
      }
    });

    // 2. Process Inline Math: $ formula $
    processed = processed.replace(/\$([\s\S]+?)\$/g, (_, formula) => {
      try {
        return katex.renderToString(formula, { ...options, displayMode: false });
      } catch (e) {
        return `$${formula}$`;
      }
    });

    return processed;
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
    protectedText = protectedText.replace(/```([\s\S]*?)```/g, (_, code) => {
      codeBlocks.push(code);
      return `___CODE_BLOCK_${codeBlocks.length - 1}___`;
    });

    // 3. Process Tables
    // Matches blocks of lines starting with | to create HTML tables
    protectedText = protectedText.replace(/((?:^|\n)\|[^\n]*\|(?:\n\|[^\n]*\|)+)/g, (match) => {
        const rows = match.trim().split('\n').map(row => row.trim());
        
        // Basic validation: needs at least 2 rows
        if (rows.length < 2) return match;
        
        // Simple parser that splits by pipe
        const parseRow = (row: string) => {
             return row.split('|')
                .filter((c, i, a) => (i > 0 && i < a.length - 1) || c.trim() !== '') // intelligent trim of outer pipes
                .map(c => c.trim());
        };

        const headers = parseRow(rows[0]);
        // Row 1 is usually separator |---|---|
        const bodyRows = rows.slice(2);

        let tableHtml = '<div class="overflow-hidden overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-sm"><table class="min-w-full divide-y divide-gray-200 bg-white text-sm">';
        
        // Header
        tableHtml += '<thead class="bg-gray-50"><tr>';
        headers.forEach(h => {
            tableHtml += `<th class="px-6 py-3 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">${h}</th>`;
        });
        tableHtml += '</tr></thead>';

        // Body
        tableHtml += '<tbody class="divide-y divide-gray-100">';
        bodyRows.forEach(rowStr => {
            const cells = parseRow(rowStr);
            if (cells.length === 0) return;
            tableHtml += '<tr class="hover:bg-gray-50/50 transition-colors">';
            cells.forEach(c => {
                 tableHtml += `<td class="px-6 py-4 text-gray-600 whitespace-pre-wrap leading-relaxed">${c}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table></div>';

        return tableHtml;
    });

    // 4. Standard formatting
    let html = protectedText
      // Horizontal Rule
      .replace(/^---$/gm, '<hr class="my-6 border-gray-200" />')
      
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-gray-900 mt-6 mb-3 font-poppins flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 font-poppins border-l-4 border-blue-500 pl-4 py-1 bg-blue-50/30 rounded-r-lg">$1</h2>')
      
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      
      // Italic
      .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-600">$1</em>')
      
      // Underline
      .replace(/<u>([^<]+)<\/u>/g, '<span class="underline decoration-blue-300 decoration-2 underline-offset-2">$1</span>')
      
      // Color Tags (Enhanced with Badges/Highlights)
      .replace(/\[BLUE\](.*?)\[\/BLUE\]/gis, '<span class="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md font-medium border border-blue-100">$1</span>')
      .replace(/\[GREEN\](.*?)\[\/GREEN\]/gis, '<span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium border border-emerald-100">$1</span>')
      .replace(/\[RED\](.*?)\[\/RED\]/gis, '<span class="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md font-medium border border-rose-100">$1</span>')
      .replace(/\[ORANGE\](.*?)\[\/ORANGE\]/gis, '<span class="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md font-medium border border-amber-100">$1</span>')
      
      // Lists - Unordered
      .replace(/^\s*-\s+(.*)$/gm, '<div class="flex items-start mb-2 pl-2"><span class="mr-2 text-blue-500 mt-1.5 text-xs">•</span><span class="text-gray-700">$1</span></div>')
      // Lists - Ordered
      .replace(/^\s*(\d+)\.\s+(.*)$/gm, '<div class="flex items-start mb-2 pl-2"><span class="mr-2 text-blue-600 font-bold text-xs mt-0.5 bg-blue-50 w-5 h-5 flex items-center justify-center rounded-full border border-blue-100 shrink-0">$1</span><span class="text-gray-700">$2</span></div>')
      
      // Newlines to breaks
      .replace(/\n/g, '<br />');

    // 5. Cleanup HTML structure - remove breaks around block elements
    html = html.replace(/<br \/>\s*(<(?:h\d|div|hr|table|thead|tbody|tr|th|td|pre))/g, '$1');
    html = html.replace(/(<\/(?:h\d|div|hr|table|thead|tbody|tr|th|td|pre)>)\s*<br \/>/g, '$1');

    // 6. Restore Code Blocks
    html = html.replace(/___CODE_BLOCK_(\d+)___/g, (_, id) => {
        const code = codeBlocks[parseInt(id)];
        return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono my-4 shadow-lg ring-1 ring-gray-900/5"><code>${code.trim()}</code></pre>`;
    });

    // 7. Restore Math Blocks
    html = html.replace(/___MATH_BLOCK_(\d+)___/g, (_, id) => {
      const rawMath = mathBlocks[parseInt(id)];
      return renderMathContent(rawMath);
    });

    return html;
  };

  return (
    <div 
      className="formatted-content text-gray-800 leading-relaxed break-words text-sm md:text-base font-inter"
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};

export default FormattedText;