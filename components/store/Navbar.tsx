
import React, { useState } from 'react';
import { ShoppingBag, Search, User, LogOut, ShieldCheck, Heart, LogIn } from 'lucide-react';
import { CartItem, Employee, Customer } from '../../types';
import { TRANSLATIONS } from '../../services/translations';

interface NavbarProps {
  onSearchChange: (val: string) => void;
  searchTerm: string;
  cartCount: number;
  onCartClick: () => void;
  onHomeClick: () => void;
  onExit: () => void;
  isEmployee?: boolean;
  currentUser: Employee | Customer | null;
  onProfileClick: () => void;
  onWishlistClick?: () => void;
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearchChange, searchTerm, cartCount, onCartClick, onHomeClick, onExit, 
  isEmployee, currentUser, onProfileClick, onWishlistClick, onLoginClick
}) => {
  const t = TRANSLATIONS['vi'];
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const wishlistCount = (!isEmployee && currentUser && 'wishlist' in currentUser) 
    ? (currentUser as Customer).wishlist.length 
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="bg-indigo-900 text-white text-[10px] sm:text-xs py-2 text-center font-medium tracking-wide relative overflow-hidden">
          <span className="relative z-10">🎉 MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TỪ 500.000Đ - ĐỔI TRẢ TRONG 30 NGÀY</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 skew-x-12 animate-slide-in-right opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={onHomeClick}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform duration-300">U</div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight hidden sm:block group-hover:text-indigo-600 transition-colors">UniShop</h1>
          </div>

          <div className="flex-1 max-w-2xl relative mx-auto group">
            <input
              type="text"
              placeholder={t.search}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-full py-3 pl-12 pr-4 focus:ring-4 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all text-sm text-slate-800 font-medium group-hover:bg-white group-hover:shadow-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" size={20} />
          </div>

          <div className="flex items-center gap-2">
            
            {onWishlistClick && (
                <button 
                    onClick={onWishlistClick}
                    className="relative p-3 text-gray-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all group"
                >
                    <Heart size={24} className="group-hover:scale-110 transition-transform"/>
                    {wishlistCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm border border-white">
                            {wishlistCount}
                        </span>
                    )}
                </button>
            )}

            <button 
              onClick={onCartClick}
              className="relative p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all group"
            >
              <ShoppingBag size={24} className="group-hover:scale-110 transition-transform"/>
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm animate-bounce-short border border-white">
                  {cartCount}
                </span>
              )}
            </button>
            
            {currentUser ? (
              <div className="relative">
                  <button 
                      onClick={() => setIsProfileMenuOpen(p => !p)}
                      onBlur={() => setTimeout(() => setIsProfileMenuOpen(false), 200)}
                      className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border-2 border-white hover:border-indigo-200 transition-all shadow-sm"
                  >
                      {currentUser.name.charAt(0).toUpperCase()}
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-50 animate-scale-up origin-top-right">
                        <div className="px-3 py-2 border-b border-slate-100 mb-2">
                            <p className="font-bold text-sm text-slate-800 truncate">{currentUser.name}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        </div>
                        <button onClick={() => { onProfileClick(); setIsProfileMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600">
                            <User size={16}/> Tài khoản của tôi
                        </button>
                        {isEmployee && (
                            <button onClick={() => { onExit(); setIsProfileMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 hover:text-indigo-600">
                              <ShieldCheck size={16}/> Về Portal
                            </button>
                        )}
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button onClick={() => { onExit(); setIsProfileMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-rose-500 rounded-lg hover:bg-rose-50 font-medium">
                            <LogOut size={16}/> Đăng xuất
                        </button>
                    </div>
                  )}
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-sm active:scale-95 ml-2"
              >
                <LogIn size={16} /> <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
