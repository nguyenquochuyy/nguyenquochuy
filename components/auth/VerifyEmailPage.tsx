import React, { useState, useEffect } from 'react';
import { Mail, Key, Loader2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../../services/translations';
import { api } from '../../services/apiClient';

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
  const navigate = useNavigate();
  const t = TRANSLATIONS['vi'];

  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call API to verify code
      const response = await api.verifyCode(email, code);
      
      if (response.success) {
        onVerifySuccess();
      } else {
        setError(response.message || t.invalidVerificationCode);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(t.serverConnectionError);
      setIsLoading(false);
    }
  };
  
  const handleResend = async () => {
    if (resendTimer === 0) {
      try {
        // Call API to resend code
        const response = await api.sendVerificationCode(email);
        
        if (response.success) {
          setResendTimer(30);
          setError('');
        } else {
          setError(response.message || t.verificationError);
        }
      } catch (err) {
        console.error('Resend error:', err);
        setError(t.serverConnectionError);
      }
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
                <Mail size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold">UniShop</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">{t.verifyEmail}</h2>
            <p className="text-xl text-white/90 mb-8">
              {t.verifyEmailSubtitle}
            </p>
          </div>
          
          <div className="space-y-[15px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Key size={20} />
              </div>
              <span className="text-lg">{t.verifyBenefit1}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Key size={20} />
              </div>
              <span className="text-lg">{t.verifyBenefit2}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Key size={20} />
              </div>
              <span className="text-lg">{t.verifyBenefit3}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"></div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Register Button */}
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">{t.backToRegister}</span>
          </button>

          {/* Verification Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.checkEmail}</h2>
              <p className="text-gray-600 text-sm">
                {t.verificationCodeSent} <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-[15px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.verificationCode}</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none tracking-[0.5em] font-mono text-center transition-all"
                    placeholder="_ _ _ _ _ _"
                  />
                </div>
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
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
                {isLoading ? t.verifying : t.verifyAccount}
              </button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-8">
              <p>
                {t.didntReceiveCode}{' '}
                <button 
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="font-medium text-indigo-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0 ? `${t.resendIn} ${resendTimer}s` : t.resendCode}
                </button>
              </p>
              <p className="mt-2">
                {t.or}{' '}
                <button 
                  onClick={() => navigate('/customer-login')}
                  className="font-medium text-indigo-600 hover:underline transition-colors"
                >
                  {t.backToSignIn}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
