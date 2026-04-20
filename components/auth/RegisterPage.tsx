
import React, { useState } from 'react';
import { BackendContextType, Customer } from '../../types';
import { UserPlus, User, Mail, Lock, Loader2, Check, Eye, EyeOff, Phone, AlertTriangle, ArrowLeft, Shield, X } from 'lucide-react';
import { api } from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../../services/translations';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';

interface RegisterPageProps {
  onNavigate: (view: 'LOGIN') => void;
  backend: BackendContextType;
  onBeginVerification: (data: Omit<Customer, 'id' | 'joinedAt' | 'status'>) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, backend, onBeginVerification }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();
  const t = TRANSLATIONS['vi'];
  const passwordStrength = usePasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const check = await api.checkEmail(email);
        if (check.exists) {
            setError(t.emailAlreadyUsed);
            setIsLoading(false);
            return;
        }

        const res = await api.sendVerificationCode(email);
        if (res.success) {
            onBeginVerification({ 
              name, 
              email, 
              phone,
              password, 
              address: '',
              loyaltyPoints: 0,
              wishlist: [] 
            }); 
        } else {
            setError(res.message || t.verificationError);
        }
    } catch (err) {
        console.error(err);
        setError(t.serverConnectionError);
    } finally {
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
                <UserPlus size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold">UniShop</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">{t.createAccount}</h2>
            <p className="text-xl text-white/90 mb-8">
              {t.registerSubtitle}
            </p>
          </div>
          
          <div className="space-y-[15px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Check size={20} />
              </div>
              <span className="text-lg">{t.registerBenefit1}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Check size={20} />
              </div>
              <span className="text-lg">{t.registerBenefit2}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Check size={20} />
              </div>
              <span className="text-lg">{t.registerBenefit3}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Login Button */}
          <button 
            onClick={() => navigate('/customer-login')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">{t.backToLogin}</span>
          </button>

          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.createAccount}</h2>
              <p className="text-gray-600">{t.registerPrompt}</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-[15px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.phoneNumber}</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                    placeholder={t.phonePlaceholder}
                  />
                </div>
              </div>

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
                     onFocus={() => setShowPasswordRequirements(true)}
                     onBlur={() => setTimeout(() => setShowPasswordRequirements(false), 200)}
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Độ mạnh mật khẩu</span>
                      <span className="text-xs font-medium" style={{ color: passwordStrength.color.replace('bg-', '').replace('-500', '') }}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {showPasswordRequirements && passwordStrength.feedback.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Yêu cầu mật khẩu:</span>
                    </div>
                    <ul className="space-y-1">
                      {passwordStrength.feedback.map((requirement, index) => (
                        <li key={index} className="text-xs text-blue-700 flex items-center gap-1">
                          <X size={10} className="text-red-500" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2">
                      <AlertTriangle size={16} /> {error}
                  </div>
              )}

              <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-200"
              >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                  {isLoading ? t.creatingAccount : t.createAccountBtn}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {t.alreadyHaveAccount}{' '}
                <button onClick={() => navigate('/customer-login')} className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  {t.signIn}
                </button>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>{t.agreementPrompt}</p>
            <div className="flex justify-center gap-[15px] mt-2">
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

export default RegisterPage;
