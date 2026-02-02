import React, { useState } from 'react';
import { BackendContextType, Order, Language, formatCurrency, OrderStatus } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import ConfirmModal from './ConfirmModal';
import { FileText, Printer, X, CheckCircle, Truck } from 'lucide-react';

interface OrderManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const OrderManager: React.FC<OrderManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, updateOrderStatus } = backend;
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);

  // Status Badge Helper
  const StatusBadge = ({ status }: { status: OrderStatus }) => {
        const styles = {
            [OrderStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
            [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-700 border-blue-200',
            [OrderStatus.SHIPPING]: 'bg-purple-100 text-purple-700 border-purple-200',
            [OrderStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            [OrderStatus.CANCELLED]: 'bg-rose-100 text-rose-700 border-rose-200',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status]}`}>
                {t.statusLabels[status]}
            </span>
        );
  };

  // --- Order Detail Modal ---
  const OrderDetailModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
    const handlePrint = () => window.print();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-slate-900/60 backdrop-blur-sm print:bg-white print:absolute print:inset-0">
            <style>{`
                @media print {
                    body > * { display: none !important; }
                    .print-only-modal { display: block !important; position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 9999; background: white; padding: 20px; }
                    .no-print { display: none !important; }
                }
            `}</style>
            
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col print-only-modal">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 no-print">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-indigo-600" /> {t.orderDetails}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium">
                            <Printer size={18} /> {t.printInvoice}
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {/* Invoice Content */}
                    <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
                                <h1 className="text-2xl font-bold text-slate-900">UniShop</h1>
                            </div>
                            <p className="text-slate-500 text-sm">Automated Retail Ecosystem</p>
                            <p className="text-slate-500 text-sm">support@unishop.demo</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-slate-200 uppercase tracking-widest mb-2">{t.invoice}</h2>
                            <p className="text-slate-900 font-mono font-bold text-lg">#{order.id}</p>
                            <p className="text-slate-500 text-sm mt-1">{new Date(order.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}</p>
                            <div className="mt-2 no-print"><StatusBadge status={order.status} /></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-8">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.customerInfo}</h3>
                            <p className="font-bold text-slate-900 text-lg mb-1">{order.customerName}</p>
                            <p className="text-slate-600 text-sm">{order.customerPhone}</p>
                            <p className="text-slate-600 text-sm mt-1">{order.customerAddress}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.paymentMethod}</h3>
                            <p className="font-bold text-slate-900">{t.paymentMethods[order.paymentMethod]}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Item</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-center">Qty</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.items.map((item, idx) => {
                                    let price = item.price;
                                    let variantName = '';
                                    if (item.selectedVariantId) {
                                        const v = item.variants.find(v => v.id === item.selectedVariantId);
                                        if (v) { price = v.price; variantName = v.name; }
                                    }
                                    return (
                                        <tr key={idx}>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.images[0]} className="w-10 h-10 rounded bg-slate-100 object-cover border border-slate-200" />
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                                        {variantName && <p className="text-xs text-slate-500">{variantName}</p>}
                                                        <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm text-slate-600">{formatCurrency(price)}</td>
                                            <td className="px-4 py-4 text-center text-sm font-bold text-slate-800">x{item.quantity}</td>
                                            <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">{formatCurrency(price * item.quantity)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>{t.subtotal}</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Discount {order.voucherCode ? `(${order.voucherCode})` : ''}</span>
                                    <span>-{formatCurrency(order.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>{t.shippingFee}</span>
                                <span>{order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)}</span>
                            </div>
                             <div className="flex justify-between text-sm text-slate-600 border-b border-slate-100 pb-3">
                                <span>Thuế (VAT {order.taxRate}%)</span>
                                <span>{formatCurrency(order.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-900 pt-1">
                                <span>{t.total}</span>
                                <span className="text-indigo-600">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-3 no-print">
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
       <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.orderMgmt}</h2>
          <p className="text-slate-500 text-sm mt-1">{state.orders.length} orders processed</p>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                <tr>
                   <th className="px-6 py-4">{t.orderId}</th>
                   <th className="px-6 py-4">{t.customer}</th>
                   <th className="px-6 py-4">{t.placedAt}</th>
                   <th className="px-6 py-4 text-center">{t.status}</th>
                   <th className="px-6 py-4 text-right">{t.total}</th>
                   <th className="px-6 py-4 text-right">{t.actions}</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 text-sm">
                {[...state.orders].reverse().map(order => (
                   <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600 font-bold">#{order.id}</td>
                      <td className="px-6 py-4">
                         <div className="font-bold text-slate-900">{order.customerName}</div>
                         <div className="text-xs text-slate-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                         {new Date(order.createdAt).toLocaleDateString()}
                         <div className="text-xs">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600">
                         {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                            onClick={() => setViewingOrder(order)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                         >
                            {t.viewDetails}
                         </button>
                      </td>
                   </tr>
                ))}
                {state.orders.length === 0 && (
                   <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No orders found.</td>
                   </tr>
                )}
             </tbody>
          </table>
       </div>

       {viewingOrder && <OrderDetailModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}

       <ConfirmModal
            isOpen={!!cancellingOrder}
            onClose={() => setCancellingOrder(null)}
            onConfirm={() => {
                if (cancellingOrder) {
                    updateOrderStatus(cancellingOrder.id, OrderStatus.CANCELLED);
                    setViewingOrder(null); // Close detail modal as well
                }
            }}
            title={t.cancelOrder}
            message="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
            lang={lang}
            confirmColor="amber"
            confirmText={t.cancelOrder}
        />
    </div>
  );
};

export default OrderManager;