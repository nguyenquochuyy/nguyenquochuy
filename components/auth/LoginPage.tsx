
import React, { useState, useEffect } from 'react';
import { BackendContextType } from '../../types';
import { LogIn, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';

interface LoginPageProps {
  onNavigate?: (view: 'REGISTER' | 'FORGOT_PASSWORD') => void;
  backend: BackendContextType;
  message?: { type: 'success' | 'error', text: string } | null;
  onClearMessage: () => void;
  allowedRole?: 'CUSTOMER' | 'STAFF'; // New Prop to restrict login
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, backend, message, onClearMessage, allowedRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Perform login
      if (backend.login(email, password)) {
          // Check role restriction after successful credentials check
          const user = backend.getCurrentUser();
          if (user) {
              const isEmployee = 'role' in user;
              if (allowedRole === 'STAFF' && !isEmployee) {
                  backend.logout();
                  setError('Trang này chỉ dành cho nhân viên.');
              } else if (allowedRole === 'CUSTOMER' && isEmployee) {
                  backend.logout();
                  setError('Trang này chỉ dành cho khách hàng.');
              }
              // If success, the parent component handles navigation via useEffect on currentUser
          }
      } else {
        setError('Email hoặc mật khẩu không hợp lệ.');
      }
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClearMessage();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClearMessage]);

  return (
    <AuthLayout 
        title={allowedRole === 'STAFF' ? "Admin Login" : "Customer Sign In"}
        subtitle="Welcome back! Please enter your details."
    >
        {message && message.type === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2 mb-6 animate-fade-in">
                <CheckCircle size={16} /> {message.text}
            </div>
        )}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <form onSubmit={handleLogin} className="space-y-6">
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
                            placeholder="name@company.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="••••••••"
                        />
                         <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                        Remember me
                    </label>
                    {allowedRole !== 'STAFF' && (
                        <button 
                            type="button" 
                            onClick={() => onNavigate && onNavigate('FORGOT_PASSWORD')}
                            className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                            Forgot password?
                        </button>
                    )}
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
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                </button>
            </form>

            {allowedRole !== 'STAFF' && (
                <p className="text-center text-sm text-slate-500 mt-8">
                    Don't have an account?{' '}
                    <button 
                        onClick={() => onNavigate && onNavigate('REGISTER')}
                        className="font-medium text-indigo-600 hover:underline"
                    >
                        Sign up
                    </button>
                </p>
            )}
        </div>
    </AuthLayout>
  );
};

export default LoginPage;
