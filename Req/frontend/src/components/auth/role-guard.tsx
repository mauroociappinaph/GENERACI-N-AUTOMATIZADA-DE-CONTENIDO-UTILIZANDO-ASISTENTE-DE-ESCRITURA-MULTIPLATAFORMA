'use client';

import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
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
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated, middleware will handle redirect
    if (!isAuthenticated || !user) {
      return;
    }

    // Determine if access should be denied
    const hasAllowedRole = !allowedRoles || allowedRoles.includes(user.role);
    const hasPathAccess =
      !checkPathAccess || hasRouteAccess(pathname, user.role);

    if (!hasAllowedRole || !hasPathAccess) {
      // Redirect to appropriate path if access is denied
      const defaultPath = fallbackPath || getDefaultRouteForRole(user.role);
      router.push(defaultPath);
    }
  }, [
    user,
    isAuthenticated,
    allowedRoles,
    fallbackPath,
    router,
    pathname,
    checkPathAccess,
  ]);

  // If user is authenticated and we've verified access
  if (isAuthenticated && user) {
    // Check specific allowed roles if provided
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      );
    }

    // Check path access based on navigation configuration
    if (checkPathAccess && !hasRouteAccess(pathname, user.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" />
        </div>
      );
    }

    // User has access, render children
    return <>{children}</>;
  }

  // Show loading while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" />
    </div>
  );
}
