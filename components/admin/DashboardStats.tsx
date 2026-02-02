import React, { useMemo, useState } from 'react';
import { BackendContextType, Language, OrderStatus, formatCurrency, Order } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { 
  DollarSign, TrendingUp, ShoppingCart, AlertCircle, ArrowUpRight, ArrowDownRight,
  Package, Users, Calendar, Download, RefreshCw, Activity, CreditCard
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

type DateRange = '7D' | '30D' | '90D';

interface DashboardStatsProps {
  backend: BackendContextType;
  lang: Language;
  dateRangeFilter: DateRange;
  setDateRangeFilter: (range: DateRange) => void;
  setActiveTab: (tab: any) => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  backend, lang, dateRangeFilter, setDateRangeFilter, setActiveTab 
}) => {
  const t = TRANSLATIONS[lang];
  const { state } = backend;
  const [chartType, setChartType] = useState<'revenue' | 'orders'>('revenue');

  // --- 1. Helper Functions for Dates & Ranges ---
  const getDateRange = (range: DateRange, offsetDays = 0) => {
      const days = range === '7D' ? 7 : range === '30D' ? 30 : 90;
      const end = new Date();
      end.setDate(end.getDate() - offsetDays);
      end.setHours(23, 59, 59, 999);
      
      const start = new Date(end);
      start.setDate(end.getDate() - days);
      start.setHours(0, 0, 0, 0);
      
      return { start, end, days };
  };

  const currentRange = getDateRange(dateRangeFilter);
  const previousRange = getDateRange(dateRangeFilter, currentRange.days);

  // --- 2. Data Filtering Logic ---
  const filterOrders = (start: Date, end: Date) => {
      return state.orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= start && date <= end && o.status !== OrderStatus.CANCELLED;
      });
  };

  const currentOrders = useMemo(() => filterOrders(currentRange.start, currentRange.end), [state.orders, dateRangeFilter]);
  const previousOrders = useMemo(() => filterOrders(previousRange.start, previousRange.end), [state.orders, dateRangeFilter]);

  // --- 3. Metric Calculations with Growth ---
  const calculateMetrics = (orders: Order[]) => {
      const revenue = orders.reduce((acc, o) => acc + o.total, 0);
      const cost = orders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + (i.costPrice * i.quantity), 0), 0);
      const profit = revenue - cost;
      const count = orders.length;
      const aov = count > 0 ? revenue / count : 0;
      return { revenue, profit, count, aov };
  };

  const currentMetrics = calculateMetrics(currentOrders);
  const previousMetrics = calculateMetrics(previousOrders);

  const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
  };

  const growth = {
      revenue: calculateGrowth(currentMetrics.revenue, previousMetrics.revenue),
      profit: calculateGrowth(currentMetrics.profit, previousMetrics.profit),
      count: calculateGrowth(currentMetrics.count, previousMetrics.count),
      aov: calculateGrowth(currentMetrics.aov, previousMetrics.aov),
  };

  // --- 4. Chart Data Preparation ---
  const chartData = useMemo(() => {
      const data = [];
      const days = currentRange.days;
      const start = new Date(currentRange.start);

      for (let i = 0; i <= days; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const dateStr = date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'short' });
          
          // Filter orders for this specific day
          const dayOrders = currentOrders.filter(o => {
              const d = new Date(o.createdAt);
              return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
          });

          const dayRevenue = dayOrders.reduce((acc, o) => acc + o.total, 0);
          const dayOrdersCount = dayOrders.length;
          const dayProfit = dayOrders.reduce((acc, o) => acc + (o.total - o.items.reduce((s, x) => s + x.costPrice * x.quantity, 0)), 0);

          data.push({
              name: dateStr,
              revenue: dayRevenue,
              orders: dayOrdersCount,
              profit: dayProfit
          });
      }
      return data;
  }, [currentOrders, lang]);

  // Category Performance Data
  const categoryData = useMemo(() => {
      const catSales: Record<string, number> = {};
      currentOrders.forEach(order => {
          order.items.forEach(item => {
              // Find category name
              const catName = state.categories.find(c => c.id === item.category)?.name || 'Unknown';
              catSales[catName] = (catSales[catName] || 0) + (item.price * item.quantity);
          });
      });
      return Object.entries(catSales)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5 categories
  }, [currentOrders, state.categories]);

  const CATEGORY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  // Top Products
  const topProducts = useMemo(() => {
      const prodMap: Record<string, { name: string, qty: number, revenue: number, image: string, stock: number }> = {};
      currentOrders.forEach(order => {
          order.items.forEach(item => {
              if (!prodMap[item.id]) {
                  const productInDb = state.products.find(p => p.id === item.id);
                  prodMap[item.id] = { 
                      name: item.name, 
                      qty: 0, 
                      revenue: 0, 
                      image: item.images[0],
                      stock: productInDb ? productInDb.stock : 0
                  };
              }
              prodMap[item.id].qty += item.quantity;
              prodMap[item.id].revenue += (item.price * item.quantity);
          });
      });
      return Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [currentOrders, state.products]);

  // Inventory Health
  const lowStockCount = state.products.filter(p => {
      if (p.hasVariants) return p.variants.some(v => v.stock < 10);
      return p.stock < 10;
  }).length;

  // --- 5. Export Functionality ---
  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const bom = "\uFEFF"; // Byte Order Mark for UTF-8
    csvContent += bom;

    const escapeCSV = (str: string | number) => {
        const stringValue = String(str);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const headers = ["Date", "Revenue", "Profit", "Orders"];
    csvContent += headers.join(",") + "\n";

    chartData.forEach(day => {
        csvContent += [
            escapeCSV(day.name),
            day.revenue,
            day.profit,
            day.orders
        ].join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `unishop_dashboard_report_${dateRangeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Sub-components ---
  const TrendIndicator = ({ value }: { value: number }) => {
      const isPositive = value >= 0;
      return (
          <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(value).toFixed(1)}%
          </span>
      );
  };

  const KPICard = ({ title, value, trend, icon: Icon, colorClass, subValue }: any) => (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group relative overflow-hidden">
          <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 ${colorClass.replace('bg-', 'text-')}`}>
              <Icon size={80} />
          </div>
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                  <div className={`p-2.5 rounded-xl ${colorClass} text-white shadow-sm`}>
                      <Icon size={20} />
                  </div>
                  <TrendIndicator value={trend} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
              {subValue && <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>}
          </div>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
        
        {/* 1. Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Business Overview</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Performance report from <span className="font-bold text-slate-700">{currentRange.start.toLocaleDateString()}</span> to <span className="font-bold text-slate-700">{currentRange.end.toLocaleDateString()}</span>
                </p>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                {(['7D', '30D', '90D'] as const).map(range => (
                    <button
                        key={range}
                        onClick={() => setDateRangeFilter(range)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                            dateRangeFilter === range 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {range === '7D' ? t.last7Days : range === '30D' ? t.last30Days : 'Last 90 Days'}
                    </button>
                ))}
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button onClick={handleExport} className="px-3 py-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Download size={18} />
                </button>
            </div>
        </div>

        {/* 2. KPI Grid (More Comprehensive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
                title={t.totalRevenue} 
                value={formatCurrency(currentMetrics.revenue)} 
                trend={growth.revenue}
                icon={DollarSign}
                colorClass="bg-indigo-600"
                subValue={`Prev: ${formatCurrency(previousMetrics.revenue)}`}
            />
            <KPICard 
                title={t.netProfit} 
                value={formatCurrency(currentMetrics.profit)} 
                trend={growth.profit}
                icon={Activity}
                colorClass="bg-emerald-500"
                subValue={`Margin: ${currentMetrics.revenue > 0 ? ((currentMetrics.profit/currentMetrics.revenue)*100).toFixed(1) : 0}%`}
            />
            <KPICard 
                title={t.totalOrders} 
                value={currentMetrics.count} 
                trend={growth.count}
                icon={ShoppingCart}
                colorClass="bg-blue-500"
                subValue={`${(currentMetrics.count / (currentRange.days + 1)).toFixed(1)} orders / day`}
            />
            <KPICard 
                title={t.avgOrderValue} 
                value={formatCurrency(currentMetrics.aov)} 
                trend={growth.aov}
                icon={CreditCard}
                colorClass="bg-violet-500"
                subValue="Per customer avg."
            />
        </div>

        {/* 3. Main Analytics Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Revenue & Profit Trends</h3>
                        <p className="text-xs text-slate-500">Financial performance over time</p>
                    </div>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button 
                            onClick={() => setChartType('revenue')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === 'revenue' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                        >
                            Finance
                        </button>
                        <button 
                            onClick={() => setChartType('orders')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartType === 'orders' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                        >
                            Orders
                        </button>
                    </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} minTickGap={30} />
                            <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(value) => chartType === 'revenue' ? `${(value/1000000).toFixed(1)}M` : value} />
                            <Tooltip 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                                formatter={(value: number) => chartType === 'revenue' ? formatCurrency(value) : value}
                            />
                            <Area type="monotone" dataKey={chartType === 'revenue' ? 'revenue' : 'orders'} stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" name={chartType === 'revenue' ? 'Revenue' : 'Orders'} />
                            {chartType === 'revenue' && (
                                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSec)" name="Profit" />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Distribution (Donut) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-2">Sales by Category</h3>
                <p className="text-xs text-slate-500 mb-6">Top performing product categories</p>
                <div className="flex-1 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                cornerRadius={6}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-900">{categoryData.length}</span>
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Categories</span>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {categoryData.slice(0, 3).map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS[idx]}}></div>
                                <span className="text-slate-600">{cat.name}</span>
                            </div>
                            <span className="font-bold text-slate-900">{((cat.value / currentMetrics.revenue) * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 4. Bottom Section: Top Products & Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Products Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Package size={20} className="text-indigo-600"/> Top Performing Products
                    </h3>
                    <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-indigo-600 hover:underline">View Inventory</button>
                </div>
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3 text-center">Sales</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                                <th className="px-6 py-3 text-center">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {topProducts.map((product, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400 w-4">#{idx+1}</span>
                                            <img src={product.image} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{product.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold">
                                            {product.qty} <span className="opacity-70">sold</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-700">{formatCurrency(product.revenue)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                                            <div className={`h-full rounded-full ${product.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, product.stock * 2)}%`}}></div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold">{product.stock} left</span>
                                    </td>
                                </tr>
                            ))}
                            {topProducts.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">No sales data in this period.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Operational Health / Alerts */}
            <div className="space-y-6">
                {/* Pending Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-rose-500"/> Operational Health
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-amber-500 shadow-sm"><AlertCircle size={18}/></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Pending Orders</p>
                                    <p className="text-xs text-amber-700">Needs confirmation</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-amber-600">{state.orders.filter(o => o.status === OrderStatus.PENDING).length}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-rose-500 shadow-sm"><Package size={18}/></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Low Stock</p>
                                    <p className="text-xs text-rose-700">Restock required</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-rose-600">{lowStockCount}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm"><Users size={18}/></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Active Customers</p>
                                    <p className="text-xs text-indigo-700">In this period</p>
                                </div>
                            </div>
                            <span className="text-xl font-black text-indigo-600">{new Set(currentOrders.map(o => o.customerPhone)).size}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-slate-200">
                    <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('products')} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors flex flex-col items-center gap-2">
                            <Package size={20} /> Add Product
                        </button>
                        <button onClick={() => setActiveTab('orders')} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors flex flex-col items-center gap-2">
                            <RefreshCw size={20} /> Process Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardStats;