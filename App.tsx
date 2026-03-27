
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useBackend } from './hooks/useBackend';
import { Customer, Employee } from './types';
import Storefront from './components/store/Storefront';
import AdminDashboard from './components/admin/AdminDashboard';
import PortalPage from './components/PortalPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import VerifyEmailPage from './components/auth/VerifyEmailPage';
import Level2PasswordModal from './components/auth/Level2PasswordModal';
import { Loader2, WifiOff } from 'lucide-react';

// --- MAIN APP CONTROLLER ---
const AppController: React.FC = () => {
  const { backend, isLoading, isOffline, currentUser, setCurrentUser } = useBackend();
  const [loginMessage, setLoginMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<Omit<Customer, 'id' | 'joinedAt' | 'status'> | null>(null);
  
  // Admin Specific State
  const [isL2AuthRequired, setIsL2AuthRequired] = useState(false);

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
      if (currentUser && location.pathname === '/login') {
          navigate('/portal');
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
        
        <Route path="/login" element={
            <LoginPage 
                onNavigate={(view) => navigate(view === 'REGISTER' ? '/register' : '/forgot-password')} 
                backend={backend} 
                message={loginMessage} 
                onClearMessage={() => setLoginMessage(null)}
            />
        } />
        
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
                onVerifySuccess={() => { 
                    if(pendingRegistration) backend.register(pendingRegistration); 
                    setPendingRegistration(null); 
                    setLoginMessage({type:'success', text:'Xác thực thành công! Vui lòng đăng nhập.'}); 
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
