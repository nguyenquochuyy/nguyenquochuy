import React, { useState, useMemo, useEffect } from 'react';
import { BackendContextType, Language, formatCurrency, Transaction, Voucher, FinanceAccount } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { api } from '../../services/apiClient';
import VoucherManager from './VoucherManager';
import AdvancedFinanceReport from './AdvancedFinanceReport';
import InvoiceManager from './InvoiceManager';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, Plus, Filter,
  ArrowUpRight, ArrowDownRight, Wallet, Banknote, Landmark, X, Save, BarChart3 as BarChart3Icon, Ticket, FileText, Trash2
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
  const { state, addVoucher, updateVoucher, deleteVoucher } = backend;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financeAccounts, setFinanceAccounts] = useState<FinanceAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [mainTab, setMainTab] = useState<'finance' | 'vouchers' | 'invoices'>('finance');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'accounts' | 'reports'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({ fromAccount: '', toAccount: '', amount: 0, description: '' });

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [txsRes, accountsRes] = await Promise.all([
          fetch('/api/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}` } }),
          fetch('/api/finance/accounts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}` } })
        ]);
        const txsData = await txsRes.json();
        const accountsData = await accountsRes.json();
        setTransactions(Array.isArray(txsData.data) ? txsData.data : Array.isArray(txsData) ? txsData : []);
        setFinanceAccounts(Array.isArray(accountsData.data) ? accountsData.data : Array.isArray(accountsData) ? accountsData : []);
      } catch (error) {
        console.error('Error fetching finance data:', error);
        setTransactions([]);
        setFinanceAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Transaction Form State
  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'date' | 'status'>>({
      type: 'INCOME',
      amount: 0,
      category: 'Sales',
      description: '',
      accountId: ''
  });

  // Calculate Totals
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Chart Data: Income vs Expense by Category
  const incomeByCategory = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

  const expenseByCategory = transactions
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

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(formData.amount <= 0 || !formData.accountId) return;

      try {
          await api.addTransaction(formData);
          // Refresh transactions
          const txsRes = await fetch('/api/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}` } });
          const txsData = await txsRes.json();
          setTransactions(Array.isArray(txsData.data) ? txsData.data : Array.isArray(txsData) ? txsData : []);
          setIsModalOpen(false);
          setFormData({
              type: 'INCOME',
              amount: 0,
              category: 'Sales',
              description: '',
              accountId: financeAccounts[0]?.id || ''
          });
      } catch (error) {
          console.error('Error adding transaction:', error);
      }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!editingTransaction) return;

      try {
          await api.updateTransaction(editingTransaction.id, {
              type: formData.type,
              amount: formData.amount,
              category: formData.category,
              description: formData.description,
              accountId: formData.accountId
          });
          // Refresh transactions
          const txsRes = await fetch('/api/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}` } });
          const txsData = await txsRes.json();
          setTransactions(Array.isArray(txsData.data) ? txsData.data : Array.isArray(txsData) ? txsData : []);
          setIsEditModalOpen(false);
          setEditingTransaction(null);
      } catch (error) {
          console.error('Error updating transaction:', error);
      }
  };

  const handleDeleteTransaction = async (id: string) => {
      if(!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;

      try {
          await api.deleteTransaction(id);
          setTransactions(transactions.filter(t => t.id !== id));
      } catch (error) {
          console.error('Error deleting transaction:', error);
      }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!editingAccount) return;

      try {
          await api.createFinanceAccount(editingAccount);
          // Refresh accounts
          const accountsRes = await fetch('/api/finance/accounts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}` } });
          const accountsData = await accountsRes.json();
          setFinanceAccounts(Array.isArray(accountsData.data) ? accountsData.data : Array.isArray(accountsData) ? accountsData : []);
          setIsAccountModalOpen(false);
          setEditingAccount(null);
      } catch (error) {
          console.error('Error creating account:', error);
      }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!editingAccount) return;

      try {
          await api.updateFinanceAccount(editingAccount.id, {
              name: editingAccount.name,
              type: editingAccount.type,
              balance: editingAccount.balance,
              accountNumber: editingAccount.accountNumber
          });
          // Refresh accounts
          const accountsRes = await fetch('/api/finance/accounts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}` } });
          const accountsData = await accountsRes.json();
          setFinanceAccounts(Array.isArray(accountsData.data) ? accountsData.data : Array.isArray(accountsData) ? accountsData : []);
          setIsAccountModalOpen(false);
          setEditingAccount(null);
      } catch (error) {
          console.error('Error updating account:', error);
      }
  };

  const handleDeleteAccount = async (id: string) => {
      if(!confirm('Bạn có chắc muốn xóa tài khoản này?')) return;

      try {
          await api.deleteFinanceAccount(id);
          setFinanceAccounts(financeAccounts.filter(a => a.id !== id));
      } catch (error) {
          console.error('Error deleting account:', error);
      }
  };

  const openEditTransaction = (tx: Transaction) => {
      setEditingTransaction(tx);
      setFormData({
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          description: tx.description,
          accountId: tx.accountId
      });
      setIsEditModalOpen(true);
  };

  const openCreateAccount = () => {
      setEditingAccount({
          id: '',
          name: '',
          type: 'CASH',
          balance: 0,
          accountNumber: ''
      });
      setIsAccountModalOpen(true);
  };

  const openEditAccount = (acc: FinanceAccount) => {
      setEditingAccount(acc);
      setIsAccountModalOpen(true);
  };

  const handleTransfer = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!transferData.fromAccount || !transferData.toAccount || transferData.amount <= 0) return;
      if(transferData.fromAccount === transferData.toAccount) {
          alert('Không thể chuyển cùng tài khoản');
          return;
      }

      try {
          // Create withdrawal transaction
          await api.addTransaction({
              type: 'EXPENSE',
              amount: transferData.amount,
              category: 'Transfer',
              description: `Chuyển đến ${getAccountName(transferData.toAccount)}`,
              accountId: transferData.fromAccount
          });

          // Create deposit transaction
          await api.addTransaction({
              type: 'INCOME',
              amount: transferData.amount,
              category: 'Transfer',
              description: `Nhận từ ${getAccountName(transferData.fromAccount)}`,
              accountId: transferData.toAccount
          });

          // Refresh data
          const [txsRes, accountsRes] = await Promise.all([
              fetch('/api/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}` } }),
              fetch('/api/finance/accounts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}` } })
          ]);
          const txsData = await txsRes.json();
          const accountsData = await accountsRes.json();
          setTransactions(Array.isArray(txsData.data) ? txsData.data : Array.isArray(txsData) ? txsData : []);
          setFinanceAccounts(Array.isArray(accountsData.data) ? accountsData.data : Array.isArray(accountsData) ? accountsData : []);

          setIsTransferModalOpen(false);
          setTransferData({ fromAccount: '', toAccount: '', amount: 0, description: '' });
      } catch (error) {
          console.error('Error transferring:', error);
      }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || tx.type === filterType;
      const matchesCategory = !filterCategory || tx.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
  });

  const getAccountName = (id: string) => financeAccounts.find(a => a.id === id)?.name || 'Unknown';

  const AccountIcon = ({ type }: { type: string }) => {
      switch(type) {
          case 'BANK': return <Landmark size={24} className="text-blue-600"/>;
          case 'WALLET': return <Wallet size={24} className="text-purple-600"/>;
          default: return <Banknote size={24} className="text-emerald-600"/>;
      }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
        {/* Main Tab Switcher */}
        <div className="flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setMainTab('finance')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              mainTab === 'finance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign size={16} /> Tài Chính
            </div>
          </button>
          <button
            onClick={() => setMainTab('vouchers')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              mainTab === 'vouchers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Ticket size={16} /> Mã Giảm Giá
            </div>
          </button>
          <button
            onClick={() => setMainTab('invoices')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              mainTab === 'invoices'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} /> Hóa Đơn
            </div>
          </button>
        </div>

        {/* Finance Tab */}
        {mainTab === 'finance' && (
        <>
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {[
                    { key: 'overview', icon: BarChart3Icon, label: t.financeOverview },
                    { key: 'transactions', icon: TrendingUp, label: t.transactions },
                    { key: 'accounts', icon: CreditCard, label: t.accounts },
                    { key: 'reports', icon: BarChart3Icon, label: 'Báo cáo' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 transition-all ${
                            activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.icon size={15} /> {tab.label}
                    </button>
                ))}
            </div>
            {activeTab !== 'reports' && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> {t.addTransaction}
                </button>
            )}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t.income}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalIncome)}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t.expense}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalExpense)}</p>
                        </div>
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                            <ArrowDownRight size={20} />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t.netProfit}</p>
                            <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-gray-900' : 'text-rose-500'}`}>{formatCurrency(netProfit)}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-4">{t.cashFlow} {t.breakdownLabel}</h3>
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
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-4">{t.recentActivity}</h3>
                        <div className="space-y-2">
                            {transactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-md ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                                            {tx.type === 'INCOME' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                                            <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                                        </div>
                                    </div>
                                    <span className={`font-medium text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-500'}`}>
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
            <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')}
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="INCOME">Thu nhập</option>
                        <option value="EXPENSE">Chi phí</option>
                    </select>
                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                    >
                        <option value="">Tất cả danh mục</option>
                        {Array.from(new Set(transactions.map(t => t.category))).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 uppercase font-medium">
                            <tr>
                                <th className="px-5 py-3">{t.date}</th>
                                <th className="px-5 py-3">{t.description}</th>
                                <th className="px-5 py-3">{t.categoryLabel}</th>
                                <th className="px-5 py-3">{t.account}</th>
                                <th className="px-5 py-3 text-right">{t.amount}</th>
                                <th className="px-5 py-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                                <td className="px-5 py-3 font-medium text-gray-900">{tx.description}</td>
                                <td className="px-5 py-3">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{tx.category}</span>
                                </td>
                                <td className="px-5 py-3 text-gray-500">{getAccountName(tx.accountId)}</td>
                                <td className={`px-5 py-3 text-right font-medium ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <div className="flex gap-1 justify-end">
                                        <button
                                            onClick={() => openEditTransaction(tx)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Sửa"
                                        >
                                            <Save size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTransaction(tx.id)}
                                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </div>
        )}

        {activeTab === 'accounts' && (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button
                        onClick={openCreateAccount}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Thêm tài khoản
                    </button>
                    <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200"
                    >
                        <ArrowUpRight size={16} /> Chuyển tiền
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {financeAccounts.map(acc => (
                        <div key={acc.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-gray-50 rounded-lg">
                                    <AccountIcon type={acc.type} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{acc.name}</h3>
                                    <p className="text-xs text-gray-400 font-mono">{acc.accountNumber || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase">{t.balance}</p>
                                <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(acc.balance)}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={() => openEditAccount(acc)}
                                    className="flex-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm font-medium"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDeleteAccount(acc.id)}
                                    className="flex-1 p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors text-sm font-medium"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'reports' && (
            <AdvancedFinanceReport />
        )}

        {/* Add Transaction Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/30" onClick={() => setIsModalOpen(false)}></div>
                <div className="bg-white rounded-xl w-full max-w-lg border border-gray-200 shadow-lg relative z-10 flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">{t.addTransaction}</h3>
                        <button onClick={() => setIsModalOpen(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'INCOME'})}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'INCOME' ? 'bg-white text-emerald-600' : 'text-gray-500'}`}
                            >
                                {t.income}
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-rose-500' : 'text-gray-500'}`}
                            >
                                {t.expense}
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t.description}</label>
                            <input
                                type="text" required
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t.amount}</label>
                                <input
                                    type="text" required
                                    className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={formData.amount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formData.amount).replace(/,/g, '.')}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({...formData, amount: parseFloat(val) || 0});
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t.categoryLabel}</label>
                                <select
                                    className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t.account}</label>
                            <select
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={formData.accountId}
                                onChange={e => setFormData({...formData, accountId: e.target.value})}
                            >
                                {financeAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button" onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                                <Save size={16} /> {t.save}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Edit Transaction Modal */}
        {isEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/30" onClick={() => setIsEditModalOpen(false)}></div>
                <div className="bg-white rounded-xl w-full max-w-lg border border-gray-200 shadow-lg relative z-10 flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Sửa giao dịch</h3>
                        <button onClick={() => setIsEditModalOpen(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    <form onSubmit={handleEditTransaction} className="p-5 space-y-4">
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'INCOME'})}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'INCOME' ? 'bg-white text-emerald-600' : 'text-gray-500'}`}
                            >
                                {t.income}
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-rose-500' : 'text-gray-500'}`}
                            >
                                {t.expense}
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t.description}</label>
                            <input
                                type="text" required
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t.amount}</label>
                                <input
                                    type="text" required
                                    className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={formData.amount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formData.amount).replace(/,/g, '.')}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({...formData, amount: parseFloat(val) || 0});
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t.categoryLabel}</label>
                                <select
                                    className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t.account}</label>
                            <select
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={formData.accountId}
                                onChange={e => setFormData({...formData, accountId: e.target.value})}
                            >
                                {financeAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button" onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                                <Save size={16} /> Cập nhật
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Account Modal */}
        {isAccountModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/30" onClick={() => setIsAccountModalOpen(false)}></div>
                <div className="bg-white rounded-xl w-full max-w-lg border border-gray-200 shadow-lg relative z-10 flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">{editingAccount?.id ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h3>
                        <button onClick={() => setIsAccountModalOpen(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    <form onSubmit={editingAccount?.id ? handleUpdateAccount : handleCreateAccount} className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tên tài khoản</label>
                            <input
                                type="text" required
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={editingAccount?.name || ''}
                                onChange={e => setEditingAccount({...editingAccount!, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Loại tài khoản</label>
                            <select
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={editingAccount?.type || 'CASH'}
                                onChange={e => setEditingAccount({...editingAccount!, type: e.target.value as 'CASH' | 'BANK' | 'WALLET'})}
                            >
                                <option value="CASH">Tiền mặt</option>
                                <option value="BANK">Ngân hàng</option>
                                <option value="WALLET">Ví điện tử</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Số tài khoản</label>
                            <input
                                type="text"
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={editingAccount?.accountNumber || ''}
                                onChange={e => setEditingAccount({...editingAccount!, accountNumber: e.target.value})}
                                placeholder="N/A"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Số dư ban đầu</label>
                            <input
                                type="text"
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={editingAccount?.balance === 0 ? '' : new Intl.NumberFormat('vi-VN').format(editingAccount?.balance || 0).replace(/,/g, '.')}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setEditingAccount({...editingAccount!, balance: parseFloat(val) || 0});
                                }}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button" onClick={() => setIsAccountModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                                <Save size={16} /> {t.save}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Transfer Modal */}
        {isTransferModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/30" onClick={() => setIsTransferModalOpen(false)}></div>
                <div className="bg-white rounded-xl w-full max-w-lg border border-gray-200 shadow-lg relative z-10 flex flex-col overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Chuyển tiền giữa tài khoản</h3>
                        <button onClick={() => setIsTransferModalOpen(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    <form onSubmit={handleTransfer} className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Từ tài khoản</label>
                            <select
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={transferData.fromAccount}
                                onChange={e => setTransferData({...transferData, fromAccount: e.target.value})}
                                required
                            >
                                <option value="">Chọn tài khoản nguồn</option>
                                {financeAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Đến tài khoản</label>
                            <select
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={transferData.toAccount}
                                onChange={e => setTransferData({...transferData, toAccount: e.target.value})}
                                required
                            >
                                <option value="">Chọn tài khoản đích</option>
                                {financeAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Số tiền</label>
                            <input
                                type="text" required
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={transferData.amount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(transferData.amount).replace(/,/g, '.')}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setTransferData({...transferData, amount: parseFloat(val) || 0});
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5">Ghi chú</label>
                            <input
                                type="text"
                                className="w-full p-2.5 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                value={transferData.description}
                                onChange={e => setTransferData({...transferData, description: e.target.value})}
                                placeholder="Ghi chú (tùy chọn)"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button" onClick={() => setIsTransferModalOpen(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                                <ArrowUpRight size={16} /> Chuyển tiền
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
          <VoucherManager backend={backend} lang={lang} />
        )}

        {/* Invoices Tab */}
        {mainTab === 'invoices' && (
          <InvoiceManager backend={backend} lang={lang} />
        )}
    </div>
  );
};

export default FinanceManager;
