import React from 'react';
import { PawPrint, User, AlertTriangle } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user' || message.sender === 'user';
  
  // Detect emergency signals from message content safely
  const contentText = message.content || message.text || '';
  const isEmergency = !isUser && contentText.includes('🚨');

  // Convert markdown-like syntax (**text**, `code`, list items) securely to React elements
  const formatText = (text = '') => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Check if line is a bullet point: starts with * or - or •
      const isBullet = /^\s*[\*\-\•]\s+(.*)/.test(line);
      // Check if line is a numbered list item: starts with digit + dot
      const isNumbered = /^\s*\d+\.\s+(.*)/.test(line);
      
      let content = line;
      let bulletIcon = null;
      let numberedIndex = null;
      
      if (isBullet) {
        content = line.replace(/^\s*[\*\-\•]\s+/, '');
        // Render a cute mini paw print as bullet icon
        bulletIcon = <span className="inline-block text-sky-400 mr-2 select-none text-[10px]">🐾</span>;
      } else if (isNumbered) {
        const match = line.match(/^\s*(\d+)\.\s+(.*)/);
        if (match) {
          numberedIndex = match[1];
          content = match[2];
          bulletIcon = <span className="inline-block text-violet-400 mr-2 font-bold select-none text-[11px]">{numberedIndex}.</span>;
        }
      }
      
      // Parse bold (**text**) and code (`text`) inline elements
      const parseInline = (str) => {
        const boldParts = str.split('**');
        return boldParts.map((boldPart, boldIdx) => {
          const isBold = boldIdx % 2 === 1;
          
          // Parse single backticks `code`
          const codeParts = boldPart.split('`');
          const codeElements = codeParts.map((codePart, codeIdx) => {
            const isCode = codeIdx % 2 === 1;
            if (isCode) {
              return (
                <code key={codeIdx} className="bg-slate-950/65 border border-white/10 text-sky-300 font-mono px-1.5 py-0.5 rounded text-[10px] select-all">
                  {codePart}
                </code>
              );
            }
            return codePart;
          });
          
          if (isBold) {
            return (
              <strong key={boldIdx} className={isUser ? "font-extrabold text-slate-950" : "font-extrabold text-slate-100"}>
                {codeElements}
              </strong>
            );
          }
          return codeElements;
        });
      };
      
      if (isBullet || isNumbered) {
        return (
          <div key={lineIdx} className="flex items-start mt-1.5 first:mt-0 pl-1 leading-relaxed">
            <span className="shrink-0 mt-0.5">{bulletIcon}</span>
            <span className="flex-1">{parseInline(content)}</span>
          </div>
        );
      }
      
      return (
        <span key={lineIdx} className="block mt-1 first:mt-0 leading-relaxed">
          {parseInline(content)}
        </span>
      );
    });
  };

  return (
    <div className={`flex gap-2.5 max-w-[85%] items-start ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
      {/* Avatar bubble */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
        isUser 
          ? 'bg-[#0F172A] text-sky-400 border border-white/5' 
          : isEmergency 
            ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
            : 'bg-gradient-to-tr from-sky-400 to-violet-500 text-[#0B0F1A] shadow-md shadow-sky-400/10'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <PawPrint className="w-4 h-4 fill-current" />}
      </div>
 
      {/* Message content container */}
      <div className="flex flex-col gap-0.5">
        {/* Urgent Emergency Warning Badge */}
        {isEmergency && (
          <div className="flex items-center gap-1 text-[10px] font-black text-rose-400 uppercase tracking-wider mb-1 animate-pulse pl-1 select-none">
            <AlertTriangle className="w-3.5 h-3.5 fill-current text-rose-400" />
            <span>Urgent Medical Guidance</span>
          </div>
        )}

        <div className={`p-3.5 rounded-2xl text-xs whitespace-pre-wrap transition-all ${
          isUser
            ? 'bg-gradient-to-tr from-sky-400 to-indigo-500 text-[#0B0F1A] font-semibold rounded-tr-none shadow-md shadow-sky-400/5'
            : isEmergency
              ? 'bg-gradient-to-br from-rose-950/40 via-rose-900/10 to-transparent border border-rose-500/30 text-rose-100 rounded-tl-none shadow-[0_0_15px_rgba(239,68,68,0.1)]'
              : 'bg-white/[0.02] border border-white/5 text-slate-300 rounded-tl-none shadow-md'
        }`}>
          {formatText(contentText)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
