
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useBackend } from './hooks/useBackend';
import { Employee } from './types';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginPage from './components/auth/LoginPage';
import Level2PasswordModal from './components/auth/Level2PasswordModal';
import { Loader2, WifiOff } from 'lucide-react';

// --- ADMIN APP CONTROLLER ---
const AdminAppController: React.FC = () => {
  const { backend, isLoading, isOffline, currentUser } = useBackend();
  const [isL2AuthRequired, setIsL2AuthRequired] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
      // Check L2 Auth on login
      if (currentUser && 'role' in currentUser) {
          const emp = currentUser as Employee;
          if ((emp.level2PasswordAttempts || 0) < 5) setIsL2AuthRequired(true);
      }
  }, [currentUser]);

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
    <>
      {isOffline && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm text-center font-bold flex justify-center items-center gap-2 sticky top-0 z-[100]">
              <WifiOff size={16} /> Offline Mode: Server unreachable.
          </div>
      )}
      
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={
            isEmployee ? <Navigate to="/" /> :
            <LoginPage 
                onNavigate={() => {}} 
                backend={backend} 
                onClearMessage={() => {}}
                allowedRole="STAFF"
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
                    <AdminDashboard backend={backend} onExit={backend.logout} />
                )
            ) : <Navigate to="/login" />
        } />
      </Routes>
    </>
  );
};

const AdminApp: React.FC = () => {
    return (
        <BrowserRouter>
            <AdminAppController />
        </BrowserRouter>
    );
};

export default AdminApp;
