import React, { useState, useEffect } from 'react';
import { Mail, Key, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import AuthLayout from './AuthLayout';

interface VerifyEmailPageProps {
  email: string;
  onNavigate: (view: 'LOGIN') => void;
  onVerifySuccess: () => void;
}

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ email, onNavigate, onVerifySuccess }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (code === '123456') { // Mock verification code
        onVerifySuccess();
      } else {
        setError('Invalid verification code. Please try again.');
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      // Here you would normally trigger an API call to resend the code
    }
  };

  return (
    <AuthLayout 
        title="Check Your Email"
        subtitle={`We've sent a 6-digit verification code to ${email}`}
    >
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <form onSubmit={handleVerify} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                    <div className="relative">
                        <Key size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                            type="text" 
                            required
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none tracking-[0.5em] font-mono text-center"
                            placeholder="_ _ _ _ _ _"
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Account'}
                </button>
            </form>

            <div className="text-center text-sm text-slate-500 mt-8">
                Didn't receive a code?{' '}
                <button 
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className="font-medium text-indigo-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">
                or{' '}
                <button 
                    onClick={() => onNavigate('LOGIN')}
                    className="font-medium text-indigo-600 hover:underline"
                >
                    Back to Sign In
                </button>
            </p>
        </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
