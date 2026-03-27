import React from 'react';
import { Chrome, Github, Facebook, Twitter } from 'lucide-react';
import { TRANSLATIONS } from '../../services/translations';

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: 'google' | 'github' | 'facebook' | 'twitter') => void;
  isLoading?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  onSocialLogin, 
  isLoading = false 
}) => {
  const t = TRANSLATIONS['vi'];

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      borderColor: 'border-blue-600'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'bg-gray-800 hover:bg-gray-900',
      textColor: 'text-white',
      borderColor: 'border-gray-800'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-white',
      borderColor: 'border-blue-700'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      borderColor: 'border-sky-500'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">
            {t.orContinueWith}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {socialProviders.map((provider) => {
          const Icon = provider.icon;
          return (
            <button
              key={provider.id}
              onClick={() => onSocialLogin(provider.id as any)}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border ${provider.borderColor} ${provider.color} ${provider.textColor} font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{provider.name}</span>
              <span className="sm:hidden">{provider.name.charAt(0)}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center">
        {t.socialLoginNote}
      </p>
    </div>
  );
};

export default SocialLoginButtons;
