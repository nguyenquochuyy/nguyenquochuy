import React, { useState, useEffect } from 'react';
import { CartItem, formatCurrency, BackendContextType } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { ShoppingBag, X, Ticket, Loader2, Check, AlertTriangle, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  backend: BackendContextType;
  onNavigateToCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, setCart, backend, onNavigateToCheckout }) => {
  const t = TRANSLATIONS['vi'];
  const { validateVoucher } = backend;

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, discount: number} | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const calculateItemPrice = (item: CartItem) => {
     let price = item.price;
     if (item.selectedVariantId) {
         const variant = item.variants.find(v => v.id === item.selectedVariantId);
         if (variant) price = variant.price;
     }
     if (!item.discount) return price;
     if (item.discountType === 'FIXED') return Math.max(0, price - item.discount);
     return Math.max(0, price * (1 - item.discount / 100));
  };

  const cartSubtotal = cart.reduce((acc, item) => {
    return acc + (calculateItemPrice(item) * item.quantity);
  }, 0);

  useEffect(() => {
      if (appliedVoucher) {
          const result = validateVoucher(appliedVoucher.code, cartSubtotal);
          if (result.valid) {
              setAppliedVoucher({ code: appliedVoucher.code, discount: result.discount });
          } else {
              setAppliedVoucher(null);
          }
      }
  }, [cartSubtotal, appliedVoucher]);

  const handleApplyVoucher = () => {
      setVoucherError('');
      setIsValidatingVoucher(true);
      setTimeout(() => {
          const result = validateVoucher(voucherCode.toUpperCase(), cartSubtotal);
          if (result.valid) {
              setAppliedVoucher({ code: voucherCode.toUpperCase(), discount: result.discount });
              setVoucherCode('');
          } else {
              setVoucherError(result.message || t.invalidVoucher);
          }
          setIsValidatingVoucher(false);
      }, 500);
  };

  const cartTotal = Math.max(0, cartSubtotal - (appliedVoucher?.discount || 0));

  const handleNavigateToCheckout = () => {
    if (cart.length === 0) return;
    onClose();
    onNavigateToCheckout();
  };

  const removeFromCart = (cartItemId: string, variantId?: string) => {
    setCart(prev => prev.filter(item => {
        if (variantId) {
            return !(item.id === cartItemId && item.selectedVariantId === variantId);
        }
        return item.id !== cartItemId;
    }));
  };

  const setQuantity = (cartItemId: string, newQuantity: number, variantId?: string) => {
      setCart(prev => prev.map(item => {
          const isMatch = variantId 
            ? item.id === cartItemId && item.selectedVariantId === variantId
            : item.id === cartItemId;
          
          if (isMatch) {
              return { ...item, quantity: Math.max(1, newQuantity) };
          }
          return item;
      }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag size={22} className="text-indigo-600" /> Giỏ Hàng <span className="text-sm font-normal text-slate-500">({cart.reduce((acc, i) => acc+i.quantity, 0)} sản phẩm)</span>
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-[15px] bg-slate-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-[15px]">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <ShoppingBag size={40} className="text-slate-300" />
                </div>
                <p className="font-medium text-lg text-slate-600">Giỏ hàng của bạn đang trống</p>
                <button onClick={onClose} className="text-indigo-600 font-bold hover:underline bg-white px-6 py-2 rounded-full border border-indigo-100 shadow-sm hover:shadow-md transition-all">Tiếp tục mua sắm</button>
              </div>
            ) : (
              cart.map(item => {
                const price = calculateItemPrice(item);
                return (
                <div key={item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id} className="flex gap-[15px] p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                        {item.selectedVariantId && (
                            <p className="text-[10px] text-slate-500 font-medium bg-slate-100 w-fit px-1.5 py-0.5 rounded mt-1">
                                {item.variants.find(v => v.id === item.selectedVariantId)?.name}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-indigo-600">{formatCurrency(price)}</span>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 h-7 overflow-hidden">
                                <button onClick={() => setQuantity(item.id, Math.max(1, item.quantity - 1), item.selectedVariantId)} className="px-2 text-slate-500 hover:bg-white h-full transition-colors font-bold">-</button>
                                <span className="w-8 text-center text-xs font-bold text-slate-800 bg-white h-full flex items-center justify-center border-x border-slate-200">{item.quantity}</span>
                                <button onClick={() => setQuantity(item.id, item.quantity + 1, item.selectedVariantId)} className="px-2 text-slate-500 hover:bg-white h-full transition-colors font-bold">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id, item.selectedVariantId)} className="text-slate-400 hover:text-rose-500 transition-colors p-1"><X size={16} /></button>
                        </div>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-200 p-6 bg-white space-y-[15px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
              
              {/* Voucher Input */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  {!appliedVoucher ? (
                      <div className="flex gap-2">
                          <div className="relative flex-1">
                              <Ticket size={16} className="absolute left-3 top-3 text-slate-400" />
                              <input 
                                  type="text" 
                                  placeholder={t.voucherCode} 
                                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none uppercase placeholder:font-normal placeholder:text-slate-400 transition-all shadow-sm"
                                  value={voucherCode}
                                  onChange={(e) => setVoucherCode(e.target.value)}
                              />
                          </div>
                          <button 
                              onClick={handleApplyVoucher}
                              disabled={!voucherCode || isValidatingVoucher}
                              className="px-4 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-sm"
                          >
                              {isValidatingVoucher ? <Loader2 size={16} className="animate-spin" /> : t.applyVoucher}
                          </button>
                      </div>
                  ) : (
                      <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center"><Check size={12} /></div>
                              <span>{t.voucherApplied}: {appliedVoucher.code}</span>
                          </div>
                          <button 
                              onClick={() => setAppliedVoucher(null)}
                              className="text-xs text-rose-500 font-bold hover:underline"
                              >
                                  {t.removeVoucher}
                              </button>
                          </div>
                      )}
                      {voucherError && <p className="text-xs text-rose-500 mt-2 font-bold flex items-center gap-1 ml-1"><AlertTriangle size={12}/> {voucherError}</p>}
                  </div>

                  <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center text-sm text-slate-600">
                        <span>{t.subtotal}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(cartSubtotal)}</span>
                      </div>
                      {appliedVoucher && (
                          <div className="flex justify-between items-center text-sm text-emerald-600">
                            <span className="font-bold">{t.discountAmount} ({appliedVoucher.code})</span>
                            <span className="font-bold">-{formatCurrency(appliedVoucher.discount)}</span>
                          </div>
                      )}
                      <div className="h-px bg-slate-100 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-900 font-bold text-lg">{t.total}</span>
                        <span className="text-2xl font-bold text-indigo-600">{formatCurrency(cartTotal)}</span>
                      </div>
                  </div>
                  
                  <button 
                    onClick={handleNavigateToCheckout}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
                  >
                    Thanh Toán <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
  );
};

export default CartDrawer;
