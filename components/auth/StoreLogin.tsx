import React, { useState, useEffect } from 'react';
import { BackendContextType } from '../../types';
import { LogIn, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle, ShoppingBag, User, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../../services/translations';
import { authStorage } from '../../services/authStorage';
import { api } from '../../services/apiClient';
import { loginAnalytics } from '../../services/loginAnalytics';
import SocialLoginButtons from './SocialLoginButtons';

interface StoreLoginProps {
  backend: BackendContextType;
  message?: { type: 'success' | 'error', text: string } | null;
  onClearMessage: () => void;
  onNavigate?: (view: 'REGISTER' | 'FORGOT_PASSWORD' | 'STORE') => void;
  onLoginSuccess?: (user: Customer) => void;
}

const StoreLogin: React.FC<StoreLoginProps> = ({ backend, message, onClearMessage, onNavigate, onLoginSuccess }) => {
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
      
      console.log('Login API response:', response); // Debug log
      
      if (response && response.success) {
        // Use response.user directly since API already authenticated
        const user = response.user;
        console.log('Current user after login:', user); // Debug log
        
        if (user) {
          const isEmployee = 'role' in user;
          if (isEmployee) {
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
            
            // Update global state
            if (onLoginSuccess) {
              onLoginSuccess(user);
            }
            
            console.log('Navigating to /store...'); // Debug log
            navigate('/store');
          }
        } else {
          console.error('No user found after login');
          setError('Đăng nhập thành công nhưng không thể tải thông tin người dùng.');
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
      setError('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClearMessage();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClearMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex overflow-hidden">
      {/* Left Side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingBag size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">UniShop</h1>
                <p className="text-white/80 text-sm">Trải nghiệm mua sắm đỉnh cao</p>
              </div>
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              {t.welcomeBack}
            </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              {t.loginSubtitle}
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <CheckCircle size={24} />
              </div>
              <div>
                <span className="text-lg font-semibold">{t.benefit1}</span>
                <p className="text-white/70 text-sm">Quản lý tất cả đơn hàng trong một nơi</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <CheckCircle size={24} />
              </div>
              <div>
                <span className="text-lg font-semibold">{t.benefit2}</span>
                <p className="text-white/70 text-sm">Ưu đãi độc quyền chỉ dành cho thành viên</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <CheckCircle size={24} />
              </div>
              <div>
                <span className="text-lg font-semibold">{t.benefit3}</span>
                <p className="text-white/70 text-sm">Cập nhật tình trạng đơn hàng real-time</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-white/70 text-sm">Khách hàng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-white/70 text-sm">Sản phẩm</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">4.9★</div>
              <div className="text-white/70 text-sm">Đánh giá</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Back to Store Button */}
          <button 
            onClick={() => onNavigate && onNavigate('STORE')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">{t.backToStore}</span>
          </button>

          {/* Enhanced Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
            
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User size={40} className="text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t.customerLogin}</h2>
              <p className="text-gray-600 text-lg">{t.loginPrompt}</p>
            </div>

            {message && message.type === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium p-4 rounded-2xl flex items-center gap-3 mb-6">
                <CheckCircle size={20} />
                {message.text}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t.email}</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 group-hover:bg-gray-100"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t.password}</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 group-hover:bg-gray-100"
                    placeholder={t.passwordPlaceholder}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer select-none group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-lg border-gray-300 focus:ring-indigo-500 focus:ring-offset-2" 
                  />
                  <span className="group-hover:text-gray-900 transition-colors duration-200">{t.rememberMe}</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => onNavigate && onNavigate('FORGOT_PASSWORD')}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-200 group"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium p-4 rounded-2xl flex items-center gap-3 animate-shake">
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <LogIn size={24} />}
                {isLoading ? t.loggingIn : t.signIn}
              </button>
            </form>

            {/* Enhanced Social Login */}
            <div className="mt-8">
              <SocialLoginButtons 
                onSocialLogin={handleSocialLogin}
                isLoading={isLoading}
              />
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-lg">
                {t.noAccount}{' '}
                <button 
                  onClick={() => onNavigate && onNavigate('REGISTER')}
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200 group"
                >
                  {t.signUp}
                  <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                </button>
              </p>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>{t.agreementPrompt}</p>
              <div className="flex justify-center gap-6 mt-3">
                <button className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200">{t.termsOfUse}</button>
                <span>&</span>
                <button className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200">{t.privacyPolicy}</button>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Bảo mật</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock size={24} className="text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Mã hóa</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield size={24} className="text-purple-600" />
              </div>
              <p className="text-xs text-gray-600">An toàn</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default StoreLogin;
