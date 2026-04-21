import React, { useMemo, useState } from 'react';
import { BackendContextType, Language, OrderStatus, formatCurrency, Order } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import {
  DollarSign, TrendingUp, ShoppingCart, AlertCircle, ArrowUpRight, ArrowDownRight,
  Package, Users, Calendar, Download, RefreshCw, Activity, CreditCard, X, TrendingDown, Clock
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
  const [drillDownModal, setDrillDownModal] = useState<{
    isOpen: boolean;
    type: 'revenue' | 'profit' | 'orders' | 'aov' | null;
    title: string;
  }>({ isOpen: false, type: null, title: '' });
  const [advancedFilters, setAdvancedFilters] = useState({
    category: 'all',
    status: 'all',
    showFilters: false,
    showWidgets: false
  });
  const [widgetConfig, setWidgetConfig] = useState(() => {
    // Load widget config from localStorage
    const saved = localStorage.getItem('dashboardWidgets');
    return saved ? JSON.parse(saved) : {
        kpiCards: true,
        mainChart: true,
        categoryChart: true,
        topProducts: true,
        operationalHealth: true,
        quickActions: true
    };
  });

  const toggleWidget = (widget: keyof typeof widgetConfig) => {
      const newConfig = { ...widgetConfig, [widget]: !widgetConfig[widget] };
      setWidgetConfig(newConfig);
      localStorage.setItem('dashboardWidgets', JSON.stringify(newConfig));
  };

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
          const dateMatch = date >= start && date <= end;
          const statusMatch = advancedFilters.status === 'all' || o.status === advancedFilters.status;
          const categoryMatch = advancedFilters.category === 'all' ||
              o.items.some(item => item.category === advancedFilters.category);
          return dateMatch && statusMatch && categoryMatch && o.status !== OrderStatus.CANCELLED;
      });
  };

  const currentOrders = useMemo(() => filterOrders(currentRange.start, currentRange.end), [state.orders, dateRangeFilter, advancedFilters]);
  const previousOrders = useMemo(() => filterOrders(previousRange.start, previousRange.end), [state.orders, dateRangeFilter, advancedFilters]);

  // --- 3. Metric Calculations with Growth ---
  const calculateMetrics = (orders: Order[]) => {
      const revenue = orders.reduce((acc, o) => acc + (o.total ?? 0), 0);
      const cost = orders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + ((i.costPrice ?? 0) * (i.quantity ?? 0)), 0), 0);
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

          const dayRevenue = dayOrders.reduce((acc, o) => acc + (o.total ?? 0), 0);
          const dayOrdersCount = dayOrders.length;
          const dayProfit = dayOrders.reduce((acc, o) => acc + ((o.total ?? 0) - o.items.reduce((s, x) => s + ((x.costPrice ?? 0) * (x.quantity ?? 0)), 0)), 0);

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
                      image: item.images?.[0] ?? '',
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
  const handleExport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
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
    } else if (type === 'pdf') {
        // Use browser print for PDF export
        window.print();
    }
  };

  // --- Drill-down Modal Component ---
  const DrillDownModal = () => {
      if (!drillDownModal.isOpen || !drillDownModal.type) return null;

      const getDrillDownData = () => {
          switch (drillDownModal.type) {
              case 'revenue':
                  return {
                      icon: DollarSign,
                      color: 'bg-indigo-600',
                      data: currentOrders.map(o => ({
                          date: new Date(o.createdAt).toLocaleDateString(),
                          customer: o.customerName,
                          total: o.total,
                          items: o.items.length
                      }))
                  };
              case 'profit':
                  return {
                      icon: Activity,
                      color: 'bg-emerald-500',
                      data: currentOrders.map(o => ({
                          date: new Date(o.createdAt).toLocaleDateString(),
                          customer: o.customerName,
                          revenue: o.total,
                          cost: o.items.reduce((acc, i) => acc + ((i.costPrice || 0) * i.quantity), 0),
                          profit: o.total - o.items.reduce((acc, i) => acc + ((i.costPrice || 0) * i.quantity), 0)
                      }))
                  };
              case 'orders':
                  return {
                      icon: ShoppingCart,
                      color: 'bg-blue-500',
                      data: currentOrders.map(o => ({
                          date: new Date(o.createdAt).toLocaleDateString(),
                          customer: o.customerName,
                          status: o.status,
                          items: o.items.length,
                          total: o.total
                      }))
                  };
              case 'aov':
                  return {
                      icon: CreditCard,
                      color: 'bg-violet-500',
                      data: currentOrders.map(o => ({
                          date: new Date(o.createdAt).toLocaleDateString(),
                          customer: o.customerName,
                          total: o.total,
                          items: o.items.length,
                          avg: o.total / o.items.length
                      })).sort((a, b) => b.avg - a.avg)
                  };
              default:
                  return null;
          }
      };

      const drillData = getDrillDownData();
      if (!drillData) return null;

      const { icon: DrillIcon, color, data } = drillData;

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
              <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-lg">
                  <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${color} text-white`}>
                              <DrillIcon size={20} />
                          </div>
                          <div>
                              <h2 className="text-lg font-semibold text-gray-900">{drillDownModal.title}</h2>
                              <p className="text-sm text-gray-500">{data.length} records</p>
                          </div>
                      </div>
                      <button
                          onClick={() => setDrillDownModal({ isOpen: false, type: null, title: '' })}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                      >
                          <X size={18} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-auto p-5">
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-medium sticky top-0">
                                  <tr>
                                      <th className="px-4 py-3">Date</th>
                                      <th className="px-4 py-3">Customer</th>
                                      {drillDownModal.type === 'profit' && (
                                          <>
                                              <th className="px-4 py-3">Revenue</th>
                                              <th className="px-4 py-3">Cost</th>
                                              <th className="px-4 py-3">Profit</th>
                                          </>
                                      )}
                                      {drillDownModal.type === 'orders' && (
                                          <>
                                              <th className="px-4 py-3">Status</th>
                                              <th className="px-4 py-3">Items</th>
                                          </>
                                      )}
                                      {(drillDownModal.type === 'revenue' || drillDownModal.type === 'aov') && (
                                          <>
                                              <th className="px-4 py-3">Items</th>
                                              <th className="px-4 py-3 text-right">Total</th>
                                          </>
                                      )}
                                      {drillDownModal.type === 'aov' && (
                                          <th className="px-4 py-3 text-right">Avg/Item</th>
                                      )}
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {data.map((item: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.customer}</td>
                                          {drillDownModal.type === 'profit' && (
                                              <>
                                                  <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(item.revenue)}</td>
                                                  <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(item.cost)}</td>
                                                  <td className={`px-4 py-3 text-sm font-bold ${item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                      {formatCurrency(item.profit)}
                                                  </td>
                                              </>
                                          )}
                                          {drillDownModal.type === 'orders' && (
                                              <>
                                                  <td className="px-4 py-3">
                                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                          item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                          item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                          item.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                                          'bg-gray-100 text-gray-700'
                                                      }`}>
                                                          {item.status}
                                                      </span>
                                                  </td>
                                                  <td className="px-4 py-3 text-sm text-gray-500">{item.items}</td>
                                              </>
                                          )}
                                          {(drillDownModal.type === 'revenue' || drillDownModal.type === 'aov') && (
                                              <>
                                                  <td className="px-4 py-3 text-sm text-gray-500">{item.items}</td>
                                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                                              </>
                                          )}
                                          {drillDownModal.type === 'aov' && (
                                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.avg)}</td>
                                          )}
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  // --- Sub-components ---
  const TrendIndicator = ({ value }: { value: number }) => {
      const isPositive = value >= 0;
      return (
          <span className={`inline-flex items-center text-xs font-medium gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(value).toFixed(1)}%
          </span>
      );
  };

  const KPICard = ({ title, value, trend, icon: Icon, colorClass, subValue, onClick }: any) => (
      <div
          onClick={onClick}
          className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
      >
          <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${colorClass} text-white`}>
                  <Icon size={18} />
              </div>
              <TrendIndicator value={trend} />
          </div>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
  );

  return (
    <div className="space-y-5 pb-8">

        {/* 1. Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">{t.businessOverview}</h1>
                <p className="text-gray-500 text-sm mt-0.5">
                    {t.performanceReportFrom} <span className="font-medium text-gray-700">{currentRange.start.toLocaleDateString()}</span> – <span className="font-medium text-gray-700">{currentRange.end.toLocaleDateString()}</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
                    {(['7D', '30D', '90D'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRangeFilter(range)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                dateRangeFilter === range
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {range === '7D' ? t.last7Days : range === '30D' ? t.last30Days : t.last90Days}
                        </button>
                    ))}
                    <div className="w-px h-5 bg-gray-200 mx-0.5"></div>
                    <button
                        onClick={() => setAdvancedFilters({ ...advancedFilters, showFilters: !advancedFilters.showFilters })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            advancedFilters.showFilters ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Filters
                    </button>
                    <button
                        onClick={() => setAdvancedFilters({ ...advancedFilters, showFilters: !advancedFilters.showFilters, showWidgets: !advancedFilters.showWidgets })}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            advancedFilters.showWidgets ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Widgets
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-0.5"></div>
                    <button onClick={() => handleExport('csv')} className="px-2 py-1.5 text-gray-400 hover:text-gray-700 transition-colors" title="Export CSV">
                        <Download size={16} />
                    </button>
                    <button onClick={() => handleExport('pdf')} className="px-2 py-1.5 text-gray-400 hover:text-gray-700 transition-colors" title="Export PDF">
                        <Download size={16} />
                    </button>
                </div>
            </div>
        </div>

        {/* Advanced Filters Panel */}
        {advancedFilters.showFilters && (
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                        <select
                            value={advancedFilters.category}
                            onChange={(e) => setAdvancedFilters({ ...advancedFilters, category: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {state.categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                        <select
                            value={advancedFilters.status}
                            onChange={(e) => setAdvancedFilters({ ...advancedFilters, status: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setAdvancedFilters({ category: 'all', status: 'all', showFilters: false, showWidgets: false })}
                            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Widget Customization Panel */}
        {advancedFilters.showWidgets && (
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { key: 'kpiCards', label: 'KPI Cards' },
                        { key: 'mainChart', label: 'Main Chart' },
                        { key: 'categoryChart', label: 'Category Chart' },
                        { key: 'topProducts', label: 'Top Products' },
                        { key: 'operationalHealth', label: 'Operational Health' },
                        { key: 'quickActions', label: 'Quick Actions' }
                    ].map(widget => (
                        <label key={widget.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={widgetConfig[widget.key as keyof typeof widgetConfig]}
                                onChange={() => toggleWidget(widget.key as keyof typeof widgetConfig)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{widget.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        )}

        {/* 2. KPI Grid (More Comprehensive) */}
        {widgetConfig.kpiCards && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t.totalRevenue}
                    value={formatCurrency(currentMetrics.revenue)}
                    trend={growth.revenue}
                    icon={DollarSign}
                    colorClass="bg-indigo-600"
                    subValue={`${t.prevLabel} ${formatCurrency(previousMetrics.revenue)}`}
                    onClick={() => setDrillDownModal({ isOpen: true, type: 'revenue', title: t.totalRevenue })}
                />
                <KPICard
                    title={t.netProfit}
                    value={formatCurrency(currentMetrics.profit)}
                    trend={growth.profit}
                    icon={Activity}
                    colorClass="bg-emerald-500"
                    subValue={`${t.marginLabel} ${currentMetrics.revenue > 0 ? ((currentMetrics.profit/currentMetrics.revenue)*100).toFixed(1) : 0}%`}
                    onClick={() => setDrillDownModal({ isOpen: true, type: 'profit', title: t.netProfit })}
                />
                <KPICard
                    title={t.totalOrders}
                    value={currentMetrics.count}
                    trend={growth.count}
                    icon={ShoppingCart}
                    colorClass="bg-blue-500"
                    subValue={`${(currentMetrics.count / (currentRange.days + 1)).toFixed(1)} ${t.ordersPerDay}`}
                    onClick={() => setDrillDownModal({ isOpen: true, type: 'orders', title: t.totalOrders })}
                />
                <KPICard
                    title={t.avgOrderValue}
                    value={formatCurrency(currentMetrics.aov)}
                    trend={growth.aov}
                    icon={CreditCard}
                    colorClass="bg-violet-500"
                    subValue={t.perCustomerAvg}
                    onClick={() => setDrillDownModal({ isOpen: true, type: 'aov', title: t.avgOrderValue })}
                />
            </div>
        )}

        {/* 3. Main Analytics Chart */}
        {widgetConfig.mainChart && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-800">{t.revenueProfitTrends}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{t.financialPerformanceOverTime}</p>
                        </div>
                        <div className="flex bg-gray-100 rounded-md p-0.5">
                            <button
                                onClick={() => setChartType('revenue')}
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${chartType === 'revenue' ? 'bg-white text-gray-900' : 'text-gray-500'}`}
                            >
                                {t.financeChart}
                            </button>
                            <button
                                onClick={() => setChartType('orders')}
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${chartType === 'orders' ? 'bg-white text-gray-900' : 'text-gray-500'}`}
                            >
                                {t.orders}
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
                                    contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: '10px'}}
                                    formatter={(value: number) => chartType === 'revenue' ? formatCurrency(value) : value}
                                />
                                <Area type="monotone" dataKey={chartType === 'revenue' ? 'revenue' : 'orders'} stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMain)" name={chartType === 'revenue' ? t.revenue : t.orders} />
                                {chartType === 'revenue' && (
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSec)" name={t.profit} />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution (Donut) */}
                {widgetConfig.categoryChart && (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col">
                        <h3 className="font-semibold text-gray-800 mb-1">{t.salesByCategory}</h3>
                        <p className="text-xs text-gray-400 mb-4">{t.topPerformingCats}</p>
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
                                <span className="text-xl font-bold text-gray-900">{categoryData.length}</span>
                                <span className="text-[10px] uppercase text-gray-400 font-medium">{t.categories}</span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {categoryData.slice(0, 3).map((cat, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS[idx]}}></div>
                                        <span className="text-gray-600 text-sm">{cat.name}</span>
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">{((cat.value / currentMetrics.revenue) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* 4. Bottom Section: Top Products & Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Top Products Table */}
            {widgetConfig.topProducts && (
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Package size={18} className="text-gray-400"/> {t.topProducts}
                        </h3>
                        <button onClick={() => setActiveTab('products')} className="text-xs font-medium text-blue-600 hover:underline">{t.viewInventory}</button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-medium sticky top-0">
                                <tr>
                                    <th className="px-5 py-2.5">{t.itemLabel}</th>
                                    <th className="px-5 py-2.5 text-center">{t.sales}</th>
                                    <th className="px-5 py-2.5 text-right">{t.revenue}</th>
                                    <th className="px-5 py-2.5 text-center">{t.stock}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topProducts.map((product, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400 w-4">#{idx+1}</span>
                                                <img src={product.image} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                                                <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{product.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="text-sm text-gray-600">{product.qty} {t.soldUnit}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-medium text-gray-700">{formatCurrency(product.revenue)}</td>
                                        <td className="px-5 py-3 text-center">
                                            <div className="w-14 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                                                <div className={`h-full rounded-full ${product.stock < 10 ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{width: `${Math.min(100, product.stock * 2)}%`}}></div>
                                            </div>
                                            <span className="text-[10px] text-gray-400">{product.stock} {t.leftUnit}</span>
                                        </td>
                                    </tr>
                                ))}
                                {topProducts.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">{t.noSalesInPeriod}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Operational Health / Alerts */}
            {widgetConfig.operationalHealth && (
                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-gray-400"/> {t.operationalHealth}
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center p-3 bg-amber-50/60 rounded-lg border border-amber-100/60">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white rounded-md text-amber-500"><AlertCircle size={16}/></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{t.pendingOrders}</p>
                                        <p className="text-xs text-gray-500">{t.needsConfirmation}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-amber-600">{state.orders.filter(o => o.status === OrderStatus.PENDING).length}</span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-rose-50/60 rounded-lg border border-rose-100/60">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white rounded-md text-rose-500"><Package size={16}/></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{t.lowStock}</p>
                                        <p className="text-xs text-gray-500">{t.restockRequired}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-rose-500">{lowStockCount}</span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-blue-50/60 rounded-lg border border-blue-100/60">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white rounded-md text-blue-500"><Users size={16}/></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{t.activeCustomersLabel}</p>
                                        <p className="text-xs text-gray-500">{t.inThisPeriod}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-blue-600">{new Set(currentOrders.map(o => o.customerPhone)).size}</span>
                            </div>
                        </div>
                    </div>

                    {widgetConfig.quickActions && (
                        <div className="bg-gray-900 rounded-xl p-5 text-white">
                            <h3 className="font-semibold mb-3">{t.quickActions}</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setActiveTab('products')} className="p-3 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1.5">
                                    <Package size={18} /> {t.addProduct}
                                </button>
                                <button onClick={() => setActiveTab('orders')} className="p-3 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1.5">
                                    <RefreshCw size={18} /> {t.processOrders}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Drill-down Modal */}
        <DrillDownModal />
    </div>
  );
};

export default DashboardStats;
