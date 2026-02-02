import React, { useState, useMemo, useEffect } from 'react';
import { BackendContextType, OrderStatus, Language, Employee } from '../../types';
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

type DateRange = '7D' | '30D' | '90D';
type AdminDashboardTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'inventory' | 'finance' | 'vouchers' | 'staff' | 'settings' | 'profile';

interface AdminDashboardProps {
  backend: BackendContextType;
  onExit: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ backend, onExit }) => {
  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('dashboard');
  const [lang, setLang] = useState<Language>('vi');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'vi' : 'en');
  };

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
          case 'categories':
              return <CategoryManager backend={enhancedBackend} lang={lang} />;
          case 'orders':
              return <OrderManager backend={enhancedBackend} lang={lang} />;
          case 'customers':
              return <CustomerManager backend={enhancedBackend} lang={lang} />;
          case 'inventory':
              return <InventoryManager backend={enhancedBackend} lang={lang} />;
          case 'finance':
              return <FinanceManager backend={enhancedBackend} lang={lang} />;
          case 'vouchers':
              return <VoucherManager backend={enhancedBackend} lang={lang} />;
          case 'staff':
              return <StaffManager backend={enhancedBackend} lang={lang} />;
          case 'settings':
              return <SettingsManager backend={enhancedBackend} lang={lang} />;
          case 'profile':
              return <MyProfile currentUser={currentUser} backend={enhancedBackend} lang={lang} />;
          default:
              return null;
      }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
          lang={lang} 
          toggleLanguage={toggleLanguage}
          currentUser={currentUser}
          onExit={onExit}
      />

      <main className="flex-1 overflow-auto flex flex-col relative transition-all duration-300">
          
          {/* Top Bar (Mobile / Status) */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center print:hidden">
              <h1 className="text-xl font-bold text-slate-800 capitalize tracking-tight">
                  {activeTab === 'profile' ? 'My Profile' : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}
              </h1>
              
              <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-sm text-slate-800">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                      {currentUser?.name.charAt(0)}
                  </div>
              </div>
          </div>

          <div className="p-8">
              {renderContent()}
          </div>
      </main>
    </div>
  );
};

export default AdminDashboard;