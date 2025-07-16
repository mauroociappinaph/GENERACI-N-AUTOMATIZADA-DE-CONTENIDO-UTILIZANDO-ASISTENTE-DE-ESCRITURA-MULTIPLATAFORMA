import { UserRole } from '../generated/prisma';

/**
 * Definición de todos los permisos disponibles en el sistema
 */
export type Permission =
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'data:create'
  | 'data:read'
  | 'data:update'
  | 'data:delete'
  | 'reports:create'
  | 'reports:read'
  | 'reports:update'
  | 'reports:delete'
  | 'system:configure'
  | 'audit:read';

/**
 * Definición de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'data:create',
    'data:read',
    'data:update',
    'data:delete',
    'reports:create',
    'reports:read',
    'reports:update',
    'reports:delete',
    'system:configure',
    'audit:read',
  ],
  [UserRole.MANAGER]: [
    'users:read',
    'users:update',
    'data:create',
    'data:read',
    'data:update',
    'data:delete',
    'reports:create',
    'reports:read',
    'reports:update',
    'audit:read',
  ],
  [UserRole.USER]: [
    'data:create',
    'data:read',
    'data:update',
    'reports:read',
  ],
  [UserRole.VIEWER]: [
    'data:read',
    'reports:read',
  ],
};

/**
 * Jerarquía de roles (mayor número = mayor jerarquía)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.VIEWER]: 1,
  [UserRole.USER]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.ADMIN]: 4,
};

/**
 * Descripción de cada rol
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador del sistema con acceso completo',
  [UserRole.MANAGER]: 'Gerente con permisos de gestión y supervisión',
  [UserRole.USER]: 'Usuario estándar con permisos básicos de operación',
  [UserRole.VIEWER]: 'Usuario con permisos de solo lectura',
};

/**
 * Descripción de cada permiso
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'users:create': 'Crear nuevos usuarios',
  'users:read': 'Ver información de usuarios',
  'users:update': 'Actualizar información de usuarios',
  'users:delete': 'Eliminar usuarios',
  'data:create': 'Crear nuevos registros de datos',
  'data:read': 'Ver registros de datos',
  'data:update': 'Actualizar registros de datos',
  'data:delete': 'Eliminar registros de datos',
  'reports:create': 'Crear nuevos reportes',
  'reports:read': 'Ver reportes',
  'reports:update': 'Actualizar reportes',
  'reports:delete': 'Eliminar reportes',
  'system:configure': 'Configurar parámetros del sistema',
  'audit:read': 'Ver logs de auditoría',
};

/**
 * Información completa de un rol
 */
export interface RoleInfo {
  role: UserRole;
  name: string;
  description: string;
  permissions: Permission[];
  hierarchy: number;
}

/**
 * Información completa de un permiso
 */
export interface PermissionInfo {
  permission: Permission;
  description: string;
  category: string;
}
