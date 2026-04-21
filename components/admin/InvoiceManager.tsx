import React, { useState } from 'react';
import { BackendContextType, Language, Invoice, formatCurrency } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import {
  FileText, Plus, Search, Filter, CheckCircle, Clock,
  AlertCircle, XCircle, Send, Download, MoreVertical,
  Calendar, CreditCard, User, Hash, Save, X
} from 'lucide-react';

interface InvoiceManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const InvoiceManager: React.FC<InvoiceManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, addInvoice, updateInvoiceStatus } = backend;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Invoice Form State
  const [formData, setFormData] = useState({
    orderId: '',
    customerId: '',
    amount: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const filteredInvoices = state.invoices.filter(inv => {
    const matchesSearch = inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    await addInvoice({
      ...formData,
      status: 'PENDING'
    });
    setShowCreateModal(false);
    setFormData({
      orderId: '',
      customerId: '',
      amount: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const getStatusStyle = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'OVERDUE': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'CANCELLED': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID': return <CheckCircle size={14} />;
      case 'PENDING': return <Clock size={14} />;
      case 'OVERDUE': return <AlertCircle size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
    }
  };

  return (
    <div className="space-y-[15px] animate-fade-in">
      {/* Header & Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
        {[
          { label: 'Tổng hóa đơn', value: state.invoices.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Chờ thanh toán', value: state.invoices.filter(i => i.status === 'PENDING').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Đã thanh toán', value: state.invoices.filter(i => i.status === 'PAID').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Quá hạn', value: state.invoices.filter(i => i.status === 'OVERDUE').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-[15px]">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-[15px] bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-1 gap-[15px] w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm mã hóa đơn, đơn hàng..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="OVERDUE">Quá hạn</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus size={18} /> Tạo hóa đơn
        </button>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600">Mã hóa đơn</th>
                <th className="px-6 py-4 font-bold text-slate-600">Khách hàng</th>
                <th className="px-6 py-4 font-bold text-slate-600">Số tiền</th>
                <th className="px-6 py-4 font-bold text-slate-600">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-slate-600">Hạn thanh toán</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{inv.invoiceId}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Đơn: #{inv.orderId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                        {inv.customerId.slice(0, 2)}
                      </div>
                      <span className="text-slate-600 font-medium">{inv.customerId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-900">{formatCurrency(inv.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 w-fit ${getStatusStyle(inv.status)}`}>
                      {getStatusIcon(inv.status)}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} />
                      <span className="font-medium">{new Date(inv.dueDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inv.status === 'PENDING' && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'PAID')}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                          title="Đánh dấu đã thanh toán"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" title="Gửi hóa đơn">
                        <Send size={18} />
                      </button>
                      <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" title="Tải xuống PDF">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy hóa đơn nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-lg animate-scale-in">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                  <Plus size={20} />
                </div>
                <h3 className="font-black text-xl text-slate-900">Tạo hóa đơn mới</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-8 space-y-[15px]">
              <div className="grid grid-cols-2 gap-[15px]">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Mã đơn hàng</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      placeholder="ORD-123..."
                      value={formData.orderId}
                      onChange={e => setFormData({...formData, orderId: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Khách hàng ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      placeholder="CUST-..."
                      value={formData.customerId}
                      onChange={e => setFormData({...formData, customerId: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Số tiền thanh toán</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="number"
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-slate-900"
                    placeholder="0"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">VND</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Hạn thanh toán</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-[15px]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Save size={20} /> Lưu hóa đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;
