'use client';

import { useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { User } from '@/types';

interface AuthProviderProps {
  initialState: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
  };
}

export function AuthProvider({ initialState }: AuthProviderProps) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useAuthStore.setState({
      user: initialState.user,
      token: initialState.token,
      isAuthenticated: initialState.isAuthenticated,
    });
    initialized.current = true;
  }

  return null;
}
