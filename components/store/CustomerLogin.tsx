import React, { useState, useEffect } from 'react';
import { BackendContextType } from '../../types';
import { LogIn, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle, ShoppingBag, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../../services/translations';
import { authStorage } from '../../services/authStorage';
import { api } from '../../services/apiClient';
import { loginAnalytics } from '../../services/loginAnalytics';
import SocialLoginButtons from '../auth/SocialLoginButtons';

interface CustomerLoginProps {
  backend: BackendContextType;
  message?: { type: 'success' | 'error', text: string } | null;
  onClearMessage: () => void;
  onNavigate?: (view: 'REGISTER' | 'FORGOT_PASSWORD' | 'STORE') => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ backend, message, onClearMessage, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const t = TRANSLATIONS['vi'];

  // Load saved credentials on mount
  useEffect(() => {
    const credentials = authStorage.getCredentials();
    if (credentials) {
      setEmail(credentials.email);
      setRememberMe(credentials.rememberMe);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const startTime = performance.now();

    try {
      const response = await api.login(email, password);
      const responseTime = performance.now() - startTime;
      
      if (response && response.success) {
        const user = backend.getCurrentUser();
        if (user) {
          const isEmployee = 'role' in user;
          if (isEmployee) {
            backend.logout();
            setError('Tài khoản này không phải là tài khoản khách hàng.');
            loginAnalytics.trackLoginFailure(email, 'Admin account attempted on customer login');
          } else {
            // Track successful login
            loginAnalytics.trackLoginSuccess(email, user.id, 'email');
            loginAnalytics.updateLoginResponseTime(email, responseTime);
            
            // Save credentials if remember me is checked
            authStorage.saveCredentials(email, rememberMe);
            
            // Save session
            authStorage.saveSession(user);
            
            navigate('/store');
          }
        }
      } else {
        // Track failed login
        const failureReason = response?.isLocked ? 'Account locked' : 
                            response?.remainingAttempts !== undefined ? 'Invalid credentials' : 
                            'Unknown error';
        loginAnalytics.trackLoginFailure(email, failureReason);
        loginAnalytics.updateLoginResponseTime(email, responseTime);

        // Handle specific error messages from backend
        if (response?.isLocked) {
          setError(response.message || 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
        } else if (response?.remainingAttempts !== undefined) {
          setError(response.message || 'Email hoặc mật khẩu không hợp lệ.');
        } else {
          setError('Email hoặc mật khẩu không hợp lệ.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const responseTime = performance.now() - startTime;
      loginAnalytics.trackLoginFailure(email, 'Network error');
      loginAnalytics.updateLoginResponseTime(email, responseTime);
      setError(t.serverConnectionError);
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

  const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
    setError('');
    setIsLoading(true);
    
    try {
      // TODO: Implement OAuth providers
      console.log(`Social login with ${provider}`);
      
      // Mock social login for now
      setTimeout(() => {
        setError(`Đăng nhập với ${provider} đang được phát triển.`);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Social login error:', err);
      setError(`Không thể đăng nhập với ${provider}.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold">UniShop</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">{t.welcomeBack}</h2>
            <p className="text-xl text-white/90 mb-8">
              {t.loginSubtitle}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <span className="text-lg">{t.benefit1}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <span className="text-lg">{t.benefit2}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <span className="text-lg">{t.benefit3}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Store Button */}
          <button 
            onClick={() => onNavigate && onNavigate('STORE')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">{t.backToStore}</span>
          </button>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.customerLogin}</h2>
              <p className="text-gray-600">{t.loginPrompt}</p>
            </div>

            {message && message.type === 'success' && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2 mb-6 animate-fade-in">
                <CheckCircle size={16} /> {message.text}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder={t.passwordPlaceholder}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
                  />
                  <span>{t.rememberMe}</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => onNavigate && onNavigate('FORGOT_PASSWORD')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-200"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                {isLoading ? t.loggingIn : t.signIn}
              </button>
            </form>

            {/* Social Login */}
            <SocialLoginButtons 
              onSocialLogin={handleSocialLogin}
              isLoading={isLoading}
            />

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {t.noAccount}{' '}
                <button 
                  onClick={() => onNavigate && onNavigate('REGISTER')}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {t.signUp}
                </button>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>{t.agreementPrompt}</p>
            <div className="flex justify-center gap-4 mt-2">
              <button className="text-indigo-600 hover:underline">{t.termsOfUse}</button>
              <span>&</span>
              <button className="text-indigo-600 hover:underline">{t.privacyPolicy}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
