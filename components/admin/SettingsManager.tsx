import React, { useState, useEffect } from 'react';
import { BackendContextType, Language, Employee, StoreSettings } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import ConfirmModal from './ConfirmModal';
import { 
  Store, CreditCard, Truck, Package, ShoppingCart, DollarSign, 
  Users, Bell, Shield, Save, CheckCircle, Smartphone, Mail, Lock,
  Landmark, User, Hash, Plus, Trash2, X, Key, ShieldAlert, Edit
} from 'lucide-react';

interface SettingsManagerProps {
  backend: BackendContextType;
  lang: Language;
}

type SettingTab = 'info' | 'payment' | 'shipping' | 'inventory' | 'orders' | 'finance' | 'staff' | 'notifications' | 'security';

const SettingsManager: React.FC<SettingsManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, updateSettings, addPaymentAccount, deletePaymentAccount, setLevel2Password, disableLevel2Password } = backend;
  const { settings, paymentAccounts } = state;
  const currentUser = backend.getCurrentUser() as Employee;

  const [activeTab, setActiveTab] = useState<SettingTab>('info');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Local state for UI, initialized from backend settings
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  
  // Sync local state if backend state changes (e.g. initial load)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({ bank: '', number: '', holder: '' });
  const [deletingAccountId, setDeletingAccountId] = useState<number | null>(null);
  
  const [l2PasswordModalOpen, setL2PasswordModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newL2Password, setNewL2Password] = useState('');
  const [confirmDisableL2, setConfirmDisableL2] = useState<Employee | null>(null);

  const handleSave = () => {
      setSaveStatus('saving');
      updateSettings(localSettings);
      
      setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
      }, 800);
  };

  const handleAddAccount = () => {
      if (newAccount.bank && newAccount.number) {
          addPaymentAccount(newAccount);
          setNewAccount({ bank: '', number: '', holder: '' });
          setIsAddingAccount(false);
      }
  };

  const handleOpenL2Modal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewL2Password('');
    setL2PasswordModalOpen(true);
  };

  const handleSetL2Password = () => {
      if (selectedEmployee && newL2Password) {
          setLevel2Password(selectedEmployee.id, newL2Password);
          setL2PasswordModalOpen(false);
      }
  };

  const handleToggleL2 = (emp: Employee) => {
      if (emp.level2Password) {
          // If already enabled, ask to disable
          setConfirmDisableL2(emp);
      } else {
          // If disabled, open modal to enable/set
          handleOpenL2Modal(emp);
      }
  };

  const executeDisableL2 = () => {
      if (confirmDisableL2) {
          disableLevel2Password(confirmDisableL2.id);
          setConfirmDisableL2(null);
      }
  };

  const updateSection = (section: keyof StoreSettings, data: any) => {
      setLocalSettings(prev => ({
          ...prev,
          [section]: { ...prev[section], ...data }
      }));
  };

  const menuItems = [
      { id: 'info', label: t.shopInfo, icon: Store },
      { id: 'payment', label: t.payment, icon: CreditCard },
      { id: 'shipping', label: t.shipping, icon: Truck },
      { id: 'inventory', label: t.inventory, icon: Package },
      { id: 'orders', label: t.orders, icon: ShoppingCart },
      { id: 'finance', label: t.finance, icon: DollarSign },
      { id: 'staff', label: t.staff, icon: Users },
      { id: 'notifications', label: t.notifications, icon: Bell },
      { id: 'security', label: t.security, icon: Shield },
  ];

  const inputClass = "w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm font-medium";
  const labelClass = "block text-sm font-bold text-slate-700 mb-1.5";
  const toggleContainerClass = "flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:border-indigo-200 transition-colors shadow-sm";

  const ToggleSwitch = ({ checked, onChange, label, subLabel, icon: Icon }: any) => (
      <div className={toggleContainerClass}>
          <div className="flex items-center gap-4">
              {Icon && <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600"><Icon size={24} /></div>}
              <div>
                  <p className="font-bold text-slate-800 text-base">{label}</p>
                  {subLabel && <p className="text-xs text-slate-500 font-medium">{subLabel}</p>}
              </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
      </div>
  );

  const renderContent = () => {
      switch (activeTab) {
          case 'info':
              return (
                  <div className="space-y-6 max-w-2xl">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{t.shopInfo}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className={labelClass}>{t.shopName}</label>
                              <input type="text" className={inputClass} value={localSettings.shopInfo.name} onChange={e => updateSection('shopInfo', { name: e.target.value })} />
                          </div>
                          <div>
                              <label className={labelClass}>{t.hotline}</label>
                              <input type="text" className={inputClass} value={localSettings.shopInfo.phone} onChange={e => updateSection('shopInfo', { phone: e.target.value })} />
                          </div>
                          <div className="md:col-span-2">
                              <label className={labelClass}>{t.address}</label>
                              <input type="text" className={inputClass} value={localSettings.shopInfo.address} onChange={e => updateSection('shopInfo', { address: e.target.value })} />
                          </div>
                          <div>
                              <label className={labelClass}>{t.contactEmail}</label>
                              <input type="email" className={inputClass} value={localSettings.shopInfo.email} onChange={e => updateSection('shopInfo', { email: e.target.value })} />
                          </div>
                      </div>
                  </div>
              );
          case 'payment':
              return (
                  <div className="space-y-8 max-w-2xl">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">{t.payment}</h3>
                          <div className="space-y-4">
                              <ToggleSwitch checked={localSettings.paymentMethods.cod} onChange={(e: any) => updateSection('paymentMethods', { cod: e.target.checked })} label={t.cashOnDelivery} subLabel={t.codSubLabel} icon={CreditCard} />
                              <ToggleSwitch checked={localSettings.paymentMethods.banking} onChange={(e: any) => updateSection('paymentMethods', { banking: e.target.checked })} label={t.bankTransfer} subLabel={t.bankTransferSubLabel} icon={DollarSign} />
                              <div className={toggleContainerClass}>
                                  <div className="flex items-center gap-4">
                                      <div className="p-2.5 bg-pink-50 rounded-lg border border-pink-100"><div className="w-6 h-6 bg-pink-600 rounded flex items-center justify-center text-white text-[10px] font-bold">Mo</div></div>
                                      <div><p className="font-bold text-slate-800 text-base">{t.momoWallet}</p><p className="text-xs text-slate-500 font-medium">{t.momoSubLabel}</p></div>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" className="sr-only peer" checked={localSettings.paymentMethods.momo} onChange={e => updateSection('paymentMethods', { momo: e.target.checked })} />
                                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                  </label>
                              </div>
                          </div>
                      </div>
                      {localSettings.paymentMethods.banking && (
                          <div className="animate-fade-in">
                              <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-800">{t.bankInfo}</h3><button onClick={() => setIsAddingAccount(true)} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1"><Plus size={14}/> {t.addAccount}</button></div>
                              <div className="space-y-3">
                                  {paymentAccounts.map(acc => (
                                      <div key={acc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center group hover:border-indigo-200 transition-all">
                                          <div className="flex items-center gap-4">
                                              <div className="p-2 bg-white rounded-lg border border-slate-100 text-indigo-600"><Landmark size={20}/></div>
                                              <div><p className="font-bold text-slate-800 text-sm">{acc.bank}</p><p className="text-xs text-slate-500 font-mono mt-0.5">{acc.number}</p><p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{acc.holder}</p></div>
                                          </div>
                                          <button onClick={() => setDeletingAccountId(acc.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                      </div>
                                  ))}
                              </div>
                              {isAddingAccount && (
                                  <div className="mt-4 p-4 bg-white border-2 border-indigo-100 rounded-xl shadow-sm animate-fade-in-up">
                                      <div className="flex justify-between items-center mb-3"><span className="text-sm font-bold text-indigo-900">{t.addNewAccount}</span><button onClick={() => setIsAddingAccount(false)}><X size={16} className="text-slate-400 hover:text-slate-600"/></button></div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                          <div>
                                              <label className="text-xs font-bold text-slate-500 mb-1 block">{t.bankName}</label>
                                              <div className="relative"><Landmark size={14} className="absolute left-3 top-2.5 text-slate-400"/><input type="text" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder={lang === 'vi' ? 'VD: Vietcombank' : 'e.g. Vietcombank'} value={newAccount.bank} onChange={e => setNewAccount({...newAccount, bank: e.target.value})}/></div>
                                          </div>
                                          <div>
                                              <label className="text-xs font-bold text-slate-500 mb-1 block">{t.accountNumber}</label>
                                              <div className="relative"><Hash size={14} className="absolute left-3 top-2.5 text-slate-400"/><input type="text" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none font-mono" placeholder="000..." value={newAccount.number} onChange={e => setNewAccount({...newAccount, number: e.target.value})}/></div>
                                          </div>
                                          <div className="md:col-span-2">
                                              <label className="text-xs font-bold text-slate-500 mb-1 block">{t.accountHolder}</label>
                                              <div className="relative"><User size={14} className="absolute left-3 top-2.5 text-slate-400"/><input type="text" className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none uppercase" placeholder={lang === 'vi' ? 'NGUYEN VAN A' : 'NGUYEN VAN A'} value={newAccount.holder} onChange={e => setNewAccount({...newAccount, holder: e.target.value.toUpperCase()})}/></div>
                                          </div>
                                      </div>
                                      <button onClick={handleAddAccount} disabled={!newAccount.bank || !newAccount.number} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">{t.saveAccount}</button>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              );
          case 'shipping': return (<div className="space-y-6 max-w-2xl"><h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{t.shipping}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className={labelClass}>{t.standardShippingFee}</label><div className="relative"><input type="number" className={inputClass} value={localSettings.shipping.standardFee} onChange={e => updateSection('shipping', { standardFee: parseInt(e.target.value) || 0 })} /><span className="absolute right-3 top-2.5 text-slate-400 text-sm font-bold">₫</span></div></div><div><label className={labelClass}>{t.freeShippingThreshold}</label><div className="relative"><input type="number" className={inputClass} value={localSettings.shipping.freeShipThreshold} onChange={e => updateSection('shipping', { freeShipThreshold: parseInt(e.target.value) || 0 })} /><span className="absolute right-3 top-2.5 text-slate-400 text-sm font-bold">₫</span></div></div></div></div>);
          case 'inventory': return (<div className="space-y-6 max-w-2xl"><h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{t.inventory}</h3><div className="grid grid-cols-1 gap-6"><div><label className={labelClass}>{t.lowStockThreshold}</label><input type="number" className={inputClass} value={localSettings.inventory.lowStockThreshold} onChange={e => updateSection('inventory', { lowStockThreshold: parseInt(e.target.value) || 0 })} /><p className="text-xs text-slate-500 mt-1">{t.lowStockAlert}</p></div><ToggleSwitch checked={localSettings.inventory.showOutOfStock} onChange={(e: any) => updateSection('inventory', { showOutOfStock: e.target.checked })} label={t.showOutOfStock} subLabel={t.showOutOfStockSubLabel} icon={Package}/></div></div>);
          case 'orders': return (<div className="space-y-6 max-w-2xl"><h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{t.orders}</h3><div className="space-y-6"><ToggleSwitch checked={localSettings.orders.autoConfirm} onChange={(e: any) => updateSection('orders', { autoConfirm: e.target.checked })} label={t.autoConfirmOrders} subLabel={t.autoConfirmSubLabel} icon={CheckCircle}/><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className={labelClass}>{t.invoicePrefix}</label><input type="text" className={inputClass} value={localSettings.orders.invoicePrefix} onChange={e => updateSection('orders', { invoicePrefix: e.target.value })} /></div></div></div></div>);
          case 'finance': return (
              <div className="space-y-6 max-w-2xl">
                  <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{t.taxFinanceSettings}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                          <label className={labelClass}>{t.taxRate}</label>
                          <div className="relative">
                              <input type="number" className={inputClass} value={localSettings.tax.defaultRate} onChange={e => updateSection('tax', { defaultRate: parseFloat(e.target.value) || 0 })} />
                              <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-bold">%</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{t.vatRateDefault}</p>
                      </div>
                  </div>
              </div>
            );
          case 'staff': return (<div className="space-y-6 max-w-2xl"><h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{t.staff}</h3><div className="space-y-6"><ToggleSwitch checked={localSettings.staff.allowDelete} onChange={(e: any) => updateSection('staff', { allowDelete: e.target.checked })} label={t.allowStaffDelete} subLabel="Danger Zone: Enable staff to delete records." icon={Shield}/><div><label className={labelClass}>{t.maxStaffDiscount}</label><input type="number" className={inputClass} value={localSettings.staff.maxDiscount} onChange={e => updateSection('staff', { maxDiscount: parseInt(e.target.value) || 0 })} /></div></div></div>);
          case 'notifications': return (<div className="space-y-6 max-w-2xl"><h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{t.notifications}</h3><div className="space-y-4"><ToggleSwitch checked={localSettings.notifications.emailOnOrder} onChange={(e: any) => updateSection('notifications', { emailOnOrder: e.target.checked })} label={t.emailOnOrder} subLabel="Receive an email for every new order placed." icon={Mail}/><ToggleSwitch checked={localSettings.notifications.pushLowStock} onChange={(e: any) => updateSection('notifications', { pushLowStock: e.target.checked })} label={t.pushLowStock} subLabel="Get notified when items run low." icon={Smartphone}/></div></div>);
          case 'security': return (
            <div className="space-y-12 max-w-3xl">
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{t.accountSecurity}</h3>
                    <ToggleSwitch checked={localSettings.security.enable2FA} onChange={(e: any) => updateSection('security', { enable2FA: e.target.checked })} label={t.enable2FA} subLabel="Require verification code on login." icon={Lock}/>
                    <div>
                        <label className={labelClass}>{t.passwordExpiry}</label>
                        <input type="number" className={inputClass} value={localSettings.security.passwordExpiry} onChange={e => updateSection('security', { passwordExpiry: parseInt(e.target.value) || 0 })} />
                        <p className="text-xs text-slate-500 mt-1">{t.forcePasswordChange}</p>
                    </div>
                </div>
                
                {currentUser.role === 'OWNER' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <ShieldAlert size={20} /> {t.level2Password}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {t.level2PasswordDesc}
                        </p>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-600 text-left">{t.employee}</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 text-center">{t.status}</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 text-right">{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {backend.state.employees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{emp.name}</p>
                                                <p className="text-xs text-slate-500">{emp.role}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {emp.level2Password ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                                                        <CheckCircle size={12}/> {t.enabled}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200">
                                                        <X size={12}/> {t.disabled}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer" 
                                                            checked={!!emp.level2Password} 
                                                            onChange={() => handleToggleL2(emp)}
                                                        />
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    </label>
                                                    
                                                    {emp.level2Password && (
                                                        <button 
                                                            onClick={() => handleOpenL2Modal(emp)} 
                                                            className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200"
                                                            title={lang === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
          );
          default: return (<div className="flex flex-col items-center justify-center py-20 text-slate-400 h-full"><div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">{React.createElement(menuItems.find(i => i.id === activeTab)?.icon || Store, { size: 40, className: "text-slate-300" })}</div><p className="text-xl font-bold text-slate-600 mb-2">Settings for {menuItems.find(i => i.id === activeTab)?.label || activeTab}</p><p className="text-sm font-medium">{t.configUnderDev}</p></div>);
      }
  };

  return (
    <div className="max-w-6xl mx-auto max-h-[calc(100vh-140px)] flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">{t.settingsMgmt}</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Manage your store preferences and system configurations</p>
            </div>
            <button 
                onClick={handleSave}
                disabled={saveStatus !== 'idle'}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                    saveStatus === 'saved' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                }`}
            >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? <><CheckCircle size={18}/> Saved</> : <><Save size={18}/> {t.save}</>}
            </button>
        </div>

        {/* Layout */}
        <div className="flex flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto">
                <div className="p-3 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as SettingTab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === item.id 
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                        >
                            <item.icon size={18} className={activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'} />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
                {renderContent()}
            </div>
        </div>
        {l2PasswordModalOpen && selectedEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-2">
                        {selectedEmployee.level2Password ? 'Thay đổi Mật khẩu cấp 2' : 'Thiết lập Mật khẩu cấp 2'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Nhập mật khẩu phụ mới cho <strong className="text-slate-700">{selectedEmployee.name}</strong>.</p>
                    <div className="relative">
                        <Key size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                            type="password" 
                            value={newL2Password}
                            onChange={e => setNewL2Password(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            autoFocus
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setL2PasswordModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold">Hủy</button>
                        <button onClick={handleSetL2Password} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-bold">Lưu Mật Khẩu</button>
                    </div>
                </div>
            </div>
        )}
        
        <ConfirmModal
            isOpen={!!confirmDisableL2}
            onClose={() => setConfirmDisableL2(null)}
            onConfirm={executeDisableL2}
            title="Tắt Mật khẩu cấp 2"
            message={`Bạn có chắc chắn muốn tắt mật khẩu cấp 2 cho nhân viên ${confirmDisableL2?.name}? Họ sẽ không cần nhập mật khẩu phụ khi đăng nhập admin.`}
            lang={lang}
            confirmText="Tắt bảo mật"
            confirmColor="amber"
        />

        <ConfirmModal
            isOpen={deletingAccountId !== null}
            onClose={() => setDeletingAccountId(null)}
            onConfirm={() => {
                if (deletingAccountId !== null) {
                    deletePaymentAccount(deletingAccountId);
                }
            }}
            title="Xác nhận xóa tài khoản"
            message="Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?"
            lang={lang}
        />
    </div>
  );
};

export default SettingsManager;
