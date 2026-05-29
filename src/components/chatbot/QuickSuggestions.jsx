import React from 'react';
import { Sparkles } from 'lucide-react';

const QuickSuggestions = ({ onSelect }) => {
  const chips = [
    { label: '🐶 Dog Care', query: 'Tell me how to take care of a dog' },
    { label: '🐱 Cat Care', query: 'Tell me how to take care of a cat' },
    { label: '💉 Vaccination', query: 'What is the pet vaccination schedule?' },
    { label: '🚨 Emergency Help', query: 'What do I do in an animal emergency?' },
    { label: '📍 Nearby Vet', query: 'Where is the nearest vet hospital?' },
    { label: '🍖 Food Guide', query: 'What are the safe and toxic foods for pets?' },
    { label: '🎀 Pet Names', query: 'Suggest some cute pet names' }
  ];

  return (
    <div className="px-4 py-2 border-t border-white/5 bg-slate-900/30 flex flex-wrap gap-1.5 shrink-0">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(chip.query)}
          className="flex items-center gap-1 p-1 px-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-brand-500/10 hover:border-brand-500/30 text-[10px] font-bold text-slate-400 hover:text-brand-400 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-3 h-3 shrink-0 text-brand-400/70" />
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickSuggestions;
