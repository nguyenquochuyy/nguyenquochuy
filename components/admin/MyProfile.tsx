import React, { useState, useEffect } from 'react';
import { BackendContextType, Employee, Language } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
// FIX: Import `Loader2` to be used in the password save button.
import { User, Mail, Phone, Shield, Calendar, Save, CheckCircle, Key, AlertCircle, Loader2 } from 'lucide-react';

interface MyProfileProps {
  currentUser: Employee;
  backend: BackendContextType;
  lang: Language;
}

const MyProfile: React.FC<MyProfileProps> = ({ currentUser, backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordSaveStatus, setPasswordSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || '',
    });
  }, [currentUser]);

  const isOwner = currentUser.role === 'OWNER';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    backend.updateEmployee(currentUser.id, formData);

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.newPassword.length < 6) {
        setPasswordError('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('Mật khẩu xác nhận không khớp.');
        return;
    }

    setPasswordSaveStatus('saving');
    backend.updateEmployee(currentUser.id, { password: passwordData.newPassword });

    setTimeout(() => {
        setPasswordSaveStatus('saved');
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSaveStatus('idle'), 2000);
    }, 800);
  };


  const inputClass = "w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-medium disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-bold text-slate-700 mb-1.5";
  const iconClass = "absolute left-4 top-3.5 text-slate-400";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up space-y-[15px]">
      {/* Profile Info Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[15px]">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Thông tin cá nhân</h2>
            <p className="text-slate-500 text-sm mt-1">Xem và cập nhật thông tin tài khoản của bạn.</p>
        </div>
        <button
            type="submit"
            form="profileForm"
            disabled={saveStatus !== 'idle'}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                saveStatus === 'saved' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
        >
            {saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'saved' ? <><CheckCircle size={18}/> Đã lưu</> : <><Save size={18}/> {t.save}</>}
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <form id="profileForm" onSubmit={handleSubmitInfo} className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-5xl font-bold text-indigo-600 border-4 border-white shadow-lg mb-4">
              {currentUser.name.charAt(0)}
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{currentUser.name}</h3>
            <p className="text-slate-500">{currentUser.email}</p>
            <div className="mt-6 space-y-3 text-sm w-full">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Shield size={18} className="text-slate-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-700">Vai trò</p>
                  <p className="text-slate-500">{currentUser.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Calendar size={18} className="text-slate-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-700">Ngày tham gia</p>
                  <p className="text-slate-500">{new Date(currentUser.joinedAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-[15px]">
            <div>
              <label className={labelClass}>Họ và tên</label>
              <div className="relative">
                <User size={18} className={iconClass} />
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`${inputClass} pl-12`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail size={18} className={iconClass} />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isOwner} className={`${inputClass} pl-12`} />
              </div>
              {!isOwner && <p className="text-xs text-slate-400 mt-1">Chỉ có Chủ Shop mới có thể thay đổi email.</p>}
            </div>
            <div>
              <label className={labelClass}>{t.phone}</label>
              <div className="relative">
                <Phone size={18} className={iconClass} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isOwner} className={`${inputClass} pl-12`} />
              </div>
              {!isOwner && <p className="text-xs text-slate-400 mt-1">Chỉ có Chủ Shop mới có thể thay đổi số điện thoại.</p>}
            </div>
          </div>
        </form>
      </div>

      {/* Password Section */}
       <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <form id="passwordForm" onSubmit={handleSubmitPassword}>
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3"><Key size={20} className="text-indigo-600"/> Đổi mật khẩu</h3>
                <p className="text-sm text-slate-500 mt-1">Để bảo mật, hãy sử dụng một mật khẩu mạnh.</p>
              </div>
               <button
                  type="submit"
                  disabled={passwordSaveStatus !== 'idle'}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 ${
                      passwordSaveStatus === 'saved' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-100'
                  }`}
              >
                  {passwordSaveStatus === 'saving' ? <><Loader2 size={16} className="animate-spin"/> Đang lưu...</> : passwordSaveStatus === 'saved' ? <><CheckCircle size={16}/> Đã đổi</> : 'Cập nhật Mật khẩu'}
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
            <div>
              <label className={labelClass}>Mật khẩu mới</label>
              <div className="relative">
                <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={inputClass}
                    placeholder="Ít nhất 6 ký tự"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={inputClass}
                />
              </div>
            </div>
          </div>
          {passwordError && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> {passwordError}
              </div>
          )}
        </form>
       </div>
    </div>
  );
};

export default MyProfile;
