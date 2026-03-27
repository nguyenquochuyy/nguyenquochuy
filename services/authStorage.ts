// Local Storage Service for Authentication
interface StoredCredentials {
  email: string;
  rememberMe: boolean;
  timestamp: number;
}

interface StoredSession {
  user: any;
  token?: string;
  expiresAt: number;
}

export const authStorage = {
  // Save credentials for remember me
  saveCredentials: (email: string, rememberMe: boolean) => {
    if (rememberMe) {
      const credentials: StoredCredentials = {
        email,
        rememberMe,
        timestamp: Date.now()
      };
      localStorage.setItem('unishop_credentials', JSON.stringify(credentials));
    } else {
      localStorage.removeItem('unishop_credentials');
    }
  },

  // Get saved credentials
  getCredentials: (): StoredCredentials | null => {
    const stored = localStorage.getItem('unishop_credentials');
    if (stored) {
      try {
        const credentials = JSON.parse(stored) as StoredCredentials;
        // Clear if older than 30 days
        if (Date.now() - credentials.timestamp > 30 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem('unishop_credentials');
          return null;
        }
        return credentials;
      } catch {
        localStorage.removeItem('unishop_credentials');
        return null;
      }
    }
    return null;
  },

  // Save session
  saveSession: (user: any, token?: string, expiresIn: number = 24 * 60 * 60 * 1000) => {
    const session: StoredSession = {
      user,
      token,
      expiresAt: Date.now() + expiresIn
    };
    localStorage.setItem('unishop_session', JSON.stringify(session));
    sessionStorage.setItem('unishop_session_active', 'true');
  },

  // Get session
  getSession: (): StoredSession | null => {
    const stored = localStorage.getItem('unishop_session');
    if (stored) {
      try {
        const session = JSON.parse(stored) as StoredSession;
        if (Date.now() > session.expiresAt) {
          authStorage.clearSession();
          return null;
        }
        return session;
      } catch {
        authStorage.clearSession();
        return null;
      }
    }
    return null;
  },

  // Clear session
  clearSession: () => {
    localStorage.removeItem('unishop_session');
    sessionStorage.removeItem('unishop_session_active');
  },

  // Check if session is active
  isSessionActive: (): boolean => {
    return sessionStorage.getItem('unishop_session_active') === 'true' && 
           authStorage.getSession() !== null;
  },

  // Auto logout on tab close
  setupTabCloseListener: (callback: () => void) => {
    const handleTabClose = () => {
      if (!authStorage.isSessionActive()) {
        callback();
      }
    };

    window.addEventListener('beforeunload', handleTabClose);
    window.addEventListener('pagehide', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
      window.removeEventListener('pagehide', handleTabClose);
    };
  }
};
