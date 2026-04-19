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

function createAuthStorage(SESSION_KEY: string, CREDS_KEY: string, ACTIVE_KEY: string) {
  return {
    saveCredentials: (email: string, rememberMe: boolean) => {
      if (rememberMe) {
        localStorage.setItem(CREDS_KEY, JSON.stringify({ email, rememberMe, timestamp: Date.now() }));
      } else {
        localStorage.removeItem(CREDS_KEY);
      }
    },

    getCredentials: (): StoredCredentials | null => {
      try {
        const stored = localStorage.getItem(CREDS_KEY);
        if (!stored) return null;
        const creds = JSON.parse(stored) as StoredCredentials;
        if (Date.now() - creds.timestamp > 30 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(CREDS_KEY);
          return null;
        }
        return creds;
      } catch { localStorage.removeItem(CREDS_KEY); return null; }
    },

    saveSession: (user: any, token?: string, expiresIn: number = 24 * 60 * 60 * 1000) => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token, expiresAt: Date.now() + expiresIn }));
      sessionStorage.setItem(ACTIVE_KEY, 'true');
    },

    getSession: (): StoredSession | null => {
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) return null;
        const session = JSON.parse(stored) as StoredSession;
        if (Date.now() > session.expiresAt) {
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(ACTIVE_KEY);
          return null;
        }
        return session;
      } catch { localStorage.removeItem(SESSION_KEY); return null; }
    },

    clearSession: () => {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(ACTIVE_KEY);
    },

    isSessionActive: (): boolean => {
      return sessionStorage.getItem(ACTIVE_KEY) === 'true';
    },

    setupTabCloseListener: (callback: () => void) => {
      const handle = () => { if (!sessionStorage.getItem(ACTIVE_KEY)) callback(); };
      window.addEventListener('beforeunload', handle);
      window.addEventListener('pagehide', handle);
      return () => {
        window.removeEventListener('beforeunload', handle);
        window.removeEventListener('pagehide', handle);
      };
    },
  };
}

export const adminAuthStorage = createAuthStorage(
  'unishop_admin_session',
  'unishop_admin_credentials',
  'unishop_admin_active'
);

export const storeAuthStorage = createAuthStorage(
  'unishop_store_session',
  'unishop_store_credentials',
  'unishop_store_active'
);

export const authStorage = storeAuthStorage;
