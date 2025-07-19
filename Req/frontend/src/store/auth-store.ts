import { User } from '@/types';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  initialize: (
    user: User | null,
    token: string | null,
    isAuthenticated: boolean
  ) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(set => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  login: (token, user) =>
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    }),

  logout: () =>
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    }),

  setLoading: isLoading => set({ isLoading }),

  updateUser: userData =>
    set(state => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),

  initialize: (user, token, isAuthenticated) =>
    set({
      user,
      token,
      isAuthenticated,
      isInitialized: true,
    }),
}));
