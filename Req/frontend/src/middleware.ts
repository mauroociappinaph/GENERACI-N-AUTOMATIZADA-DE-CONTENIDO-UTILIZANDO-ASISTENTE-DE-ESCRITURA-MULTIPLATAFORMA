import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './types';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/recuperar-password'];

// Define role-based route access
const roleBasedRoutes = {
  [UserRole.ADMIN]: ['/admin', '/reports', '/records', '/dashboard'],
  [UserRole.MANAGER]: ['/reports', '/records', '/dashboard'],
  [UserRole.USER]: ['/records', '/dashboard'],
  [UserRole.VIEWER]: ['/dashboard'],
};

// Define default redirect paths based on roles
const roleDefaultPaths = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.MANAGER]: '/dashboard',
  [UserRole.USER]: '/dashboard',
  [UserRole.VIEWER]: '/dashboard',
};

// Helper function to parse authentication token
function parseAuthToken(token: string): {
  isAuthenticated: boolean;
  userRole: UserRole | null;
} {
  try {
    const parsedToken = JSON.parse(decodeURIComponent(token));
    return {
      isAuthenticated: parsedToken.state?.isAuthenticated || false,
      userRole: (parsedToken.state?.user?.role as UserRole) || null,
    };
  } catch {
    // Handle error silently
    return { isAuthenticated: false, userRole: null };
  }
}

// Helper function to handle unauthenticated users
function handleUnauthenticatedUser(
  pathname: string,
  isPublicRoute: boolean,
  request: NextRequest
) {
  if (!isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return null;
}

// Helper function to handle authenticated users
function handleAuthenticatedUser(
  pathname: string,
  isPublicRoute: boolean,
  userRole: UserRole | null,
  request: NextRequest
) {
  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (userRole) {
    const hasAccess = checkRoleAccess(pathname, userRole);
    if (!hasAccess) {
      const defaultPath = roleDefaultPaths[userRole] || '/dashboard';
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }
  }

  if (pathname === '/') {
    const defaultPath = userRole ? roleDefaultPaths[userRole] : '/dashboard';
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  const token = request.cookies.get('auth-storage')?.value;
  const { isAuthenticated, userRole } = token
    ? parseAuthToken(token)
    : { isAuthenticated: false, userRole: null };

  if (!isAuthenticated) {
    const response = handleUnauthenticatedUser(
      pathname,
      isPublicRoute,
      request
    );
    if (response) return response;
  }

  if (isAuthenticated) {
    const response = handleAuthenticatedUser(
      pathname,
      isPublicRoute,
      userRole,
      request
    );
    if (response) return response;
  }

  return NextResponse.next();
}

// Helper function to check if a user role has access to a specific path
function checkRoleAccess(pathname: string, role: UserRole): boolean {
  // For root path, consider it as a valid access point if the user has any allowed route
  if (pathname === '/') {
    return true;
  }

  const rootPath = `/${pathname.split('/')[1]}`;

  // Admin has access to everything
  if (role === UserRole.ADMIN) {
    return true;
  }

  // Check if the role has access to this route
  const allowedRoutes = roleBasedRoutes[role] || [];
  return allowedRoutes.some(
    route => rootPath === route || pathname.startsWith(`${route}/`)
  );
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
