import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { toast, Toast } from '../../services/toast';

const icons = {
  success: <CheckCircle size={18} className="text-emerald-500 shrink-0" />,
  error:   <XCircle    size={18} className="text-rose-500 shrink-0" />,
  info:    <Info       size={18} className="text-blue-500 shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
};

const colors = {
  success: 'border-l-emerald-500 bg-emerald-50',
  error:   'border-l-rose-500 bg-rose-50',
  info:    'border-l-blue-500 bg-blue-50',
  warning: 'border-l-amber-500 bg-amber-50',
};

const textColors = {
  success: 'text-emerald-800',
  error:   'text-rose-800',
  info:    'text-blue-800',
  warning: 'text-amber-800',
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`
            pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border border-transparent border-l-4
            ${colors[t.type]} ${textColors[t.type]}
            animate-slide-in-right
          `}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity mt-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
