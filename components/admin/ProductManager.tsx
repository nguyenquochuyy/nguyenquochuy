import React, { useState, useMemo } from 'react';
import { BackendContextType, Product, Language, formatCurrency, OrderStatus } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import ProductForm from './ProductForm';
import ConfirmModal from './ConfirmModal';
import { 
  Package, Search, Plus, Filter, Trash2, Edit, Eye, X, 
  ChevronLeft, ChevronRight, CheckCircle, Truck, FileText, Printer, AlertTriangle
} from 'lucide-react';

interface ProductManagerProps {
  backend: BackendContextType;
  lang: Language;
}

const ITEMS_PER_PAGE = 10;

const ProductManager: React.FC<ProductManagerProps> = ({ backend, lang }) => {
  const t = TRANSLATIONS[lang];
  const { state, addProduct, updateProduct, deleteProduct } = backend;

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  
  // Filter States
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Hidden'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper
  const getCategoryName = (id: string) => state.categories.find(c => c.id === id)?.name || id;

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return state.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchStock = stockFilter === 'All' 
        ? true 
        : stockFilter === 'Low' ? p.stock < 10 
        : !p.isVisible;
      
      return matchSearch && matchCategory && matchStock;
    });
  }, [state.products, productSearch, selectedCategory, stockFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handlers
  const handleEdit = (product: Product) => {
      setEditingProduct(product);
  };

  const ProductDetailModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="text-indigo-600" /> Product Details
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
                            <img src={img} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {getCategoryName(product.category)}
                    </span>
                    {!product.isVisible && <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Hidden</span>}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 font-mono">SKU: {product.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">{t.price}</span>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">{t.stock}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                       <div className={`w-2.5 h-2.5 rounded-full ${product.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                       <span className="text-lg font-bold text-slate-800">{product.stock}</span>
                    </div>
                  </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-2">{t.description}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
                </div>

                {product.hasVariants && (
                    <div>
                        <h4 className="font-bold text-slate-900 mb-2">{t.variants}</h4>
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-3 py-2">Variant</th>
                                        <th className="px-3 py-2">Price</th>
                                        <th className="px-3 py-2">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {product.variants.map(v => (
                                        <tr key={v.id}>
                                            <td className="px-3 py-2 font-medium">{v.name}</td>
                                            <td className="px-3 py-2">{formatCurrency(v.price)}</td>
                                            <td className="px-3 py-2">{v.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isAddingProduct) {
      return <ProductForm onSubmit={(data) => { addProduct(data); setIsAddingProduct(false); }} onCancel={() => setIsAddingProduct(false)} lang={lang} />;
  }

  if (editingProduct) {
      return <ProductForm initialData={editingProduct} onSubmit={(data) => { updateProduct(editingProduct.id, data); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} lang={lang} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">{t.productMgmt}</h2>
                <p className="text-slate-500 text-sm mt-1">Manage your catalog, prices, and stock.</p>
            </div>
            <button 
                onClick={() => setIsAddingProduct(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-medium active:scale-95"
            >
                <Plus size={18} />
                {t.addProduct}
            </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setCurrentPage(1); }}
                />
            </div>
            <div className="flex gap-3">
                <select 
                    className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50"
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                >
                    <option value="All">{t.all} Categories</option>
                    {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select 
                    className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50"
                    value={stockFilter}
                    onChange={(e) => { setStockFilter(e.target.value as any); setCurrentPage(1); }}
                >
                    <option value="All">{t.all} Status</option>
                    <option value="Low">{t.lowStock}</option>
                    <option value="Hidden">{t.hidden}</option>
                </select>
            </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Price</th>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-center">Stock</th>
                            <th className="px-6 py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayedProducts.map(product => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                            <img src={product.images[0]} className="w-full h-full object-cover" />
                                            {!product.isVisible && <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center"><Eye size={16} className="text-white"/></div>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 line-clamp-1">{product.name}</p>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        {getCategoryName(product.category)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="font-bold text-sm text-slate-900">{formatCurrency(product.price)}</p>
                                    {product.costPrice > 0 && <p className="text-[10px] text-slate-400">Cost: {formatCurrency(product.costPrice)}</p>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock < 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => setViewingProduct(product)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye size={18}/></button>
                                        <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18}/></button>
                                        <button onClick={() => setDeletingProductId(product.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    <Package size={48} className="mx-auto mb-3 opacity-20"/>
                                    <p>No products found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-slate-600">Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>

        {viewingProduct && <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} />}
        
        <ConfirmModal
            isOpen={!!deletingProductId}
            onClose={() => setDeletingProductId(null)}
            onConfirm={() => {
                if (deletingProductId) {
                    deleteProduct(deletingProductId);
                }
            }}
            title="Xác nhận xóa sản phẩm"
            message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
            lang={lang}
        />
    </div>
  );
};

export default ProductManager;