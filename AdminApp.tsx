import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useBackend } from './hooks/useBackend';
import { Employee, Language } from './types';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/auth/AdminLogin';
import Level2PasswordModal from './components/auth/Level2PasswordModal';
import { adminAuthStorage } from './services/authStorage';
import { Loader2, WifiOff } from 'lucide-react';
import ToastContainer from './components/ui/ToastContainer';

// --- ADMIN APP CONTROLLER ---
const AdminAppController: React.FC = () => {
  const { backend, isLoading, isOffline, currentUser, setCurrentUser } = useBackend();
  const [isL2AuthRequired, setIsL2AuthRequired] = useState(false);
  const lang: Language = 'vi'; // Hardcode Vietnamese

  // Restore admin session on mount (only employees)
  useEffect(() => {
    const session = adminAuthStorage.getSession();
    if (session?.user && 'role' in session.user && !currentUser) {
      setCurrentUser(session.user);
    }
  }, []);

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
              <Loader2 size={48} className="text-indigo-600 animate-spin" />
              <p className="text-slate-500 font-medium">Loading Admin System...</p>
          </div>
      );
  }

  const isEmployee = currentUser && 'role' in currentUser;

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <ToastContainer />
      {isOffline && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm text-center font-bold flex justify-center items-center gap-2 sticky top-0 z-[100] shrink-0">
              <WifiOff size={16} /> Offline Mode: Server unreachable.
          </div>
      )}
      
      <div className="flex-1 min-h-0 flex flex-col">
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={
            isEmployee ? <Navigate to="/" replace /> :
            <AdminLogin
                backend={backend}
                onClearMessage={() => {}}
            />
        } />

        {/* Dashboard Route */}
        <Route path="/*" element={
            isEmployee ? (
                isL2AuthRequired ? (
                    <Level2PasswordModal 
                        user={currentUser as Employee}
                        backend={backend}
                        onSuccess={() => {
                            backend.resetLevel2PasswordAttempts(currentUser?.id || '');
                            setIsL2AuthRequired(false);
                        }}
                        onFailure={() => {
                            setIsL2AuthRequired(false);
                            backend.logout();
                        }}
                        onCancel={() => backend.logout()}
                    />
                ) : (
                    <AdminDashboard 
                        backend={backend}
                        onExit={() => { adminAuthStorage.clearSession(); setCurrentUser(null); }}
                        lang={lang}
                    />
                )
            ) : <Navigate to="/login" />
        } />
      </Routes>
      </div>
    </div>
  );
};

const AdminApp: React.FC = () => {
    return (
        <BrowserRouter basename="/admin" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AdminAppController />
        </BrowserRouter>
    );
};

export default AdminApp;
