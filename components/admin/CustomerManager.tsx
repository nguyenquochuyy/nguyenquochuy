import React, { useState, useMemo } from 'react';
import { BackendContextType, Customer, Language, formatCurrency, Order, OrderStatus } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { api } from '../../services/apiClient';
import ConfirmModal from './ConfirmModal';
import EmailCampaignModal from './EmailCampaignModal';
import CustomerNotesModal from './CustomerNotesModal';
import {
  Users, Search, Lock, Unlock, Eye, ShoppingBag,
  MapPin, Phone, Calendar, X, MoreVertical, Plus, Edit, Mail, Save, User, Download, TrendingUp, Crown, MessageSquare
} from 'lucide-react';

interface CustomerManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const ITEMS_PER_PAGE = 8;

const CustomerManager: React.FC<CustomerManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, updateCustomerStatus, addCustomer, updateCustomer } = backend;

  const [searchTerm, setSearchTerm] = useState('');
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // For Edit
  const [isAddingCustomer, setIsAddingCustomer] = useState(false); // For Add
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmStatusChange, setConfirmStatusChange] = useState<{ id: string; status: 'ACTIVE' | 'LOCKED' } | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<'All' | 'VIP' | 'Regular' | 'New' | 'Inactive'>('All');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [bulkActionType, setBulkActionType] = useState<'lock' | 'unlock' | null>(null);
  const [isEmailCampaignOpen, setIsEmailCampaignOpen] = useState(false);
  const [notesCustomerId, setNotesCustomerId] = useState<string | null>(null);

  // Helper: Calculate stats for a customer from Orders
  const getCustomerStats = (phone: string) => {
    const customerOrders = state.orders.filter(o => o.customerPhone === phone && o.status !== OrderStatus.CANCELLED);
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = customerOrders.length;
    return { totalSpent, orderCount, orders: state.orders.filter(o => o.customerPhone === phone) };
  };

  // Customer Segmentation
  const getCustomerSegment = (customer: Customer) => {
      const stats = getCustomerStats(customer.phone);
      const daysSinceJoin = Math.floor((Date.now() - new Date(customer.joinedAt).getTime()) / (1000 * 60 * 60 * 24));

      if (stats.totalSpent >= 5000000 || stats.orderCount >= 10) return 'VIP';
      if (stats.totalSpent >= 1000000 || stats.orderCount >= 5) return 'Regular';
      if (daysSinceJoin <= 30) return 'New';
      if (stats.orderCount === 0 && daysSinceJoin > 90) return 'Inactive';
      return 'Regular';
  };

  const getSegmentColor = (segment: string) => {
      const colors = {
          'VIP': 'bg-amber-100 text-amber-700 border-amber-200',
          'Regular': 'bg-blue-100 text-blue-700 border-blue-200',
          'New': 'bg-emerald-100 text-emerald-700 border-emerald-200',
          'Inactive': 'bg-slate-100 text-slate-700 border-slate-200'
      };
      return colors[segment as keyof typeof colors] || colors.Regular;
  };

  const handleSelectAll = () => {
      if (selectedCustomers.size === displayedCustomers.length) {
          setSelectedCustomers(new Set());
      } else {
          setSelectedCustomers(new Set(displayedCustomers.map(c => c.id)));
      }
  };

  const handleSelectCustomer = (customerId: string) => {
      const newSelected = new Set(selectedCustomers);
      if (newSelected.has(customerId)) {
          newSelected.delete(customerId);
      } else {
          newSelected.add(customerId);
      }
      setSelectedCustomers(newSelected);
  };

  const handleBulkLock = async () => {
      if (selectedCustomers.size === 0) return;
      try {
          await api.bulkLockCustomers(Array.from(selectedCustomers));
          setSelectedCustomers(new Set());
      } catch (error) {
          console.error('Error bulk locking customers:', error);
          alert('Có lỗi xảy ra khi khóa tài khoản');
      }
  };

  const handleBulkUnlock = async () => {
      if (selectedCustomers.size === 0) return;
      try {
          await api.bulkUnlockCustomers(Array.from(selectedCustomers));
          setSelectedCustomers(new Set());
      } catch (error) {
          console.error('Error bulk unlocking customers:', error);
          alert('Có lỗi xảy ra khi mở khóa tài khoản');
      }
  };

  // Analytics Summary
  const analytics = useMemo(() => {
      const customers = state.customers;
      const segments = customers.map(c => getCustomerSegment(c));
      const totalRevenue = customers.reduce((sum, c) => sum + getCustomerStats(c.phone).totalSpent, 0);
      const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
      const newCustomers = customers.filter(c => Math.floor((Date.now() - new Date(c.joinedAt).getTime()) / (1000 * 60 * 60 * 24)) <= 30).length;

      return {
          total: customers.length,
          vip: segments.filter(s => s === 'VIP').length,
          regular: segments.filter(s => s === 'Regular').length,
          new: segments.filter(s => s === 'New').length,
          inactive: segments.filter(s => s === 'Inactive').length,
          totalRevenue,
          activeCustomers,
          newCustomers
      };
  }, [state.customers]);

  // Filter Customers
  const filteredCustomers = useMemo(() => {
      return state.customers.filter(c => {
          const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.phone.includes(searchTerm) ||
                           (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
          const matchSegment = segmentFilter === 'All' || getCustomerSegment(c) === segmentFilter;
          return matchSearch && matchSegment;
      });
  }, [state.customers, searchTerm, segmentFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const displayedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Export Handler
  const handleExportCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      const bom = "\uFEFF";
      csvContent += bom;

      const headers = ["Mã KH", "Tên", "SĐT", "Email", "Địa chỉ", "Trạng thái", "Phân khúc", "Tổng chi", "Số đơn", "Ngày tham gia"];
      csvContent += headers.join(",") + "\n";

      filteredCustomers.forEach(c => {
          const stats = getCustomerStats(c.phone);
          const segment = getCustomerSegment(c);
          const row = [
              c.id,
              `"${c.name.replace(/"/g, '""')}"`,
              c.phone,
              c.email || '',
              `"${c.address.replace(/"/g, '""')}"`,
              c.status,
              segment,
              stats.totalSpent,
              stats.orderCount,
              new Date(c.joinedAt).toLocaleString()
          ];
          csvContent += row.join(",") + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- Sub-component: Add/Edit Modal (Professional & Light Theme) ---
  const CustomerFormModal = ({
      initialData,
      onClose,
      onSubmit
  }: {
      initialData?: Customer,
      onClose: () => void,
      onSubmit: (data: any) => void
  }) => {
      const [formData, setFormData] = useState({
          name: initialData?.name || '',
          phone: initialData?.phone || '',
          email: initialData?.email || '',
          address: initialData?.address || '',
          status: initialData?.status || 'ACTIVE'
      });

      const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          onSubmit(formData);
          onClose();
      };

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col z-10 overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900">
                            {initialData ? t.editCustomer : t.addCustomer}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {initialData ? 'Cập nhật thông tin khách hàng' : 'Tạo hồ sơ khách hàng mới'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{t.customer} <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text" required
                                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                    placeholder={t.name || "John Doe"}
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{t.phone} <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text" required
                                    className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium shadow-sm"
                                    placeholder="090..."
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{t.email}</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
                                placeholder="customer@example.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{t.address}</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
                            <textarea
                                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none min-h-[80px] shadow-sm font-medium"
                                placeholder="Địa chỉ giao hàng..."
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{t.status}</label>
                        <div className="relative">
                            <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                                {formData.status === 'ACTIVE' ? <Unlock size={18} /> : <Lock size={18} />}
                            </div>
                            <select
                                className="w-full pl-10 pr-10 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer shadow-sm font-medium"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="ACTIVE">{t.active}</option>
                                <option value="LOCKED">{t.locked}</option>
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-50 mt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors text-sm">
                            {t.cancel}
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 text-sm">
                            <Save size={18} /> {t.saveCustomer}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      );
  };

  // Detail Modal Component
  const CustomerDetailModal = ({ customer, onClose }: { customer: Customer, onClose: () => void }) => {
    const stats = getCustomerStats(customer.phone);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">

          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
             <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm ${customer.status === 'ACTIVE' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                    {customer.name.charAt(0)}
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
                   <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-2"><Phone size={14} className="text-indigo-500"/> {customer.phone}</span>
                      {customer.email && <span className="flex items-center gap-2"><Mail size={14} className="text-indigo-500"/> {customer.email}</span>}
                      <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-500"/> {t.joined}: {new Date(customer.joinedAt).toLocaleDateString()}</span>
                   </div>
                </div>
             </div>
             <div className="flex gap-2">
                <button
                    onClick={() => { onClose(); setEditingCustomer(customer); }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title={t.editCustomer}
                >
                    <Edit size={20} />
                </button>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <X size={20} />
                </button>
             </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
             {/* Stats Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t.totalSpent}</p>
                   <p className="text-xl font-bold text-indigo-600">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t.totalOrders}</p>
                   <p className="text-xl font-bold text-gray-900">{stats.orderCount}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                   <div>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t.status}</p>
                       <p className={`text-sm font-bold ${customer.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {customer.status === 'ACTIVE' ? t.active : t.locked}
                       </p>
                   </div>
                   <button
                     onClick={() => setConfirmStatusChange({ id: customer.id, status: customer.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' })}
                     className={`p-2 rounded-lg transition-colors ${customer.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                     title={customer.status === 'ACTIVE' ? t.lockAccount : t.unlockAccount}
                   >
                      {customer.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                   </button>
                </div>
             </div>

             {/* Order History */}
             <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <ShoppingBag size={18} /> {t.orderHistory}
                </h3>
                {stats.orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Chưa có đơn hàng nào.
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">{t.orderId}</th>
                                    <th className="px-4 py-3">{t.placedAt}</th>
                                    <th className="px-4 py-3">{t.status}</th>
                                    <th className="px-4 py-3 text-right">{t.total}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[...stats.orders].reverse().map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-gray-600">#{order.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                                'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {t.statusLabels[order.status]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(order.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-900">{t.customerMgmt}</h2>
              <p className="text-slate-500 text-sm mt-1">{state.customers.length} khách hàng đã đăng ký</p>
          </div>
          <button
            onClick={() => setIsAddingCustomer(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium active:scale-95"
          >
            <Plus size={18} />
            {t.addCustomer}
          </button>
       </div>

       {/* Analytics Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                   <Users size={18} className="text-indigo-600" />
                   <span className="text-xs font-bold text-slate-500 uppercase">Tổng khách hàng</span>
               </div>
               <p className="text-2xl font-bold text-slate-900">{analytics.total}</p>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                   <Crown size={18} className="text-amber-600" />
                   <span className="text-xs font-bold text-slate-500 uppercase">VIP</span>
               </div>
               <p className="text-2xl font-bold text-amber-600">{analytics.vip}</p>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                   <TrendingUp size={18} className="text-emerald-600" />
                   <span className="text-xs font-bold text-slate-500 uppercase">Mới (30 ngày)</span>
               </div>
               <p className="text-2xl font-bold text-emerald-600">{analytics.newCustomers}</p>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                   <ShoppingBag size={18} className="text-blue-600" />
                   <span className="text-xs font-bold text-slate-500 uppercase">Tổng doanh thu</span>
               </div>
               <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.totalRevenue)}</p>
           </div>
       </div>

       {/* Toolbar */}
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
             <input
               type="text"
               placeholder={t.searchCustomerPlaceholder}
               className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
             />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
              <select
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50 w-full md:w-auto"
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value as any)}
              >
                  <option value="All">Tất cả phân khúc</option>
                  <option value="VIP">VIP</option>
                  <option value="Regular">Thường</option>
                  <option value="New">Mới</option>
                  <option value="Inactive">Không hoạt động</option>
              </select>
              <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                  title="Xuất CSV"
              >
                  <Download size={16} />
              </button>
          </div>
       </div>

       {/* Customer List */}
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {selectedCustomers.size > 0 && (
            <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                Đã chọn {selectedCustomers.size} khách hàng
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkLock}
                  className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-200 flex items-center gap-1"
                >
                  <Lock size={14} /> Khóa
                </button>
                <button
                  onClick={handleBulkUnlock}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 flex items-center gap-1"
                >
                  <Unlock size={14} /> Mở khóa
                </button>
                <button
                  onClick={() => setIsEmailCampaignOpen(true)}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
                >
                  <Mail size={14} /> Gửi Email
                </button>
                <button
                  onClick={() => setSelectedCustomers(new Set())}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                   <tr>
                      <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider w-12">
                         <input
                           type="checkbox"
                           checked={selectedCustomers.size === displayedCustomers.length && displayedCustomers.length > 0}
                           onChange={handleSelectAll}
                           className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                         />
                      </th>
                      <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">{t.customer}</th>
                      <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">{t.address}</th>
                      <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">{t.totalSpent}</th>
                      <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-center">Phân khúc</th>
                      <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-center">{t.status}</th>
                      <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">{t.actions}</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {displayedCustomers.map(customer => {
                       const stats = getCustomerStats(customer.phone);
                       const segment = getCustomerSegment(customer);
                       return (
                       <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                             <input
                               type="checkbox"
                               checked={selectedCustomers.has(customer.id)}
                               onChange={() => handleSelectCustomer(customer.id)}
                               className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                             />
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${customer.status === 'ACTIVE' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800">{customer.name}</p>
                                    <div className="flex flex-col">
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10}/> {customer.phone}</p>
                                        {customer.email && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10}/> {customer.email}</p>}
                                    </div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-start gap-1 max-w-xs">
                                <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                <span className="text-sm text-slate-600 truncate">{customer.address}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">{formatCurrency(stats.totalSpent)}</span>
                                <span className="text-xs text-slate-500">{stats.orderCount} đơn hàng</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getSegmentColor(segment)}`}>
                                  {segment}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                  customer.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                                  {customer.status === 'ACTIVE' ? t.active : t.locked}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => setViewingCustomer(customer)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Xem chi tiết"
                                >
                                   <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => setNotesCustomerId(customer.id)}
                                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Ghi chú"
                                >
                                   <MessageSquare size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingCustomer(customer)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title={t.editCustomer}
                                >
                                   <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => setConfirmStatusChange({ id: customer.id, status: customer.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' })}
                                  className={`p-2 rounded-lg transition-colors ${
                                      customer.status === 'ACTIVE'
                                      ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                      : 'text-rose-400 hover:text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={customer.status === 'ACTIVE' ? t.lockAccount : t.unlockAccount}
                                >
                                   {customer.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                                </button>
                             </div>
                          </td>
                       </tr>
                   )})}
                   {filteredCustomers.length === 0 && (
                       <tr>
                           <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                               <Users size={48} className="mx-auto mb-3 opacity-20"/>
                               <p>Không tìm thấy khách hàng nào.</p>
                           </td>
                       </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>

       {viewingCustomer && <CustomerDetailModal customer={viewingCustomer} onClose={() => setViewingCustomer(null)} />}

       {isAddingCustomer && (
           <CustomerFormModal
               onClose={() => setIsAddingCustomer(false)}
               onSubmit={(data) => addCustomer(data)}
           />
       )}

       {editingCustomer && (
           <CustomerFormModal
               initialData={editingCustomer}
               onClose={() => setEditingCustomer(null)}
               onSubmit={(data) => updateCustomer(editingCustomer.id, data)}
           />
       )}

       <ConfirmModal
            isOpen={!!confirmStatusChange}
            onClose={() => setConfirmStatusChange(null)}
            onConfirm={() => {
                if (confirmStatusChange) {
                    updateCustomerStatus(confirmStatusChange.id, confirmStatusChange.status);
                }
            }}
            title={confirmStatusChange?.status === 'LOCKED' ? t.lockAccount : t.unlockAccount}
            message={confirmStatusChange?.status === 'LOCKED' ? 'Bạn có chắc chắn muốn khóa tài khoản này?' : 'Bạn có chắc chắn muốn mở khóa tài khoản này?'}
            lang={lang}
            confirmColor="amber"
            confirmText={confirmStatusChange?.status === 'LOCKED' ? 'Khóa' : 'Mở Khóa'}
        />

        <EmailCampaignModal
            isOpen={isEmailCampaignOpen}
            onClose={() => setIsEmailCampaignOpen(false)}
            customerIds={Array.from(selectedCustomers)}
            lang={lang}
        />

        {notesCustomerId && (
            <CustomerNotesModal
                isOpen={!!notesCustomerId}
                onClose={() => setNotesCustomerId(null)}
                customerId={notesCustomerId}
                lang={lang}
            />
        )}
    </div>
  );
};

export default CustomerManager;
