import React, { useState } from 'react';
import { Mail, Loader2, Send } from 'lucide-react';
import AuthLayout from './AuthLayout';

interface ForgotPasswordPageProps {
  onNavigate: (view: 'LOGIN') => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <AuthLayout
        title="Reset Your Password"
        subtitle="Enter your email to receive a password reset link."
    >
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            {isSent ? (
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send size={32} />
                    </div>
                    <h2 className="font-bold text-lg text-slate-900">Check your inbox</h2>
                    <p className="text-sm text-slate-500 mt-2">A password reset link has been sent to <strong>{email}</strong> if an account exists.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                    </button>
                </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-8">
                Remember your password?{' '}
                <button 
                    onClick={() => onNavigate('LOGIN')}
                    className="font-medium text-indigo-600 hover:underline"
                >
                    Sign in
                </button>
            </p>
        </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
