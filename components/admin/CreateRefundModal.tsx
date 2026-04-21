import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { X, DollarSign, Package } from 'lucide-react';

interface CreateRefundModalProps {
  onClose: () => void;
  onRefundCreated: () => void;
  orders: any[];
}

const CreateRefundModal: React.FC<CreateRefundModalProps> = ({ onClose, onRefundCreated, orders }) => {
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState<'ORIGINAL' | 'BANKING' | 'CASH'>('ORIGINAL');
  const [refundAccount, setRefundAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<{productId: string, productName: string, quantity: number, price: number}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  useEffect(() => {
    if (selectedOrder) {
      // Auto-select all items from the order
      const items = selectedOrder.items.map((item: any) => ({
        productId: item.id || item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      }));
      setSelectedItems(items);
      setAmount(selectedOrder.total.toString());
    }
  }, [selectedOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !amount || !reason) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!selectedOrder) {
      alert('Không tìm thấy đơn hàng');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createRefund({
        orderId: selectedOrder.id,
        orderNumber: selectedOrder.id,
        customerId: selectedOrder.customerId || '',
        customerName: selectedOrder.customerName,
        customerPhone: selectedOrder.customerPhone,
        amount: parseFloat(amount),
        reason,
        refundMethod,
        refundAccount: refundMethod === 'BANKING' ? refundAccount : '',
        notes,
        items: selectedItems,
      });
      onRefundCreated();
      onClose();
    } catch (error) {
      console.error('Error creating refund:', error);
      alert('Có lỗi xảy ra khi tạo yêu cầu hoàn tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/30">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg relative overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="text-indigo-600" /> Tạo Yêu Cầu Hoàn Tiền
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-[15px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-[15px]">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Đơn hàng *</label>
              <select
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
              >
                <option value="">Chọn đơn hàng</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.id} - {order.customerName} - {order.total.toLocaleString()}đ
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Số tiền hoàn (VNĐ) *</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[15px]">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phương thức hoàn tiền *</label>
              <select
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value as any)}
              >
                <option value="ORIGINAL">Hoàn về phương thức gốc</option>
                <option value="BANKING">Chuyển khoản ngân hàng</option>
                <option value="CASH">Tiền mặt</option>
              </select>
            </div>

            {refundMethod === 'BANKING' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tài khoản ngân hàng *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={refundAccount}
                  onChange={(e) => setRefundAccount(e.target.value)}
                  placeholder="Số tài khoản hoặc tên ngân hàng"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Lý do hoàn tiền *</label>
            <textarea
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Ghi chú</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {selectedOrder && selectedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Package size={16} /> Sản phẩm hoàn tiền
              </h3>
              <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {selectedItems.map((item, index) => (
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo Yêu Cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRefundModal;
