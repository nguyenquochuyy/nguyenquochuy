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
          button: 'bg-rose-600 hover:bg-rose-700'
      },
      amber: {
        bg: 'bg-amber-100',
        text: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700'
      }
  };

  const selectedColor = colorClasses[confirmColor as keyof typeof colorClasses] || colorClasses.rose;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-xl w-full max-w-sm border border-gray-200 shadow-lg p-5">
        <div className="flex items-start gap-3">
            <div className={`w-10 h-10 flex-shrink-0 ${selectedColor.bg} ${selectedColor.text} rounded-full flex items-center justify-center`}>
                <AlertTriangle size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${selectedColor.button}`}
          >
            {confirmText || t.delete}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
