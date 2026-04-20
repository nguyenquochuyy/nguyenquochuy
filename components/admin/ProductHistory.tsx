import React from 'react';
import { ProductHistory, Language, formatCurrency } from '../../types';
import { History, TrendingUp, Package, Eye, Clock, User } from 'lucide-react';

interface ProductHistoryModalProps {
  history: ProductHistory[];
  lang: Language;
  onClose: () => void;
}

const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({ history, lang, onClose }) => {
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'price': return <TrendingUp size={16} className="text-emerald-600" />;
      case 'stock': return <Package size={16} className="text-blue-600" />;
      case 'visibility': return <Eye size={16} className="text-indigo-600" />;
      default: return <History size={16} className="text-slate-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'price': return 'bg-emerald-50 border-emerald-200';
      case 'stock': return 'bg-blue-50 border-blue-200';
      case 'visibility': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const formatValue = (value: string | number, changeType: string) => {
    if (changeType === 'price') return formatCurrency(Number(value));
    if (changeType === 'stock') return String(value);
    if (typeof value === 'boolean') return value ? 'visible' : 'hidden';
    // If it's a JSON string, try to parse and show relevant fields
    if (typeof value === 'string' && value.startsWith('{')) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.price !== undefined) return formatCurrency(parsed.price);
        if (parsed.stock !== undefined) return String(parsed.stock);
        if (parsed.name) return parsed.name;
        if (parsed.isVisible !== undefined) return parsed.isVisible ? 'visible' : 'hidden';
      } catch {
        // If parsing fails, return truncated string
        return value.length > 50 ? value.substring(0, 50) + '...' : value;
      }
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <History className="text-indigo-600" /> Product History
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History size={48} className="mx-auto mb-3 opacity-20" />
              <p>No history recorded</p>
            </div>
          ) : (
            <div className="space-y-[15px]">
              {history.map((entry) => (
                <div key={entry.id} className={`p-4 rounded-xl border ${getChangeColor(entry.changeType)}`}>
                  <div className="flex items-start justify-between gap-[15px]">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getChangeIcon(entry.changeType)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900">{entry.productName}</p>
                        <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                        <div className="flex items-center gap-[15px] mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(entry.changedAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {entry.changedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Change</p>
                      <p className="font-mono text-sm font-bold text-gray-700">
                        {formatValue(entry.oldValue, entry.changeType)} → {formatValue(entry.newValue, entry.changeType)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductHistoryModal;
