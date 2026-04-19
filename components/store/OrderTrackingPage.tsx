import React, { useState } from 'react';
import { Order, OrderStatus, formatCurrency } from '../../types';
import { 
  Package, Truck, CheckCircle, XCircle, Clock, 
  MapPin, Phone, Calendar, ChevronRight, ArrowLeft,
  ShoppingBag, CreditCard, User
} from 'lucide-react';

interface OrderTrackingPageProps {
  order: Order;
  onBack: () => void;
  lang?: 'vi' | 'en';
}

const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ order, onBack, lang = 'vi' }) => {
  const [showTimeline, setShowTimeline] = useState(true);

  const statusLabels = {
    [OrderStatus.PENDING]: lang === 'vi' ? 'Chờ xác nhận' : 'Pending',
    [OrderStatus.CONFIRMED]: lang === 'vi' ? 'Đã xác nhận' : 'Confirmed',
    [OrderStatus.SHIPPING]: lang === 'vi' ? 'Đang giao hàng' : 'Shipping',
    [OrderStatus.COMPLETED]: lang === 'vi' ? 'Hoàn thành' : 'Completed',
    [OrderStatus.CANCELLED]: lang === 'vi' ? 'Đã hủy' : 'Cancelled',
  };

  const paymentMethods = {
    'CASH': lang === 'vi' ? 'Tiền mặt' : 'Cash on Delivery',
    'VNPAY': lang === 'vi' ? 'VNPay' : 'VNPay',
    'BANK': lang === 'vi' ? 'Chuyển khoản' : 'Bank Transfer',
  };

  // Generate timeline based on order status
  const getTimeline = () => {
    const timeline = [
      {
        status: OrderStatus.PENDING,
        label: lang === 'vi' ? 'Đặt hàng thành công' : 'Order Placed',
        time: new Date(order.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US'),
        icon: ShoppingBag,
        completed: true,
        current: false,
      },
    ];

    if (order.status === OrderStatus.PENDING) {
      return timeline;
    }

    timeline.push({
      status: OrderStatus.CONFIRMED,
      label: lang === 'vi' ? 'Đã xác nhận đơn hàng' : 'Order Confirmed',
      time: lang === 'vi' ? 'Đang xử lý' : 'Processing',
      icon: CheckCircle,
      completed: order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.SHIPPING || order.status === OrderStatus.COMPLETED,
      current: order.status === OrderStatus.CONFIRMED,
    });

    if (order.status === OrderStatus.CONFIRMED) {
      return timeline;
    }

    timeline.push({
      status: OrderStatus.SHIPPING,
      label: lang === 'vi' ? 'Đang giao hàng' : 'Out for Delivery',
      time: lang === 'vi' ? 'Đang vận chuyển' : 'In Transit',
      icon: Truck,
      completed: order.status === OrderStatus.SHIPPING || order.status === OrderStatus.COMPLETED,
      current: order.status === OrderStatus.SHIPPING,
    });

    if (order.status === OrderStatus.SHIPPING) {
      return timeline;
    }

    if (order.status === OrderStatus.COMPLETED) {
      timeline.push({
        status: OrderStatus.COMPLETED,
        label: lang === 'vi' ? 'Giao hàng thành công' : 'Delivered',
        time: new Date().toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US'),
        icon: CheckCircle,
        completed: true,
        current: false,
      });
    }

    if (order.status === OrderStatus.CANCELLED) {
      timeline.push({
        status: OrderStatus.CANCELLED,
        label: lang === 'vi' ? 'Đơn hàng đã hủy' : 'Order Cancelled',
        time: new Date().toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US'),
        icon: XCircle,
        completed: true,
        current: false,
      });
    }

    return timeline;
  };

  const timeline = getTimeline();

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-700 border-blue-200',
      [OrderStatus.SHIPPING]: 'bg-purple-100 text-purple-700 border-purple-200',
      [OrderStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [OrderStatus.CANCELLED]: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            {lang === 'vi' ? 'Quay lại' : 'Back'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Order Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {lang === 'vi' ? 'Đơn hàng #' : 'Order #'}{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-slate-500 text-sm">
                {lang === 'vi' ? 'Đặt vào lúc' : 'Placed on'} {new Date(order.createdAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
              {statusLabels[order.status]}
            </span>
          </div>
        </div>

        {/* Timeline */}
        {showTimeline && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              {lang === 'vi' ? 'Theo dõi đơn hàng' : 'Order Tracking'}
            </h2>
            <div className="space-y-4">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    item.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : item.current
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-bold ${item.completed || item.current ? 'text-slate-900' : 'text-slate-400'}`}>
                      {item.label}
                    </p>
                    <p className="text-sm text-slate-500">{item.time}</p>
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className={`absolute left-5 mt-10 w-0.5 h-12 ${
                      item.completed ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} style={{ marginLeft: '19px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-indigo-600" />
            {lang === 'vi' ? 'Thông tin giao hàng' : 'Shipping Information'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-500">{lang === 'vi' ? 'Người nhận' : 'Recipient'}</p>
                  <p className="font-bold text-slate-900">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-500">{lang === 'vi' ? 'Số điện thoại' : 'Phone'}</p>
                  <p className="font-bold text-slate-900">{order.customerPhone}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-500">{lang === 'vi' ? 'Địa chỉ giao hàng' : 'Delivery Address'}</p>
                  <p className="font-bold text-slate-900">{order.customerAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-500">{lang === 'vi' ? 'Ngày giao dự kiến' : 'Estimated Delivery'}</p>
                  <p className="font-bold text-slate-900">
                    {order.status === OrderStatus.COMPLETED 
                      ? new Date(order.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')
                      : lang === 'vi' ? '2-3 ngày làm việc' : '2-3 business days'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package size={20} className="text-indigo-600" />
            {lang === 'vi' ? 'Sản phẩm' : 'Order Items'}
          </h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => {
              let price = item.price;
              let variantName = '';
              if (item.selectedVariantId) {
                const v = item.variants.find(v => v.id === item.selectedVariantId);
                if (v) { price = v.price; variantName = v.name; }
              }
              return (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <img src={item.images[0]} alt={item.name} className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    {variantName && <p className="text-sm text-slate-500">{variantName}</p>}
                    <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                    <p className="text-sm text-slate-600 mt-1">{lang === 'vi' ? 'Số lượng:' : 'Qty:'} {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(price)}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(price * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-indigo-600" />
            {lang === 'vi' ? 'Tóm tắt đơn hàng' : 'Order Summary'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{lang === 'vi' ? 'Tạm tính' : 'Subtotal'}</span>
              <span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">
                  {lang === 'vi' ? 'Giảm giá' : 'Discount'} {order.voucherCode ? `(${order.voucherCode})` : ''}
                </span>
                <span className="font-medium text-emerald-600">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{lang === 'vi' ? 'Phí vận chuyển' : 'Shipping Fee'}</span>
              <span className="font-medium text-slate-900">
                {order.shippingFee === 0 ? lang === 'vi' ? 'Miễn phí' : 'Free' : formatCurrency(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{lang === 'vi' ? 'Thuế (VAT)' : 'Tax (VAT)'}</span>
              <span className="font-medium text-slate-900">{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-slate-200">
              <span className="text-slate-500">{lang === 'vi' ? 'Phương thức thanh toán' : 'Payment Method'}</span>
              <span className="font-medium text-slate-900">{paymentMethods[order.paymentMethod as keyof typeof paymentMethods] || order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-200">
              <span className="text-slate-900">{lang === 'vi' ? 'Tổng cộng' : 'Total'}</span>
              <span className="text-indigo-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
