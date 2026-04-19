import React, { useState, useEffect } from 'react';
import { X, Printer, Package, FileText, Truck } from 'lucide-react';
import { api } from '../../services/apiClient';
import { formatCurrency } from '../../types';

interface PrintLabelsModalProps {
  orderId: string;
  onClose: () => void;
}

interface LabelData {
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  shippingMethod?: string;
  shippingFee?: number;
  trackingNumber?: string;
  items?: any[];
  subtotal?: number;
  total?: number;
  discountAmount?: number;
  voucherCode?: string;
  voucherDiscount?: number;
  pointsUsed?: number;
  pointsDiscount?: number;
  taxRate?: number;
  taxAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentTransactionId?: string;
  status?: string;
  createdAt?: string;
  totalItems?: number;
  totalQuantity?: number;
}

const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({ orderId, onClose }) => {
  const [labelType, setLabelType] = useState<'shipping' | 'packing' | 'invoice'>('shipping');
  const [labelData, setLabelData] = useState<LabelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLabelData();
  }, [labelType, orderId]);

  const fetchLabelData = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (labelType === 'shipping') {
        data = await api.getShippingLabel(orderId);
      } else if (labelType === 'packing') {
        data = await api.getPackingLabel(orderId);
      } else {
        data = await api.getInvoice(orderId);
      }
      setLabelData(data);
    } catch (error: any) {
      console.error('Error fetching label data:', error);
      setError(error.message || 'Không thể tải dữ liệu. Đơn hàng có thể không tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('label-print-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${labelType === 'shipping' ? 'Nhãn vận chuyển' : labelType === 'packing' ? 'Danh sách đóng gói' : 'Hóa đơn'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .label-container { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total-row { font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderShippingLabel = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-300 p-6 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">UNISHOP</h3>
            <p className="text-sm text-slate-600">123 Commerce Street</p>
            <p className="text-sm text-slate-600">Ho Chi Minh City, Vietnam</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{labelData?.orderId}</p>
            <p className="text-sm text-slate-600">{labelData?.createdAt}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg mb-4">
          <h4 className="font-bold text-slate-900 mb-2">Thông tin giao hàng</h4>
          <p className="font-semibold text-slate-800">{labelData?.customerName}</p>
          <p className="text-slate-600">{labelData?.customerPhone}</p>
          <p className="text-slate-600 whitespace-pre-line">{labelData?.customerAddress}</p>
        </div>

        {labelData?.trackingNumber && (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800"><strong>Mã vận đơn:</strong> {labelData.trackingNumber}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPackingList = () => (
    <div className="space-y-4">
      <div className="border-2 border-slate-300 p-6 rounded-lg">
        <div className="flex justify-between items-start mb-4 border-b pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Danh sách đóng gói</h3>
            <p className="text-sm text-slate-600">Mã đơn: {labelData?.orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">{labelData?.createdAt}</p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-slate-50 rounded">
          <p><strong>Khách hàng:</strong> {labelData?.customerName}</p>
          <p><strong>SĐT:</strong> {labelData?.customerPhone}</p>
          <p><strong>Địa chỉ:</strong> {labelData?.customerAddress}</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2 text-left">STT</th>
              <th className="px-3 py-2 text-left">Sản phẩm</th>
              <th className="px-3 py-2 text-center">SL</th>
              <th className="px-3 py-2 text-right">Đơn giá</th>
              <th className="px-3 py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {labelData?.items?.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2 text-center">{item.quantity}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-slate-50">
              <td className="px-3 py-2" colSpan={2}>Tổng</td>
              <td className="px-3 py-2 text-center">{labelData?.totalQuantity}</td>
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2 text-right">{formatCurrency(labelData?.total || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  const renderInvoice = () => (
    <div className="space-y-4">
      <div className="border-2 border-slate-300 p-6 rounded-lg">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">HÓA ĐƠN</h3>
            <p className="text-sm text-slate-600">Mã đơn: {labelData?.orderId}</p>
            <p className="text-sm text-slate-600">Ngày: {labelData?.createdAt}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-indigo-600">UNISHOP</h3>
            <p className="text-sm text-slate-600">123 Commerce Street</p>
            <p className="text-sm text-slate-600">Ho Chi Minh City, Vietnam</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded">
            <h4 className="font-bold text-slate-900 mb-2">Thông tin khách hàng</h4>
            <p className="font-semibold">{labelData?.customerName}</p>
            <p className="text-sm text-slate-600">{labelData?.customerPhone}</p>
            <p className="text-sm text-slate-600">{labelData?.customerEmail}</p>
            <p className="text-sm text-slate-600 whitespace-pre-line">{labelData?.customerAddress}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded">
            <h4 className="font-bold text-slate-900 mb-2">Thông tin thanh toán</h4>
            <p><strong>Phương thức:</strong> {labelData?.paymentMethod}</p>
            <p><strong>Trạng thái:</strong> {labelData?.paymentStatus}</p>
            {labelData?.paymentTransactionId && (
              <p><strong>Mã giao dịch:</strong> {labelData.paymentTransactionId}</p>
            )}
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2 text-left">Sản phẩm</th>
              <th className="px-3 py-2 text-center">SL</th>
              <th className="px-3 py-2 text-right">Đơn giá</th>
              <th className="px-3 py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {labelData?.items?.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2 text-center">{item.quantity}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 text-right">
          <p>Tạm tính: {formatCurrency(labelData?.subtotal || 0)}</p>
          {labelData?.discountAmount && labelData.discountAmount > 0 && (
            <p className="text-rose-600">Giảm giá: -{formatCurrency(labelData.discountAmount)}</p>
          )}
          {labelData?.voucherCode && (
            <p className="text-indigo-600">Voucher ({labelData.voucherCode}): -{formatCurrency(labelData.voucherDiscount || 0)}</p>
          )}
          {labelData?.pointsUsed && labelData.pointsUsed > 0 && (
            <p className="text-amber-600">Điểm ({labelData.pointsUsed}): -{formatCurrency(labelData.pointsDiscount || 0)}</p>
          )}
          <p>Phí vận chuyển: {formatCurrency(labelData?.shippingFee || 0)}</p>
          {labelData?.taxAmount && labelData.taxAmount > 0 && (
            <p>Thuế ({labelData.taxRate}%): {formatCurrency(labelData.taxAmount)}</p>
          )}
          <p className="text-xl font-bold text-slate-900 border-t pt-2 mt-2">
            Tổng cộng: {formatCurrency(labelData?.total || 0)}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Printer className="text-indigo-600" /> In ấn đơn hàng
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Label Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLabelType('shipping')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                labelType === 'shipping'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Truck size={18} /> Nhãn vận chuyển
            </button>
            <button
              onClick={() => setLabelType('packing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                labelType === 'packing'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Package size={18} /> Danh sách đóng gói
            </button>
            <button
              onClick={() => setLabelType('invoice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                labelType === 'invoice'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText size={18} /> Hóa đơn
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-rose-600 bg-rose-50 rounded-lg border border-rose-200">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-2 text-rose-500">Vui lòng kiểm tra lại mã đơn hàng.</p>
            </div>
          ) : (
            <div id="label-print-content">
              {labelType === 'shipping' && renderShippingLabel()}
              {labelType === 'packing' && renderPackingList()}
              {labelType === 'invoice' && renderInvoice()}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            disabled={loading || !labelData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Printer size={18} /> In
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintLabelsModal;
