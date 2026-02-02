
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackendContextType, Product, CartItem, ProductVariant, Order, Employee, Customer } from '../../types';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ProductDetails from './ProductDetails';
import StoreHome from './StoreHome';
import CheckoutPage from './CheckoutPage';
import OrderSuccessModal from './OrderSuccessModal';
import AllProductsPage from './AllProductsPage';
import UserProfile from './UserProfile';
import WishlistPage from './WishlistPage';
import { Check, X } from 'lucide-react';

interface StorefrontProps {
  backend: BackendContextType;
  onExit: () => void;
  currentUser: Employee | Customer | null;
}

type ActiveView = 'HOME' | 'PRODUCT' | 'CHECKOUT' | 'ALL_PRODUCTS' | 'PROFILE' | 'WISHLIST';

const Storefront: React.FC<StorefrontProps> = ({ backend, onExit, currentUser }) => {
  const { state, toggleWishlist } = backend;
  const navigate = useNavigate();
  
  const [activeView, setActiveView] = useState<ActiveView>('HOME');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const isEmployee = currentUser && 'role' in currentUser;
  // Safe cast for wishlist access
  const customerWishlist = (!isEmployee && currentUser && 'wishlist' in currentUser) 
    ? (currentUser as Customer).wishlist 
    : [];

  React.useEffect(() => {
    const handleScroll = () => {
        setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (product: Product) => {
      setViewingProduct(product);
      setActiveView('PRODUCT');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateHome = () => {
      setActiveView('HOME');
      setViewingProduct(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const navigateToCheckout = () => {
      setActiveView('CHECKOUT');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAllProducts = () => {
     setActiveView('ALL_PRODUCTS');
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProfile = () => {
    setActiveView('PROFILE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToWishlist = () => {
      if (!currentUser) {
          alert("Vui lòng đăng nhập để sử dụng tính năng này.");
          return;
      }
      setActiveView('WISHLIST');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setLastOrder(order);
    setShowSuccess(true);
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    setLastOrder(null);
    navigateHome();
  };

  const addToCart = (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    setCart(prev => {
      const existing = prev.find(item => 
        (variant ? item.selectedVariantId === variant.id : item.id === product.id) && item.id === product.id
      );

      if (existing) {
        return prev.map(item => {
           if ((variant ? item.selectedVariantId === variant.id : item.id === product.id) && item.id === product.id) {
               return { ...item, quantity: item.quantity + quantity };
           }
           return item;
        });
      }

      const itemToAdd: CartItem = {
          ...product,
          quantity: quantity,
          selectedVariantId: variant?.id,
      };
      
      return [...prev, itemToAdd];
    });
    setIsCartOpen(true);
  };

  const handleToggleWishlist = (productId: string) => {
      if (!currentUser || isEmployee) {
          alert("Vui lòng đăng nhập tài khoản khách hàng để lưu sản phẩm.");
          return;
      }
      toggleWishlist(currentUser.id, productId);
  };

  // If user logs out, go home from profile view
  React.useEffect(() => {
      if (!currentUser && (activeView === 'PROFILE' || activeView === 'WISHLIST')) {
          navigateHome();
      }
  }, [currentUser, activeView]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar 
        onSearchChange={(val) => { setSearchTerm(val); if(activeView !== 'HOME' && activeView !== 'ALL_PRODUCTS' && val) navigateToAllProducts(); }} 
        searchTerm={searchTerm} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onHomeClick={() => { setCategoryFilter('All'); setSearchTerm(''); navigateHome(); }}
        onExit={onExit}
        isEmployee={isEmployee}
        currentUser={currentUser}
        onProfileClick={navigateToProfile}
        onWishlistClick={!isEmployee ? navigateToWishlist : undefined}
        onLoginClick={() => navigate('/login')}
      />
      
      {showSuccess && lastOrder && (
        <OrderSuccessModal order={lastOrder} onClose={closeSuccessModal} />
      )}

      <main className="flex-1 w-full flex flex-col">
        {activeView === 'PROFILE' && currentUser && 'joinedAt' in currentUser ? (
            <UserProfile
                currentUser={currentUser as Customer}
                orders={state.orders}
                backend={backend}
                onLogout={onExit}
            />
        ) : activeView === 'WISHLIST' && !isEmployee ? (
            <WishlistPage
                products={state.products}
                wishlistIds={customerWishlist}
                onRemoveFromWishlist={(pid) => handleToggleWishlist(pid)}
                onAddToCart={(p) => addToCart(p)}
                onNavigateHome={navigateHome}
                onProductClick={navigateToProduct}
            />
        ) : activeView === 'PRODUCT' && viewingProduct ? (
            <ProductDetails 
                product={viewingProduct} 
                products={state.products}
                onNavigateHome={navigateHome}
                onCategoryClick={(catId) => { setCategoryFilter(catId); navigateToAllProducts(); }}
                onProductClick={navigateToProduct}
                onAddToCart={addToCart}
            />
        ) : activeView === 'CHECKOUT' ? (
            <CheckoutPage
                cart={cart}
                setCart={setCart}
                backend={backend}
                onOrderSuccess={handleOrderSuccess}
                onNavigateHome={navigateHome}
                currentUser={currentUser as Customer}
            />
        ) : activeView === 'ALL_PRODUCTS' ? (
             <AllProductsPage
                products={state.products}
                categories={state.categories}
                onProductClick={navigateToProduct}
                onAddToCart={(p) => addToCart(p)}
                onNavigateHome={navigateHome}
                initialSearchTerm={searchTerm}
                initialCategoryFilter={categoryFilter}
             />
        ) : (
            <StoreHome 
                products={state.products}
                categories={state.categories}
                onProductClick={navigateToProduct}
                onAddToCart={(p) => addToCart(p)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                onViewAllClick={navigateToAllProducts}
            />
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        setCart={setCart}
        backend={backend}
        onNavigateToCheckout={navigateToCheckout}
      />

      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-indigo-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-30 hover:bg-indigo-700 hover:-translate-y-1 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
      </button>

      <Footer />
    </div>
  );
};

export default Storefront;
