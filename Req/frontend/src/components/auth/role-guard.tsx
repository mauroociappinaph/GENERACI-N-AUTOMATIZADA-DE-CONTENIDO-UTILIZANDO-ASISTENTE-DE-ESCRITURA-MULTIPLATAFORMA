'use client';

import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect, useCallback } from 'react';
import { Loading } from '@/components/ui/loading';
import { getDefaultRouteForRole, hasRouteAccess } from '@/lib/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
  checkPathAccess?: boolean;
}

/**
 * Component that guards routes based on user roles
 *
 * @param children - Content to render if user has access
 * @param allowedRoles - Specific roles that can access this route (optional)
 * @param fallbackPath - Path to redirect to if access is denied (defaults to role-based path)
 * @param checkPathAccess - Whether to check path access based on navigation config (defaults to true)
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath,
  checkPathAccess = true,
}: RoleGuardProps) {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const getRedirectPath = useCallback(
    (userRole: UserRole) => {
      return fallbackPath || getDefaultRouteForRole(userRole);
    },
    [fallbackPath]
  );

  const checkRoleAccess = useCallback(
    (userRole: UserRole) => {
      return !allowedRoles || allowedRoles.includes(userRole);
    },
    [allowedRoles]
  );

  const checkUserPathAccess = useCallback(
    (currentPath: string, userRole: UserRole) => {
      return !checkPathAccess || hasRouteAccess(currentPath, userRole);
    },
    [checkPathAccess]
  );

  const handleAccessDenied = useCallback(
    (userRole: UserRole) => {
      const redirectPath = getRedirectPath(userRole);
      router.push(redirectPath);
    },
    [getRedirectPath, router]
  );

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user) {
      return;
    }

    if (!checkRoleAccess(user.role)) {
      handleAccessDenied(user.role);
      return;
    }

    if (!checkUserPathAccess(pathname, user.role)) {
      handleAccessDenied(user.role);
    }
  }, [
    user,
    isAuthenticated,
    allowedRoles,
    fallbackPath,
    router,
    pathname,
    checkPathAccess,
    isInitialized,
    checkRoleAccess,
    checkUserPathAccess,
    handleAccessDenied,
  ]);

  // Show loading while store is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // If user is authenticated and has access, render children
  if (isAuthenticated && user) {
    // Final access check before rendering
    const hasAllowedRole = !allowedRoles || allowedRoles.includes(user.role);
    const hasPathAccess =
      !checkPathAccess || hasRouteAccess(pathname, user.role);

    if (hasAllowedRole && hasPathAccess) {
      return <>{children}</>;
    }
  }

  // Show loading while redirecting or if not authenticated
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" />
    </div>
  );
}
