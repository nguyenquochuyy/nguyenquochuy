
import React, { useState } from 'react';
import { BackendContextType, Customer } from '../../types';
import { UserPlus, User, Mail, Lock, Loader2, Check, Eye, EyeOff, Phone, AlertTriangle } from 'lucide-react';
import { api } from '../../services/apiClient';
import AuthLayout from './AuthLayout';

interface RegisterPageProps {
  onNavigate: (view: 'LOGIN') => void;
  backend: BackendContextType;
  onBeginVerification: (data: Omit<Customer, 'id' | 'joinedAt' | 'status'>) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, backend, onBeginVerification }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // New State
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        // 1. Check if email already exists
        const check = await api.checkEmail(email);
        if (check.exists) {
            setError('Email này đã được sử dụng. Vui lòng chọn email khác.');
            setIsLoading(false);
            return;
        }

        // 2. Send Verification Code
        const res = await api.sendVerificationCode(email);
        if (res.success) {
            onBeginVerification({ 
              name, 
              email, 
              phone, // Include phone
              password, 
              address: '',
              loyaltyPoints: 0,
              wishlist: [] 
            }); 
        } else {
            setError(res.message || 'Có lỗi khi gửi mã xác thực.');
        }
    } catch (err) {
        console.error(err);
        // Fallback for offline mode (Simulate success for testing)
        if (email.includes('@')) {
             console.log("Offline Mode: Skipping check. Code is pseudo-generated.");
             onBeginVerification({ name, email, phone, password, address: '', loyaltyPoints: 0, wishlist: [] });
        } else {
             setError('Không thể kết nối đến server.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthLayout
        title="Create a Customer Account"
        subtitle="Start your shopping journey with UniShop."
    >
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <form onSubmit={handleRegister} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="090..." />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                           type={showPassword ? "text" : "password"}
                           required 
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)} 
                           className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
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

                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-8">
                Already have an account?{' '}
                <button onClick={() => onNavigate('LOGIN')} className="font-medium text-indigo-600 hover:underline">
                    Sign in
                </button>
            </p>
        </div>
    </AuthLayout>
  );
};

export default RegisterPage;
