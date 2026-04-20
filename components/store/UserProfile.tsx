
import React, { useState } from 'react';
import { BackendContextType, Customer, Order, formatCurrency, OrderStatus } from '../../types';
import { User, ShoppingBag, LogOut, Save, Key, CheckCircle, Loader2, AlertCircle, Eye, EyeOff, Trophy, Crown } from 'lucide-react';

interface UserProfileProps {
  currentUser: Customer;
  orders: Order[];
  backend: BackendContextType;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, orders, backend, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

    const [formData, setFormData] = useState({
        name: currentUser.name,
        phone: currentUser.phone,
        address: currentUser.address,
    });
    const [infoSaveStatus, setInfoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSaveStatus, setPasswordSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setInfoSaveStatus('saving');
        backend.updateCustomer(currentUser.id, formData);
        setTimeout(() => {
            setInfoSaveStatus('saved');
            setTimeout(() => setInfoSaveStatus('idle'), 2000);
        }, 1000);
    };
    
    const handlePasswordSubmit = (e: React.FormEvent) => {
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
        backend.updateCustomer(currentUser.id, { password: passwordData.newPassword });
        setTimeout(() => {
            setPasswordSaveStatus('saved');
            setPasswordData({ newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordSaveStatus('idle'), 2000);
        }, 1000);
    };

    const customerOrders = orders
      .filter(o => o.customerPhone === currentUser.phone || o.customerEmail === currentUser.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const inputClass = "w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-medium";
    const labelClass = "block text-sm font-bold text-slate-700 mb-1.5";

    const SidebarItem = ({ tab, label, icon: Icon }: { tab: 'profile' | 'orders', label: string, icon: React.ElementType }) => (
        <button onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
            <Icon size={18} /> {label}
        </button>
    );

    const StatusBadge = ({ status }: { status: OrderStatus }) => {
        const styles = {
            [OrderStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
            [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-700 border-blue-200',
            [OrderStatus.SHIPPING]: 'bg-purple-100 text-purple-700 border-purple-200',
            [OrderStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            [OrderStatus.CANCELLED]: 'bg-rose-100 text-rose-700 border-rose-200',
        };
        const statusLabels = {
            [OrderStatus.PENDING]: 'Chờ xác nhận',
            [OrderStatus.CONFIRMED]: 'Đã xác nhận',
            [OrderStatus.SHIPPING]: 'Đang giao',
            [OrderStatus.COMPLETED]: 'Hoàn thành',
            [OrderStatus.CANCELLED]: 'Hủy',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status]}`}>
                {statusLabels[status]}
            </span>
        );
    };


    return (
        <div className="bg-slate-50 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Tài Khoản Của Tôi</h1>
                    <p className="text-slate-500 mt-1">Chào mừng trở lại, {currentUser.name}!</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-[15px]">
                    <aside className="lg:col-span-1 self-start lg:sticky top-28 space-y-[15px]">
                        {/* Loyalty Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Thành Viên</p>
                                    <h3 className="text-xl font-bold">{currentUser.name}</h3>
                                </div>
                                <Crown size={24} className="text-amber-400" fill="currentColor"/>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Điểm Tích Lũy</p>
                                <p className="text-3xl font-black">{currentUser.loyaltyPoints || 0}</p>
                            </div>
                            <div className="mt-4 text-[10px] text-indigo-300">
                                1 điểm = 1.000đ khi thanh toán
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-sm">
                            <SidebarItem tab="profile" label="Thông tin cá nhân" icon={User} />
                            <SidebarItem tab="orders" label="Lịch sử đơn hàng" icon={ShoppingBag} />
                            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                <LogOut size={18} /> Đăng xuất
                            </button>
                        </div>
                    </aside>

                    <main className="lg:col-span-3 space-y-[15px]">
                        {activeTab === 'profile' && (
                            <>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <form onSubmit={handleInfoSubmit}>
                                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                            <h3 className="text-lg font-bold text-slate-900">Thông tin liên hệ</h3>
                                            <button type="submit" disabled={infoSaveStatus !== 'idle'} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 ${infoSaveStatus === 'saved' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-100'}`}>
                                                {infoSaveStatus === 'saving' ? <><Loader2 size={16} className="animate-spin"/> Đang lưu...</> : infoSaveStatus === 'saved' ? <><CheckCircle size={16}/> Đã lưu</> : 'Lưu thay đổi'}
                                            </button>
                                        </div>
                                        <div className="space-y-[15px]">
                                            <div><label className={labelClass}>Họ và tên</label><input type="text" name="name" value={formData.name} onChange={handleInfoChange} className={inputClass}/></div>
                                            <div><label className={labelClass}>Email</label><input type="email" name="email" value={currentUser.email} readOnly className={`${inputClass} bg-slate-50 cursor-not-allowed`}/></div>
                                            <div><label className={labelClass}>Số điện thoại</label><input type="tel" name="phone" value={formData.phone} onChange={handleInfoChange} className={inputClass}/></div>
                                            <div><label className={labelClass}>Địa chỉ</label><textarea name="address" value={formData.address} onChange={handleInfoChange} rows={3} className={`${inputClass} resize-none`}/></div>
                                        </div>
                                    </form>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <form onSubmit={handlePasswordSubmit}>
                                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                            <h3 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h3>
                                             <button type="submit" disabled={passwordSaveStatus !== 'idle'} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 ${passwordSaveStatus === 'saved' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-100'}`}>
                                                {passwordSaveStatus === 'saving' ? <><Loader2 size={16} className="animate-spin"/> Đang lưu...</> : passwordSaveStatus === 'saved' ? <><CheckCircle size={16}/> Đã đổi</> : 'Cập nhật'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                                            <div><label className={labelClass}>Mật khẩu mới</label><div className="relative"><input type={showNewPassword ? 'text' : 'password'} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={inputClass}/><button type="button" onClick={() => setShowNewPassword(p => !p)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"><Eye size={16}/></button></div></div>
                                            <div><label className={labelClass}>Xác nhận mật khẩu</label><div className="relative"><input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={inputClass}/><button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"><Eye size={16}/></button></div></div>
                                        </div>
                                        {passwordError && (<div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16}/> {passwordError}</div>)}
                                    </form>
                                </div>
                            </>
                        )}
                        {activeTab === 'orders' && (
                             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-900">Lịch sử đơn hàng</h3></div>
                                {customerOrders.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400">Bạn chưa có đơn hàng nào.</div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Mã Đơn</th>
                                                <th className="px-6 py-3 font-medium">Ngày Đặt</th>
                                                <th className="px-6 py-3 font-medium">Tổng Tiền</th>
                                                <th className="px-6 py-3 font-medium">Trạng Thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {customerOrders.map(order => (
                                                <tr key={order.id}>
                                                    <td className="px-6 py-4 font-mono font-bold text-slate-700">#{order.id.slice(-6).toUpperCase()}</td>
                                                    <td className="px-6 py-4 text-slate-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                                    <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(order.total)}</td>
                                                    <td className="px-6 py-4"><StatusBadge status={order.status}/></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
