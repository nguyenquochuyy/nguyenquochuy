import React, { useState } from 'react';
import { BackendContextType, Language, Employee, UserRole } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import {
  Users, Plus, Edit, Lock, Unlock, Key, History, Activity,
  Mail, Calendar, Shield, User, Save, X, Check, Copy, ArrowRight, ShieldCheck, Phone
} from 'lucide-react';

interface StaffManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const StaffManager: React.FC<StaffManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, addEmployee, updateEmployee } = backend;

  const [activeTab, setActiveTab] = useState<'list' | 'activity'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New States for Email & Password Flow
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [emailData, setEmailData] = useState<{name: string, email: string} | null>(null);
  const [showResetToast, setShowResetToast] = useState(false);

  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'joinedAt' | 'lastActive'>>({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    status: 'ACTIVE',
    avatar: ''
  });

  // Helper: Generate Random Password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEmployee(editingId, formData);
      setIsModalOpen(false);
      resetForm();
    } else {
      // New Employee Flow: Generate Password -> Show Email -> Save
      const tempPass = generateRandomPassword();
      setGeneratedPassword(tempPass);
      setEmailData({ name: formData.name, email: formData.email });

      addEmployee({ ...formData, password: tempPass }); // FIX: Add password to new employee

      setIsModalOpen(false);
      setShowEmailPreview(true); // Trigger Email Simulation
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STAFF',
      status: 'ACTIVE',
      avatar: ''
    });
  };

  const openEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      role: emp.role,
      status: emp.status,
      avatar: emp.avatar
    });
    setIsModalOpen(true);
  };

  const handleResetPassword = () => {
      // Manual reset trigger
      const tempPass = generateRandomPassword();
      setGeneratedPassword(tempPass);
      setEmailData({ name: formData.name, email: formData.email });

      // FIX: Actually update the password in the backend
      if (editingId) {
          updateEmployee(editingId, { password: tempPass });
      }

      setIsModalOpen(false);
      setShowEmailPreview(true);
  };

  const getRoleBadge = (role: UserRole) => {
      switch(role) {
          case 'OWNER': return <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">{t.roleOwner}</span>;
          case 'ACCOUNTANT': return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">{t.roleAccountant}</span>;
          default: return <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">{t.roleStaff}</span>;
      }
  };

  // --- COMPONENT: Simulated Email Template ---
  const EmailSimulationModal = () => {
      if (!emailData) return null;

      const handleLoginClick = () => {
          setShowEmailPreview(false);
          setShowChangePasswordModal(true);
      };

      return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/70 " onClick={() => setShowEmailPreview(false)}></div>

            {/* Email Container (Styled like a real HTML email) */}
            <div className="bg-slate-100 w-full max-w-lg shadow-lg relative z-10 rounded-xl overflow-hidden flex flex-col font-sans">
                {/* Email Header / Top Bar Simulation */}
                <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>To: <span className="font-medium text-slate-800">{emailData.email}</span></span>
                    </div>
                    <span>Just now</span>
                </div>

                {/* Email Body */}
                <div className="p-8">
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center border-t-4 border-indigo-600">
                        {/* Logo */}
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg shadow-indigo-200">
                            U
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chào mừng đến với UniShop!</h2>
                        <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                            Xin chào <strong>{emailData.name}</strong>,<br/>
                            Tài khoản của bạn đã được tạo. Hãy dùng thông tin đăng nhập tạm thời bên dưới để truy cập hệ thống.
                        </p>

                        {/* Credential Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left">
                            <div className="mb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tên đăng nhập</span>
                                <div className="text-slate-800 font-medium text-sm">{emailData.email}</div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu tạm thời</span>
                                <div className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-2 mt-1">
                                    <code className="text-rose-600 font-mono font-bold text-lg tracking-wide">{generatedPassword}</code>
                                    <button className="text-slate-400 hover:text-indigo-600" title="Copy"><Copy size={16}/></button>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={handleLoginClick}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 w-full mb-4"
                        >
                            Đăng nhập & Đổi mật khẩu
                        </button>

                        <p className="text-xs text-slate-400">
                            Vì lý do bảo mật, hãy đổi mật khẩu ngay sau lần đăng nhập đầu tiên.
                        </p>
                    </div>

                    <div className="text-center mt-6 text-xs text-slate-400">
                        &copy; 2024 UniShop Enterprise System.<br/>Automated Security Notification.
                    </div>
                </div>
            </div>
        </div>
      );
  };

  // --- COMPONENT: Change Password Simulation ---
  const ChangePasswordModal = () => {
      const [newPass, setNewPass] = useState('');
      const [confirmPass, setConfirmPass] = useState('');
      const [step, setStep] = useState(1); // 1: Form, 2: Success

      const handleSave = (e: React.FormEvent) => {
          e.preventDefault();
          if (newPass !== confirmPass) return alert("Passwords do not match");
          setStep(2);
          setTimeout(() => {
              setShowChangePasswordModal(false);
              setShowResetToast(true);
              setTimeout(() => setShowResetToast(false), 3000);
          }, 1500);
      };

      return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/80 "></div>

            <div className="bg-white rounded-xl w-full max-w-md shadow-lg relative z-10 overflow-hidden">
                {step === 1 ? (
                    <form onSubmit={handleSave} className="p-8">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-center text-xl font-bold text-slate-900 mb-2">{t.newPassword}</h3>
                        <p className="text-center text-sm text-slate-500 mb-6">
                            {lang === 'vi' ? 'Bảo mật tài khoản bằng cách tạo mật khẩu mạnh.' : 'Secure your account by creating a strong password.'}
                        </p>

                        <div className="space-y-[15px]">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.newPassword}</label>
                                <input
                                    type="password" required minLength={6}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.confirmPassword}</label>
                                <input
                                    type="password" required minLength={6}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={confirmPass}
                                    onChange={e => setConfirmPass(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-8 w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            {t.updatePassword}
                        </button>
                    </form>
                ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-64">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{t.allSet}</h3>
                        <p className="text-slate-500 text-sm mt-2">{t.passwordUpdatedSecure}</p>
                    </div>
                )}
            </div>
        </div>
      );
  };

  return (
    <div className="space-y-[15px] max-w-7xl mx-auto animate-fade-in-up">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-[15px] border-b border-slate-200 pb-2">
            <div className="flex gap-[15px]">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'list' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Users size={18} /> {t.staffList}
                    {activeTab === 'list' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'activity' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Activity size={18} /> {t.activityLog}
                    {activeTab === 'activity' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
            </div>
            <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
                <Plus size={16} /> {t.addStaff}
            </button>
        </div>

        {/* LIST VIEW */}
        {activeTab === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
                {state.employees.map(emp => (
                    <div key={emp.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-[15px]">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-100">
                                    {emp.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{emp.name}</h3>
                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                </div>
                            </div>
                            <button onClick={() => openEdit(emp)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16}/></button>
                        </div>

                        <div className="space-y-3 border-t border-slate-100 pt-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Shield size={14}/> {t.role}</span>
                                {getRoleBadge(emp.role)}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Activity size={14}/> {t.status}</span>
                                <span className={`flex items-center gap-1 text-xs font-bold ${emp.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {emp.status === 'ACTIVE' ? <Unlock size={12}/> : <Lock size={12}/>} {emp.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar size={14}/> {t.joined}</span>
                                <span className="text-slate-700 font-medium">{new Date(emp.joinedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><History size={14}/> {t.lastActive}</span>
                                <span className="text-slate-700 font-medium">{emp.lastActive ? new Date(emp.lastActive).toLocaleString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* ACTIVITY LOG VIEW */}
        {activeTab === 'activity' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">{t.date}</th>
                            <th className="px-6 py-4">{t.employeeLabel}</th>
                            <th className="px-6 py-4">{t.actionLabel}</th>
                            <th className="px-6 py-4">{t.moduleLabel}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {state.activityLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">{t.noActivityYet}</td>
                            </tr>
                        ) : (
                            [...state.activityLogs].reverse().map(log => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {log.employeeName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">
                                            {log.module}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {/* Main Add/Edit Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="absolute inset-0 bg-black/30" onClick={() => setIsModalOpen(false)}></div>
                <div className="bg-white rounded-xl w-full max-w-lg shadow-lg relative z-10 flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900">{editingId ? t.editStaff : t.addStaff}</h3>
                        <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-[15px]">
                        <div className="grid grid-cols-2 gap-[15px]">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.name}</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-2.5 text-slate-400"/>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.phone}</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-2.5 text-slate-400"/>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.email}</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-2.5 text-slate-400"/>
                                <input
                                    type="email" required
                                    className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-[15px]">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.role}</label>
                                <select
                                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value as any})}
                                >
                                    <option value="STAFF">{t.roleStaff}</option>
                                    <option value="ACCOUNTANT">{t.roleAccountant}</option>
                                    <option value="OWNER">{t.roleOwner}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.accountAccess}</label>
                                <select
                                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm outline-none"
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                                >
                                    <option value="ACTIVE">{t.active}</option>
                                    <option value="LOCKED">{t.locked}</option>
                                </select>
                            </div>
                        </div>

                        {editingId ? (
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleResetPassword}
                                    className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1"
                                >
                                    <Key size={16}/> {t.resetPasswordSendEmail}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                                <ShieldCheck size={18} className="text-blue-600 mt-0.5 shrink-0"/>
                                <div className="text-xs text-blue-700">
                                    <span className="font-bold">{t.securityNote}:</span> {lang === 'vi' ? 'Mật khẩu ngẫu nhiên sẽ được tạo và gửi đến email này. Nhân viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu.' : 'A random password will be generated and sent to this email upon creation. The user will be prompted to change it on first login.'}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 mt-2">
                            <button
                                type="button" onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-bold shadow-md flex items-center gap-2"
                            >
                                <Save size={16} /> {editingId ? t.save : t.createAccountLabel}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Email Simulation Modal */}
        {showEmailPreview && <EmailSimulationModal />}

        {/* Change Password Modal */}
        {showChangePasswordModal && <ChangePasswordModal />}

        {/* Toast for Final Success */}
        {showResetToast && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[80] bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-fade-in-up">
                <Check size={20} className="text-emerald-400"/>
                <span className="font-medium">{t.passwordUpdatedSuccess}</span>
            </div>
        )}
    </div>
  );
};

export default StaffManager;
