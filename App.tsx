import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './services/queryClient';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useBackend } from './hooks/useBackend';
import { Customer } from './types';
import Storefront from './components/store/Storefront';
import StoreLogin from './components/auth/StoreLogin';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import VerifyEmailPage from './components/auth/VerifyEmailPage';
import { Loader2, WifiOff } from 'lucide-react';
import ToastContainer from './components/ui/ToastContainer';
import { api } from './services/apiClient';
import { storeAuthStorage } from './services/authStorage';

// --- MAIN APP CONTROLLER ---
const AppController: React.FC = () => {
  const { backend, isLoading, isOffline, currentUser, setCurrentUser } = useBackend();
  const [loginMessage, setLoginMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<Omit<Customer, 'id' | 'joinedAt' | 'status'> | null>(null);

  // Restore ONLY customer sessions (store users)
  useEffect(() => {
    const session = storeAuthStorage.getSession();
    if (session?.user && !('role' in session.user) && !currentUser) {
      setCurrentUser(session.user);
    }
  }, []);

  useEffect(() => {
    const cleanup = storeAuthStorage.setupTabCloseListener(backend.logout);
    return cleanup;
  }, [backend]);

  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to store after login
  React.useEffect(() => {
    if (currentUser && location.pathname === '/login') {
      navigate('/store');
    }
  }, [currentUser, location.pathname, navigate]);

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4 animate-fade-in">
              <Loader2 size={48} className="text-indigo-600 animate-spin" />
              <p className="text-slate-500 font-medium">Khởi động hệ thống UniShop...</p>
          </div>
      );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
      if (!currentUser) return <Navigate to="/login" replace />;
      return children;
  };

  return (
    <>
      <ToastContainer />
      {isOffline && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm text-center font-bold flex justify-center items-center gap-2 sticky top-0 z-[100] shadow-sm">
              <WifiOff size={16} /> Chế độ Offline: Không thể kết nối đến máy chủ.
          </div>
      )}

      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={<Navigate to="/store" replace />} />

        <Route path="/login" element={
            <StoreLogin
                backend={backend}
                message={loginMessage}
                onClearMessage={() => setLoginMessage(null)}
                onNavigate={(view) => {
                    if (view === 'REGISTER') navigate('/register');
                    else if (view === 'FORGOT_PASSWORD') navigate('/forgot-password');
                    else if (view === 'STORE') navigate('/store');
                }}
                onLoginSuccess={(user) => {
                    // Update backend context with logged in user
                    backend.setCurrentUser(user);
                    console.log('User logged in:', user);
                }}
            />
        } />

        <Route path="/customer-login" element={<Navigate to="/login" replace />} />

        <Route path="/register" element={
            <RegisterPage
                onNavigate={() => navigate('/login')}
                backend={backend}
                onBeginVerification={(d) => { setPendingRegistration(d); navigate('/verify'); }}
            />
        } />

        <Route path="/verify" element={
            <VerifyEmailPage
                email={pendingRegistration?.email || ''}
                onNavigate={() => navigate('/login')}
                onVerifySuccess={async () => {
                    if(pendingRegistration) {
                        try {
                            // Call API to create customer
                            const response = await api.createCustomer(pendingRegistration);
                            if (response.success) {
                                setLoginMessage({type:'success', text:'Tài khoản đã được tạo thành công! Vui lòng đăng nhập.'});
                            } else {
                                setLoginMessage({type:'error', text: response.message || 'Có lỗi xảy ra khi tạo tài khoản.'});
                            }
                        } catch (error) {
                            console.error('Create customer error:', error);
                            setLoginMessage({type:'error', text: 'Không thể kết nối đến server để tạo tài khoản.'});
                        }
                    }
                    setPendingRegistration(null);
                    navigate('/login');
                }}
            />
        } />

        <Route path="/forgot-password" element={<ForgotPasswordPage onNavigate={() => navigate('/login')} />} />

        {/* === STOREFRONT === */}
        <Route path="/store/*" element={
            <Storefront
                backend={backend}
                onExit={backend.logout}
                currentUser={currentUser as Customer | null}
            />
        } />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/store" replace />} />
        <Route path="*" element={<Navigate to="/store" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppController />
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};

export default App;
