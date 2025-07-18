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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get the token from cookies
  const token = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;
  let userRole: UserRole | null = null;

  // Parse the token to check if user is authenticated and get role
  if (token) {
    try {
      const parsedToken = JSON.parse(decodeURIComponent(token));
      isAuthenticated = parsedToken.state?.isAuthenticated || false;
      userRole = parsedToken.state?.user?.role || null;
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }

  // Redirect logic for unauthenticated users
  if (!isAuthenticated && !isPublicRoute && pathname !== '/') {
    // Redirect to login if not authenticated and trying to access protected route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logic for authenticated users
  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access public route
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Handle role-based access
    if (userRole) {
      // Check if user is trying to access a route they don't have permission for
      const hasAccess = checkRoleAccess(pathname, userRole);

      if (!hasAccess) {
        // Redirect to the default path for their role
        const defaultPath = roleDefaultPaths[userRole] || '/dashboard';
        return NextResponse.redirect(new URL(defaultPath, request.url));
      }
    }

    // Redirect root path to appropriate dashboard
    if (pathname === '/') {
      const defaultPath = userRole ? roleDefaultPaths[userRole] : '/dashboard';
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }
  }

  return NextResponse.next();
}

// Helper function to check if a user role has access to a specific path
function checkRoleAccess(pathname: string, role: UserRole): boolean {
  // Root paths like /admin, /dashboard, etc.
  const rootPath = '/' + pathname.split('/')[1];

  // Admin has access to everything
  if (role === UserRole.ADMIN) {
    return true;
  }

  // Check if the role has access to this route
  const allowedRoutes = roleBasedRoutes[role] || [];
  return allowedRoutes.some(route => rootPath === route);
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
