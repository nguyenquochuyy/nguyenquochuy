import React, { useState } from 'react';
import { BackendContextType, Language, Refund, RefundStatus } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import {
  ArrowLeft, Plus, Search, Filter, CheckCircle, XCircle, Clock,
  AlertCircle, DollarSign, Calendar, User, Phone, Eye, Trash2,
  MoreVertical, Download, RefreshCw
} from 'lucide-react';

interface RefundManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const RefundManager: React.FC<RefundManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, createRefund, updateRefundStatus, deleteRefund } = backend;
  const refunds = state.refunds || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'ALL'>('ALL');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch =
      refund.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: RefundStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PROCESSING': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: RefundStatus) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} />;
      case 'APPROVED': return <CheckCircle size={16} />;
      case 'PROCESSING': return <RefreshCw size={16} />;
      case 'COMPLETED': return <CheckCircle size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      case 'CANCELLED': return <XCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = (refundId: string, newStatus: RefundStatus) => {
    const currentUser = backend.getCurrentUser();
    updateRefundStatus(refundId, newStatus, currentUser?.name);
    setShowActions(null);
  };

  const handleDelete = (refundId: string) => {
    if (confirm('Bạn có chắc muốn xóa yêu cầu hoàn tiền này?')) {
      deleteRefund(refundId);
    }
    setShowActions(null);
  };

  return (
    <div className="space-y-[15px]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.refundMgmt}</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý yêu cầu hoàn tiền và trả hàng</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus size={20} /> Tạo Yêu Cầu
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-[15px]">
        <div className="flex flex-col sm:flex-row gap-[15px]">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RefundStatus | 'ALL')}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="REJECTED">Từ chối</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Refunds List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filteredRefunds.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <DollarSign size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="font-medium">Không có yêu cầu hoàn tiền nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Mã Đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Khách Hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Số Tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Lý Do</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ngày Tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{refund.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{refund.customerName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone size={12} /> {refund.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refund.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 max-w-xs truncate">{refund.reason}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(refund.status)}`}>
                        {getStatusIcon(refund.status)}
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Calendar size={14} /> {formatDate(refund.requestDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRefund(refund)}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === refund.id ? null : refund.id)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Thao tác"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {showActions === refund.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10">
                              {refund.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(refund.id, 'APPROVED')}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <CheckCircle size={16} className="text-green-600" /> Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(refund.id, 'REJECTED')}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <XCircle size={16} className="text-red-600" /> Từ chối
                                  </button>
                                </>
                              )}
                              {refund.status === 'APPROVED' && (
                                <button
                                  onClick={() => handleStatusUpdate(refund.id, 'PROCESSING')}
                                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <RefreshCw size={16} className="text-blue-600" /> Bắt đầu xử lý
                                </button>
                              )}
                              {refund.status === 'PROCESSING' && (
                                <button
                                  onClick={() => handleStatusUpdate(refund.id, 'COMPLETED')}
                                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <CheckCircle size={16} className="text-green-600" /> Hoàn thành
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(refund.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                              >
                                <Trash2 size={16} /> Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/30">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="text-indigo-600" /> Chi Tiết Hoàn Tiền
              </h2>
              <button onClick={() => setSelectedRefund(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-[15px]">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase border ${getStatusColor(selectedRefund.status)}`}>
                  {getStatusIcon(selectedRefund.status)}
                  {selectedRefund.status}
                </span>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Calendar size={14} /> {formatDate(selectedRefund.requestDate)}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <User size={18} /> Thông Tin Khách Hàng
                </h3>
                <div className="grid grid-cols-2 gap-[15px] text-sm">
                  <div>
                    <span className="text-slate-500">Tên:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedRefund.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">SĐT:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedRefund.customerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign size={18} /> Thông Tin Đơn Hàng
                </h3>
                <div className="grid grid-cols-2 gap-[15px] text-sm">
                  <div>
                    <span className="text-slate-500">Mã đơn:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedRefund.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="ml-2 font-bold text-indigo-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedRefund.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Phương thức:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedRefund.refundMethod}</span>
                  </div>
                  {selectedRefund.refundAccount && (
                    <div>
                      <span className="text-slate-500">TK hoàn tiền:</span>
                      <span className="ml-2 font-medium text-slate-900">{selectedRefund.refundAccount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Plus size={18} /> Sản Phẩm Hoàn Trả
                </h3>
                <div className="space-y-2">
                  {selectedRefund.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-slate-200 last:border-0">
                      <span className="text-slate-900">{item.productName}</span>
                      <span className="text-slate-600">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle size={18} /> Lý Do Hoàn Trả
                </h3>
                <p className="text-sm text-slate-700">{selectedRefund.reason}</p>
              </div>

              {/* Notes */}
              {selectedRefund.notes && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle size={18} /> Ghi Chú
                  </h3>
                  <p className="text-sm text-slate-700">{selectedRefund.notes}</p>
                </div>
              )}

              {/* Processing Info */}
              {(selectedRefund.processedDate || selectedRefund.completedDate || selectedRefund.processedBy) && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={18} /> Thông Tin Xử Lý
                  </h3>
                  <div className="grid grid-cols-2 gap-[15px] text-sm">
                    {selectedRefund.processedBy && (
                      <div>
                        <span className="text-slate-600">Người xử lý:</span>
                        <span className="ml-2 font-medium text-slate-900">{selectedRefund.processedBy}</span>
                      </div>
                    )}
                    {selectedRefund.processedDate && (
                      <div>
                        <span className="text-slate-600">Ngày xử lý:</span>
                        <span className="ml-2 font-medium text-slate-900">{formatDate(selectedRefund.processedDate)}</span>
                      </div>
                    )}
                    {selectedRefund.completedDate && (
                      <div>
                        <span className="text-slate-600">Ngày hoàn thành:</span>
                        <span className="ml-2 font-medium text-slate-900">{formatDate(selectedRefund.completedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/30">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="text-indigo-600" /> Tạo Yêu Cầu Hoàn Tiền
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-slate-500 text-sm">Tính năng tạo yêu cầu hoàn tiền sẽ được phát triển sau.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundManager;
