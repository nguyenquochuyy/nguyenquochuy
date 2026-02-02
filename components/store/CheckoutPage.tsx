
import React, { useState, useEffect } from 'react';
import { BackendContextType, CartItem, formatCurrency, Order, Customer } from '../../types';
import { 
  ChevronRight, ShoppingBag, Ticket, Loader2, Check, AlertTriangle, 
  Lock, Landmark, CreditCard, User, Mail, Phone, MapPin, Truck, ArrowLeft,
  ShieldCheck, RefreshCw, QrCode, Copy, Crown
} from 'lucide-react';

interface CheckoutPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  backend: BackendContextType;
  onOrderSuccess: (order: Order) => void;
  onNavigateHome: () => void;
  currentUser?: Customer;
}

const SHIPPING_OPTIONS = {
  STANDARD: { name: 'Giao hàng tiêu chuẩn', fee: 30000 },
  EXPRESS: { name: 'Giao hàng hỏa tốc', fee: 50000 },
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, setCart, backend, onOrderSuccess, onNavigateHome, currentUser }) => {
  const { validateVoucher, placeOrder, state } = backend;

  const [customerInfo, setCustomerInfo] = useState({
    email: currentUser?.email || '',
    name: currentUser?.name || '',
    address: currentUser?.address || '',
    phone: currentUser?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('COD');
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, discount: number} | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [usePoints, setUsePoints] = useState(false);

  const [selectedBankIdx, setSelectedBankIdx] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
      if (cart.length === 0) {
          onNavigateHome();
      }
  }, [cart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };
  
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

  const subtotal = cart.reduce((acc, item) => acc + calculateItemPrice(item) * item.quantity, 0);
  const shippingFee = SHIPPING_OPTIONS[shippingMethod].fee;

  const handleApplyVoucher = () => {
      setVoucherError('');
      setIsValidatingVoucher(true);
      setTimeout(() => {
          const result = validateVoucher(voucherCode.toUpperCase(), subtotal);
          if (result.valid) {
              setAppliedVoucher({ code: voucherCode.toUpperCase(), discount: result.discount });
              setVoucherCode('');
          } else {
              setVoucherError(result.message || 'Mã không hợp lệ');
          }
          setIsValidatingVoucher(false);
      }, 500);
  };
  
  // Calculate Loyalty Points Discount
  let pointsDiscount = 0;
  if (usePoints && currentUser && currentUser.loyaltyPoints > 0) {
      const maxDiscount = currentUser.loyaltyPoints * 1000;
      const payable = subtotal - (appliedVoucher?.discount || 0);
      pointsDiscount = Math.min(maxDiscount, payable);
  }

  const taxableTotal = subtotal - (appliedVoucher?.discount || 0) - pointsDiscount;
  const taxAmount = Math.max(0, taxableTotal) * (state.settings.tax.defaultRate / 100);
  const total = Math.max(0, taxableTotal + taxAmount + shippingFee);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      const newOrder = placeOrder(
        { name: customerInfo.name, phone: customerInfo.phone, address: customerInfo.address, email: customerInfo.email },
        cart,
        paymentMethod,
        { method: SHIPPING_OPTIONS[shippingMethod].name, fee: shippingFee },
        appliedVoucher?.code,
        usePoints // Pass new param
      );
      setCart([]);
      onOrderSuccess(newOrder);
    }, 1500);
  };

  const inputClass = "w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all shadow-sm";

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <button type="button" onClick={onNavigateHome} className="hover:text-indigo-600 font-medium flex items-center gap-1"><ArrowLeft size={14}/> Quay lại giỏ hàng</button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Thông tin giao hàng</h2>
                    <div className="space-y-5">
                        <div className="relative"><Mail size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none"/><input type="email" name="email" placeholder="Địa chỉ Email" required className={inputClass} value={customerInfo.email} onChange={handleInputChange} /></div>
                        <div className="relative"><User size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none"/><input type="text" name="name" placeholder="Họ và Tên" required className={inputClass} value={customerInfo.name} onChange={handleInputChange} /></div>
                        <div className="relative"><Phone size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none"/><input type="tel" name="phone" placeholder="Số điện thoại" required className={inputClass} value={customerInfo.phone} onChange={handleInputChange} /></div>
                        <div className="relative"><MapPin size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none"/><textarea name="address" placeholder="Địa chỉ chi tiết (số nhà, tên đường...)" required rows={3} className={`${inputClass} resize-none min-h-[100px]`} value={customerInfo.address} onChange={handleInputChange}></textarea></div>
                        <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={saveInfo} onChange={e => setSaveInfo(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"/>Lưu thông tin cho lần mua hàng sau</label>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Phương thức vận chuyển</h2>
                    <div className="space-y-3">
                        {Object.entries(SHIPPING_OPTIONS).map(([key, option]) => (
                            <label key={key} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${shippingMethod === key ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white'}`}>
                                <div className="flex items-center gap-4">
                                    <input type="radio" name="shipping" value={key} checked={shippingMethod === key} onChange={() => setShippingMethod(key as any)} className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"/>
                                    <div><p className="font-bold text-slate-900">{option.name}</p><p className="text-xs text-slate-500">{key === 'STANDARD' ? 'Nhận hàng trong 2-4 ngày' : 'Nhận hàng trong 24h'}</p></div>
                                </div>
                                <span className="font-bold text-slate-900">{formatCurrency(option.fee)}</span>
                            </label>
                        ))}
                    </div>
                </div>
            
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Phương thức thanh toán</h2>
                    <div className="space-y-3">
                        <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white'}`}><input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"/><div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-indigo-600"><CreditCard size={20}/></div><div><p className="font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</p><p className="text-xs text-slate-500">Thanh toán bằng tiền mặt cho nhân viên giao hàng.</p></div></label>
                        <label className={`flex flex-col items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'BANKING' ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white'}`}>
                            <div className="flex items-start gap-4 w-full">
                                <input type="radio" name="payment" value="BANKING" checked={paymentMethod === 'BANKING'} onChange={() => setPaymentMethod('BANKING')} className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"/><div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-indigo-600"><Landmark size={20}/></div>
                                <div className="flex-1"><p className="font-bold text-slate-900">Chuyển khoản ngân hàng</p><p className="text-xs text-slate-500">Quét mã QR hoặc chuyển khoản theo thông tin bên dưới.</p></div>
                            </div>
                            {paymentMethod === 'BANKING' && (
                                <div className="w-full mt-4 pl-10 animate-fade-in-up">
                                    {state.paymentAccounts.length > 1 && (<div className="flex gap-2 border-b border-slate-200 mb-4">{state.paymentAccounts.map((acc, idx) => (<button type="button" key={acc.id} onClick={() => setSelectedBankIdx(idx)} className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-colors ${selectedBankIdx === idx ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{acc.bank}</button>))}</div>)}
                                    {state.paymentAccounts[selectedBankIdx] && (() => {
                                        const selectedAccount = state.paymentAccounts[selectedBankIdx];
                                        const transferContent = `UHS${customerInfo.phone || Date.now().toString().slice(-6)}`;
                                        const qrData = JSON.stringify({ bank: selectedAccount.bank, account: selectedAccount.number, name: selectedAccount.holder, amount: total, info: transferContent });
                                        return (<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-100"><div className="flex flex-col items-center justify-center p-4"><p className="text-sm font-bold text-slate-700 mb-2">Quét mã để thanh toán</p><div className="w-48 h-48 md:w-56 md:h-56 p-2 bg-white rounded-lg border border-slate-200 shadow-md"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`} alt="QR Code" className="w-full h-full object-contain"/></div><p className="text-xs text-slate-500 mt-2 text-center">Sử dụng App Banking hoặc ví điện tử hỗ trợ VietQR</p></div><div className="space-y-4 text-sm"><div className="space-y-1"><p className="text-xs font-bold text-slate-400 uppercase">Ngân hàng</p><p className="font-bold text-lg text-slate-900">{selectedAccount.bank}</p></div><div className="space-y-1"><p className="text-xs font-bold text-slate-400 uppercase">Chủ tài khoản</p><p className="font-semibold text-slate-800 uppercase">{selectedAccount.holder}</p></div><div className="space-y-1"><p className="text-xs font-bold text-slate-400 uppercase">Số tài khoản</p><div className="flex items-center gap-2"><p className="font-mono font-bold text-indigo-600 text-lg tracking-wider bg-indigo-50 px-3 py-1 rounded">{selectedAccount.number}</p><button type="button" onClick={() => copyToClipboard(selectedAccount.number, 'number')} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1 rounded-lg flex items-center gap-1"><Copy size={12}/> {copiedField === 'number' ? 'Đã chép!' : 'Chép'}</button></div></div><div className="space-y-1"><p className="text-xs font-bold text-slate-400 uppercase">Nội dung chuyển khoản</p><div className="flex items-center gap-2"><p className="font-mono font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded">{transferContent}</p><button type="button" onClick={() => copyToClipboard(transferContent, 'content')} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1 rounded-lg flex items-center gap-1"><Copy size={12}/> {copiedField === 'content' ? 'Đã chép!' : 'Chép'}</button></div></div></div></div>)
                                    })()}
                                </div>
                            )}
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-8 gap-4">
                <div className="grid grid-cols-3 gap-4 text-xs text-slate-500 text-center"><span className="flex items-center gap-2"><Lock size={12}/> Bảo mật SSL</span><span className="flex items-center gap-2"><RefreshCw size={12}/> Đổi trả 30 ngày</span><span className="flex items-center gap-2"><ShieldCheck size={12}/> Hàng chính hãng</span></div>
                <button type="submit" disabled={isProcessing} className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-60">{isProcessing ? <Loader2 size={24} className="animate-spin"/> : `Đặt Hàng (${formatCurrency(total)})`}</button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Tóm tắt đơn hàng ({cart.length})</h2>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">{cart.map(item => (<div key={item.id + (item.selectedVariantId || '')} className="flex gap-4 items-center"><div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-100 shrink-0"><img src={item.images[0]} className="w-full h-full object-cover"/><span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">{item.quantity}</span></div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>{item.selectedVariantId && <p className="text-xs text-slate-500">{item.variants.find(v=>v.id === item.selectedVariantId)?.name}</p>}</div><p className="text-sm font-medium text-slate-700">{formatCurrency(calculateItemPrice(item) * item.quantity)}</p></div>))}</div>
                
                {/* Coupon Section */}
                <div className="border-t border-slate-100 mt-4 pt-4 space-y-3">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Mã giảm giá" className={`${inputClass} !pl-4 text-sm`} value={voucherCode} onChange={e => setVoucherCode(e.target.value)} disabled={!!appliedVoucher} />
                        <button type="button" onClick={handleApplyVoucher} disabled={!voucherCode || isValidatingVoucher || !!appliedVoucher} className="px-4 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-indigo-600 disabled:opacity-50 transition-colors">{isValidatingVoucher ? <Loader2 size={16} className="animate-spin" /> : 'Áp dụng'}</button>
                    </div>
                    {voucherError && <p className="text-xs text-rose-500 mt-1 font-bold flex items-center gap-1"><AlertTriangle size={12}/> {voucherError}</p>}
                    {appliedVoucher && (<div className="flex justify-between items-center bg-emerald-50 text-emerald-700 p-2 rounded-lg text-sm font-bold"><span><Check size={16} className="inline-block mr-1"/> {appliedVoucher.code}</span><button onClick={() => setAppliedVoucher(null)} className="text-xs hover:underline">Gỡ</button></div>)}
                </div>

                {/* Loyalty Points Section */}
                {currentUser && currentUser.loyaltyPoints > 0 && (
                    <div className="border-t border-slate-100 mt-4 pt-4">
                        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Crown size={20} className="text-amber-500" fill="currentColor"/>
                                <div>
                                    <p className="text-sm font-bold text-indigo-900">Dùng điểm thưởng</p>
                                    <p className="text-xs text-indigo-600">Bạn có <span className="font-bold">{currentUser.loyaltyPoints}</span> điểm</p>
                                </div>
                            </div>
                            <div className="relative">
                                <input type="checkbox" className="sr-only peer" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-300 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                            </div>
                        </label>
                        {usePoints && (
                            <p className="text-xs text-emerald-600 font-medium mt-2 text-right">
                                Sẽ trừ {Math.ceil(pointsDiscount / 1000)} điểm (-{formatCurrency(pointsDiscount)})
                            </p>
                        )}
                    </div>
                )}

                <div className="border-t border-slate-100 mt-4 pt-4 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600"><span>Tạm tính</span><span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between text-slate-600"><span>Phí vận chuyển</span><span className="font-medium text-slate-900">{formatCurrency(shippingFee)}</span></div>
                    {appliedVoucher && <div className="flex justify-between text-emerald-600 font-bold"><span>Voucher giảm giá</span><span>-{formatCurrency(appliedVoucher.discount)}</span></div>}
                    {usePoints && pointsDiscount > 0 && <div className="flex justify-between text-amber-600 font-bold"><span>Điểm thưởng</span><span>-{formatCurrency(pointsDiscount)}</span></div>}
                    <div className="flex justify-between text-slate-600"><span>Thuế (VAT {state.settings.tax.defaultRate}%)</span><span className="font-medium text-slate-900">{formatCurrency(taxAmount)}</span></div>
                </div>
                <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-center font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-2xl text-indigo-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
