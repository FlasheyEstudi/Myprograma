import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginData, RegisterData, AuthTokens } from '@/api/types';
import { authApi } from '@/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const { user, tokens } = response;
          
          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          
          set({ 
            user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          const { user, tokens } = response;
          
          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          
          set({ 
            user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },

      refreshToken: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await authApi.refreshToken(refreshToken);
          const { tokens } = response;
          
          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({ 
            user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            await get().refreshToken();
            const user = await authApi.getCurrentUser();
            set({ 
              user, 
              isAuthenticated: true,
              isLoading: false 
            });
          } catch (refreshError) {
            get().logout();
            set({ isLoading: false });
          }
        }
      },

      updateProfile: async (data: { name?: string; phone?: string }) => {
        try {
          const updatedUser = await authApi.updateProfile(data);
          set({ user: updatedUser });
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);