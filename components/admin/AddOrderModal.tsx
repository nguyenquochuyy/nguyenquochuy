import React, { useState, useEffect } from 'react';
import { Language, Product, CartItem, formatCurrency } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { api } from '../../services/apiClient';
import { X, Plus, Package, Trash2, Search, PlusCircle } from 'lucide-react';

interface AddOrderModalProps {
  onClose: () => void;
  lang: Language;
  onOrderCreated: () => void;
  products: Product[];
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ onClose, lang, onOrderCreated, products }) => {
  const t = TRANSLATIONS[lang];
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANKING' | 'MOMO' | 'VNPAY'>('COD');
  const [shippingMethod, setShippingMethod] = useState('Standard');
  const [shippingFee, setShippingFee] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProduct = (product: Product) => {
    const existing = selectedProducts.find(sp => sp.id === product.id);
    if (existing) {
      setSelectedProducts(prev =>
        prev.map(sp =>
          sp.id === product.id ? { ...sp, quantity: sp.quantity + 1 } : sp
        )
      );
    } else {
      setSelectedProducts(prev => [
        ...prev,
        {
          ...product,
          quantity: 1,
          selectedVariantId: undefined
        }
      ]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(sp => sp.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
    } else {
      setSelectedProducts(prev =>
        prev.map(sp =>
          sp.id === productId ? { ...sp, quantity } : sp
        )
      );
    }
  };

  const subtotal = selectedProducts.reduce((sum, item) => {
    let price = item.price;
    if (item.selectedVariantId && item.variants) {
      const variant = item.variants.find(v => v.id === item.selectedVariantId);
      if (variant) price = variant.price;
    }
    return sum + (price * item.quantity);
  }, 0);

  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        customerEmail,
        paymentMethod,
        shippingMethod,
        shippingFee,
        items: selectedProducts,
        subtotal,
        total,
        discountAmount: 0
      };

      await api.createOrder(orderData);
      onOrderCreated();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white w-full max-w-6xl rounded-xl border border-gray-200 shadow-lg relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Plus className="text-indigo-600" /> {t.addNewOrder}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-[15px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-[15px]">
            {/* Cột trái: Thông tin khách hàng */}
            <div className="space-y-[15px]">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Thông tin khách hàng</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Tên khách hàng *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Địa chỉ *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Thanh toán & Vận chuyển</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phương thức thanh toán *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="COD">Thanh toán khi nhận hàng</option>
                      <option value="BANKING">Chuyển khoản ngân hàng</option>
                      <option value="MOMO">Ví MoMo</option>
                      <option value="VNPAY">Ví VNPay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phương thức vận chuyển *</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                    >
                      <option value="Standard">Tiêu chuẩn</option>
                      <option value="Express">Hỏa tốc</option>
                      <option value="Same Day">Giao trong ngày</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phí vận chuyển</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Chọn sản phẩm */}
            <div className="space-y-[15px]">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Sản phẩm</h3>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">Không tìm thấy sản phẩm</p>
                  ) : (
                    filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 border-b border-slate-100 hover:bg-slate-50"
                      >
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} className="w-12 h-12 rounded object-cover border border-slate-200" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Package size={16} className="text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{product.name}</p>
                          <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                          <p className="text-xs font-bold text-indigo-600">{formatCurrency(product.price)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addProduct(product)}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                        >
                          <PlusCircle size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sản phẩm đã chọn */}
              {selectedProducts.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Sản phẩm đã chọn</h3>
                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {selectedProducts.map(item => {
                      let price = item.price;
                      if (item.selectedVariantId && item.variants) {
                        const variant = item.variants.find(v => v.id === item.selectedVariantId);
                        if (variant) price = variant.price;
                      }
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 border-b border-slate-100">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 text-sm truncate">{item.name}</p>
                            <p className="text-xs font-bold text-indigo-600">{formatCurrency(price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(item.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tổng tiền */}
              {selectedProducts.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tạm tính:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Phí vận chuyển:</span>
                    <span className="font-medium">{formatCurrency(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Tổng cộng:</span>
                    <span className="text-indigo-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hành động */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedProducts.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang tạo...' : t.createOrder}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;
