import React, { useState } from 'react';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { BackendContextType, Employee } from '../../types';

interface Level2PasswordModalProps {
  user: Employee;
  backend: BackendContextType;
  onSuccess: () => void;
  onFailure: () => void; // On max attempts
  onCancel: () => void;
}

const MAX_ATTEMPTS = 5;

const Level2PasswordModal: React.FC<Level2PasswordModalProps> = ({ user, backend, onSuccess, onFailure, onCancel }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(user.level2PasswordAttempts || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const result = backend.verifyLevel2Password(user.id, password);
      
      if (result.success) {
        onSuccess();
      } else {
        const newAttempts = MAX_ATTEMPTS - result.attemptsLeft;
        setAttempts(newAttempts);
        if (result.attemptsLeft <= 0) {
          setError(`Quá nhiều lần thử không thành công. Bạn sẽ bị đăng xuất.`);
          setTimeout(onFailure, 1500);
        } else {
          setError(`Mật khẩu không chính xác. Bạn còn ${result.attemptsLeft} lần thử.`);
          setIsLoading(false);
          setPassword('');
        }
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative flex flex-col z-10 overflow-hidden transform transition-all scale-100">
        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Xác thực bảo mật</h2>
            <p className="text-slate-500 mt-2 text-sm">Nhập mật khẩu cấp 2 của bạn để truy cập Bảng điều khiển quản trị.</p>
            <p className="text-xs text-slate-400 mt-2">Gợi ý: Quản trị viên có thể sử dụng mã mặc định nếu quên mật khẩu.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            <div>
                <label className="sr-only">Mật khẩu cấp 2</label>
                <input 
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-center tracking-[0.2em] font-mono py-3 bg-slate-50 border border-slate-200 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••"
                />
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2 text-left">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Mở khóa'}
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 rounded-lg font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
                Hủy
            </button>
        </form>
      </div>
    </div>
  );
};

export default Level2PasswordModal;