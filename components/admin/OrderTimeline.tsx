import React from 'react';
import { Order, OrderTimelineEvent, OrderStatus, Language, formatCurrency } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { Clock, CheckCircle, Circle, Package, Truck, CreditCard, AlertCircle, CheckCheck } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
  lang: Language;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, lang }) => {
  const t = TRANSLATIONS[lang];

  const statusOrder: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPING, OrderStatus.COMPLETED];

  const getStatusIcon = (status: OrderStatus, isCompleted: boolean) => {
    if (status === OrderStatus.CANCELLED) {
      return <AlertCircle size={20} className="text-rose-500" />;
    }
    if (isCompleted) {
      return <CheckCircle size={20} className="text-emerald-500" />;
    }
    return <Circle size={20} className="text-slate-300" />;
  };

  const getStatusLabel = (status: OrderStatus) => {
    try {
      return t.statusLabels?.[status] || status;
    } catch {
      return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-amber-500';
      case OrderStatus.CONFIRMED: return 'text-blue-500';
      case OrderStatus.SHIPPING: return 'text-indigo-500';
      case OrderStatus.COMPLETED: return 'text-emerald-500';
      case OrderStatus.CANCELLED: return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  const timeline: OrderTimelineEvent[] = order.timeline || [];

  // Auto-generate timeline if not present
  const displayTimeline = timeline.length > 0 ? timeline : [
    { status: OrderStatus.PENDING, timestamp: order.createdAt, note: 'Đơn hàng đã đặt' },
    ...(order.status !== OrderStatus.PENDING ? [
      { status: order.status, timestamp: order.updatedAt || order.createdAt, note: getStatusLabel(order.status) }
    ] : [])
  ];

  const currentIndex = statusOrder.indexOf(order.status as OrderStatus);

  return (
    <div className="space-y-[15px]">
      {/* Status Timeline */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Clock size={14} /> Timeline Trạng Thái Đơn Hàng
        </h4>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-1 bottom-1 w-0.5 bg-slate-200" />

          {/* Status Steps */}
          <div className="space-y-3">
            {statusOrder.map((status, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const isCancelled = order.status === OrderStatus.CANCELLED;

              return (
                <div key={status} className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 ${
                    isCancelled ? 'border-rose-200' : isCurrent ? 'border-indigo-500' : isCompleted ? 'border-emerald-500' : 'border-slate-200'
                  }`}>
                    {isCancelled ? <AlertCircle size={16} className="text-rose-500" /> : getStatusIcon(status, isCompleted)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <p className={`text-xs font-medium ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                      {getStatusLabel(status)}
                    </p>
                    {isCurrent && (
                      <p className="text-[10px] text-slate-500 mt-0.5">Trạng thái hiện tại</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Events */}
      {displayTimeline.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2">
            <CheckCheck size={14} /> Timeline Sự Kiện
          </h4>
          <div className="space-y-2">
            {displayTimeline.map((event, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className={`mt-0.5 ${getStatusColor(event.status as OrderStatus)}`}>
                  {getStatusIcon(event.status as OrderStatus, true)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-slate-700">{getStatusLabel(event.status as OrderStatus)}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {event.note && (
                    <p className="text-[10px] text-slate-500 mt-0.5">{event.note}</p>
                  )}
                  {event.processedBy && (
                    <p className="text-[10px] text-slate-400 mt-0.5">Xử lý bởi: {event.processedBy}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Tracking */}
      {order.shippingTracking && (
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Truck size={14} /> Theo Dõi Vận Chuyển
          </h4>
          <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs text-indigo-700 font-mono">{order.shippingTracking}</p>
          </div>
        </div>
      )}

      {/* Payment Status */}
      {order.paymentStatus && (
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2">
            <CreditCard size={14} /> Trạng Thái Thanh Toán
          </h4>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div className={`p-1.5 rounded-full ${
              order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-600' :
              order.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-600' :
              order.paymentStatus === 'FAILED' ? 'bg-rose-100 text-rose-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              <CreditCard size={14} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">
                {order.paymentStatus === 'PAID' ? 'Đã thanh toán' :
                 order.paymentStatus === 'PENDING' ? 'Chờ thanh toán' :
                 order.paymentStatus === 'FAILED' ? 'Thất bại' :
                 order.paymentStatus}
              </p>
              {order.paymentTransactionId && (
                <p className="text-[10px] text-slate-500">Mã giao dịch: {order.paymentTransactionId}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
