import React from 'react';

const QuickSuggestions = ({ onSelect }) => {
  const suggestions = [
    { label: '🐶 Dog Care', query: 'Give me general care tips for a dog' },
    { label: '🐱 Cat Care', query: 'Give me general care tips for a cat' },
    { label: '💉 Vaccination', query: 'What is the recommended vaccination schedule for puppies?' },
    { label: '🚨 Emergency', query: 'My dog has a severe bleeding injury' },
    { label: '📍 Nearby Vet', query: 'Nearest vet' },
    { label: '🍖 Food Guide', query: 'What foods are toxic for pets?' },
    { label: '🎀 Pet Names', query: 'Suggest names for a white female cat' }
  ];

  return (
    <div className="p-3 bg-slate-900/60 border-t border-white/5 flex flex-wrap gap-2 justify-center select-none shrink-0">
      {suggestions.map((sug, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(sug.query)}
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-sky-500/10 text-slate-300 hover:text-sky-300 transition-all duration-200 active:scale-[0.96]"
        >
          {sug.label}
        </button>
      ))}
    </div>
  );
};

export default QuickSuggestions;
