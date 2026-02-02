
import React from 'react';
import { Product, formatCurrency } from '../../types';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  products: Product[];
  wishlistIds: string[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onNavigateHome: () => void;
  onProductClick: (product: Product) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ 
  products, wishlistIds, onRemoveFromWishlist, onAddToCart, onNavigateHome, onProductClick
}) => {
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="bg-slate-50 min-h-screen py-12 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Heart className="text-rose-500 fill-rose-500" /> Danh Sách Yêu Thích
                </h1>
                <button onClick={onNavigateHome} className="text-sm font-bold text-indigo-600 hover:underline">
                    Tiếp tục mua sắm
                </button>
            </div>

            {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Danh sách trống</h3>
                    <p className="text-slate-500 mb-6">Bạn chưa lưu sản phẩm nào.</p>
                    <button onClick={onNavigateHome} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        Khám phá sản phẩm
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlistProducts.map(product => {
                        const finalPrice = product.discount 
                            ? (product.discountType === 'FIXED' ? product.price - product.discount : product.price * (1 - product.discount / 100))
                            : product.price;
                        
                        return (
                            <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all group flex flex-col">
                                <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => onProductClick(product)}>
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRemoveFromWishlist(product.id); }}
                                        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                        title="Xóa khỏi yêu thích"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 text-sm mb-1 truncate">{product.name}</h3>
                                    <div className="mt-auto">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-indigo-600 font-bold">{formatCurrency(finalPrice)}</span>
                                            {product.discount > 0 && <span className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</span>}
                                        </div>
                                        <button 
                                            onClick={() => onAddToCart(product)}
                                            className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart size={16}/> Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
};

export default WishlistPage;
