'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }
interface ToastContextType { showToast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[500] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-6">
        {toasts.map((toast) => (
          <div key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-4 duration-500 ${
              toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
              toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
              'bg-blue-500/20 border-blue-500/30 text-blue-400'
            }`}>
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
