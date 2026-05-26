import React from 'react';

const Spinner = ({ size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinnerMarkup = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-t-brand-500 border-r-transparent border-b-brand-500/20 border-l-transparent animate-spin`}
        role="status"
      />
      <span className="text-sm font-semibold tracking-wider text-brand-400 animate-pulse">
        PawLink Rescuing...
      </span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {spinnerMarkup}
      </div>
    );
  }

  return spinnerMarkup;
};

export default Spinner;
