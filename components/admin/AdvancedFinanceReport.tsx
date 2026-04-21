import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, RefreshCcw, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../types';

interface AdvancedFinanceReportProps {
  // Can pass any needed props, but data is fetched directly
}

interface ReportData {
  current: {
    income: number;
    expense: number;
    profit: number;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
  };
  comparison: {
    income: number;
    expense: number;
    profit: number;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
  };
}

const AdvancedFinanceReport: React.FC<AdvancedFinanceReportProps> = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // Date ranges
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [compareStartDate, setCompareStartDate] = useState('');
  const [compareEndDate, setCompareEndDate] = useState('');
  const [enableCompare, setEnableCompare] = useState(false);

  // Set default dates (Current month vs Last month)
  useEffect(() => {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    setStartDate(firstDayThisMonth.toISOString().split('T')[0]);
    setEndDate(lastDayThisMonth.toISOString().split('T')[0]);

    setCompareStartDate(firstDayLastMonth.toISOString().split('T')[0]);
    setCompareEndDate(lastDayLastMonth.toISOString().split('T')[0]);
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/api/finance/reports/advanced?startDate=${startDate ? new Date(startDate).toISOString() : ''}&endDate=${endDate ? new Date(endDate).toISOString() : ''}`;
      if (enableCompare) {
        url += `&compareStartDate=${compareStartDate ? new Date(compareStartDate).toISOString() : ''}&compareEndDate=${compareEndDate ? new Date(compareEndDate).toISOString() : ''}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('unishop_admin_token')}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data || json);
      } else {
        console.error('API error:', res.status, res.statusText);
        setData({
          current: { income: 0, expense: 0, profit: 0, incomeByCategory: {}, expenseByCategory: {} },
          comparison: { income: 0, expense: 0, profit: 0, incomeByCategory: {}, expenseByCategory: {} }
        });
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setData({
        current: { income: 0, expense: 0, profit: 0, incomeByCategory: {}, expenseByCategory: {} },
        comparison: { income: 0, expense: 0, profit: 0, incomeByCategory: {}, expenseByCategory: {} }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate, compareStartDate, compareEndDate, enableCompare]);

  if (!data) return <div className="p-10 text-center text-slate-500 animate-pulse">Đang tải dữ liệu báo cáo...</div>;

  const calculateTrend = (current: number, past: number) => {
    if (past === 0) return current > 0 ? 100 : 0;
    return ((current - past) / Math.abs(past)) * 100;
  };

  // Prepare chart data
  const comparisonChartData = [
    {
      name: 'Thu Nhập',
      'Hiện tại': data.current.income,
      'Kỳ trước': enableCompare ? data.comparison.income : 0,
    },
    {
      name: 'Chi Phí',
      'Hiện tại': data.current.expense,
      'Kỳ trước': enableCompare ? data.comparison.expense : 0,
    },
    {
      name: 'Lợi Nhuận',
      'Hiện tại': data.current.profit,
      'Kỳ trước': enableCompare ? data.comparison.profit : 0,
    }
  ];

  return (
    <div className="space-y-[15px] animate-fade-in">
      {/* Date Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-[15px] items-end">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Kỳ Báo Cáo</label>
          <div className="flex items-center gap-2">
            <input type="date" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="text-slate-400">-</span>
            <input type="date" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <input type="checkbox" checked={enableCompare} onChange={e => setEnableCompare(e.target.checked)} className="rounded text-indigo-600" />
            So Sánh Với Kỳ Trước
          </label>
          {enableCompare ? (
            <div className="flex items-center gap-2">
                <input type="date" className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" value={compareStartDate} onChange={e => setCompareStartDate(e.target.value)} />
                <span className="text-slate-400">-</span>
                <input type="date" className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50" value={compareEndDate} onChange={e => setCompareEndDate(e.target.value)} />
            </div>
          ) : (
            <div className="h-10 flex items-center text-sm text-slate-400 italic">Tính năng so sánh đang tắt</div>
          )}
        </div>

        <button onClick={fetchReport} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg text-sm flex items-center gap-2 h-10">
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* KPI Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
        {[
          { label: 'Tổng Thu Nhập', current: data.current.income, compare: data.comparison.income, icon: TrendingUp, color: 'emerald' },
          { label: 'Tổng Chi Phí', current: data.current.expense, compare: data.comparison.expense, icon: TrendingDown, color: 'rose' },
          { label: 'Lợi Nhuận Ròng', current: data.current.profit, compare: data.comparison.profit, icon: DollarSign, color: 'blue' }
        ].map((kpi, idx) => {
          const trend = calculateTrend(kpi.current, kpi.compare);
          return (
            <div key={idx} className={`bg-white p-6 rounded-xl shadow-sm border border-${kpi.color}-100`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-xs font-bold text-${kpi.color}-600 uppercase`}>{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(kpi.current)}</p>
                </div>
                <div className={`p-3 bg-${kpi.color}-50 rounded-xl text-${kpi.color}-600`}>
                  <kpi.icon size={24} />
                </div>
              </div>
              {enableCompare && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Kỳ trước</p>
                    <p className="text-sm font-semibold text-slate-700">{formatCurrency(kpi.compare)}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : trend < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px]">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Biểu đồ So Sánh</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₫${(val/1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: '#f8fafc'}} />
                <Legend iconType="circle" />
                <Bar dataKey="Hiện tại" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                {enableCompare && <Bar dataKey="Kỳ trước" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={50} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Phân Bổ Chi Phí Theo Danh Mục</h3>
          <div className="space-y-[15px]">
             {Object.entries(data.current.expenseByCategory || {})
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700">{category}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-rose-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (amount / Math.max(data.current.expense, 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
             ))}
             {Object.keys(data.current.expenseByCategory || {}).length === 0 && (
                 <div className="text-center text-slate-500 py-10 text-sm">Không có dữ liệu chi phí kỳ này</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFinanceReport;
