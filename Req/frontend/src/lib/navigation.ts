import { UserRole } from '@/types';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavigationItem[];
  description?: string;
}

export const mainNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    description: 'Vista general del sistema',
  },
  {
    name: 'Registros',
    href: '/records',
    icon: 'database',
    description: 'Gestión de datos y registros',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    children: [
      {
        name: 'Todos los registros',
        href: '/records',
        description: 'Ver todos los registros',
      },
      {
        name: 'Crear registro',
        href: '/records/create',
        description: 'Crear un nuevo registro',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        name: 'Búsqueda avanzada',
        href: '/records/search',
        description: 'Búsqueda avanzada de registros',
      },
    ],
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: 'chart',
    description: 'Generación y visualización de reportes',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      {
        name: 'Reportes disponibles',
        href: '/reports',
        description: 'Ver reportes disponibles',
      },
      {
        name: 'Crear reporte',
        href: '/reports/create',
        description: 'Crear un nuevo reporte',
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        name: 'Reportes programados',
        href: '/reports/scheduled',
        description: 'Ver reportes programados',
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
  {
    name: 'Administración',
    href: '/admin',
    icon: 'settings',
    description: 'Configuración y administración del sistema',
    roles: [UserRole.ADMIN],
    children: [
      {
        name: 'Usuarios',
        href: '/admin/users',
        description: 'Gestión de usuarios',
      },
      {
        name: 'Configuración',
        href: '/admin/settings',
        description: 'Configuración del sistema',
      },
      {
        name: 'Auditoría',
        href: '/admin/audit',
        description: 'Logs de auditoría',
      },
    ],
  },
];

/**
 * Filters navigation items based on user role
 * @param navigation Navigation items to filter
 * @param role User role
 * @returns Filtered navigation items
 */
export function filterNavigationByRole(
  navigation: NavigationItem[],
  role?: UserRole | null
): NavigationItem[] {
  if (!role) return navigation.filter((item) => !item.roles);

  return navigation
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => {
      if (!item.children) return item;

      return {
        ...item,
        children: item.children.filter(
          (child) => !child.roles || child.roles.includes(role)
        ),
      };
    });
}

/**
 * Checks if a user has access to a specific route
 * @param path Route path
 * @param role User role
 * @returns Boolean indicating if user has access
 */
export function hasRouteAccess(path: string, role?: UserRole | null): boolean {
  if (!role) return false;

  // Admin has access to everything
  if (role === UserRole.ADMIN) return true;

  // Get base path (first segment)
  const basePath = '/' + path.split('/')[1];

  // Define role-based route access (same as in middleware.ts)
  const roleBasedRoutes = {
    [UserRole.ADMIN]: ['/admin', '/reports', '/records', '/dashboard'],
    [UserRole.MANAGER]: ['/reports', '/records', '/dashboard'],
    [UserRole.USER]: ['/records', '/dashboard'],
    [UserRole.VIEWER]: ['/dashboard'],
  };

  // Check if the role has access to this base path
  const allowedRoutes = roleBasedRoutes[role] || [];
  if (!allowedRoutes.includes(basePath)) return false;

  // If this is a child route, check if role has access to the specific child
  if (path !== basePath) {
    const childPath = path.split('/').slice(0, 3).join('/');
    const navItem = mainNavigation.find(item => item.href === basePath);
    const childNavItem = navItem?.children?.find(item => item.href === childPath);

    if (childNavItem && childNavItem.roles && !childNavItem.roles.includes(role)) {
      return false;
    }
  }

  return true;
}

/**
 * Gets the default landing page for a user based on their role
 * @param role User role
 * @returns Default landing page path
 */
export function getDefaultRouteForRole(role?: UserRole | null): string {
  if (!role) return '/login';

  // Use the same defaults as defined in middleware.ts
  const roleDefaultPaths = {
    [UserRole.ADMIN]: '/admin',
    [UserRole.MANAGER]: '/dashboard',
    [UserRole.USER]: '/dashboard',
    [UserRole.VIEWER]: '/dashboard',
  };

  return roleDefaultPaths[role] || '/dashboard';
}
