import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingDown, AlertTriangle, RefreshCw, Activity,
  Package, Clock, BarChart2, X,
} from 'lucide-react';

interface ForecastPoint {
  date: string;
  actualStock?: number;
  predictedStock: number;
  dailySales: number;
}

interface ProductForecast {
  productId: string;
  productName: string;
  productImage: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilEmpty: number;
  isLowStock: boolean;
  reorderPoint: number;
  forecastPoints: ForecastPoint[];
}

interface StockForecastingProps {
  onClose?: () => void;
}

const API = '/api';

/* ── mini sparkline ── */
const MiniSparkline: React.FC<{ points: ForecastPoint[]; isLow: boolean }> = ({ points, isLow }) => {
  const slice = points.slice(-20);
  if (slice.length < 2) return null;
  const W = 72, H = 28;
  const max = Math.max(...slice.map(p => p.predictedStock), 1);
  const pts = slice.map((p, i) => {
    const x = ((i / (slice.length - 1)) * W).toFixed(1);
    const y = (H - (p.predictedStock / max) * H).toFixed(1);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} style={{ display: 'block', flexShrink: 0 }}>
      <polyline points={pts} fill="none"
        stroke={isLow ? '#f43f5e' : '#6366f1'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StockForecasting: React.FC<StockForecastingProps> = ({ onClose }) => {
  const [forecasts, setForecasts]       = useState<ProductForecast[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [forecastDays, setForecastDays] = useState(30);
  const [selectedId, setSelectedId]     = useState<string>('');
  const [filterMode, setFilterMode]     = useState<'ALL' | 'LOW'>('ALL');

  const loadForecast = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/inventory/forecast?days=${forecastDays}`);
      if (!res.ok) throw new Error('Không thể tải dữ liệu dự báo');
      const data = await res.json();
      const list: ProductForecast[] = data.data?.forecasts ?? [];
      setForecasts(list);
      setSelectedId(prev => (list.find(f => f.productId === prev) ? prev : list[0]?.productId ?? ''));
    } catch (e: any) {
      setError(e.message ?? 'Lỗi tải dự báo');
    } finally { setLoading(false); }
  }, [forecastDays]);

  useEffect(() => { loadForecast(); }, [loadForecast]);

  const today     = new Date().toISOString().slice(0, 10);
  const lowCount  = forecasts.filter(f => f.isLowStock).length;
  const displayed = filterMode === 'LOW' ? forecasts.filter(f => f.isLowStock) : forecasts;
  const product   = forecasts.find(f => f.productId === selectedId) ?? null;

  /* ── Urgency badge ── */
  const DaysBadge: React.FC<{ days: number }> = ({ days }) => {
    if (days >= 999) return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-100 text-emerald-700 border-emerald-200">∞ ngày</span>;
    if (days < 7)   return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border bg-rose-100 text-rose-700 border-rose-200">{days} ngày</span>;
    if (days < 14)  return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border bg-amber-100 text-amber-700 border-amber-200">{days} ngày</span>;
    return                 <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-100 text-emerald-700 border-emerald-200">{days} ngày</span>;
  };

  /* ── Big area chart ── */
  const BigChart: React.FC<{ p: ProductForecast }> = ({ p }) => {
    const pts = p.forecastPoints;
    if (pts.length < 2) return <p className="text-sm text-slate-400 text-center py-6">Chưa đủ dữ liệu.</p>;

    const W = 500, H = 120;
    const max  = Math.max(...pts.map(x => x.predictedStock), 1);
    const sx   = (i: number) => ((i / (pts.length - 1)) * W).toFixed(1);
    const sy   = (v: number) => (H - Math.max(0, v / max) * H).toFixed(1);
    const past = pts.filter(x => x.date <= today);
    const fut  = pts.filter(x => x.date > today);

    const linePath = (arr: ForecastPoint[]) =>
      arr.map((x, i) => `${i === 0 ? 'M' : 'L'}${sx(pts.indexOf(x))},${sy(x.predictedStock)}`).join(' ');

    const areaPath = (arr: ForecastPoint[]) => {
      if (arr.length < 2) return '';
      const fi = pts.indexOf(arr[0]), li = pts.indexOf(arr[arr.length - 1]);
      return arr.map((x, i) =>
        `${i === 0 ? 'M' : 'L'}${sx(pts.indexOf(x))},${sy(x.predictedStock)}`
      ).join(' ') + ` L${sx(li)},${H} L${sx(fi)},${H} Z`;
    };

    const rY   = sy(p.reorderPoint);
    const todX = past.length > 0 ? sx(past.length - 1) : null;
    const lbls = [0, Math.round(pts.length * 0.25), Math.round(pts.length * 0.5), Math.round(pts.length * 0.75), pts.length - 1];

    return (
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
          {[0.25, 0.5, 0.75].map(r => <line key={r} x1="0" y1={H*(1-r)} x2={W} y2={H*(1-r)} stroke="#e2e8f0" strokeWidth="0.8" />)}
          <line x1="0" y1={rY} x2={W} y2={rY} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="6,4" />
          {todX && <line x1={todX} y1="0" x2={todX} y2={H} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,3" />}
          {past.length > 1 && <path d={areaPath(past)} fill="#6366f1" opacity="0.13" />}
          {fut.length  > 1 && <path d={areaPath(fut)}  fill="#f43f5e" opacity="0.08" />}
          {past.length > 1 && <path d={linePath(past)} fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" />}
          {fut.length  > 1 && <path d={linePath(fut)}  fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeDasharray="6,3" strokeLinecap="round" />}
        </svg>
        <div className="flex justify-between mt-1">
          {lbls.map(i => (
            <span key={i} className="text-[10px] text-slate-400">
              {new Date(pts[i]?.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-[15px] mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-indigo-500 rounded" />Tồn kho thực tế</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-rose-400 rounded" />Dự báo tương lai</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-amber-400 rounded" />Ngưỡng tái đặt hàng</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-px h-3 bg-slate-400" />Hôm nay</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Modal — dọc, max-height scroll */}
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '92vh' }}>

        {/* ─ Header ─ */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center gap-3">
            <Activity size={20} />
            <div>
              <h2 className="font-bold text-base leading-tight">Dự Báo Tồn Kho</h2>
              <p className="text-indigo-200 text-xs">Thuật toán trung bình động (Moving Average)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={forecastDays} onChange={e => setForecastDays(Number(e.target.value))}
              className="bg-white/20 text-white text-sm rounded-lg px-3 py-1.5 border border-white/30 outline-none cursor-pointer">
              <option value={7} className="text-slate-900">7 ngày tới</option>
              <option value={14} className="text-slate-900">14 ngày tới</option>
              <option value={30} className="text-slate-900">30 ngày tới</option>
              <option value={60} className="text-slate-900">60 ngày tới</option>
            </select>
            <button onClick={loadForecast} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ─ Body ─ */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <RefreshCw size={30} className="animate-spin text-indigo-400 mb-3" />
            <p className="text-slate-400 text-sm">Đang tính toán dự báo...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <AlertTriangle size={30} className="text-rose-400 mb-3" />
            <p className="text-rose-600 font-semibold text-sm mb-3">{error}</p>
            <button onClick={loadForecast} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Thử lại</button>
          </div>
        ) : (
          /* ─ Hai cột trong body ─ */
          <div className="flex flex-1 overflow-hidden">

            {/* CỘT TRÁI — danh sách sản phẩm có ảnh */}
            <div className="flex flex-col border-r border-slate-100" style={{ width: 320, flexShrink: 0 }}>
              {/* Filter tabs */}
              <div className="flex-shrink-0 flex gap-2 p-3 border-b border-slate-100">
                <button onClick={() => setFilterMode('ALL')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterMode === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Tất cả ({forecasts.length})
                </button>
                <button onClick={() => setFilterMode('LOW')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ${filterMode === 'LOW' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <AlertTriangle size={11} />Cần nhập ({lowCount})
                </button>
              </div>

              {/* Danh sách có ảnh */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {displayed.length === 0 && (
                  <p className="p-5 text-center text-sm text-slate-400">Không có sản phẩm</p>
                )}
                {displayed.map(f => (
                  <button key={f.productId} onClick={() => setSelectedId(f.productId)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-3 hover:bg-slate-50 transition-colors border-l-2 ${selectedId === f.productId ? 'bg-indigo-50 border-indigo-500' : 'border-transparent'}`}>
                    {/* Ảnh sản phẩm */}
                    <div className="relative flex-shrink-0">
                      {f.productImage
                        ? <img src={f.productImage} alt={f.productName} className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm" />
                        : <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Package size={16} className="text-slate-400" />
                          </div>
                      }
                      {f.isLowStock && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    {/* Tên + badge */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-xs truncate leading-snug">{f.productName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] text-slate-500">Tồn: <strong>{f.currentStock}</strong></span>
                        <DaysBadge days={f.daysUntilEmpty} />
                      </div>
                    </div>
                    {/* Mini chart */}
                    <MiniSparkline points={f.forecastPoints} isLow={f.isLowStock} />
                  </button>
                ))}
              </div>
            </div>

            {/* CỘT PHẢI — chi tiết */}
            <div className="flex-1 overflow-y-auto">
              {!product ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <BarChart2 size={48} className="mb-3" />
                  <p className="text-sm">Chọn sản phẩm để xem dự báo</p>
                </div>
              ) : (
                <div className="p-5 space-y-5">

                  {/* Product header */}
                  <div className="flex items-center gap-[15px]">
                    {product.productImage
                      ? <img src={product.productImage} alt={product.productName} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-md" />
                      : <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Package size={24} className="text-slate-400" />
                        </div>
                    }
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{product.productName}</h3>
                      {product.isLowStock
                        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200 mt-1">
                            <AlertTriangle size={12} />Cần nhập hàng sớm
                          </span>
                        : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 mt-1">
                            ✓ Tồn kho ổn định
                          </span>
                      }
                    </div>
                  </div>

                  {/* Cảnh báo chi tiết */}
                  {product.isLowStock && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-3">
                      <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                      <p className="text-rose-700 text-sm">
                        Tốc độ bán ~<strong>{product.avgDailySales.toFixed(1)} sp/ngày</strong>.{' '}
                        {product.daysUntilEmpty < 999
                          ? <>Hàng sẽ hết sau khoảng <strong>{product.daysUntilEmpty} ngày</strong>.</>
                          : 'Tốc độ bán rất thấp.'
                        }
                        {' '}Nên đặt thêm ít nhất <strong>{product.reorderPoint} sản phẩm</strong>.
                      </p>
                    </div>
                  )}

                  {/* 4 stat cards — static Tailwind classes */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 border bg-indigo-50 border-indigo-100">
                      <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold mb-1">
                        <Package size={13} />Tồn kho hiện tại
                      </div>
                      <p className="text-3xl font-bold text-indigo-700">{product.currentStock}</p>
                      <p className="text-xs text-indigo-400 mt-0.5">sản phẩm</p>
                    </div>
                    <div className="rounded-xl p-3 border bg-violet-50 border-violet-100">
                      <div className="flex items-center gap-1.5 text-violet-600 text-xs font-semibold mb-1">
                        <TrendingDown size={13} />TB bán / ngày
                      </div>
                      <p className="text-3xl font-bold text-violet-700">{product.avgDailySales.toFixed(1)}</p>
                      <p className="text-xs text-violet-400 mt-0.5">sản phẩm / ngày</p>
                    </div>
                    <div className={`rounded-xl p-3 border ${product.daysUntilEmpty < 14 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${product.daysUntilEmpty < 14 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        <Clock size={13} />Số ngày còn hàng
                      </div>
                      <p className={`text-3xl font-bold ${product.daysUntilEmpty < 14 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {product.daysUntilEmpty >= 999 ? '∞' : product.daysUntilEmpty}
                      </p>
                      <p className={`text-xs mt-0.5 ${product.daysUntilEmpty < 14 ? 'text-rose-400' : 'text-emerald-400'}`}>ngày nữa hết hàng</p>
                    </div>
                    <div className="rounded-xl p-3 border bg-amber-50 border-amber-100">
                      <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold mb-1">
                        <AlertTriangle size={13} />Ngưỡng tái đặt hàng
                      </div>
                      <p className="text-3xl font-bold text-amber-700">{product.reorderPoint}</p>
                      <p className="text-xs text-amber-400 mt-0.5">sản phẩm tối thiểu</p>
                    </div>
                  </div>

                  {/* Biểu đồ */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-3">
                      <BarChart2 size={15} className="text-indigo-500" />
                      Biểu đồ dự báo tồn kho — {forecastDays} ngày tới
                    </h4>
                    <BigChart p={product} />
                  </div>

                  {/* Bảng chi tiết */}
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm mb-2">Chi tiết dự báo 14 ngày tới</h4>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                          <tr>
                            <th className="px-4 py-2 text-left">Ngày</th>
                            <th className="px-4 py-2 text-center">Tồn dự báo</th>
                            <th className="px-4 py-2 text-center">Bán / ngày</th>
                            <th className="px-4 py-2 text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {product.forecastPoints
                            .filter(pt => pt.date >= today)
                            .slice(0, 14)
                            .map(pt => (
                              <tr key={pt.date} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-2 text-slate-600">
                                  {new Date(pt.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="px-4 py-2 text-center font-bold text-slate-800">{pt.predictedStock}</td>
                                <td className="px-4 py-2 text-center text-slate-500">{pt.dailySales.toFixed(1)}</td>
                                <td className="px-4 py-2 text-center">
                                  {pt.predictedStock <= product.reorderPoint
                                    ? <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold border border-rose-200">⚠ Tồn thấp</span>
                                    : <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold border border-emerald-200">✓ Bình thường</span>
                                  }
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default StockForecasting;
