import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Check } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      if(email) {
          setSubscribed(true);
          setEmail('');
          setTimeout(() => setSubscribed(false), 3000);
      }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-900/50">U</div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">UniShop</h2>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Nền tảng mua sắm trực tuyến hàng đầu, mang đến trải nghiệm đẳng cấp và sản phẩm chất lượng nhất cho cuộc sống của bạn.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all hover:scale-110"><Facebook size={18}/></a>
                        <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all hover:scale-110"><Instagram size={18}/></a>
                        <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all hover:scale-110"><Twitter size={18}/></a>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Liên Hệ</h3>
                    <ul className="space-y-4 text-sm text-slate-400">
                        <li className="flex items-start gap-3 group">
                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><MapPin size={16}/></div>
                            <span className="mt-1">123 Lê Lợi, Quận 1, TP.HCM</span>
                        </li>
                        <li className="flex items-center gap-3 group">
                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Phone size={16}/></div>
                            <span>0901 234 567</span>
                        </li>
                        <li className="flex items-center gap-3 group">
                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Mail size={16}/></div>
                            <span>contact@unishop.com</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Hỗ Trợ Khách Hàng</h3>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-indigo-400 hover:pl-1 transition-all">Hướng dẫn mua hàng</a></li>
                        <li><a href="#" className="hover:text-indigo-400 hover:pl-1 transition-all">Chính sách vận chuyển</a></li>
                        <li><a href="#" className="hover:text-indigo-400 hover:pl-1 transition-all">Chính sách đổi trả</a></li>
                        <li><a href="#" className="hover:text-indigo-400 hover:pl-1 transition-all">Bảo mật thông tin</a></li>
                        <li><a href="#" className="hover:text-indigo-400 hover:pl-1 transition-all">Câu hỏi thường gặp</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Đăng Ký Nhận Tin</h3>
                    <p className="text-xs text-slate-400 mb-4">Nhận thông tin khuyến mãi và voucher độc quyền.</p>
                    <form onSubmit={handleSubscribe} className="space-y-3">
                        {subscribed ? (
                            <div className="w-full bg-emerald-600/20 text-emerald-400 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2 border border-emerald-600/30">
                                <Check size={16}/> Đã đăng ký!
                            </div>
                        ) : (
                            <>
                                <input 
                                    type="email" 
                                    placeholder="Email của bạn" 
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <button className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-900/50">Đăng Ký Ngay</button>
                            </>
                        )}
                    </form>
                </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                <p>&copy; 2024 UniShop Enterprise. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-6 bg-white px-2 rounded" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 bg-white px-2 rounded" alt="Mastercard" />
                    <div className="h-6 bg-white px-2 rounded flex items-center font-bold text-slate-800 italic">Momo</div>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;