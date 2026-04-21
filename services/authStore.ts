import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, Employee } from '../types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: Customer | Employee | null;
  userType: 'employee' | 'customer' | null;
  isAuthenticated: boolean;

  setAuth: (payload: {
    accessToken: string;
    refreshToken: string;
    user: Customer | Employee;
    type: 'employee' | 'customer';
  }) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      userType: null,
      isAuthenticated: false,

      setAuth: ({ accessToken, refreshToken, user, type }) =>
        set({
          accessToken,
          refreshToken,
          user,
          userType: type,
          isAuthenticated: true,
        }),

      setAccessToken: (token) => set({ accessToken: token }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          userType: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'unishop-auth',
      // Chỉ persist refresh token và user info, không persist access token
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        userType: state.userType,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
