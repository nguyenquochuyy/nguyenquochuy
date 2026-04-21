import React from 'react';
import { Order, Language, formatCurrency, OrderStatus } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import OrderTimeline from './OrderTimeline';
import { FileText, Printer, X, Package, User, CheckCircle, Truck } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onPrintLabels: (orderId: string) => void;
  lang: Language;
  StatusBadge: (props: { status: OrderStatus }) => React.ReactElement;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderNotes: (orderId: string, internalNotes: string, customerNotes: string) => void;
  setCancellingOrder: (order: Order) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onPrintLabels, lang, StatusBadge, updateOrderStatus, updateOrderNotes, setCancellingOrder }) => {
  const t = TRANSLATIONS[lang];
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/30 print:bg-white print:absolute print:inset-0">
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-only-modal { display: block !important; position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 9999; background: white; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg relative overflow-hidden flex flex-col max-h-[85vh] print-only-modal">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 no-print shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-600" /> {t.orderDetails}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => onPrintLabels(order.id)} className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-medium text-sm">
              <Printer size={16} /> In ấn
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-[15px]">
            {/* Cột trái: Thông tin đơn hàng */}
            <div className="space-y-[15px]">
              {/* Tiêu đề hóa đơn */}
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">U</div>
                    <h1 className="text-lg font-bold text-slate-900">UniShop</h1>
                  </div>
                  <p className="text-slate-500 text-xs">Automated Retail Ecosystem</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-900 font-mono font-bold text-sm">#{order.id}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</p>
                  <div className="mt-1 no-print"><StatusBadge status={order.status} /></div>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.customerInfo}</h3>
                <p className="font-bold text-slate-900 text-sm mb-0.5">{order.customerName}</p>
                <p className="text-slate-600 text-xs">{order.customerPhone}</p>
                <p className="text-slate-600 text-xs mt-0.5">{order.customerAddress}</p>
              </div>

              {/* Thông tin thanh toán */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.paymentMethod}</h3>
                <p className="font-bold text-slate-900 text-sm">{t.paymentMethods[order.paymentMethod]}</p>
              </div>

              {/* Sản phẩm */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t.itemLabel}</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {order.items.map((item, idx) => {
                    let price = item.price;
                    let variantName = '';
                    if (item.selectedVariantId) {
                      const v = item.variants?.find(v => v.id === item.selectedVariantId);
                      if (v) { price = v.price; variantName = v.name; }
                    }
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} className="w-8 h-8 rounded bg-slate-100 object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Package size={14} className="text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">{item.name}</p>
                          {variantName && <p className="text-[10px] text-slate-500 truncate">{variantName}</p>}
                        </div>
                        <p className="text-xs font-bold text-slate-900">x{item.quantity}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>{t.total}</span>
                  <span className="text-indigo-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Cột phải: Timeline */}
            <div className="no-print">
              <OrderTimeline order={order} lang={lang} />
            </div>
          </div>

          {/* Phần ghi chú - Chỉnh sửa trực tiếp */}
          <div className="mt-6 space-y-[15px] no-print">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                <FileText size={18} /> Ghi Chú Nội Bộ
              </h3>
              <textarea
                defaultValue={order.internalNotes || ''}
                onBlur={(e) => {
                  updateOrderNotes(order.id, e.target.value, order.customerNotes || '');
                }}
                placeholder="Thêm ghi chú nội bộ cho nhân viên..."
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                rows={2}
              />
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                <User size={18} /> Ghi Chú Khách Hàng
              </h3>
              <textarea
                defaultValue={order.customerNotes || ''}
                onBlur={(e) => {
                  updateOrderNotes(order.id, order.internalNotes || '', e.target.value);
                }}
                placeholder="Ghi chú từ khách hàng..."
                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Printer size={18} /> In Hóa Đơn
          </button>
          {order.status === OrderStatus.PENDING && (
            <>
              <button
                onClick={() => setCancellingOrder(order)}
                className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"
              >
                {t.cancelOrder}
              </button>
              <button
                onClick={() => { updateOrderStatus(order.id, OrderStatus.CONFIRMED); onClose(); }}
                className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2"
              >
                <CheckCircle size={18} /> {t.confirmOrder}
              </button>
            </>
          )}
          {order.status === OrderStatus.CONFIRMED && (
            <button
              onClick={() => { updateOrderStatus(order.id, OrderStatus.SHIPPING); onClose(); }}
              className="px-6 py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-xl font-bold shadow-lg shadow-purple-200 transition-colors flex items-center gap-2"
            >
              <Truck size={18} /> {t.markShipping}
            </button>
          )}
          {order.status === OrderStatus.SHIPPING && (
            <button
              onClick={() => { updateOrderStatus(order.id, OrderStatus.COMPLETED); onClose(); }}
              className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={18} /> {t.completeOrder}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
