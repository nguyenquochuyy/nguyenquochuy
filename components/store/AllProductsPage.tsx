import React, { useState, useMemo, useEffect } from 'react';
import { Product, formatCurrency, Category } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { 
  ChevronRight, Filter, Search, ShoppingCart, Heart, Eye, X, 
  AlertTriangle, ChevronLeft, ChevronDown
} from 'lucide-react';

interface AllProductsPageProps {
  products: Product[];
  categories: Category[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateHome: () => void;
  initialSearchTerm?: string;
  initialCategoryFilter?: string;
}

const ITEMS_PER_PAGE = 12;

const AllProductsPage: React.FC<AllProductsPageProps> = ({ 
  products, categories, onProductClick, onAddToCart, onNavigateHome,
  initialSearchTerm = '', initialCategoryFilter = 'All'
}) => {
  const t = TRANSLATIONS['vi'];
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOption, setSortOption] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all');
  const [discountFilter, setDiscountFilter] = useState<boolean>(false);

  const getDiscountedPrice = (product: Product) => {
    if (!product.discount) return product.price;
    if (product.discountType === 'FIXED') return Math.max(0, product.price - product.discount);
    return Math.max(0, product.price * (1 - product.discount / 100));
  };
  
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Category';
  const rootCategories = useMemo(() => categories.filter(c => !c.parentId).sort((a, b) => a.order - b.order), [categories]);
  const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId).sort((a, b) => a.order - b.order);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]);
  };

  const processedProducts = useMemo(() => {
      let result = products.filter(p => {
        if (!p.isVisible) return false;

        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter ||
                                categories.find(c => c.id === p.category)?.parentId === categoryFilter;

        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

        const price = getDiscountedPrice(p);
        const matchesMinPrice = priceRange.min === '' || price >= parseFloat(priceRange.min);
        const matchesMaxPrice = priceRange.max === '' || price <= parseFloat(priceRange.max);

        const matchesStock = stockFilter === 'all' ||
                           (stockFilter === 'in-stock' && p.stock > 0) ||
                           (stockFilter === 'low-stock' && p.stock > 0 && p.stock < 10);

        const matchesDiscount = !discountFilter || (discountFilter && p.discount > 0);

        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesStock && matchesDiscount;
      });

      if (sortOption === 'price-asc') {
          result.sort((a, b) => getDiscountedPrice(a) - getDiscountedPrice(b));
      } else if (sortOption === 'price-desc') {
          result.sort((a, b) => getDiscountedPrice(b) - getDiscountedPrice(a));
      } else {
          result.reverse();
      }
      return result;
  }, [products, searchTerm, categoryFilter, priceRange, sortOption, categories, stockFilter, discountFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, priceRange, sortOption, stockFilter, discountFilter]);
  useEffect(() => {
    if (initialCategoryFilter !== 'All') {
        const parent = categories.find(c => c.id === initialCategoryFilter)?.parentId;
        if (parent) setExpandedCategories([parent]);
    }
  }, [initialCategoryFilter, categories]);

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = processedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setPriceRange({ min: '', max: '' });
    setStockFilter('all');
    setDiscountFilter(false);
  };

  const StockBadge = ({ stock }: { stock: number }) => {
     if (stock === 0) {
         return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-red-200"><X size={10}/> {t.outOfStock}</span>;
     }
     if (stock < 10) {
         return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-amber-200"><AlertTriangle size={10}/> {t.lowStockLabel}</span>;
     }
     return null;
  };

  // FIX: Changed component to be of type React.FC to correctly handle React's special 'key' prop.
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const finalPrice = getDiscountedPrice(product);
    const hasDiscount = product.discount > 0;
    const isOutOfStock = product.stock === 0;

    return (
        <div 
            onClick={() => onProductClick(product)}
            className="group bg-white rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-100 flex flex-col relative cursor-pointer"
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                />
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    <StockBadge stock={product.stock} />
                    {hasDiscount && !isOutOfStock && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        -{product.discount}{product.discountType === 'PERCENT' ? '%' : 'đ'}
                        </span>
                    )}
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-rose-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 duration-300 shadow-sm">
                    <Heart size={18} />
                </button>
                <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100">
                    {!isOutOfStock && !product.hasVariants && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} 
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={16}/> Thêm vào giỏ
                        </button>
                    )}
                    <button className="w-full bg-white/90 backdrop-blur text-slate-900 py-3 rounded-xl font-bold text-sm shadow-xl border border-white hover:bg-white transition-colors flex items-center justify-center gap-2">
                        <Eye size={16}/> Xem chi tiết
                    </button>
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2">{getCategoryName(product.category)}</p>
                <h3 className="text-slate-900 font-bold text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.5em]">
                    {product.name}
                </h3>
                <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-3">
                    <div className="flex flex-col">
                        <span className={`text-xl font-extrabold ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>{formatCurrency(finalPrice)}</span>
                        {hasDiscount && !isOutOfStock && (<span className="text-xs text-slate-400 line-through font-medium">{formatCurrency(product.price)}</span>)}
                    </div>
                    {product.hasVariants && (
                        <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-wide">
                            + Tùy chọn
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };
  
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <button onClick={onNavigateHome} className="hover:text-indigo-600 transition-colors">Trang chủ</button>
          <ChevronRight size={14} />
          <span className="font-bold text-slate-700">Tất Cả Sản Phẩm</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-[15px]">
          <aside className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 self-start lg:sticky top-28">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Filter size={18} /> Bộ lọc</h2>
              <button onClick={handleResetFilters} className="text-xs font-bold text-indigo-600 hover:underline">Xóa hết</button>
            </div>
            
            <div className="space-y-[15px]">
              <div>
                <label className="text-sm font-bold text-slate-900 mb-2 block">Tìm kiếm</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" placeholder="Tên sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Danh mục</h3>
                <ul className="space-y-1 max-h-[40vh] overflow-y-auto pr-2">
                  <li>
                    <button onClick={() => setCategoryFilter('All')} className={`w-full text-left text-sm p-2 rounded-md transition-colors ${categoryFilter === 'All' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>Tất cả</button>
                  </li>
                  {rootCategories.map(cat => {
                      const children = getChildren(cat.id);
                      const isExpanded = expandedCategories.includes(cat.id);
                      return (
                          <li key={cat.id}>
                              <div className="flex justify-between items-center group">
                                  <button onClick={() => setCategoryFilter(cat.id)} className={`flex-1 text-left text-sm p-2 rounded-md font-bold transition-colors ${categoryFilter === cat.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-800 hover:bg-slate-50'}`}>{cat.name}</button>
                                  {children.length > 0 && (
                                      <button onClick={() => toggleCategory(cat.id)} className="p-1 rounded-md text-slate-400 hover:bg-slate-100">
                                          <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                      </button>
                                  )}
                              </div>
                              {isExpanded && children.length > 0 && (
                                  <ul className="pl-4 mt-1 space-y-1 border-l-2 border-slate-200 ml-2 animate-fade-in">
                                      {children.map(child => (
                                          <li key={child.id}>
                                              <button onClick={() => setCategoryFilter(child.id)} className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors ${categoryFilter === child.id ? 'text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>{child.name}</button>
                                          </li>
                                      ))}
                                  </ul>
                              )}
                          </li>
                      );
                  })}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Khoảng giá</h3>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Từ" value={priceRange.min} onChange={e => setPriceRange(p => ({...p, min: e.target.value}))} className="w-full text-sm p-2 bg-slate-50 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                  <span>-</span>
                  <input type="number" placeholder="Đến" value={priceRange.max} onChange={e => setPriceRange(p => ({...p, max: e.target.value}))} className="w-full text-sm p-2 bg-slate-50 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Tình trạng kho</h3>
                <div className="space-y-2">
                  <button onClick={() => setStockFilter('all')} className={`w-full text-left text-sm p-2 rounded-md transition-colors ${stockFilter === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>Tất cả</button>
                  <button onClick={() => setStockFilter('in-stock')} className={`w-full text-left text-sm p-2 rounded-md transition-colors ${stockFilter === 'in-stock' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>Còn hàng</button>
                  <button onClick={() => setStockFilter('low-stock')} className={`w-full text-left text-sm p-2 rounded-md transition-colors ${stockFilter === 'low-stock' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>Sắp hết hàng</button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={discountFilter} onChange={e => setDiscountFilter(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-900">Chỉ hiện sản phẩm giảm giá</span>
                </label>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center mb-6">
              <p className="text-sm text-slate-500 font-medium">Hiển thị <span className="font-bold text-slate-800">{paginatedProducts.length}</span> trên <span className="font-bold text-slate-800">{processedProducts.length}</span> sản phẩm</p>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <span className="text-xs font-bold text-slate-400 uppercase">Sắp xếp:</span>
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value as any)} className="bg-slate-50 text-slate-800 text-sm font-bold py-2 pl-3 pr-8 rounded-lg border-transparent focus:ring-0 cursor-pointer outline-none hover:bg-slate-100 transition-colors">
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp - Cao</option>
                  <option value="price-desc">Giá: Cao - Thấp</option>
                </select>
              </div>
            </div>
            
            {paginatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[15px]">
                    {paginatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <Search size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-xl font-medium text-slate-900">Không tìm thấy sản phẩm nào</p>
                    <p className="mt-2 text-sm text-slate-500">Hãy thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={20} /></button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === page ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-white hover:border-slate-200 border border-transparent'}`}>{page}</button>
                        ))}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={20} /></button>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllProductsPage;
