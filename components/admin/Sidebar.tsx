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
                  relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-150 group
                  ${isActive
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }
                  ${isCollapsed ? 'justify-center' : 'gap-3'}
              `}
              title={isCollapsed ? label : ''}
          >
              <Icon size={19} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />

              {!isCollapsed && (
                  <span className="text-sm whitespace-nowrap overflow-hidden transition-all">{label}</span>
              )}

              {badge !== undefined && badge > 0 && (
                  <div className={`
                      flex items-center justify-center bg-amber-400 text-gray-900 font-bold rounded-full text-[10px]
                      ${isCollapsed ? 'absolute top-1.5 right-1.5 w-2 h-2 p-0' : 'px-1.5 py-0.5 ml-auto'}
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
          bg-gray-900 text-gray-300 flex flex-col transition-all duration-300 ease-in-out print:hidden
          fixed inset-y-0 left-0 z-40 border-r border-gray-800
          ${isCollapsed ? 'w-[68px]' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 shrink-0">
          <div className={`flex items-center gap-2.5 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                 U
             </div>
             <div>
                 <h1 className="text-sm font-semibold text-white leading-tight">UniShop</h1>
                 <p className="text-[10px] text-gray-500 font-medium">Admin</p>
             </div>
          </div>

          <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`
                  p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors
                  ${isCollapsed ? 'mx-auto' : ''}
              `}
          >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 min-h-0 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide">

        {!isCollapsed && <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Menu</p>}

        <SidebarItem id="dashboard" icon={LayoutDashboard} label={t.dashboard} />
        <SidebarItem id="products" icon={Package} label="Sản Phẩm" />
        <SidebarItem id="orders" icon={ShoppingCart} label={t.orders} />
        <SidebarItem id="customers" icon={Users} label={t.customers} />

        <div className="my-3 border-t border-gray-800 mx-2"></div>

        {!isCollapsed && <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Quản lý</p>}

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
      <div className="p-3 border-t border-gray-800 shrink-0">
          <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('profile')}
              onKeyDown={(e) => e.key === 'Enter' && setActiveTab('profile')}
              className={`
              cursor-pointer w-full flex items-center p-2 rounded-lg transition-colors duration-150
              ${isCollapsed ? 'justify-center' : ''}
              ${activeTab === 'profile' ? 'bg-white/10' : 'hover:bg-white/5'}
          `}>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {currentUser?.name.charAt(0)}
              </div>

              {!isCollapsed && (
                  <div className="ml-2.5 flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{currentUser?.role}</p>
                  </div>
              )}

              {!isCollapsed && (
                  <button onClick={(e) => { e.stopPropagation(); onExit(); }} className="p-1.5 text-gray-500 hover:text-white rounded-md transition-colors" title={t.exit}>
                      <LogOut size={15} />
                  </button>
              )}
          </div>

          {isCollapsed && (
              <button onClick={onExit} className="w-full mt-2 p-2 flex justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                  <LogOut size={18} />
              </button>
          )}
      </div>
    </aside>
  );
};

export default Sidebar;
