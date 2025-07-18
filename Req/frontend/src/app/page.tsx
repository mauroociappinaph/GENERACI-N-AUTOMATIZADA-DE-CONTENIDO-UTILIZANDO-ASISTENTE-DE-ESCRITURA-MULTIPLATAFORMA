'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getDefaultRouteForRole } from '@/lib/navigation';
import { Loading } from '@/components/ui/loading';

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to their default route based on role
    if (isAuthenticated && user) {
      const defaultRoute = getDefaultRouteForRole(user.role);
      router.push(defaultRoute);
    } else {
      // If not authenticated, redirect to login
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" />
    </div>
  );
}
