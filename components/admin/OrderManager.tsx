import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { BackendContextType, Order, Language, formatCurrency, OrderStatus, Refund, RefundStatus } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import ConfirmModal from './ConfirmModal';
import OrderTimeline from './OrderTimeline';
import PrintLabelsModal from './PrintLabelsModal';
import OrderDetailModal from './OrderDetailModal';
import AddOrderModal from './AddOrderModal';
import CreateRefundModal from './CreateRefundModal';
import RefundDetailModal from './RefundDetailModal';
import { FileText, Printer, X, CheckCircle, Truck, Search, Download, Filter, Calendar, Package, Plus, DollarSign, ArrowLeft, ArrowRight, Clock, Eye, MoreVertical, Trash2, RefreshCw, Phone, AlertCircle, User } from 'lucide-react';

interface OrderManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const ITEMS_PER_PAGE = 10;

const OrderManager: React.FC<OrderManagerProps> = memo(({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, updateOrderStatus, createRefund, updateRefundStatus, deleteRefund, updateOrderNotes } = backend;
  const [activeTab, setActiveTab] = useState<'orders' | 'refunds'>('orders');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [printLabelsOrderId, setPrintLabelsOrderId] = useState<string | null>(null);

  // Trạng thái bộ lọc
  const [orderSearch, setOrderSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(orderSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [orderSearch]);

  // Trạng thái bộ lọc hoàn tiền
  const [refundSearch, setRefundSearch] = useState('');
  const [refundStatusFilter, setRefundStatusFilter] = useState<RefundStatus | 'ALL'>('ALL');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showRefundActions, setShowRefundActions] = useState<string | null>(null);
  const [isCreatingRefund, setIsCreatingRefund] = useState(false);
  const [viewingRefund, setViewingRefund] = useState<Refund | null>(null);

  // Trạng thái chọn hàng loạt
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkActionType, setBulkActionType] = useState<'status' | 'delete' | null>(null);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>(OrderStatus.PENDING);

  // Logic bộ lọc
  const filteredOrders = useMemo(() => {
      return state.orders.filter(o => {
          const matchSearch = o.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                           o.customerPhone.includes(debouncedSearch) ||
                           o.id.toLowerCase().includes(debouncedSearch.toLowerCase());
          const matchStatus = statusFilter === 'All' || o.status === statusFilter;
          const matchDateFrom = !dateFrom || new Date(o.createdAt) >= new Date(dateFrom);
          const matchDateTo = !dateTo || new Date(o.createdAt) <= new Date(dateTo);
          return matchSearch && matchStatus && matchDateFrom && matchDateTo;
      });
  }, [state.orders, debouncedSearch, statusFilter, dateFrom, dateTo]);

  // Logic bộ lọc hoàn tiền
  const filteredRefunds = useMemo(() => {
    const refunds = state.refunds || [];
    return refunds.filter(refund => {
      const matchesSearch =
        refund.orderNumber.toLowerCase().includes(refundSearch.toLowerCase()) ||
        refund.customerName.toLowerCase().includes(refundSearch.toLowerCase()) ||
        refund.customerPhone.includes(refundSearch);
      const matchesStatus = refundStatusFilter === 'ALL' || refund.status === refundStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [state.refunds, refundSearch, refundStatusFilter]);

  // Helper badge trạng thái
  const StatusBadge = ({ status }: { status: OrderStatus }) => {
        const styles = {
            [OrderStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
            [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-700 border-blue-200',
            [OrderStatus.SHIPPING]: 'bg-purple-100 text-purple-700 border-purple-200',
            [OrderStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            [OrderStatus.CANCELLED]: 'bg-rose-100 text-rose-700 border-rose-200',
        };
        const statusLabels = {
            [OrderStatus.PENDING]: 'Chờ xử lý',
            [OrderStatus.CONFIRMED]: 'Đã xác nhận',
            [OrderStatus.SHIPPING]: 'Đang giao',
            [OrderStatus.COMPLETED]: 'Hoàn thành',
            [OrderStatus.CANCELLED]: 'Đã hủy',
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[status]}`}>
                {statusLabels[status] || status}
            </span>
        );
  };

  // Helper trạng thái hoàn tiền
  const getRefundStatusColor = (status: RefundStatus) => {
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

  const getRefundStatusIcon = (status: RefundStatus) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} />;
      case 'APPROVED': return <CheckCircle size={16} />;
      case 'PROCESSING': return <RefreshCw size={16} />;
      case 'COMPLETED': return <CheckCircle size={16} />;
      case 'REJECTED': return <X size={16} />;
      case 'CANCELLED': return <X size={16} />;
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

  const handleRefundStatusUpdate = (refundId: string, newStatus: RefundStatus) => {
    const currentUser = backend.getCurrentUser();
    updateRefundStatus(refundId, newStatus, currentUser?.name);
    setShowRefundActions(null);
  };

  const handleRefundDelete = (refundId: string) => {
    if (confirm('Bạn có chắc muốn xóa yêu cầu hoàn tiền này?')) {
      deleteRefund(refundId);
    }
    setShowRefundActions(null);
  };

  // Handlers hành động hàng loạt
  const handleSelectOrder = (orderId: string) => {
      setSelectedOrders(prev => {
          const newSet = new Set(prev);
          if (newSet.has(orderId)) {
              newSet.delete(orderId);
          } else {
              newSet.add(orderId);
          }
          return newSet;
      });
  };

  const handleSelectAll = () => {
      if (selectedOrders.size === filteredOrders.length) {
          setSelectedOrders(new Set());
      } else {
          setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
      }
  };

  const handleBulkStatus = () => {
      selectedOrders.forEach(id => updateOrderStatus(id, bulkStatus));
      setSelectedOrders(new Set());
      setBulkActionType(null);
  };

  const handleBulkDelete = () => {
      selectedOrders.forEach(id => updateOrderStatus(id, OrderStatus.CANCELLED));
      setSelectedOrders(new Set());
      setBulkActionType(null);
  };

  // Handlers xuất dữ liệu
  const handleExportCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      const bom = "\uFEFF";
      csvContent += bom;

      const headers = ["Mã đơn", "Khách hàng", "SĐT", "Địa chỉ", "Trạng thái", "Tổng", "Phương thức thanh toán", "Ngày tạo"];
      csvContent += headers.join(",") + "\n";

      filteredOrders.forEach(o => {
          const row = [
              o.id,
              `"${o.customerName.replace(/"/g, '""')}"`,
              o.customerPhone,
              `"${o.customerAddress.replace(/"/g, '""')}"`,
              o.status,
              o.total,
              o.paymentMethod,
              new Date(o.createdAt).toLocaleString()
          ];
          csvContent += row.join(",") + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportPDF = () => {
      window.print();
  };

  const handlePrintLabels = useCallback((orderId: string) => {
      setPrintLabelsOrderId(orderId);
  }, []);

  const handleOrderCreated = useCallback(() => {
      // Refresh orders from backend
      window.location.reload();
  }, []);

  const handleRefundCreated = useCallback(() => {
      // Refresh refunds from backend
      window.location.reload();
  }, []);

  const handleRefundUpdated = useCallback(() => {
      // Refresh refunds from backend
      window.location.reload();
  }, []);

  return (
    <div className="space-y-[15px] max-w-7xl mx-auto animate-fade-in-up">
       <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.orderMgmt}</h2>
          <p className="text-slate-500 text-sm mt-1">{filteredOrders.length} {t.ordersProcessed}</p>
       </div>

       {/* Tab Switcher */}
       <div className="flex gap-2 border-b border-slate-200">
         <button
           onClick={() => setActiveTab('orders')}
           className={`px-4 py-2 font-medium transition-colors border-b-2 ${
             activeTab === 'orders'
               ? 'border-indigo-600 text-indigo-600'
               : 'border-transparent text-slate-600 hover:text-slate-900'
           }`}
         >
           <div className="flex items-center gap-2">
             <Package size={18} /> Đơn Hàng
           </div>
         </button>
         <button
           onClick={() => setActiveTab('refunds')}
           className={`px-4 py-2 font-medium transition-colors border-b-2 ${
             activeTab === 'refunds'
               ? 'border-indigo-600 text-indigo-600'
               : 'border-transparent text-slate-600 hover:text-slate-900'
           }`}
         >
           <div className="flex items-center gap-2">
             <DollarSign size={18} /> Hoàn Tiền
           </div>
         </button>
       </div>

       {/* Orders Tab */}
       {activeTab === 'orders' && (
       <>

       {/* Toolbar */}
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-[15px] justify-between">
           <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
               <input
                   type="text"
                   placeholder="Tìm kiếm đơn hàng..."
                   className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                   value={orderSearch}
                   onChange={(e) => setOrderSearch(e.target.value)}
               />
           </div>
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
               <button
                   onClick={() => setIsAddingOrder(true)}
                   className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
               >
                   <Plus size={16} /> {t.addNewOrder}
               </button>
               <select
                   className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50 w-full sm:w-auto"
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
               >
                   <option value="All">Tất cả trạng thái</option>
                   <option value="PENDING">Chờ xác nhận</option>
                   <option value="CONFIRMED">Đã xác nhận</option>
                   <option value="SHIPPING">Đang giao</option>
                   <option value="COMPLETED">Hoàn thành</option>
                   <option value="CANCELLED">Đã hủy</option>
               </select>
               <button
                   onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                   className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${showAdvancedFilters ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
               >
                   <Filter size={16} className="inline mr-2" />
                   Bộ lọc nâng cao
               </button>
               <div className="flex gap-2">
                   <button onClick={handleExportCSV} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2" title="Export CSV">
                       <Download size={16} />
                   </button>
                   <button onClick={handleExportPDF} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2" title="Export PDF">
                       <Printer size={16} />
                   </button>
               </div>
           </div>
       </div>

       {/* Bộ lọc nâng cao */}
       {showAdvancedFilters && (
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-2">Từ ngày</label>
                       <input
                           type="date"
                           value={dateFrom}
                           onChange={(e) => setDateFrom(e.target.value)}
                           className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-2">Đến ngày</label>
                       <input
                           type="date"
                           value={dateTo}
                           onChange={(e) => setDateTo(e.target.value)}
                           className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                       />
                   </div>
               </div>
               <div className="mt-4 flex justify-end">
                   <button
                       onClick={() => { setDateFrom(''); setDateTo(''); setShowAdvancedFilters(false); }}
                       className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                   >
                       Đặt lại bộ lọc
                   </button>
               </div>
           </div>
       )}

       {/* Thanh hành động hàng loạt */}
       {selectedOrders.size > 0 && (
           <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-center justify-between animate-fade-in">
               <div className="flex items-center gap-[15px]">
                   <span className="text-sm font-bold text-indigo-900">{selectedOrders.size} đã chọn</span>
                   <button
                       onClick={() => setSelectedOrders(new Set())}
                       className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                   >
                       Bỏ chọn
                   </button>
               </div>
               <div className="flex gap-2">
                   <button
                       onClick={() => setBulkActionType('status')}
                       className="px-4 py-2 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors border border-slate-200"
                   >
                       Cập nhật trạng thái
                   </button>
                   <button
                       onClick={() => setBulkActionType('delete')}
                       className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
                   >
                       Hủy đơn đã chọn
                   </button>
               </div>
           </div>
       )}

       {/* Modal hành động hàng loạt */}
       {bulkActionType && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setBulkActionType(null)}></div>
               <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative p-6">
                   <h3 className="text-xl font-bold text-slate-900 mb-4">
                       {bulkActionType === 'delete' ? 'Hủy đơn hàng đã chọn' : 'Cập nhật trạng thái đơn hàng'}
                   </h3>
                   {bulkActionType === 'status' && (
                       <div className="space-y-[15px]">
                           <select
                               value={bulkStatus}
                               onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
                               className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                           >
                               <option value="PENDING">Chờ xử lý</option>
                               <option value="CONFIRMED">Đã xác nhận</option>
                               <option value="SHIPPING">Đang giao</option>
                               <option value="COMPLETED">Hoàn thành</option>
                               <option value="CANCELLED">Đã hủy</option>
                           </select>
                       </div>
                   )}
                   {bulkActionType === 'delete' && (
                       <p className="text-slate-600">Bạn có chắc muốn hủy {selectedOrders.size} đơn hàng đã chọn? Hành động này không thể hoàn tác.</p>
                   )}
                   <div className="flex justify-end gap-3 mt-6">
                       <button
                           onClick={() => setBulkActionType(null)}
                           className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                       >
                           Hủy
                       </button>
                       <button
                            onClick={() => {
                                if (bulkActionType === 'delete') handleBulkDelete();
                                else if (bulkActionType === 'status') handleBulkStatus();
                           }}
                           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                       >
                           Xác nhận
                       </button>
                   </div>
               </div>
           </div>
       )}

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                <tr>
                    <th className="px-4 py-4 w-10">
                        <input
                            type="checkbox"
                            checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                    </th>
                    <th className="px-6 py-4">{t.orderId}</th>
                    <th className="px-6 py-4">{t.customer}</th>
                    <th className="px-6 py-4">{t.placedAt}</th>
                    <th className="px-6 py-4 text-center">{t.status}</th>
                    <th className="px-6 py-4 text-right">{t.total}</th>
                    <th className="px-6 py-4 text-right">{t.actions}</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 text-sm">
                {[...filteredOrders].reverse().map(order => (
                   <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                          <input
                              type="checkbox"
                              checked={selectedOrders.has(order.id)}
                              onChange={() => handleSelectOrder(order.id)}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                      </td>
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
                {filteredOrders.length === 0 && (
                   <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">{t.noOrdersFound}</td>
                   </tr>
                )}
             </tbody>
          </table>
              </div>
       </div>

       {viewingOrder && <OrderDetailModal key={viewingOrder.id} order={viewingOrder} onClose={() => setViewingOrder(null)} onPrintLabels={handlePrintLabels} lang={lang} StatusBadge={({ status }) => <StatusBadge status={status} />} updateOrderStatus={updateOrderStatus} updateOrderNotes={updateOrderNotes} setCancellingOrder={setCancellingOrder} />}
      {isAddingOrder && <AddOrderModal onClose={() => setIsAddingOrder(false)} lang={lang} onOrderCreated={handleOrderCreated} products={state.products} />}
      {printLabelsOrderId && <PrintLabelsModal orderId={printLabelsOrderId} onClose={() => setPrintLabelsOrderId(null)} />}
       </>
       )}

       {/* Tab Hoàn tiền */}
       {activeTab === 'refunds' && (
       <>
       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-[15px] justify-between">
         <div className="relative flex-1 w-full">
           <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
           <input
             type="text"
             placeholder="Tìm kiếm yêu cầu hoàn tiền..."
             className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
             value={refundSearch}
             onChange={(e) => setRefundSearch(e.target.value)}
           />
         </div>
         <div className="flex gap-3">
           <select
             value={refundStatusFilter}
             onChange={(e) => setRefundStatusFilter(e.target.value as RefundStatus | 'ALL')}
             className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50"
           >
             <option value="ALL">Tất cả trạng thái</option>
             <option value="PENDING">Chờ duyệt</option>
             <option value="APPROVED">Đã duyệt</option>
             <option value="PROCESSING">Đang xử lý</option>
             <option value="COMPLETED">Hoàn thành</option>
             <option value="REJECTED">Từ chối</option>
             <option value="CANCELLED">Đã hủy</option>
           </select>
           <button
             onClick={() => setIsCreatingRefund(true)}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
           >
             <Plus size={18} /> Tạo Yêu Cầu
           </button>
         </div>
       </div>

       <div className="bg-white rounded-xl border border-slate-200">
         {filteredRefunds.length === 0 ? (
           <div className="p-12 text-center text-slate-500">
             <DollarSign size={48} className="mx-auto mb-4 text-slate-300" />
             <p className="font-medium">Không có yêu cầu hoàn tiền nào</p>
           </div>
         ) : (
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
                         {formatCurrency(refund.amount)}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="text-sm text-slate-600 max-w-xs truncate">{refund.reason}</span>
                     </td>
                     <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getRefundStatusColor(refund.status)}`}>
                         {getRefundStatusIcon(refund.status)}
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
                           onClick={() => setViewingRefund(refund)}
                           className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                           title="Xem chi tiết"
                         >
                           <Eye size={18} />
                         </button>
                         <div className="relative">
                           <button
                             onClick={() => setShowRefundActions(showRefundActions === refund.id ? null : refund.id)}
                             className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                             title="Thao tác"
                           >
                             <MoreVertical size={18} />
                           </button>
                           {showRefundActions === refund.id && (
                             <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                               {refund.status === 'PENDING' && (
                                 <>
                                   <button
                                     onClick={() => handleRefundStatusUpdate(refund.id, 'APPROVED')}
                                     className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                   >
                                     <CheckCircle size={16} className="text-green-600" /> Duyệt
                                   </button>
                                   <button
                                     onClick={() => handleRefundStatusUpdate(refund.id, 'REJECTED')}
                                     className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                   >
                                     <X size={16} className="text-red-600" /> Từ chối
                                   </button>
                                 </>
                               )}
                               {refund.status === 'APPROVED' && (
                                 <button
                                   onClick={() => handleRefundStatusUpdate(refund.id, 'PROCESSING')}
                                   className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                 >
                                   <RefreshCw size={16} className="text-blue-600" /> Bắt đầu xử lý
                                 </button>
                               )}
                               {refund.status === 'PROCESSING' && (
                                 <button
                                   onClick={() => handleRefundStatusUpdate(refund.id, 'COMPLETED')}
                                   className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                 >
                                   <CheckCircle size={16} className="text-green-600" /> Hoàn thành
                                 </button>
                               )}
                               <button
                                 onClick={() => handleRefundDelete(refund.id)}
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
         )}
       </div>
       </>
       )}

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

        {/* Refund modals - at end so accessible from both tabs */}
        {isCreatingRefund && <CreateRefundModal onClose={() => setIsCreatingRefund(false)} onRefundCreated={handleRefundCreated} orders={state.orders} />}
        {viewingRefund && <RefundDetailModal refund={viewingRefund} onClose={() => setViewingRefund(null)} onRefundUpdated={handleRefundUpdated} lang={lang} />}
    </div>
  );
});

OrderManager.displayName = 'OrderManager';

export default OrderManager;
