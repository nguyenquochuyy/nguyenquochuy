import React, { useState } from 'react';
import { Order, formatCurrency } from '../../types';
import { Check, Mail, Package, MapPin, User, Phone, Download, FileText, ArrowRight } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {

  const [showEmail, setShowEmail] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative z-10 bg-slate-50 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg animate-scale-up">
                <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Đặt Hàng Thành Công!</h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">Cảm ơn bạn đã tin tưởng và mua sắm tại UniShop. Đơn hàng của bạn đã được ghi nhận.</p>

            {/* Order Summary */}
            <div className="mt-8 text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                <div>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Package size={16} className="text-indigo-500"/> Tóm Tắt Đơn Hàng</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Mã đơn hàng:</span> <span className="font-bold font-mono text-slate-800">#{order.id}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Ngày đặt:</span> <span className="font-medium text-slate-800">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span></div>
                        <div className="flex justify-between border-t border-slate-100 pt-2 mt-2 text-base">
                            <span className="font-bold text-slate-900">Tổng cộng:</span> 
                            <span className="font-extrabold text-indigo-600 text-lg">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><MapPin size={16} className="text-indigo-500"/> Thông Tin Giao Hàng</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                        <p className="font-bold text-slate-800 flex items-center gap-2"><User size={14}/> {order.customerName}</p>
                        <p className="flex items-center gap-2"><Phone size={14}/> {order.customerPhone}</p>
                        <p>{order.customerAddress}</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-400 mt-6">
                Một email xác nhận chi tiết đã được gửi đến <strong className="text-slate-500">{order.customerEmail}</strong>.
            </p>
            
            {/* Toggle Email Preview */}
            <div className="mt-6">
                <button onClick={() => setShowEmail(!showEmail)} className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-2 mx-auto">
                    {showEmail ? 'Ẩn' : 'Xem'} Chi Tiết Email Xác Nhận <ArrowRight size={14} className={`transition-transform ${showEmail ? 'rotate-90' : 'rotate-0'}`} />
                </button>
            </div>
            
        </div>

        {/* Simulated Email */}
        {showEmail && (
            <div className="flex-1 bg-slate-200 p-8 border-t border-slate-300 overflow-y-auto animate-fade-in-up">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg font-sans">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 text-xs text-slate-500">
                        <p><strong>From:</strong> UniShop &lt;support@unishop.demo&gt;</p>
                        <p><strong>To:</strong> {order.customerEmail}</p>
                        <p><strong>Subject:</strong> Xác nhận đơn hàng UniShop #{order.id}</p>
                    </div>
                    {/* Body */}
                    <div className="p-8">
                        <h1 className="text-2xl font-bold text-indigo-600 mb-4">Cảm ơn bạn đã mua sắm!</h1>
                        <p className="text-slate-600 mb-4">Chào {order.customerName},</p>
                        <p className="text-slate-600 mb-6">UniShop đã nhận được đơn hàng của bạn. Chúng tôi sẽ nhanh chóng xử lý và giao hàng cho bạn trong thời gian sớm nhất. Dưới đây là tóm tắt đơn hàng của bạn:</p>

                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                    <tr>
                                        <th className="p-3 text-left">Sản phẩm</th>
                                        <th className="p-3 text-center">Số lượng</th>
                                        <th className="p-3 text-right">Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map(item => (
                                        <tr key={item.id + (item.selectedVariantId || '')} className="border-t border-slate-100">
                                            <td className="p-3 flex items-center gap-3">
                                                <img src={item.images[0]} className="w-10 h-10 rounded-md bg-slate-100 object-cover" />
                                                <div>
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    {item.selectedVariantId && <p className="text-xs text-slate-500">{item.variants.find(v=>v.id === item.selectedVariantId)?.name}</p>}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-slate-600">x{item.quantity}</td>
                                            <td className="p-3 text-right font-medium text-slate-800">{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <div className="w-full max-w-xs space-y-2 text-sm">
                                <div className="flex justify-between text-slate-600"><span>Tạm tính:</span><span>{formatCurrency(order.subtotal)}</span></div>
                                <div className="flex justify-between text-slate-600"><span>Phí vận chuyển:</span><span>{formatCurrency(order.shippingFee)}</span></div>
                                {order.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Giảm giá:</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
                                <div className="flex justify-between text-slate-600"><span>Thuế (VAT {order.taxRate}%):</span><span>{formatCurrency(order.taxAmount)}</span></div>
                                <div className="flex justify-between font-bold text-base text-slate-900 border-t border-slate-200 pt-2 mt-2"><span>Tổng cộng:</span><span>{formatCurrency(order.total)}</span></div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors">Xem chi tiết đơn hàng</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-200 flex justify-center">
            <button 
                onClick={onClose}
                className="w-full max-w-xs bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
                Tiếp Tục Mua Sắm
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
