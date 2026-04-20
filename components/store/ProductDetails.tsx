import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant, formatCurrency } from '../../types';
import { 
  ChevronRight, Star, Minus, Plus, ShoppingBag, Truck, ShieldCheck, 
  RefreshCw, Zap, Eye, Heart, Share2, CreditCard, Box, ArrowRight, Check,
  User, ThumbsUp, MessageSquare, Send, X, AlertCircle, Clock, Gift, Tag,
  ChevronDown, Filter, Camera
} from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  products: Product[];
  onNavigateHome: () => void;
  onCategoryClick: (catId: string) => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, variant?: ProductVariant) => void;
}

// Mock Reviews Data
const INITIAL_REVIEWS = [
    { id: 1, user: "Nguyễn Văn A", rating: 5, date: "12/05/2024", content: "Sản phẩm rất đẹp, đóng gói cẩn thận. Giao hàng nhanh hơn dự kiến!", verified: true, helpful: 12, images: [] },
    { id: 2, user: "Trần Thị B", rating: 4, date: "10/05/2024", content: "Chất lượng tốt so với tầm giá. Tuy nhiên màu sắc bên ngoài đậm hơn trong ảnh một chút.", verified: true, helpful: 5, images: ["https://picsum.photos/100/100?random=1"] },
    { id: 3, user: "Lê Hoà", rating: 5, date: "05/05/2024", content: "Tuyệt vời! Sẽ ủng hộ shop dài dài. Nhân viên tư vấn nhiệt tình.", verified: false, helpful: 2, images: [] },
    { id: 4, user: "Phạm K", rating: 3, date: "01/05/2024", content: "Giao hàng hơi chậm, nhưng hàng ổn.", verified: true, helpful: 0, images: [] }
];

