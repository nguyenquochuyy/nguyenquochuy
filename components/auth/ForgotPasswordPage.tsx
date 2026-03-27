import React, { useState } from 'react';
import { Mail, Loader2, Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRANSLATIONS } from '../../services/translations';

interface ForgotPasswordPageProps {
  onNavigate: (view: 'LOGIN') => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();
  const t = TRANSLATIONS['vi'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
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
            <h2 className="text-4xl font-bold mb-4">{t.resetPassword}</h2>
            <p className="text-xl text-white/90 mb-8">
              {t.resetPasswordSubtitle}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Send size={20} />
              </div>
              <span className="text-lg">{t.resetBenefit1}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Send size={20} />
              </div>
              <span className="text-lg">{t.resetBenefit2}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Send size={20} />
              </div>
              <span className="text-lg">{t.resetBenefit3}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"></div>
      </div>

      {/* Right Side - Forgot Password Form */}
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

          {/* Forgot Password Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.resetPassword}</h2>
              <p className="text-gray-600">{t.resetPasswordPrompt}</p>
            </div>

            {isSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{t.checkInbox}</h3>
                <p className="text-sm text-gray-600">
                  {t.resetLinkSent} <strong>{email}</strong> {t.ifAccountExists}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-indigo-200"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  {isLoading ? t.sendingResetLink : t.sendResetLink}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {t.rememberPassword}{' '}
                <button 
                  onClick={() => navigate('/customer-login')}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {t.signIn}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
