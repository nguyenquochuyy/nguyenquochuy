import React, { useState, useMemo } from 'react';
import { BackendContextType, Language, formatCurrency, Transaction, Voucher } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import VoucherManager from './VoucherManager';
import AdvancedFinanceReport from './AdvancedFinanceReport';
import InvoiceManager from './InvoiceManager';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, Plus, Filter,
  ArrowUpRight, ArrowDownRight, Wallet, Banknote, Landmark, X, Save, BarChart3, Ticket, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface FinanceManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, addTransaction, addVoucher, updateVoucher, deleteVoucher } = backend;

  const [mainTab, setMainTab] = useState<'finance' | 'vouchers' | 'invoices'>('finance');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'accounts' | 'reports'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Transaction Form State
  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'date' | 'status'>>({
      type: 'INCOME',
      amount: 0,
      category: 'Sales',
      description: '',
      accountId: state.financeAccounts[0]?.id || ''
  });

  // Calculate Totals
  const totalIncome = state.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = state.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Chart Data: Income vs Expense by Category
  const incomeByCategory = state.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

  const expenseByCategory = state.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

  const pieData = [
      ...Object.keys(incomeByCategory).map(key => ({ name: `Income: ${key}`, value: incomeByCategory[key], type: 'income' })),
      ...Object.keys(expenseByCategory).map(key => ({ name: `Exp: ${key}`, value: expenseByCategory[key], type: 'expense' }))
  ];

  const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#ef4444', '#f87171', '#fca5a5'];

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(formData.amount <= 0 || !formData.accountId) return;
      
      addTransaction(formData as any);
      setIsModalOpen(false);
      setFormData({
          type: 'INCOME',
          amount: 0,
          category: 'Sales',
          description: '',
          accountId: state.financeAccounts[0]?.id || ''
      });
  };

  const getAccountName = (id: string) => state.financeAccounts.find(a => a.id === id)?.name || 'Unknown';

  const AccountIcon = ({ type }: { type: string }) => {
      switch(type) {
          case 'BANK': return <Landmark size={24} className="text-blue-600"/>;
          case 'WALLET': return <Wallet size={24} className="text-purple-600"/>;
          default: return <Banknote size={24} className="text-emerald-600"/>;
      }
  };

  return (
    <div className="space-y-[15px] max-w-7xl mx-auto animate-fade-in-up">
        {/* Main Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setMainTab('finance')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              mainTab === 'finance'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign size={18} /> Tài Chính
            </div>
          </button>
          <button
            onClick={() => setMainTab('vouchers')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              mainTab === 'vouchers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Ticket size={18} /> Mã Giảm Giá
            </div>
          </button>
          <button
            onClick={() => setMainTab('invoices')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              mainTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={18} /> Hóa Đơn
            </div>
          </button>
        </div>

        {/* Finance Tab */}
        {mainTab === 'finance' && (
        <>
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-[15px] border-b border-slate-200 pb-2">
            <div className="flex gap-[15px]">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'overview' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BarChart3 size={18} /> {t.financeOverview}
                    {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('transactions')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'transactions' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <TrendingUp size={18} /> {t.transactions}
                    {activeTab === 'transactions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('accounts')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'accounts' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <CreditCard size={18} /> {t.accounts}
                    {activeTab === 'accounts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'reports' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BarChart size={18} /> Báo cáo nâng cao
                    {activeTab === 'reports' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
            </div>
            {activeTab !== 'reports' && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={16} /> {t.addTransaction}
                </button>
            )}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
            <div className="space-y-[15px]">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{t.income}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalIncome)}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-wide">{t.expense}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalExpense)}</p>
                        </div>
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                            <ArrowDownRight size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{t.netProfit}</p>
                            <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>{formatCurrency(netProfit)}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px]">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">{t.cashFlow} {t.breakdownLabel}</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === 'income' ? COLORS[index % 3] : COLORS[3 + index % 3]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">{t.recentActivity}</h3>
                        <div className="space-y-[15px]">
                            {state.transactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {tx.type === 'INCOME' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                                            <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">{t.date}</th>
                            <th className="px-6 py-4">{t.description}</th>
                            <th className="px-6 py-4">{t.categoryLabel}</th>
                            <th className="px-6 py-4">{t.account}</th>
                            <th className="px-6 py-4 text-right">{t.amount}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {state.transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{tx.description}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{tx.category}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{getAccountName(tx.accountId)}</td>
                                <td className={`px-6 py-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'accounts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
                {state.financeAccounts.map(acc => (
                    <div key={acc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                            <AccountIcon type={acc.type} />
                        </div>
                        <div className="flex items-center gap-[15px] mb-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <AccountIcon type={acc.type} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{acc.name}</h3>
                                <p className="text-xs text-slate-500 font-mono">{acc.accountNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-slate-500 font-bold uppercase">{t.balance}</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(acc.balance)}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'reports' && (
            <AdvancedFinanceReport />
        )}

        {/* Add Transaction Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900">{t.addTransaction}</h3>
                        <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-[15px]">
                        <div className="flex gap-[15px] p-1 bg-slate-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'INCOME'})}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                {t.income}
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                {t.expense}
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.description}</label>
                            <input 
                                type="text" required
                                className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-[15px]">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.amount}</label>
                                <input 
                                    type="text" required
                                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.amount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formData.amount).replace(/,/g, '.')}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({...formData, amount: parseFloat(val) || 0});
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.categoryLabel}</label>
                                <select 
                                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    {formData.type === 'INCOME' ? (
                                        <>
                                            <option value="Sales">{t.categorySales}</option>
                                            <option value="Invest">{t.categoryInvest}</option>
                                            <option value="Other">{t.categoryOther}</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Cost of Goods">{t.categoryCostOfGoods}</option>
                                            <option value="Salary">{t.categorySalary}</option>
                                            <option value="Rent">{t.categoryRent}</option>
                                            <option value="Marketing">{t.categoryMarketing}</option>
                                            <option value="Other">{t.categoryOther}</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.account}</label>
                            <select 
                                className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.accountId}
                                onChange={e => setFormData({...formData, accountId: e.target.value})}
                            >
                                {state.financeAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button" onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold"
                            >
                                {t.cancel}
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-bold shadow-md flex items-center gap-2"
                            >
                                <Save size={16} /> {t.save}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
        )}

        {/* Vouchers Tab */}
        {mainTab === 'vouchers' && (
        <>
        <VoucherManager backend={backend} lang={lang} />
        </>
        )}

        {/* Invoices Tab */}
        {mainTab === 'invoices' && (
          <InvoiceManager backend={backend} lang={lang} />
        )}
    </div>
  );
};

export default FinanceManager;
