import React from 'react';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  const isEmergency = message.text.includes('🚨');

  // Convert markdown-like syntax (**text**) securely to React elements
  const formatText = (text) => {
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split('**');
      return (
        <span key={lineIdx} className="block mt-1 first:mt-0">
          {parts.map((part, partIdx) => {
            // Alternate parts are inside **
            if (partIdx % 2 === 1) {
              return (
                <strong key={partIdx} className={isUser ? "font-extrabold text-slate-950" : "font-extrabold text-white"}>
                  {part}
                </strong>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <div className={`flex gap-2.5 max-w-[85%] items-start ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
      {/* Avatar bubble */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
        isUser 
          ? 'bg-slate-800 text-brand-300 border border-white/5' 
          : isEmergency 
            ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
            : 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/10'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message content bubble */}
      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-gradient-to-tr from-brand-600 to-brand-500 text-slate-950 font-semibold rounded-tr-none shadow-md shadow-brand-500/5'
          : isEmergency
            ? 'bg-rose-950/20 border border-rose-500/30 text-rose-200 rounded-tl-none shadow-lg'
            : 'bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none shadow-md'
      }`}>
        {formatText(message.text)}
      </div>
    </div>
  );
};

export default MessageBubble;