const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  product, products, onNavigateHome, onCategoryClick, onProductClick, onAddToCart 
}) => {
  // --- STATE ---
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
      product.hasVariants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  
  // Social Proof & Timer
  const [viewers, setViewers] = useState(12);
  const [soldCount, setSoldCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 30 });

  // Reviews
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, content: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'with_images' | '5_star'>('all');

  // Recently Viewed & Bundles
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [bundleSelected, setBundleSelected] = useState(true);

  // --- LOGIC & EFFECTS ---

  // Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev.s > 0) return { ...prev, s: prev.s - 1 };
            if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
            if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
            return prev; // Expired
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Related products
  const relatedProducts = useMemo(() => {
      return products
        .filter(p => p.category === product.category && p.id !== product.id && p.isVisible)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
  }, [product, products]);

  // Upsell Bundle Product (Just pick a random one)
  const bundleProduct = useMemo(() => {
      return products.find(p => p.id !== product.id && p.isVisible) || products[0];
  }, [product, products]);

  // Recently Viewed Persistence
  useEffect(() => {
      try {
          const stored = localStorage.getItem('unishop_recent_viewed');
          let currentIds: string[] = stored ? JSON.parse(stored) : [];
          currentIds = currentIds.filter(id => id !== product.id);
          currentIds.unshift(product.id);
          currentIds = currentIds.slice(0, 8);
          localStorage.setItem('unishop_recent_viewed', JSON.stringify(currentIds));
          setRecentIds(currentIds);
      } catch (e) {}
  }, [product.id]);

  const recentlyViewedProducts = useMemo(() => {
      return recentIds
          .map(id => products.find(p => p.id === id))
          .filter(p => p !== undefined && p.id !== product.id && p.isVisible) as Product[];
  }, [recentIds, products, product.id]);

  // Reset state on product change
  useEffect(() => {
      setActiveImage(product.images[0]);
      setSelectedVariant(product.hasVariants && product.variants.length > 0 ? product.variants[0] : null);
      setQty(1);
      setActiveTab('desc');
      setViewers(Math.floor(Math.random() * 30) + 10);
      setSoldCount(Math.floor(Math.random() * 500) + 50);
      setReviews(INITIAL_REVIEWS);
      setIsWritingReview(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product]);

  // --- HELPERS ---
  const getDiscountedPrice = (prod: Product, priceOverride?: number) => {
    const basePrice = priceOverride !== undefined ? priceOverride : prod.price;
    if (!prod.discount) return basePrice;
    if (prod.discountType === 'FIXED') return Math.max(0, basePrice - prod.discount);
    return Math.max(0, basePrice * (1 - prod.discount / 100));
  };

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const finalPrice = getDiscountedPrice(product, currentPrice);
  const isOutOfStock = currentStock === 0;

  // Bundle Calculation
  const bundleTotalPrice = finalPrice + getDiscountedPrice(bundleProduct);
  const bundleDiscountedPrice = bundleTotalPrice * 0.95; // 5% off for bundle

  // Review Stats
  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(r => r.rating === star).length;
      const percent = (count / reviews.length) * 100;
      return { star, count, percent };
  });

  const filteredReviews = reviews.filter(r => {
      if (reviewFilter === '5_star') return r.rating === 5;
      if (reviewFilter === 'with_images') return r.images && r.images.length > 0;
      return true;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newReview.name || !newReview.content) return;
      const review = {
          id: Date.now(),
          user: newReview.name,
          rating: newReview.rating,
          date: new Date().toLocaleDateString('vi-VN'),
          content: newReview.content,
          verified: true,
          helpful: 0,
          images: []
      };
      setReviews([review, ...reviews]);
      setNewReview({ name: '', rating: 5, content: '' });
      setIsWritingReview(false);
  };

  const handleBuyNow = () => {
      onAddToCart(product, qty, selectedVariant || undefined);
  };

  const handleAddBundle = () => {
      onAddToCart(product, 1, selectedVariant || undefined);
      onAddToCart(bundleProduct, 1);
  };

  // Color detector for swatches
  const getColorCode = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes('đen') || lower.includes('black')) return '#000000';
      if (lower.includes('trắng') || lower.includes('white')) return '#ffffff';
      if (lower.includes('đỏ') || lower.includes('red')) return '#ef4444';
      if (lower.includes('xanh dương') || lower.includes('blue')) return '#3b82f6';
      if (lower.includes('xanh lá') || lower.includes('green')) return '#22c55e';
      if (lower.includes('vàng') || lower.includes('yellow')) return '#eab308';
      if (lower.includes('hồng') || lower.includes('pink')) return '#ec4899';
      if (lower.includes('tím') || lower.includes('purple')) return '#a855f7';
      if (lower.includes('xám') || lower.includes('gray')) return '#6b7280';
      return null;
  };

  // Reusable Product Card
  // FIX: Changed component to be of type React.FC to correctly handle React's special 'key' prop.
  const SimpleProductCard: React.FC<{ p: Product }> = ({ p }) => (
      <div onClick={() => onProductClick(p)} className="group cursor-pointer bg-white rounded-2xl p-3 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100 h-full flex flex-col">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
              <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              {p.discount > 0 && <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">-{p.discount}%</span>}
          </div>
          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate mb-1 text-sm">{p.name}</h4>
          <p className="text-indigo-600 font-bold text-sm">{formatCurrency(getDiscountedPrice(p))}</p>
      </div>
  );

  return (
      <div className="animate-fade-in bg-white min-h-screen pb-24 md:pb-20 font-sans relative">
          
          {/* Breadcrumbs */}
          <div className="bg-white border-b border-slate-100 sticky top-20 z-30 shadow-sm backdrop-blur-md bg-white/90">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
                      <button onClick={onNavigateHome} className="hover:text-indigo-600 transition-colors">Trang chủ</button>
                      <ChevronRight size={14} className="text-slate-300" />
                      <button onClick={() => onCategoryClick(product.category)} className="hover:text-indigo-600 transition-colors uppercase font-medium">
                          {product.category}
                      </button>
                      <ChevronRight size={14} className="text-slate-300" />
                      <span className="text-slate-900 font-bold truncate max-w-[200px]">{product.name}</span>
                  </div>
              </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* LEFT COLUMN: Gallery (7 Cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-[15px]">
                      <div className="flex flex-col-reverse md:flex-row gap-[15px]">
                          {/* Vertical Thumbnails (Desktop) */}
                          <div className="hidden md:flex flex-col gap-3 w-20 flex-shrink-0 max-h-[600px] overflow-y-auto scrollbar-hide">
                              {product.images.map((img, idx) => (
                                  <button 
                                    key={idx} 
                                    onClick={() => setActiveImage(img)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-slate-300'}`}
                                  >
                                      <img src={img} className="w-full h-full object-cover" />
                                  </button>
                              ))}
                          </div>

                          {/* Main Image */}
                          <div className="flex-1 aspect-[4/3] md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 relative group shadow-sm select-none cursor-zoom-in">
                              <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 origin-center" />
                              
                              {/* Badges */}
                              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                                {product.discount > 0 && (
                                    <div className="bg-rose-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 animate-bounce-short">
                                        <Zap size={14} fill="currentColor" />
                                        -{product.discount}{product.discountType === 'PERCENT' ? '%' : 'đ'}
                                    </div>
                                )}
                                {isOutOfStock && <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">Hết hàng</div>}
                              </div>

                              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                  <button className="w-10 h-10 bg-white rounded-full text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-md"><Heart size={20} /></button>
                                  <button className="w-10 h-10 bg-white rounded-full text-slate-400 hover:text-indigo-500 flex items-center justify-center shadow-md"><Share2 size={20} /></button>
                              </div>
                          </div>
                      </div>

                      {/* Mobile Horizontal Thumbnails */}
                      <div className="flex md:hidden gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {product.images.map((img, idx) => (
                              <button 
                                key={idx} onClick={() => setActiveImage(img)}
                                className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === img ? 'border-indigo-600' : 'border-transparent'}`}
                              >
                                  <img src={img} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>

                      {/* FREQUENTLY BOUGHT TOGETHER (Upsell) */}
                      {bundleProduct && (
                          <div className="border border-indigo-100 rounded-2xl p-5 bg-gradient-to-br from-indigo-50/50 to-white shadow-sm mt-4">
                              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                  <Gift size={20} className="text-indigo-600"/> Thường được mua cùng
                              </h3>
                              <div className="flex flex-col sm:flex-row items-center gap-[15px] md:gap-[15px]">
                                  <div className="flex items-center gap-[15px]">
                                      <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden bg-white">
                                          <img src={product.images[0]} className="w-full h-full object-cover"/>
                                      </div>
                                      <div className="text-slate-300"><Plus size={24}/></div>
                                      <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden bg-white relative">
                                          <img src={bundleProduct.images[0]} className="w-full h-full object-cover"/>
                                          {bundleSelected && <div className="absolute inset-0 bg-indigo-900/10 flex items-center justify-center"><Check className="text-indigo-600 bg-white rounded-full p-0.5" size={20}/></div>}
                                      </div>
                                  </div>
                                  <div className="flex-1 text-center sm:text-left">
                                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{bundleProduct.name}</p>
                                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                          <span className="text-rose-600 font-bold">{formatCurrency(bundleDiscountedPrice)}</span>
                                          <span className="text-slate-400 text-xs line-through">{formatCurrency(bundleTotalPrice)}</span>
                                      </div>
                                      <p className="text-xs text-emerald-600 font-medium mt-1">Tiết kiệm {formatCurrency(bundleTotalPrice - bundleDiscountedPrice)}</p>
                                  </div>
                                  <button 
                                      onClick={handleAddBundle}
                                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors shadow-lg"
                                  >
                                      Mua Combo
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* RIGHT COLUMN: Info & Actions (5 Cols - Sticky) */}
                  <div className="lg:col-span-5">
                      <div className="sticky top-32 space-y-[15px]">
                          
                          {/* Basic Info */}
                          <div>
                              <div className="flex items-center gap-2 mb-3">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
                                  {product.discount > 0 && (
                                      <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                          <Clock size={12}/> Kết thúc sau {timeLeft.h}:{timeLeft.m}:{timeLeft.s}
                                      </div>
                                  )}
                              </div>
                              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-tight">{product.name}</h1>
                              
                              <div className="flex items-center gap-[15px] text-sm mb-4">
                                  <div className="flex items-center gap-1 text-amber-400">
                                      <span className="font-bold text-slate-900 mr-1">{averageRating}</span>
                                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />)}
                                  </div>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="text-slate-500 underline cursor-pointer hover:text-indigo-600" onClick={() => { setActiveTab('reviews'); document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' }); }}>{reviews.length} đánh giá</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="text-emerald-600 font-bold flex items-center gap-1"><Zap size={14} fill="currentColor"/> Đã bán {soldCount}</span>
                              </div>

                              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="flex items-end gap-3">
                                      <span className="text-4xl font-black text-slate-900 tracking-tight">{formatCurrency(finalPrice)}</span>
                                      {product.discount > 0 && <span className="text-lg text-slate-400 line-through font-medium mb-1.5">{formatCurrency(currentPrice)}</span>}
                                  </div>
                                  
                                  {/* Coupons Mock */}
                                  <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                                      <div className="flex items-center gap-1 bg-white border border-rose-200 text-rose-600 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-rose-50 transition-colors border-dashed">
                                          <Tag size={12}/> Giảm 50k
                                      </div>
                                      <div className="flex items-center gap-1 bg-white border border-indigo-200 text-indigo-600 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-indigo-50 transition-colors border-dashed">
                                          <Tag size={12}/> Freeship
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Variants */}
                          {product.hasVariants && (
                              <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                      <label className="text-sm font-bold text-slate-900 uppercase tracking-wide">Phân loại: <span className="text-indigo-600">{selectedVariant?.name}</span></label>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                      {product.variants.map(variant => {
                                          const isSelected = selectedVariant?.id === variant.id;
                                          const isVarOutOfStock = variant.stock === 0;
                                          const colorCode = getColorCode(variant.name);

                                          return (
                                              <button
                                                  key={variant.id}
                                                  onClick={() => !isVarOutOfStock && setSelectedVariant(variant)}
                                                  disabled={isVarOutOfStock}
                                                  className={`
                                                      group relative rounded-xl border-2 transition-all flex items-center justify-center
                                                      ${colorCode ? 'w-10 h-10 rounded-full' : 'px-4 py-2 min-w-[3rem]'}
                                                      ${isSelected 
                                                          ? 'border-indigo-600 ring-1 ring-indigo-600 ring-offset-2' 
                                                          : isVarOutOfStock 
                                                              ? 'border-slate-100 opacity-50 cursor-not-allowed bg-slate-50' 
                                                              : 'border-slate-200 hover:border-slate-400 bg-white'
                                                      }
                                                  `}
                                                  title={variant.name}
                                              >
                                                  {colorCode ? (
                                                      <span className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: colorCode }}></span>
                                                  ) : (
                                                      <span className={`text-sm font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>{variant.name}</span>
                                                  )}
                                                  
                                                  {isVarOutOfStock && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-0.5 bg-slate-300 -rotate-45"></div></div>}
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                          )}

                          {/* Actions */}
                          <div className="space-y-[15px] pt-2">
                              {/* Quantity */}
                              <div className="flex items-center gap-[15px]">
                                  <div className="flex items-center border border-slate-300 rounded-xl h-12 w-fit">
                                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-l-xl" disabled={isOutOfStock}><Minus size={18}/></button>
                                      <input type="number" value={qty} readOnly className="w-12 text-center text-lg font-bold text-slate-900 bg-transparent outline-none"/>
                                      <button onClick={() => setQty(Math.min(currentStock, qty + 1))} className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-r-xl" disabled={isOutOfStock}><Plus size={18}/></button>
                                  </div>
                                  <div className="text-sm">
                                      <p className="font-bold text-slate-900">{isOutOfStock ? 'Hết hàng' : 'Còn hàng'}</p>
                                      {!isOutOfStock && <p className="text-slate-500">{currentStock} sản phẩm có sẵn</p>}
                                  </div>
                              </div>

                              {/* Buttons */}
                              <div className="flex gap-3">
                                  <button
                                      onClick={() => onAddToCart(product, qty, selectedVariant || undefined)}
                                      disabled={isOutOfStock}
                                      className="flex-1 bg-indigo-50 border-2 border-indigo-600 text-indigo-700 px-4 py-3.5 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                      <ShoppingBag size={20} /> Thêm Giỏ
                                  </button>
                                  <button
                                      onClick={handleBuyNow}
                                      disabled={isOutOfStock}
                                      className="flex-[1.5] bg-slate-900 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                                  >
                                      Mua Ngay <ArrowRight size={20} />
                                  </button>
                              </div>
                          </div>

                          {/* Service Badges */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                              <div className="flex gap-3 items-center p-2">
                                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Truck size={20}/></div>
                                  <div className="text-xs"><p className="font-bold text-slate-900">Freeship</p><p className="text-slate-500">Đơn từ 500k</p></div>
                              </div>
                              <div className="flex gap-3 items-center p-2">
                                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><ShieldCheck size={20}/></div>
                                  <div className="text-xs"><p className="font-bold text-slate-900">Chính Hãng</p><p className="text-slate-500">Cam kết 100%</p></div>
                              </div>
                              <div className="flex gap-3 items-center p-2">
                                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><RefreshCw size={20}/></div>
                                  <div className="text-xs"><p className="font-bold text-slate-900">Đổi Trả</p><p className="text-slate-500">Trong 30 ngày</p></div>
                              </div>
                              <div className="flex gap-3 items-center p-2">
                                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Headset size={20}/></div>
                                  <div className="text-xs"><p className="font-bold text-slate-900">Hỗ Trợ</p><p className="text-slate-500">24/7 Hotline</p></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* DETAILS SECTION (TABS) */}
              <div className="mt-16 md:mt-24">
                  <div className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
                      {[
                          { id: 'desc', label: 'Chi tiết sản phẩm' },
                          { id: 'specs', label: 'Thông số kỹ thuật' },
                          { id: 'reviews', label: `Đánh giá (${reviews.length})` }
                      ].map(tab => (
                          <button 
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`pb-4 px-6 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                          >
                              {tab.label}
                          </button>
                      ))}
                  </div>

                  <div className="min-h-[300px] animate-fade-in">
                      {activeTab === 'desc' && (
                          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                              <p className="whitespace-pre-line">{product.description}</p>
                              {/* Upsell Mock in Desc */}
                              <div className="my-8 p-6 bg-indigo-50 rounded-2xl flex items-center gap-[15px] border border-indigo-100 not-prose">
                                  <Zap className="text-indigo-600 flex-shrink-0" size={32}/>
                                  <div>
                                      <h4 className="font-bold text-slate-900 text-lg">Điểm nổi bật</h4>
                                      <p className="text-sm text-slate-600">Sản phẩm này được thiết kế với công nghệ mới nhất, đảm bảo độ bền vượt trội.</p>
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeTab === 'specs' && (
                          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                              <table className="w-full text-sm text-left">
                                  <tbody className="divide-y divide-slate-100">
                                      <tr className="bg-slate-50"><td className="py-4 px-6 font-bold text-slate-500 w-1/3">Thương hiệu</td><td className="py-4 px-6 font-bold text-slate-900">UniShop Selection</td></tr>
                                      <tr><td className="py-4 px-6 font-bold text-slate-500">Xuất xứ</td><td className="py-4 px-6 text-slate-900">Việt Nam</td></tr>
                                      <tr className="bg-slate-50"><td className="py-4 px-6 font-bold text-slate-500">Chất liệu</td><td className="py-4 px-6 text-slate-900">Cao cấp, Thân thiện môi trường</td></tr>
                                      <tr><td className="py-4 px-6 font-bold text-slate-500">SKU</td><td className="py-4 px-6 font-mono text-slate-900">{product.sku}</td></tr>
                                      <tr className="bg-slate-50"><td className="py-4 px-6 font-bold text-slate-500">Bảo hành</td><td className="py-4 px-6 text-slate-900">12 Tháng chính hãng</td></tr>
                                  </tbody>
                              </table>
                          </div>
                      )}

                      {activeTab === 'reviews' && (
                          <div id="reviews-section">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px] mb-10">
                                  {/* Summary */}
                                  <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200">
                                      <div className="text-5xl font-black text-slate-900 mb-2">{averageRating}</div>
                                      <div className="flex justify-center gap-1 text-amber-400 mb-2">
                                          {[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />)}
                                      </div>
                                      <p className="text-slate-500 text-sm">Dựa trên {reviews.length} đánh giá</p>
                                  </div>
                                  
                                  {/* Progress Bars */}
                                  <div className="col-span-2 space-y-2">
                                      {ratingDistribution.map(({ star, count, percent }) => (
                                          <div key={star} className="flex items-center gap-3 text-sm">
                                              <span className="font-bold text-slate-700 w-3 flex items-center gap-1">{star} <Star size={10} fill="currentColor" className="text-slate-400"/></span>
                                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                              </div>
                                              <span className="text-slate-400 w-8 text-right">{count}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>

                              {/* Filter & Write */}
                              <div className="flex flex-col sm:flex-row justify-between items-center gap-[15px] mb-8">
                                  <div className="flex gap-2">
                                      {['all', 'with_images', '5_star'].map(f => (
                                          <button 
                                              key={f} 
                                              onClick={() => setReviewFilter(f as any)}
                                              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${reviewFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                                          >
                                              {f === 'all' ? 'Tất cả' : f === 'with_images' ? 'Có hình ảnh' : '5 Sao'}
                                          </button>
                                      ))}
                                  </div>
                                  <button onClick={() => setIsWritingReview(!isWritingReview)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2">
                                      <MessageSquare size={16}/> Viết đánh giá
                                  </button>
                              </div>

                              {/* Form */}
                              {isWritingReview && (
                                  <form onSubmit={handleSubmitReview} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 animate-fade-in-up">
                                      <div className="mb-4">
                                          <label className="block text-sm font-bold text-slate-700 mb-1">Đánh giá của bạn</label>
                                          <div className="flex gap-1">
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                  <button type="button" key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setNewReview({ ...newReview, rating: star })}>
                                                      <Star size={28} className={`${star <= (hoverRating || newReview.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-200'} transition-colors`}/>
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px] mb-4">
                                          <input type="text" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Tên hiển thị" value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} />
                                          <div className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-slate-400 cursor-pointer hover:text-indigo-600 hover:border-indigo-300 transition-colors">
                                              <Camera size={18}/> <span>Thêm ảnh (Tùy chọn)</span>
                                          </div>
                                      </div>
                                      <textarea required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px] mb-4 resize-none" placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." value={newReview.content} onChange={e => setNewReview({...newReview, content: e.target.value})} />
                                      <div className="flex justify-end">
                                          <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">Gửi đánh giá</button>
                                      </div>
                                  </form>
                              )}

                              {/* List */}
                              <div className="space-y-[15px]">
                                  {filteredReviews.map(review => (
                                      <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 animate-fade-in">
                                          <div className="flex justify-between items-start mb-2">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-white shadow-sm">
                                                      {review.user.charAt(0)}
                                                  </div>
                                                  <div>
                                                      <p className="font-bold text-slate-900 text-sm">{review.user}</p>
                                                      <div className="flex items-center gap-2">
                                                          <div className="flex text-amber-400">
                                                              {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />)}
                                                          </div>
                                                          <span className="text-xs text-slate-400">{review.date}</span>
                                                      </div>
                                                  </div>
                                              </div>
                                              {review.verified && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-100"><Check size={10} strokeWidth={4}/> Đã mua hàng</span>}
                                          </div>
                                          <p className="text-slate-700 text-sm leading-relaxed mb-3 pl-[52px]">{review.content}</p>
                                          {review.images && review.images.length > 0 && (
                                              <div className="flex gap-2 pl-[52px] mb-3">
                                                  {review.images.map((img, i) => (
                                                      <img key={i} src={img} className="w-16 h-16 rounded-lg object-cover border border-slate-100 cursor-pointer hover:opacity-80"/>
                                                  ))}
                                              </div>
                                          )}
                                          <div className="pl-[52px] flex items-center gap-[15px]">
                                              <button className="text-xs text-slate-400 font-bold hover:text-indigo-600 flex items-center gap-1 group transition-colors">
                                                  <ThumbsUp size={14} className="group-hover:-translate-y-0.5 transition-transform"/> Hữu ích ({review.helpful})
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* RECOMMENDED SECTIONS */}
              <div className="space-y-20 mt-20 border-t border-slate-100 pt-16">
                  {relatedProducts.length > 0 && (
                      <div>
                          <div className="flex justify-between items-end mb-8">
                              <h3 className="text-2xl font-black text-slate-900">Sản Phẩm Tương Tự</h3>
                              <button className="text-sm font-bold text-indigo-600 hover:underline">Xem tất cả</button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px]">
                              {relatedProducts.map(p => <SimpleProductCard key={p.id} p={p}/>)}
                          </div>
                      </div>
                  )}

                  {recentlyViewedProducts.length > 0 && (
                      <div>
                          <div className="flex items-center gap-3 mb-8">
                              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock size={20}/></div>
                              <h3 className="text-2xl font-black text-slate-900">Đã Xem Gần Đây</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px]">
                              {recentlyViewedProducts.map(p => <SimpleProductCard key={p.id} p={p}/>)}
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* STICKY BOTTOM BAR (Mobile Only) */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 px-4 z-50 md:hidden flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-safe">
              <div className="flex flex-col justify-center">
                  <span className="text-xs text-slate-500 font-medium">Tổng tiền</span>
                  <span className="text-lg font-bold text-indigo-600 leading-none">{formatCurrency(finalPrice)}</span>
              </div>
              <div className="flex-1 flex gap-2">
                  <button onClick={() => onAddToCart(product, qty, selectedVariant || undefined)} disabled={isOutOfStock} className="flex-1 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm disabled:opacity-50">
                      Thêm
                  </button>
                  <button onClick={handleBuyNow} disabled={isOutOfStock} className="flex-[1.5] bg-slate-900 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                      Mua Ngay
                  </button>
              </div>
          </div>
      </div>
  );
};

// Simple Icon Component needed
const Headset = ({size, className}: {size?: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
);

export default ProductDetails;
