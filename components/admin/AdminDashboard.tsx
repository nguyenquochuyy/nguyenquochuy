import React, { useState, useMemo, useEffect } from 'react';
import { BackendContextType, OrderStatus, Language, Employee } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import Sidebar from './Sidebar';
import DashboardStats from './DashboardStats';
import ProductManager from './ProductManager';
import CategoryManager from './CategoryManager';
import CustomerManager from './CustomerManager';
import InventoryManager from './InventoryManager';
import FinanceManager from './FinanceManager';
import VoucherManager from './VoucherManager';
import StaffManager from './StaffManager';
import SettingsManager from './SettingsManager';
import OrderManager from './OrderManager';
import MyProfile from './MyProfile';
import ReviewsManagement from './ReviewsManagement';

type DateRange = '7D' | '30D' | '90D';
type AdminDashboardTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'finance' | 'staff' | 'settings' | 'reviews' | 'profile';

interface AdminDashboardProps {
  backend: BackendContextType;
  onExit: () => void;
  lang: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ backend, onExit, lang }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dashboardDateRange, setDashboardDateRange] = useState<DateRange>('7D');
  
  const { state } = backend;
  
  // Current User State (Simulating Login) - now gets user from context
  const currentUser = backend.getCurrentUser() as Employee;
  const currentUserId = currentUser?.id;

  // Create Enhanced Backend wrapper to inject currentUserId into actions
  const enhancedBackend = useMemo(() => ({
      ...backend,
      updateOrderStatus: (id: string, status: OrderStatus) => backend.updateOrderStatus(id, status, currentUserId),
      adjustStock: (productId: string, variantId: string | undefined, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT', reason: string) => backend.adjustStock(productId, variantId, quantity, type, reason, currentUserId),
      addTransaction: (transaction: any) => backend.addTransaction(transaction, currentUserId),
      addVoucher: (voucher: any) => backend.addVoucher(voucher, currentUserId),
      updateVoucher: (id: string, updates: any) => backend.updateVoucher(id, updates, currentUserId),
  }), [backend, currentUserId]);

  // Render Content based on Active Tab
  const renderContent = () => {
      switch (activeTab) {
          case 'dashboard':
              return (
                  <DashboardStats 
                      backend={enhancedBackend} 
                      lang={lang} 
                      dateRangeFilter={dashboardDateRange} 
                      setDateRangeFilter={setDashboardDateRange} 
                      setActiveTab={setActiveTab} 
                  />
              );
          case 'products':
              return <ProductManager backend={enhancedBackend} lang={lang} />;
          case 'orders':
              return <OrderManager backend={enhancedBackend} lang={lang} />;
          case 'customers':
              return <CustomerManager backend={enhancedBackend} lang={lang} />;
          case 'finance':
              return <FinanceManager backend={enhancedBackend} lang={lang} />;
          case 'staff':
              return <StaffManager backend={enhancedBackend} lang={lang} />;
          case 'settings':
              return <SettingsManager backend={enhancedBackend} lang={lang} />;
          case 'reviews':
              return <ReviewsManagement backend={enhancedBackend} lang={lang} />;
          case 'profile':
              return <MyProfile currentUser={currentUser} backend={enhancedBackend} lang={lang} />;
          default:
              return null;
      }
  };

  return (
    <div className="h-full bg-slate-50 font-sans">

      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setActiveTab(tab); setIsMobileSidebarOpen(false); }}
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
          lang={lang} 
          currentUser={currentUser}
          onExit={onExit}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Offset wrapper — pushes content away from fixed sidebar */}
      <div className={`h-full flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'
      }`}>

      <main className="flex-1 min-h-0 overflow-auto flex flex-col relative min-w-0">
          
          {/* Top Bar */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-3">
                  {/* Mobile hamburger */}
                  <button
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                  </button>
                  <h1 className="text-lg md:text-xl font-bold text-slate-800 capitalize tracking-tight">
                      {activeTab === 'dashboard' ? t.dashboard
                       : activeTab === 'products' ? 'Sản Phẩm'
                       : activeTab === 'orders' ? t.orders
                       : activeTab === 'customers' ? t.customers
                       : activeTab === 'finance' ? 'Tài Chính'
                       : activeTab === 'staff' ? t.staff
                       : activeTab === 'settings' ? t.settings
                       : activeTab === 'profile' ? t.myProfile
                       : activeTab}
                  </h1>
              </div>
              
              <div className="flex items-center gap-3 md:gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-sm text-slate-800">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.role}</p>
                  </div>
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                      {currentUser?.name.charAt(0)}
                  </div>
              </div>
          </div>

          <div className="p-4 md:p-6 xl:p-8">
              {renderContent()}
          </div>
      </main>
      </div>{/* /offset wrapper */}
    </div>
  );
};

export default AdminDashboard;