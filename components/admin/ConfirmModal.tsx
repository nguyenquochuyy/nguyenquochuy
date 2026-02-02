import React from 'react';
import { TRANSLATIONS } from '../../services/translations';
import { Language } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  lang: Language;
  confirmText?: string;
  confirmColor?: 'rose' | 'amber';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    lang,
    confirmText,
    confirmColor = 'rose'
}) => {
  const t = TRANSLATIONS[lang];
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const colorClasses = {
      rose: {
          bg: 'bg-rose-100',
          text: 'text-rose-600',
          button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
      },
      amber: {
        bg: 'bg-amber-100',
        text: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
      }
  };

  const selectedColor = colorClasses[confirmColor as keyof typeof colorClasses] || colorClasses.rose;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 transform transition-all scale-100">
        <div className="flex items-start gap-4">
            <div className={`w-12 h-12 flex-shrink-0 ${selectedColor.bg} ${selectedColor.text} rounded-full flex items-center justify-center`}>
                <AlertTriangle size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500">{message}</p>
            </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold">
            {t.cancel}
          </button>
          <button 
            onClick={handleConfirm} 
            className={`px-4 py-2 text-white rounded-lg text-sm font-bold shadow-md transition-colors ${selectedColor.button}`}
          >
            {confirmText || t.delete}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;