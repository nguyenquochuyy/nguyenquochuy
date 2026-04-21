import React, { useState, useEffect } from 'react';
import { BackendContextType } from '../../types';
import { LogIn, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminAuthStorage } from '../../services/authStorage';
import { api, tokenManager } from '../../services/apiClient';

interface AdminLoginProps {
  backend: BackendContextType;
  message?: { type: 'success' | 'error', text: string } | null;
  onClearMessage: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ backend, message, onClearMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Load saved credentials on mount
  useEffect(() => {
    const credentials = adminAuthStorage.getCredentials();
    if (credentials) {
      setEmail(credentials.email);
      setRememberMe(credentials.rememberMe);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use the centralized login method from backend context
      const success = await backend.login(email, password);

      if (success) {
        // Get the user that was just set in the context
        const user = backend.getCurrentUser();
        if (user) {
          adminAuthStorage.saveCredentials(email, rememberMe);
          // Token is already in localStorage via apiClient -> tokenManager
          // We also save session for legacy/persistence reasons if needed
          adminAuthStorage.saveSession(user, tokenManager.getAdmin(), 8 * 60 * 60 * 1000);
          navigate('/');
        }
      } else {
        setError('Email hoặc mật khẩu không đúng.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Đăng nhập Admin</h2>
            <p className="text-slate-400 text-sm">UniShop Portal</p>
          </div>

          {message && message.type === 'success' && (
            <div className="bg-emerald-900/50 border border-emerald-600 text-emerald-400 text-sm font-medium p-3 rounded-lg flex items-center gap-2 mb-6">
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-[15px]">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@unishop.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-800" 
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-400 text-sm font-medium p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-500/25"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Liên hệ IT Admin nếu cần hỗ trợ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
