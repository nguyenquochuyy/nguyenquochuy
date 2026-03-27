import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, Key, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../../services/translations';
import { api } from '../../services/apiClient';

interface TwoFactorAuthProps {
  user: any;
  onSuccess: () => void;
  onBack: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ user, onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();
  const t = TRANSLATIONS['vi'];

  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  const sendCode = async () => {
    setIsSending(true);
    setError('');
    
    try {
      const response = await api.send2FACode(user.email, method);
      
      if (response.success) {
        setIsCodeSent(true);
        setResendTimer(60);
      } else {
        setError(response.message || 'Không thể gửi mã xác thực.');
      }
    } catch (err) {
      console.error('Send 2FA code error:', err);
      setError('Không thể kết nối đến server.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.verify2FACode(user.email, code);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Mã xác thực không hợp lệ.');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      sendCode();
    }
  };

  // Auto send code on mount
  useEffect(() => {
    sendCode();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* 2FA Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác thực hai yếu tố</h2>
            <p className="text-gray-600 text-sm">
              Mã xác thực đã được gửi đến {method === 'email' ? 'email' : 'SĐT'} của bạn
            </p>
          </div>

          {/* Method Selection */}
          {!isCodeSent && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn phương thức xác thực:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    method === 'email' 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Mail size={18} />
                  <span className="text-sm font-medium">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('sms')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    method === 'sms' 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone size={18} />
                  <span className="text-sm font-medium">SMS</span>
                </button>
              </div>
            </div>
          )}

          {isCodeSent && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã xác thực 6 số</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all tracking-[0.5em] font-mono text-center"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-200"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                {isLoading ? 'Đang xác thực...' : 'Xác thực'}
              </button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0 ? `Gửi lại sau ${resendTimer}s` : 'Gửi lại mã'}
                </button>
              </div>
            </form>
          )}

          {!isCodeSent && (
            <button
              onClick={sendCode}
              disabled={isSending}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-200"
            >
              {isSending ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
              {isSending ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Bảo vệ tài khoản của bạn với xác thực hai yếu tố</p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
