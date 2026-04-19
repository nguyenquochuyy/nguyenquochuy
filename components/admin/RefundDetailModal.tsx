import React, { useState } from 'react';
import { api } from '../../services/apiClient';
import { RefundStatus } from '../../types';
import { X, DollarSign, CheckCircle, XCircle, Clock, Trash2, Package } from 'lucide-react';

interface RefundDetailModalProps {
  refund: any;
  onClose: () => void;
  onRefundUpdated: () => void;
  lang: 'en' | 'vi';
}

const RefundDetailModal: React.FC<RefundDetailModalProps> = ({ refund, onClose, onRefundUpdated, lang }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: RefundStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PROCESSING': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: RefundStatus) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} />;
      case 'APPROVED': return <CheckCircle size={16} />;
      case 'PROCESSING': return <Clock size={16} />;
      case 'COMPLETED': return <CheckCircle size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      case 'CANCELLED': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getRefundMethodLabel = (method: string) => {
    switch (method) {
      case 'ORIGINAL': return 'Hoàn về phương thức gốc';
      case 'BANKING': return 'Chuyển khoản ngân hàng';
      case 'CASH': return 'Tiền mặt';
      default: return method;
    }
  };

  const handleUpdateStatus = async (newStatus: RefundStatus) => {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái sang ${newStatus}?`)) return;

    setIsUpdating(true);
    try {
      await api.updateRefundStatus(refund.id, newStatus, 'Admin');
      onRefundUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating refund status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa yêu cầu hoàn tiền này?')) return;

    setIsUpdating(true);
    try {
      await api.deleteRefund(refund.id);
      onRefundUpdated();
      onClose();
    } catch (error) {
      console.error('Error deleting refund:', error);
      alert('Có lỗi xảy ra khi xóa yêu cầu hoàn tiền');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-900/60 backdrop-blur-sm">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="text-indigo-600" /> Chi Tiết Yêu Cầu Hoàn Tiền
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(refund.status)}`}>
              {getStatusIcon(refund.status)}
              {refund.status}
            </span>
            <span className="text-sm text-slate-500">
              {new Date(refund.requestDate).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Order Info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Mã đơn hàng:</span>
              <span className="font-medium text-slate-900">{refund.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Khách hàng:</span>
              <span className="font-medium text-slate-900">{refund.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Số điện thoại:</span>
              <span className="font-medium text-slate-900">{refund.customerPhone}</span>
            </div>
            {refund.customerId && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">ID khách hàng:</span>
                <span className="font-medium text-slate-900">{refund.customerId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Phương thức hoàn:</span>
              <span className="font-medium text-slate-900">{getRefundMethodLabel(refund.refundMethod)}</span>
            </div>
            {refund.refundAccount && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Tài khoản:</span>
                <span className="font-medium text-slate-900">{refund.refundAccount}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
              <span className="text-sm font-bold text-slate-900">Số tiền hoàn:</span>
              <span className="font-bold text-indigo-600 text-lg">{refund.amount.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Refund Items */}
          {refund.items && refund.items.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Package size={16} /> Sản phẩm hoàn tiền
              </h3>
              <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {refund.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                    <div>
                      <span className="font-medium text-slate-900">{item.productName}</span>
                      <span className="text-slate-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-indigo-600">{(item.price * item.quantity).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">Lý do hoàn tiền:</h3>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{refund.reason}</p>
          </div>

          {/* Notes */}
          {refund.notes && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Ghi chú:</h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{refund.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Lịch sử xử lý:</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Ngày tạo:</span>
              <span className="font-medium text-slate-900">{new Date(refund.requestDate).toLocaleString('vi-VN')}</span>
            </div>
            {refund.processedDate && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Bắt đầu xử lý:</span>
                <span className="font-medium text-slate-900">{new Date(refund.processedDate).toLocaleString('vi-VN')}</span>
              </div>
            )}
            {refund.completedDate && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Hoàn thành:</span>
                <span className="font-medium text-slate-900">{new Date(refund.completedDate).toLocaleString('vi-VN')}</span>
              </div>
            )}
            {refund.processedBy && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Người xử lý:</span>
                <span className="font-medium text-slate-900">{refund.processedBy}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {refund.status === 'PENDING' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateStatus('APPROVED')}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} /> Duyệt
              </button>
              <button
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle size={16} /> Từ chối
              </button>
            </div>
          )}

          {refund.status === 'APPROVED' && (
            <button
              onClick={() => handleUpdateStatus('PROCESSING')}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Clock size={16} /> Bắt đầu xử lý
            </button>
          )}

          {refund.status === 'PROCESSING' && (
            <button
              onClick={() => handleUpdateStatus('COMPLETED')}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> Hoàn thành
            </button>
          )}

          {refund.status === 'PENDING' && (
            <button
              onClick={handleDelete}
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Xóa yêu cầu
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundDetailModal;
