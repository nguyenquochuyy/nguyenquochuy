import React from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, FolderTree, ClipboardList,
  DollarSign, Ticket, Shield, Settings, LogOut, ChevronLeft, ChevronRight, Users, MessageSquare
} from 'lucide-react';
import { Language, UserRole, Employee } from '../../types';
import { TRANSLATIONS } from '../../services/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  lang: Language;
  currentUser?: Employee;
  onExit: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, isCollapsed, setIsCollapsed,
  lang, currentUser, onExit, isMobileOpen = false, onCloseMobile
}) => {
  const t = TRANSLATIONS[lang];
  const currentRole = currentUser?.role || 'STAFF';

  const SidebarItem = ({ id, icon: Icon, label, badge }: { id: string, icon: any, label: string, badge?: number }) => {
      const isActive = activeTab === id;
      return (
          <button
              onClick={() => setActiveTab(id)}
              className={`
                  relative flex items-center w-full p-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : 'gap-3'}
              `}
              title={isCollapsed ? label : ''}
          >
              <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              
              {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap overflow-hidden transition-all">{label}</span>
              )}

              {/* Badge */}
              {badge !== undefined && badge > 0 && (
                  <div className={`
                      flex items-center justify-center bg-amber-500 text-slate-900 font-bold rounded-full text-[10px]
                      ${isCollapsed ? 'absolute top-2 right-2 w-2 h-2 p-0' : 'px-2 py-0.5 ml-auto'}
                  `}>
                      {!isCollapsed && badge}
                  </div>
              )}
          </button>
      );
  };

  return (
    <aside 
      className={`
          bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out shadow-2xl print:hidden
          fixed inset-y-0 left-0 z-40
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Header Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50 shrink-0">
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
             <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                 U
             </div>
             <div>
                 <h1 className="text-base font-bold text-white tracking-tight leading-tight">UniShop</h1>
                 <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Enterprise</p>
             </div>
          </div>
          
          <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
                  p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-700
                  ${isCollapsed ? 'mx-auto' : ''}
              `}
          >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
      </div>
      
      {/* Navigation Content */}
      <nav className="flex-1 min-h-0 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        
        <div className="mb-2 px-3">
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Main Menu</p>}
        </div>

        <SidebarItem id="dashboard" icon={LayoutDashboard} label={t.dashboard} />
        <SidebarItem id="products" icon={Package} label="Sản Phẩm" />
        <SidebarItem id="orders" icon={ShoppingCart} label={t.orders} />
        <SidebarItem id="customers" icon={Users} label={t.customers} />

        <div className="my-4 border-t border-slate-800/50 mx-2"></div>
        
        <div className="mb-2 px-3">
            {!isCollapsed && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Administration</p>}
        </div>

        {(currentRole === 'OWNER' || currentRole === 'ACCOUNTANT') && (
            <SidebarItem id="finance" icon={DollarSign} label="Tài Chính" />
        )}

        {currentRole === 'OWNER' && (
            <SidebarItem id="staff" icon={Shield} label={t.staff} />
        )}
        
        <SidebarItem id="reviews" icon={MessageSquare} label="Reviews" />
        <SidebarItem id="settings" icon={Settings} label={t.settings} />

      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 shrink-0">
          {!isCollapsed && (
              <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs font-medium text-slate-500">{t.lang}</span>
                  <span className="text-xs font-bold text-slate-300">Tiếng Việt</span>
              </div>
          )}

          <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('profile')}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('profile')}
              className={`
              cursor-pointer w-full flex items-center p-2 rounded-xl transition-all duration-200
              ${isCollapsed ? 'justify-center' : 'bg-slate-800 border border-slate-700/50'}
              ${activeTab === 'profile' ? (isCollapsed ? 'bg-indigo-600/50' : 'bg-slate-700 ring-2 ring-indigo-500') : 'hover:bg-slate-700'}
          `}>
              <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-900">
                      {currentUser?.name.charAt(0)}
                  </div>
              </div>
              
              {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0 text-left">
                      <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                      <p className="text-[10px] text-emerald-400 font-medium truncate uppercase tracking-wide">{currentUser?.role}</p>
                  </div>
              )}
              
              {!isCollapsed && (
                  <button onClick={(e) => { e.stopPropagation(); onExit(); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title={t.exit}>
                      <LogOut size={16} />
                  </button>
              )}
          </div>
          
          {isCollapsed && (
              <button onClick={onExit} className="w-full mt-4 p-2 flex justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <LogOut size={20} />
              </button>
          )}
      </div>
    </aside>
  );
};

export default Sidebar;