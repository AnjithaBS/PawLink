import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Icon mapping for premium visual feedback
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/70';
      case 'error':
        return 'border-rose-500/30 bg-rose-950/70';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/70';
      case 'info':
      default:
        return 'border-sky-500/30 bg-sky-950/70';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in pointer-events-auto ${getBorderColor(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 text-sm font-medium text-slate-100">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-100 p-0.5 rounded-lg transition-colors hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Dynamic keyframe injection for smooth slide-in alerts */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%) translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
