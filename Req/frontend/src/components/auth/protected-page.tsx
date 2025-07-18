'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types';
import { RoleGuard } from './role-guard';
import { MainLayout } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { getDefaultRouteForRole } from '@/lib/navigation';

interface ProtectedPageProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  title?: string;
  requireAuth?: boolean;
  checkPathAccess?: boolean;
}

/**
 * Component that wraps pages with authentication, authorization, and layout
 *
 * @param children - Page content
 * @param allowedRoles - Specific roles that can access this page
 * @param title - Page title
 * @param requireAuth - Whether authentication is required (default: true)
 * @param checkPathAccess - Whether to check path access based on navigation config
 */
export function ProtectedPage({
  children,
  allowedRoles,
  title,
  requireAuth = true,
  checkPathAccess = true,
}: ProtectedPageProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // If authentication is not required, render without protection
  if (!requireAuth) {
    return <>{children}</>;
  }

  return (
    <RoleGuard
      allowedRoles={allowedRoles}
      fallbackPath={user ? getDefaultRouteForRole(user.role) : '/login'}
      checkPathAccess={checkPathAccess}
    >
      <MainLayout user={user} onLogout={handleLogout}>
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          </div>
        )}
        {children}
      </MainLayout>
    </RoleGuard>
  );
}
