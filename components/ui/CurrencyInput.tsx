import React, { useState, useEffect } from 'react';
import { formatNumberInput, parseNumberInput } from '../../types';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  suffix?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  value, 
  onChange, 
  label, 
  error, 
  suffix = '₫',
  className = '',
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    // Only update display value if the parsed display value is different from the actual value
    // This prevents the cursor from jumping when typing
    if (parseNumberInput(displayValue) !== value) {
      setDisplayValue(value === 0 ? '' : formatNumberInput(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseNumberInput(inputValue);
    
    // Format for display
    setDisplayValue(formatNumberInput(inputValue));
    
    // Pass raw number to parent
    onChange(numericValue);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">{label}</label>}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className={`w-full p-3 rounded-xl border ${error ? 'border-rose-500 bg-rose-50' : 'border-slate-200 bg-slate-50'} focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium pr-10 ${className}`}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 font-medium">
          {suffix}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default CurrencyInput;
