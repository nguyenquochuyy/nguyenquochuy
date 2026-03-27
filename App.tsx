
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useBackend } from './hooks/useBackend';
import { Customer, Employee } from './types';
import Storefront from './components/store/Storefront';
import AdminDashboard from './components/admin/AdminDashboard';
import PortalPage from './components/PortalPage';
import LoginPage from './components/auth/LoginPage';
import AdminLogin from './components/auth/AdminLogin';
import StoreLogin from './components/auth/StoreLogin';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import VerifyEmailPage from './components/auth/VerifyEmailPage';
import Level2PasswordModal from './components/auth/Level2PasswordModal';
import { Loader2, WifiOff } from 'lucide-react';
import { api } from './services/apiClient';
import { authStorage } from './services/authStorage';

// --- MAIN APP CONTROLLER ---
const AppController: React.FC = () => {
  const { backend, isLoading, isOffline, currentUser, setCurrentUser } = useBackend();
  const [loginMessage, setLoginMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<Omit<Customer, 'id' | 'joinedAt' | 'status'> | null>(null);
  
  // Admin Specific State
  const [isL2AuthRequired, setIsL2AuthRequired] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const session = authStorage.getSession();
    if (session && !currentUser) {
      setCurrentUser(session.user);
    }
  }, [currentUser, setCurrentUser]);

  // Setup tab close listener for session cleanup
  useEffect(() => {
    const cleanup = authStorage.setupTabCloseListener(() => {
      backend.logout();
    });
    
    return cleanup;
  }, [backend]);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle L2 Auth Check for Admin
  React.useEffect(() => {
      if (currentUser && 'role' in currentUser && location.pathname.startsWith('/admin')) {
          const emp = currentUser as Employee;
          if ((emp.level2PasswordAttempts || 0) < 5 && emp.level2Password) {
             // Logic to show L2 modal is handled in the AdminRoute wrapper or below
             // Tạm thời tắt yêu cầu nhập MK cấp 2
             // setIsL2AuthRequired(true);
          }
      }
  }, [currentUser, location]);

  // Navigate to Portal after Login
  React.useEffect(() => {
    if (currentUser && location.pathname === '/admin/login') {
      navigate('/portal');
    } else if (currentUser && location.pathname === '/login') {
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

  const isEmployee = currentUser && 'role' in currentUser;

  // --- Protected Route Wrappers ---
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
      if (!currentUser) return <Navigate to="/login" replace />;
        return children;
  };

  const AdminRoute = ({ children }: { children: React.ReactElement }) => {
      if (!currentUser) return <Navigate to="/login" replace />;
      if (!isEmployee) return <Navigate to="/portal" replace />;
      
      // L2 Auth Intercept
      if (isL2AuthRequired) {
          return (
            <Level2PasswordModal 
                user={currentUser as Employee}
                backend={backend}
                onSuccess={() => {
                    backend.resetLevel2PasswordAttempts(currentUser.id);
                    setIsL2AuthRequired(false);
                }}
                onFailure={() => {
                    setIsL2AuthRequired(false);
                    backend.logout();
                }}
                onCancel={() => navigate('/portal')}
            />
          );
      }
      return children;
  };

  return (
    <>
      {isOffline && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm text-center font-bold flex justify-center items-center gap-2 sticky top-0 z-[100] shadow-sm">
              <WifiOff size={16} /> Chế độ Offline: Không thể kết nối đến máy chủ.
          </div>
      )}
      
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={<Navigate to="/store" replace />} />
        
        <Route path="/admin/login" element={
            <AdminLogin 
                backend={backend} 
                message={loginMessage} 
                onClearMessage={() => setLoginMessage(null)}
            />
        } />
        
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

        {/* === PORTAL (Logged In) === */}
        <Route path="/portal" element={
            <ProtectedRoute>
                <PortalPage 
                    user={currentUser!} 
                    onNavigate={(path) => navigate(path)}
                    onLogout={backend.logout}
                />
            </ProtectedRoute>
        } />

        {/* === ADMIN APP === */}
        <Route path="/admin/*" element={
            <AdminRoute>
                <AdminDashboard 
                    backend={backend} 
                    onExit={() => navigate('/portal')} 
                />
            </AdminRoute>
        } />

        {/* === STOREFRONT (Public but aware of user) === */}
        <Route path="/store/*" element={
            <Storefront 
                backend={backend} 
                onExit={() => {
                    // If employee, go back to portal. If customer, logout.
                    if (isEmployee) navigate('/portal');
                    else backend.logout();
                }} 
                currentUser={currentUser}
            />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/store" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AppController />
        </BrowserRouter>
    );
};

export default App;
