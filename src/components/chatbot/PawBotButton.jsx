import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import ChatWindow from './ChatWindow.jsx';
import { Bot } from 'lucide-react';

const PawBotButton = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // If the user is not logged in, keep the chatbot hidden
  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] select-none font-sans flex flex-col items-end">
      
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 group"
          title="Ask PawBot"
        >
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 rounded-full bg-brand-500/25 animate-ping group-hover:scale-110" />
          <Bot className="w-6 h-6 z-10 animate-bounce" />
        </button>
      )}

      {/* Slide up chat drawer */}
      {isOpen && (
        <ChatWindow onClose={() => setIsOpen(false)} />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default PawBotButton;
