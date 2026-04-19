import React, { useState, useMemo } from 'react';
import { BackendContextType, Language, formatCurrency, Product } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import StockForecasting from './StockForecasting';
import BarcodeScanner from './BarcodeScanner';
import SupplierManager from './SupplierManager';
import WarehouseManager from './WarehouseManager';
import StockTakeManager from './StockTakeManager';
import { 
    Package, Search, Plus, Filter, FileText, ArrowDown, ArrowUp, AlertTriangle, 
    Download, Calendar, History, Box, ChevronDown, Check, FileDown, ArrowRight, TrendingDown, ScanLine, Truck, Building2, ClipboardCheck
} from 'lucide-react';

interface InventoryManagerProps {
    backend: BackendContextType;
    lang: Language;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, adjustStock } = backend;
  
  const [activeTab, setActiveTab] = useState<'stock' | 'history' | 'suppliers' | 'warehouses' | 'stocktake'>('stock');
  const [showForecast, setShowForecast] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  
  // Modal State - Replaced isImportModalOpen with transactionModalType to support IN and OUT
  const [transactionModalType, setTransactionModalType] = useState<'IN' | 'OUT' | null>(null);
  
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');

  // Derived Data
  const lowStockItems = useMemo(() => {
      let count = 0;
      state.products.forEach(p => {
          if (p.hasVariants) {
              p.variants.forEach(v => { if (v.stock < 10) count++; });
          } else {
              if (p.stock < 10) count++;
          }
      });
      return count;
  }, [state.products]);

  // Low Stock Details
  const lowStockDetails = useMemo(() => {
      const items: Array<{name: string, variant?: string, stock: number, sku: string, image: string}> = [];
      state.products.forEach(p => {
          if (p.hasVariants) {
              p.variants.forEach(v => {
                  if (v.stock < 10) {
                      items.push({
                          name: p.name,
                          variant: v.name,
                          stock: v.stock,
                          sku: v.sku,
                          image: p.images[0]
                      });
                  }
              });
          } else {
              if (p.stock < 10) {
                  items.push({
                      name: p.name,
                      stock: p.stock,
                      sku: p.sku,
                      image: p.images[0]
                  });
              }
          }
      });
      return items.sort((a, b) => a.stock - b.stock);
  }, [state.products]);

  const totalInventoryValue = useMemo(() => {
      return state.products.reduce((acc, p) => {
          if (p.hasVariants) {
              return acc + p.variants.reduce((vAcc, v) => vAcc + (v.stock * v.price), 0);
          }
          return acc + (p.stock * p.price);
      }, 0);
  }, [state.products]);

  // Helper to get current stock of selected item for validation
  const getCurrentSelectedStock = () => {
      if (!selectedProduct) return 0;
      const product = state.products.find(p => p.id === selectedProduct);
      if (!product) return 0;
      
      if (product.hasVariants && selectedVariant) {
          const v = product.variants.find(v => v.id === selectedVariant);
          return v ? v.stock : 0;
      }
      return product.stock;
  };

  // Handle Export to CSV
  const handleExport = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      const bom = "\uFEFF"; // Byte Order Mark for UTF-8 in Excel
      csvContent += bom;

      const escapeCSV = (str: string | number) => {
          const stringValue = String(str);
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
              return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
      };

      if (activeTab === 'stock') {
          const headers = ["Product Name", "Variant", "SKU", "Stock", "Cost Price", "Selling Price", "Total Value"];
          csvContent += headers.join(",") + "\n";

          state.products.forEach(p => {
              if (p.hasVariants) {
                  p.variants.forEach(v => {
                    csvContent += [
                            escapeCSV(p.name),
                            escapeCSV(v.name),
                            escapeCSV(v.sku),
                          v.stock,
                          p.costPrice,
                          v.price,
                          v.stock * v.price
                      ].join(",") + "\n";
                  });
              } else {
                  csvContent += [
                      escapeCSV(p.name),
                      "-",
                      escapeCSV(p.sku),
                      p.stock,
                      p.costPrice,
                      p.price,
                      p.stock * p.price
                  ].join(",") + "\n";
              }
          });
      } else {
          const headers = ["Date", "Type", "Product", "Variant", "Quantity Change", "Stock Before", "Stock After", "Reason"];
          csvContent += headers.join(",") + "\n";

          state.inventoryLogs.forEach(log => {
              csvContent += [
                  escapeCSV(new Date(log.createdAt).toLocaleString()),
                  log.type,
                  escapeCSV(log.productName),
                  escapeCSV(log.variantName || "-"),
                  log.type === 'OUT' ? -log.quantity : log.quantity,
                  log.stockBefore,
                  log.stockAfter,
                  escapeCSV(log.reason)
              ].join(",") + "\n";
          });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `unishop_inventory_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Handle Transaction Submit
  const handleTransactionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProduct || quantity <= 0 || !transactionModalType) return;
      
      const product = state.products.find(p => p.id === selectedProduct);
      if(!product) return;

      adjustStock(
          selectedProduct, 
          product.hasVariants ? selectedVariant : undefined, 
          quantity, 
          transactionModalType, 
          reason || (transactionModalType === 'IN' ? 'Manual Import' : 'Manual Export')
      );

      // Reset
      setTransactionModalType(null);
      setSelectedProduct('');
      setSelectedVariant('');
      setQuantity(0);
      setReason('');
  };

  // Stock List Render
  const renderStockList = () => {
      const flattenedInventory: Array<{
          id: string, 
          name: string, 
          variant?: string, 
          sku: string, 
          stock: number, 
          price: number,
          image: string
      }> = [];

      state.products.forEach(p => {
          if (p.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            if (p.hasVariants) {
                p.variants.forEach(v => {
                    flattenedInventory.push({
                        id: p.id, // Keep product ID for reference
                        name: p.name,
                        variant: v.name,
                        sku: v.sku,
                        stock: v.stock,
                        price: v.price,
                        image: p.images[0]
                    });
                });
            } else {
                flattenedInventory.push({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    stock: p.stock,
                    price: p.price,
                    image: p.images[0]
                });
            }
          }
      });

      return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                      <tr>
                          <th className="px-6 py-4">{t.products}</th>
                          <th className="px-6 py-4">{t.sku}</th>
                          <th className="px-6 py-4 text-center">{t.currentStock}</th>
                          <th className="px-6 py-4 text-right">{t.totalValue}</th>
                          <th className="px-6 py-4 text-center">{t.status}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                      {flattenedInventory.map((item, idx) => (
                          <tr key={`${item.id}-${item.variant || 'main'}-${idx}`} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                      <div>
                                          <p className="font-bold text-slate-900">{item.name}</p>
                                          {item.variant && <p className="text-xs text-indigo-600 font-medium">{item.variant}</p>}
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-500">{item.sku}</td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`font-bold ${item.stock < 10 ? 'text-rose-600' : 'text-slate-700'}`}>{item.stock}</span>
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-slate-700">
                                  {formatCurrency(item.stock * item.price)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  {item.stock < 10 ? (
                                      <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200 flex items-center justify-center gap-1 w-fit mx-auto">
                                          <AlertTriangle size={12}/> {t.lowStockLabel}
                                      </span>
                                  ) : (
                                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1 w-fit mx-auto">
                                          <Check size={12}/> {t.inStock}
                                      </span>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
                  </div>
          </div>
      );
  };

  // History List Render
  const renderHistory = () => {
      const filteredLogs = state.inventoryLogs.filter(log => {
          const matchSearch = log.productName.toLowerCase().includes(searchTerm.toLowerCase()) || log.reason.toLowerCase().includes(searchTerm.toLowerCase());
          const matchType = filterType === 'ALL' || log.type === filterType;
          return matchSearch && matchType;
      });

      return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                      <tr>
                          <th className="px-6 py-4">{t.placedAt}</th>
                          <th className="px-6 py-4">{t.transactionType}</th>
                          <th className="px-6 py-4">{t.products}</th>
                          <th className="px-6 py-4 text-center">{t.change}</th>
                          <th className="px-6 py-4 text-center">{t.stock}</th>
                          <th className="px-6 py-4">{t.reason}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredLogs.map((log, idx) => (
                          <tr key={log.id || `log-${idx}`} className="hover:bg-slate-50">
                              <td className="px-6 py-4 text-slate-500">
                                  {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                                      log.type === 'IN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      log.type === 'OUT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                      'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                      {log.type === 'IN' ? t.stockIn : log.type === 'OUT' ? t.stockOut : t.adjustment}
                                  </span>
                              </td>
                              <td className="px-6 py-4">
                                  <p className="font-medium text-slate-900">{log.productName}</p>
                                  {log.variantName && <p className="text-xs text-slate-500">{log.variantName}</p>}
                              </td>
                              <td className="px-6 py-4 text-center font-bold">
                                  <span className={log.type === 'IN' ? 'text-emerald-600' : log.type === 'OUT' ? 'text-rose-600' : 'text-blue-600'}>
                                      {log.type === 'IN' || (log.type === 'ADJUSTMENT' && log.quantity > 0) ? '+' : '-'}{log.quantity}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-center text-slate-500">
                                  {log.stockBefore} → <span className="font-bold text-slate-800">{log.stockAfter}</span>
                              </td>
                              <td className="px-6 py-4 text-slate-600 italic">
                                  {log.reason}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
                  </div>
          </div>
      );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                <div className="flex items-center gap-3 mb-2 opacity-90">
                    <Box size={20} />
                    <span className="font-semibold text-sm uppercase tracking-wide">{t.totalValue}</span>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(totalInventoryValue)}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-rose-600 mb-1">
                        <AlertTriangle size={18} />
                        <span className="font-bold text-sm uppercase">{t.lowStock}</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{lowStockItems}</p>
                    <p className="text-xs text-slate-500 mt-1">Products below 10 units</p>
                </div>
                <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                    <ArrowDown size={24} />
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center gap-3">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setTransactionModalType('IN')}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <ArrowDown size={18} /> {t.importStock}
                    </button>
                    <button 
                        onClick={() => setTransactionModalType('OUT')}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <ArrowUp size={18} /> {t.exportStock}
                    </button>
                </div>
                <button 
                    onClick={handleExport}
                    className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                    <FileDown size={18} /> {t.exportExcel}
                </button>
            </div>
        </div>

        {/* Cảnh báo tồn kho thấp */}
        {lowStockDetails.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className="text-rose-600" />
                        <div>
                            <h3 className="font-bold text-rose-900">Cảnh Báo Tồn Kho Thấp</h3>
                            <p className="text-sm text-rose-700">{lowStockDetails.length} sản phẩm cần nhập hàng</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setActiveTab('stock'); }}
                        className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors"
                    >
                        Xem tất cả
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockDetails.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-rose-100 flex items-center gap-3">
                            <img src={item.image} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
                                {item.variant && <p className="text-xs text-slate-500">{item.variant}</p>}
                                <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-rose-600">{item.stock}</p>
                                <p className="text-xs text-rose-500">còn lại</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-2">
            <div className="flex gap-6">
                <button 
                    onClick={() => setActiveTab('stock')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'stock' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Package size={18} /> {t.stockList}
                    {activeTab === 'stock' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <History size={18} /> {t.history}
                    {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setShowForecast(true)}
                    className="pb-3 font-bold text-sm flex items-center gap-2 transition-all relative text-violet-600 hover:text-violet-800"
                >
                    <TrendingDown size={18} /> Dự Báo Tồn Kho
                    {lowStockItems > 0 && <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{lowStockItems}</span>}
                </button>
                <button 
                    onClick={() => setActiveTab('suppliers')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'suppliers' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Truck size={18} /> Nhà cung cấp
                    {activeTab === 'suppliers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('warehouses')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'warehouses' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Building2 size={18} /> Kho hàng
                    {activeTab === 'warehouses' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('stocktake')}
                    className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all relative ${activeTab === 'stocktake' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ClipboardCheck size={18} /> Kiểm kê
                    {activeTab === 'stocktake' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                </button>
            </div>

            {activeTab !== 'suppliers' && activeTab !== 'warehouses' && activeTab !== 'stocktake' && (
            <div className="flex gap-3 w-full sm:w-auto">
                <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors font-bold text-sm"
                    title="Quét mã vạch"
                >
                    <ScanLine size={16} /> Quét
                </button>
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={t.search} 
                        className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'history' && (
                    <div className="relative">
                        <select 
                            className="pl-3 pr-8 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                        >
                            <option value="ALL">{t.all}</option>
                            <option value="IN">{t.stockIn}</option>
                            <option value="OUT">{t.stockOut}</option>
                        </select>
                        <Filter size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                )}
            </div>
            )}
        </div>

        {/* Content */}
        {activeTab === 'stock' ? renderStockList() : renderHistory()}

        {/* Transaction Modal (Combined Import/Export) */}
        {transactionModalType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setTransactionModalType(null)}></div>
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className={`font-bold text-lg flex items-center gap-2 ${transactionModalType === 'IN' ? 'text-emerald-700' : 'text-amber-600'}`}>
                            {transactionModalType === 'IN' ? <ArrowDown size={20}/> : <ArrowUp size={20}/>}
                            {transactionModalType === 'IN' ? t.importStock : t.exportStock}
                        </h3>
                        <button onClick={() => setTransactionModalType(null)}><span className="text-slate-400 hover:text-slate-600">✕</span></button>
                    </div>
                    
                    <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.selectProduct}</label>
                            <select 
                                required
                                className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={selectedProduct}
                                onChange={(e) => { setSelectedProduct(e.target.value); setSelectedVariant(''); }}
                            >
                                <option value="">-- {t.selectProduct} --</option>
                                {state.products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedProduct && state.products.find(p => p.id === selectedProduct)?.hasVariants && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.variant}</label>
                                <select 
                                    required
                                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={selectedVariant}
                                    onChange={(e) => setSelectedVariant(e.target.value)}
                                >
                                    <option value="">-- {t.selectVariant} --</option>
                                    {state.products.find(p => p.id === selectedProduct)?.variants.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.quantity}</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        required min="1"
                                        max={transactionModalType === 'OUT' ? getCurrentSelectedStock() : undefined}
                                        className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={quantity === 0 ? '' : quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    />
                                    {transactionModalType === 'OUT' && selectedProduct && (
                                        <div className="absolute right-0 -bottom-5 text-[10px] text-slate-500">
                                            Max: {getCurrentSelectedStock()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t.note}</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={transactionModalType === 'IN' ? t.placeholderIn || "e.g. PO-2024-001" : t.placeholderOut || "e.g. Damaged / Return"}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setTransactionModalType(null)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold"
                            >
                                {t.cancel}
                            </button>
                            <button 
                                type="submit" 
                                className={`px-6 py-2 text-white rounded-lg text-sm font-bold shadow-md transition-colors ${
                                    transactionModalType === 'IN' 
                                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                                    : 'bg-amber-500 hover:bg-amber-600'
                                }`}
                            >
                                {t.save}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
            <SupplierManager 
                suppliers={state.suppliers || []} 
                purchaseOrders={state.purchaseOrders || []} 
                products={state.products || []}
                onAddSupplier={async (data) => {
                    await fetch('/api/suppliers', { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} });
                }}
                onUpdateSupplier={async (id, data) => {
                    await fetch(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} });
                }}
                onDeleteSupplier={async (id) => {
                    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
                }}
                onCreatePO={async (data) => {
                    await fetch('/api/purchase-orders', { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} });
                }}
                onUpdatePOStatus={async (id, status) => {
                    await fetch(`/api/purchase-orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), headers: {'Content-Type': 'application/json'} });
                }}
            />
        )}

        {/* Warehouses Tab */}
        {activeTab === 'warehouses' && (
            <WarehouseManager 
                warehouses={state.warehouses || []}
                products={state.products || []}
                onAddWarehouse={async (data) => {
                    await fetch('/api/warehouses', { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} });
                }}
                onUpdateWarehouse={async (id, data) => {
                    await fetch(`/api/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} });
                }}
                onDeleteWarehouse={async (id) => {
                    await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
                }}
                onTransfer={async (data) => {
                    await fetch('/api/inventory/transfer', { method: 'POST', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} });
                }}
            />
        )}

        {/* Stock Take Tab */}
        {activeTab === 'stocktake' && (
            <StockTakeManager 
                stockTakes={state.stockTakes || []}
                products={state.products || []}
                onRecordStockTake={async (data) => {
                    await fetch('/api/inventory/stock-take', { 
                        method: 'POST', 
                        body: JSON.stringify({...data, performedBy: 'admin'}), 
                        headers: {'Content-Type': 'application/json'} 
                    });
                }}
            />
        )}

        {/* Stock Forecasting Modal */}
        {showForecast && <StockForecasting onClose={() => setShowForecast(false)} />}

        {/* Barcode Scanner Modal */}
        {showScanner && (
            <BarcodeScanner 
                onClose={() => setShowScanner(false)} 
                onProductFound={(product) => {
                    setSearchTerm(product.barcode || product.sku || product.name);
                }} 
            />
        )}
    </div>
  );
};

export default InventoryManager;