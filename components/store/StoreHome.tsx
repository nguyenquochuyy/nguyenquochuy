import React, { useState, useEffect, useMemo } from 'react';
import { Product, formatCurrency, Category, CartItem } from '../../types';
import { TRANSLATIONS } from '../../services/translations';
import { 
  ArrowRight, ChevronLeft, ChevronRight, Truck, ShieldCheck, RefreshCw, 
  Phone, TrendingUp, Zap, Filter, Search, Plus, ShoppingCart, Heart, Eye, X, Check, AlertTriangle,
  Clock, Star, Quote, Mail
} from 'lucide-react';

interface StoreHomeProps {
  products: Product[];
  categories: Category[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  searchTerm: string;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  setSearchTerm: (term: string) => void;
  onViewAllClick: () => void;
}

const ITEMS_PER_PAGE = 8;

const StoreHome: React.FC<StoreHomeProps> = ({
  products, categories, onProductClick, onAddToCart,
  searchTerm, categoryFilter, setCategoryFilter, setSearchTerm, onViewAllClick
}) => {
  const t = TRANSLATIONS['vi'];
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [sortOption, setSortOption] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  // Newsletter State
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Advanced Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all');
  const [discountFilter, setDiscountFilter] = useState<boolean>(false);

  // --- MOCK DATA ---
  const HERO_SLIDES = [
    {
      id: 1,
      title: "Bộ Sưu Tập Mùa Hè",
      subtitle: "Giảm giá tới 50% cho các sản phẩm mới nhất",
      cta: "Mua Ngay",
      color: "from-rose-500 to-orange-400",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Công Nghệ Tương Lai",
      subtitle: "Trải nghiệm âm thanh đỉnh cao với Quantum Series",
      cta: "Khám Phá",
      color: "from-blue-600 to-indigo-600",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2065&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Phong Cách Tối Giản",
      subtitle: "Nâng tầm không gian sống của bạn",
      cta: "Xem Chi Tiết",
      color: "from-emerald-500 to-teal-400",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop"
    }
  ];

  const BRANDS = ["Nike", "Adidas", "Sony", "Apple", "Samsung", "Dior", "Gucci", "Zara"];

  const TESTIMONIALS = [
      {
          id: 1,
          name: "Minh Anh",
          role: "Fashion Blogger",
          content: "Chất lượng sản phẩm tuyệt vời, đóng gói cẩn thận và giao hàng siêu tốc. Chắc chắn sẽ ủng hộ UniShop dài dài!",
          avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
      },
      {
          id: 2,
          name: "Hoàng Nam",
          role: "Tech Reviewer",
          content: "Mình rất ấn tượng với chính sách bảo hành và hỗ trợ khách hàng. Mua đồ công nghệ ở đây cực kỳ yên tâm.",
          avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
      },
      {
          id: 3,
          name: "Thảo Vy",
          role: "Designer",
          content: "Giao diện web đẹp, dễ mua sắm. Tìm được rất nhiều món đồ decor độc lạ cho studio của mình.",
          avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d"
      }
  ];

  const BLOG_POSTS = [
    {
      id: 1,
      title: "5 Xu Hướng Thời Trang Hè 2024 Bạn Không Thể Bỏ Qua",
      excerpt: "Khám phá những phong cách đang làm mưa làm gió trên các sàn diễn thời trang quốc tế và cách phối đồ cực chất.",
      date: "15 Th05",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Review Tai Nghe Chống Ồn: Đáng Tiền Hay Không?",
      excerpt: "Đánh giá chi tiết các mẫu tai nghe chống ồn hot nhất hiện nay. Liệu công nghệ này có thực sự cần thiết?",
      date: "12 Th05",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Bí Quyết Decor Phòng Làm Việc Tạo Cảm Hứng",
      excerpt: "Biến góc làm việc nhàm chán trở nên sinh động và tràn đầy năng lượng với những món đồ decor đơn giản.",
      date: "10 Th05",
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const timer = setInterval(() => {
          setTimeLeft(prev => {
              if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
              if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
              if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
              return prev;
          });
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  // --- LOGIC ---
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const processedProducts = useMemo(() => {
      let result = products.filter(p => {
        if (!p.isVisible) return false;
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter ||
                                categories.find(c => c.id === p.category)?.parentId === categoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
        const matchesStock = stockFilter === 'all' ||
                           (stockFilter === 'in-stock' && p.stock > 0) ||
                           (stockFilter === 'low-stock' && p.stock > 0 && p.stock < 10);
        const matchesDiscount = !discountFilter || (discountFilter && p.discount > 0);
        return matchesCategory && matchesSearch && matchesPrice && matchesStock && matchesDiscount;
      });

      if (sortOption === 'price-asc') {
          result.sort((a, b) => a.price - b.price);
      } else if (sortOption === 'price-desc') {
          result.sort((a, b) => b.price - a.price);
      } else {
          result.reverse();
      }
      return result;
  }, [products, categoryFilter, searchTerm, sortOption, categories, priceRange, stockFilter, discountFilter]);

  const trendingProducts = useMemo(() => {
      return [...products]
        .filter(p => p.isVisible)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
  }, [products]);

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = processedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [categoryFilter, searchTerm, sortOption, priceRange, stockFilter, discountFilter]);

  const getDiscountedPrice = (product: Product) => {
    if (!product.discount) return product.price;
    if (product.discountType === 'FIXED') return Math.max(0, product.price - product.discount);
    return Math.max(0, product.price * (1 - product.discount / 100));
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

  const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      if(email) {
          setIsSubscribed(true);
          // Simulate API call
          setTimeout(() => {
              setIsSubscribed(false);
              setEmail('');
          }, 3000);
      }
  };

  return (
    <div className="bg-white">
        {/* HERO SLIDER */}
        {searchTerm === '' && categoryFilter === 'All' && (
            <div className="relative w-full h-[600px] md:h-[750px] overflow-hidden bg-slate-900 group z-0">
                {HERO_SLIDES.map((slide, index) => (
                    <div 
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center transform scale-105 animate-pulse-slow origin-center" />
                        <div className="absolute inset-0 z-20 flex items-center px-6 md:px-20">
                            <div className="max-w-4xl animate-fade-in-up space-y-[15px] pl-4 md:pl-12 border-l-4 border-white/30">
                                <span className={`inline-block px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r ${slide.color} uppercase tracking-widest mb-2 shadow-lg ring-1 ring-white/50 backdrop-blur-md`}>
                                    New Collection 2024
                                </span>
                                <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] drop-shadow-2xl">
                                    {slide.title}
                                </h2>
                                <p className="text-lg md:text-2xl text-slate-200 font-light drop-shadow-md max-w-2xl leading-relaxed">
                                    {slide.subtitle}
                                </p>
                                <button className="mt-4 bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 group/btn">
                                    {slide.cta} <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform"/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Slider Controls */}
                <div className="absolute bottom-10 right-10 z-30 flex gap-[15px]">
                    <button 
                        onClick={() => setCurrentHeroSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                        className="p-4 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                    >
                        <ChevronLeft size={24}/>
                    </button>
                    <button 
                        onClick={() => setCurrentHeroSlide(prev => (prev + 1) % HERO_SLIDES.length)}
                        className="p-4 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                    >
                        <ChevronRight size={24}/>
                    </button>
                </div>
            </div>
        )}

        {/* BRANDS MARQUEE (TRUST INDICATOR) */}
        {searchTerm === '' && categoryFilter === 'All' && (
            <div className="bg-slate-50 border-y border-slate-100 py-8 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Trusted Partners</p>
                </div>
                <div className="flex overflow-hidden group space-x-16">
                    <div className="flex animate-marquee gap-16 items-center min-w-full shrink-0 justify-around">
                        {BRANDS.map((brand, idx) => (
                            <span key={idx} className="text-2xl md:text-3xl font-black text-slate-300 uppercase hover:text-slate-900 transition-colors cursor-pointer select-none">
                                {brand}
                            </span>
                        ))}
                    </div>
                    <div className="flex animate-marquee gap-16 items-center min-w-full shrink-0 justify-around" aria-hidden="true">
                        {BRANDS.map((brand, idx) => (
                            <span key={idx} className="text-2xl md:text-3xl font-black text-slate-300 uppercase hover:text-slate-900 transition-colors cursor-pointer select-none">
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* TRUST BAR */}
        <div className="border-b border-slate-100 relative z-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px]">
                    {[
                        { icon: Truck, title: "Miễn Phí Vận Chuyển", sub: "Đơn hàng từ 500k" },
                        { icon: ShieldCheck, title: "Bảo Hành Chính Hãng", sub: "Cam kết 100% Authentic" },
                        { icon: RefreshCw, title: "Đổi Trả Dễ Dàng", sub: "Trong vòng 30 ngày" },
                        { icon: Phone, title: "Hỗ Trợ 24/7", sub: "Hotline: 0901 234 567" }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center gap-[15px] group px-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-indigo-200 group-hover:scale-110">
                                <item.icon size={28} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-base">{item.title}</p>
                                <p className="text-sm text-slate-500 mt-1">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-24">
            
            {/* FEATURED COLLECTIONS (MOSAIC GRID) */}
            {searchTerm === '' && (
                <div className="animate-fade-in-up">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Khám Phá Phong Cách</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Chọn bộ sưu tập phù hợp với cá tính của bạn. Từ năng động, hiện đại đến tối giản và tinh tế.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-[15px] h-[600px]">
                        <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-3xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform">Thời Trang Nữ</h3>
                                <p className="text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity delay-100">Vẻ đẹp thanh lịch & hiện đại</p>
                            </div>
                        </div>
                        <div className="md:col-span-2 relative rounded-3xl overflow-hidden group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1491336477066-31156b5e4f35?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-2xl font-bold text-white mb-1 translate-y-4 group-hover:translate-y-0 transition-transform">Nam Giới</h3>
                                <p className="text-slate-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">Lịch lãm & Phong cách</p>
                            </div>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2101&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-1 translate-y-4 group-hover:translate-y-0 transition-transform">Điện Tử</h3>
                            </div>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white mb-1 translate-y-4 group-hover:translate-y-0 transition-transform">Nội Thất</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FLASH SALE BANNER & COUNTDOWN */}
            {searchTerm === '' && categoryFilter === 'All' && (
                <div className="relative rounded-[40px] overflow-hidden bg-slate-900 shadow-2xl shadow-rose-200 group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-1000"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-900/90 to-indigo-900/80"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 md:p-16 gap-12">
                        <div className="text-center lg:text-left text-white max-w-xl">
                            <div className="inline-flex items-center gap-2 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 animate-pulse">
                                <Zap size={14} fill="white" /> Flash Sale
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black mb-6 leading-tight">SĂN DEAL SỐC<br/>GIẢM TỚI 50%</h3>
                            <p className="text-slate-200 text-lg mb-8">Cơ hội duy nhất trong tháng. Săn ngay các sản phẩm công nghệ và thời trang hot nhất với giá không tưởng.</p>
                            <button className="bg-white text-rose-600 px-8 py-3 rounded-full font-bold hover:bg-rose-50 transition-colors shadow-lg shadow-rose-900/20">
                                Xem Sản Phẩm
                            </button>
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex gap-[15px]">
                            {Object.entries(timeLeft).map(([unit, value]) => (
                                <div key={unit} className="flex flex-col items-center">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-3xl md:text-4xl font-black text-white shadow-xl">
                                        {value.toString().padStart(2, '0')}
                                    </div>
                                    <span className="text-xs uppercase font-bold text-rose-300 mt-2 tracking-widest">{unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Trending Section */}
            {searchTerm === '' && categoryFilter === 'All' && (
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-[15px]">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                                <Zap size={14} fill="currentColor"/> Hot Trend
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900">Xu Hướng Tìm Kiếm</h3>
                        </div>
                        <button className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-2 group">
                            Xem tất cả <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform"><ArrowRight size={14}/></div>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
                        {trendingProducts.map((product, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer border border-slate-100" onClick={() => onProductClick(product)}>
                                <div className="relative aspect-square rounded-2xl overflow-hidden mb-5 bg-slate-100">
                                    <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                                        #{idx + 1} Trending
                                    </div>
                                    {product.discount > 0 && (
                                        <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                            -{product.discount}%
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-bold text-slate-900 text-base truncate mb-2 group-hover:text-indigo-600 transition-colors">{product.name}</h4>
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <p className="text-indigo-600 font-extrabold text-lg">{formatCurrency(getDiscountedPrice(product))}</p>
                                        {product.discount > 0 && <span className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</span>}
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TESTIMONIALS (SOCIAL PROOF) */}
            {searchTerm === '' && categoryFilter === 'All' && (
                <div className="bg-slate-50 rounded-[40px] p-8 md:p-16 text-center">
                    <h3 className="text-3xl font-black text-slate-900 mb-4">Khách Hàng Nói Gì?</h3>
                    <p className="text-slate-500 mb-12 max-w-xl mx-auto">Hơn 10,000 khách hàng đã tin tưởng và hài lòng với chất lượng dịch vụ của UniShop.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
                        {TESTIMONIALS.map(item => (
                            <div key={item.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                    <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full border-4 border-white shadow-md" />
                                </div>
                                <div className="flex justify-center gap-1 text-amber-400 mb-4 mt-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                                <p className="text-slate-600 italic text-sm mb-6 relative z-10">"{item.content}"</p>
                                <div className="text-center">
                                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">{item.role}</p>
                                </div>
                                <Quote size={40} className="absolute bottom-4 right-4 text-slate-100 -z-0" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Product Grid */}
            <div id="products-section">
                <div className="flex justify-between items-end mb-8">
                    <h3 className="text-3xl font-black text-slate-900">Tất Cả Sản Phẩm</h3>
                    <button onClick={onViewAllClick} className="text-sm font-bold text-indigo-600 hover:underline">Xem tất cả</button>
                </div>

                {displayedProducts.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-lg">
                        <p>Không tìm thấy sản phẩm nào</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
                            {displayedProducts.map(product => {
                                const finalPrice = getDiscountedPrice(product);
                                const hasDiscount = product.discount > 0;
                                const isOutOfStock = product.stock === 0;

                                return (
                                    <div 
                                        key={product.id} 
                                        className="group bg-white rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 border border-slate-100 flex flex-col relative cursor-pointer"
                                        onClick={() => onProductClick(product)}
                                    >
                                        {/* Image Area */}
                                        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                                            <img 
                                                src={product.images[0]} 
                                                alt={product.name} 
                                                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                                            />
                                            
                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                                <StockBadge stock={product.stock} />
                                                {hasDiscount && !isOutOfStock && (
                                                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                    -{product.discount}{product.discountType === 'PERCENT' ? '%' : 'đ'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Wishlist Button */}
                                            <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-rose-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 duration-300 shadow-sm">
                                                <Heart size={18} />
                                            </button>

                                            {/* Hover Actions */}
                                            <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100">
                                                {!isOutOfStock && !product.hasVariants && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} 
                                                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <ShoppingCart size={16}/> Thêm vào giỏ
                                                    </button>
                                                )}
                                                <button 
                                                    className="w-full bg-white/90 backdrop-blur text-slate-900 py-3 rounded-xl font-bold text-sm shadow-xl border border-white hover:bg-white transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Eye size={16}/> Xem chi tiết
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info Area */}
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
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* NEWSLETTER SECTION (NEW) */}
            <div className="bg-indigo-900 rounded-[40px] overflow-hidden relative isolate">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop')] mix-blend-overlay opacity-20 bg-cover bg-center"></div>
                <div className="relative z-10 px-6 py-24 md:px-24 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="text-center md:text-left max-w-xl">
                        <div className="inline-flex items-center gap-2 bg-indigo-800 text-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-700">
                            <Mail size={14} /> Newsletter
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">Đăng Ký Nhận Tin<br/>Giảm Ngay 10%</h3>
                        <p className="text-indigo-200 text-lg">Đừng bỏ lỡ các chương trình khuyến mãi độc quyền và bộ sưu tập mới nhất từ UniShop.</p>
                    </div>
                    <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                            {isSubscribed ? (
                                <div className="flex-1 bg-emerald-500/20 rounded-xl flex items-center justify-center text-white font-bold py-4 gap-2 border border-emerald-500/50">
                                    <Check size={20}/> Đã đăng ký thành công!
                                </div>
                            ) : (
                                <>
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="Địa chỉ email của bạn" 
                                        className="flex-1 bg-transparent text-white placeholder-indigo-300 px-6 py-4 outline-none font-medium"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                    <button className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                                        Gửi
                                    </button>
                                </>
                            )}
                        </form>
                        {!isSubscribed && <p className="text-center text-xs text-indigo-300 mt-3">*Không spam. Hủy đăng ký bất cứ lúc nào.</p>}
                    </div>
                </div>
            </div>

            {/* LATEST NEWS */}
            <div>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">Tin Tức & Mẹo Hay</h3>
                        <p className="text-slate-500">Cập nhật xu hướng và kiến thức mua sắm thông minh</p>
                    </div>
                    <button className="text-sm font-bold text-indigo-600 hover:underline">Xem Blog</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
                    {BLOG_POSTS.map((post) => (
                        <div key={post.id} className="group cursor-pointer">
                            <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 relative">
                                <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                                    {post.date}
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {post.title}
                            </h4>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                                {post.excerpt}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default StoreHome;
