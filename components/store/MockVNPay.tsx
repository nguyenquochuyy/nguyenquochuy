import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, CreditCard, Landmark, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../types';

interface MockVNPayProps {
  amount: number;
  orderInfo: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const MockVNPay: React.FC<MockVNPayProps> = ({ amount, orderInfo, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'LOADING' | 'INPUT' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('LOADING');

  useEffect(() => {
    // Tự động tắt loading sau 1 giây báo mở VNPay
    const timer = setTimeout(() => {
      setStep('INPUT');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePay = () => {
    setStep('PROCESSING');
    // Giả lập xử lý thanh toán mất 2 giây
    setTimeout(() => {
      setStep('SUCCESS');
      // Sau khi báo thành công, đợi 1.5s rồi gọi hook trở về
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  const handleCancel = () => {
    setStep('FAILED');
    setTimeout(() => {
      onCancel();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-fade-in font-sans">
      {/* HEADER GIẢ LẬP VNPAY */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-blue-600 shadow-md flex items-center justify-center">
         <span className="text-white font-extrabold tracking-wider text-xl">VNPAY<span className="text-red-400">QR</span></span>
      </div>

      <div className="max-w-md w-full mx-auto px-4 mt-16">
        {step === 'LOADING' && (
          <div className="flex flex-col items-center gap-[15px] text-blue-600 my-20">
             <Loader2 size={48} className="animate-spin" />
             <p className="font-medium text-lg text-slate-600">Đang kết nối cổng thanh toán VNPAY...</p>
          </div>
        )}

        {step === 'INPUT' && (
          <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden my-8 animate-slide-up">
            <div className="bg-blue-50 p-6 border-b border-blue-100 text-center">
               <p className="text-sm text-slate-500 font-medium mb-1">Số tiền thanh toán</p>
               <h2 className="text-3xl font-extrabold text-blue-700">{formatCurrency(amount)}</h2>
               <p className="text-xs text-slate-400 mt-2">Mã ĐH: <span className="font-mono text-slate-600">{orderInfo}</span></p>
            </div>
            
            <div className="p-6 space-y-[15px]">
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 font-medium">
                    <ShieldCheck size={18} />
                    Môi trường thanh toán (Sandbox Demo)
                </div>

                <div className="space-y-3">
                    <p className="font-semibold text-slate-700">Chọn phương thức:</p>
                    
                    <button className="w-full flex items-center gap-[15px] p-4 border border-blue-600 bg-blue-50 rounded-xl">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Landmark size={20} className="text-blue-600" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-bold text-slate-800 text-sm">Thẻ ATM / Tài khoản nội địa</p>
                            <p className="text-xs text-slate-500">Mô phỏng ngân hàng nội địa VNPAY</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-4 border-blue-600"></div>
                    </button>
                    
                    <button disabled className="w-full flex items-center gap-[15px] p-4 border border-slate-200 bg-slate-50 rounded-xl opacity-60">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <CreditCard size={20} className="text-slate-400" />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-bold text-slate-500 text-sm">Thẻ thanh toán quốc tế</p>
                            <p className="text-xs text-slate-400">Không khả dụng ở bản Demo</p>
                        </div>
                    </button>
                </div>

                <div className="border-t border-slate-200 pt-6 flex gap-3">
                    <button onClick={handleCancel} className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                        HUỶ BỎ
                    </button>
                    <button onClick={handlePay} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-colors">
                        XÁC NHẬN
                    </button>
                </div>
            </div>
            <div className="bg-slate-50 p-3 text-center text-xs text-slate-400">
                Giao dịch an toàn được bảo vệ bởi VNPAY
            </div>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="flex flex-col items-center gap-[15px] text-blue-600 my-20">
             <div className="relative">
                <Loader2 size={64} className="animate-spin text-blue-600" />
                <Landmark size={28} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" />
             </div>
             <p className="font-bold text-xl text-slate-700 mt-4">Đang xử lý thanh toán...</p>
             <p className="text-sm text-slate-500">Vui lòng không đóng trình duyệt!</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="flex flex-col items-center gap-[15px] my-20 animate-fade-in-up">
             <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-2">
                 <CheckCircle size={48} />
             </div>
             <h2 className="font-black text-2xl text-green-600 mb-1">Thanh toán thành công!</h2>
             <p className="text-slate-500 text-sm">Đang chuyển hướng về UniShop...</p>
          </div>
        )}

        {step === 'FAILED' && (
          <div className="flex flex-col items-center gap-[15px] my-20 animate-fade-in-up">
             <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-2">
                 <XCircle size={48} />
             </div>
             <h2 className="font-black text-2xl text-rose-600 mb-1">Giao dịch đã bị huỷ!</h2>
             <p className="text-slate-500 text-sm">Đang quay lại giỏ hàng...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockVNPay;
