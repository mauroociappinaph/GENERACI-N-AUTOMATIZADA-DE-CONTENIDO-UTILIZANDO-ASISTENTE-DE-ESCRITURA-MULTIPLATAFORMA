'use client';

import { useAuthStore } from '@/store/auth-store';
import { User } from '@/types';
import { useEffect } from 'react';

interface AuthInitializerProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export function AuthInitializer({ user, token, isAuthenticated }: AuthInitializerProps) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize(user, token, isAuthenticated);
  }, [initialize, user, token, isAuthenticated]);

  return null;
}
