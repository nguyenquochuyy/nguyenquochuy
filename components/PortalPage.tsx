
import React from 'react';
import { Employee, Customer } from '../types';
import { ShoppingBag, LayoutDashboard, LogOut, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface PortalPageProps {
  user: Employee | Customer;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

const PortalPage: React.FC<PortalPageProps> = ({ user, onNavigate, onLogout }) => {
  const isEmployee = 'role' in user;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-rose-200/20 rounded-full blur-3xl animate-blob" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[30%] h-[30%] bg-emerald-200/20 rounded-full blur-3xl animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-5xl w-full z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-indigo-500/30 mx-auto mb-6 transform hover:scale-105 transition-transform duration-500">
            U
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
            Xin chào, <span className="text-indigo-600">{user.name}</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Bạn muốn truy cập vào khu vực nào hôm nay?
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 px-4">
          
          {/* Store Card */}
          <div 
            onClick={() => onNavigate('/store')}
            className="group bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden animate-fade-in-up hover:-translate-y-2 duration-300"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500 transform rotate-12">
              <ShoppingBag size={200} />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Cửa Hàng</h3>
              <p className="text-slate-500 mb-8 leading-relaxed flex-1">
                Truy cập giao diện mua sắm, xem sản phẩm, tạo đơn hàng mới và quản lý giỏ hàng của bạn.
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center gap-2 font-bold text-indigo-600 group-hover:gap-4 transition-all bg-indigo-50 px-6 py-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white">
                  Vào Cửa Hàng <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </div>

          {/* Admin Card (Only for Employees) */}
          {isEmployee ? (
            <div 
              onClick={() => onNavigate('/admin')}
              className="group bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl hover:shadow-slate-800/50 transition-all cursor-pointer relative overflow-hidden animate-fade-in-up hover:-translate-y-2 duration-300"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 transform -rotate-12 text-white">
                <LayoutDashboard size={200} />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/10 backdrop-blur-sm shadow-inner">
                  <LayoutDashboard size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Trang Quản Trị</h3>
                <p className="text-slate-400 mb-8 leading-relaxed flex-1">
                  Quản lý sản phẩm, tồn kho, đơn hàng, tài chính và cấu hình hệ thống toàn diện.
                </p>
                <div className="mt-auto">
                  <span className="inline-flex items-center gap-2 font-bold text-white group-hover:gap-4 transition-all bg-white/10 px-6 py-3 rounded-xl group-hover:bg-white group-hover:text-slate-900 backdrop-blur-md">
                    Vào Admin <ArrowRight size={18} />
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-[2rem] p-8 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center opacity-70 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-500 mb-2">Khu Vực Quản Trị</h3>
                <p className="text-slate-400 max-w-xs">Chức năng này chỉ dành cho nhân viên cửa hàng.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold px-8 py-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all"
          >
            <LogOut size={20} /> Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
