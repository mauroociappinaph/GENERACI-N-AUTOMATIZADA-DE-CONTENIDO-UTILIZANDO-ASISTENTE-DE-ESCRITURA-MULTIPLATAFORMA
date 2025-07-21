import { UserRole } from '@prisma/client';
/**
 * Definición de todos los permisos disponibles en el sistema
 */
export type Permission = 'users:create' | 'users:read' | 'users:update' | 'users:delete' | 'data:create' | 'data:read' | 'data:update' | 'data:delete' | 'reports:create' | 'reports:read' | 'reports:update' | 'reports:delete' | 'system:configure' | 'audit:read';
/**
 * Definición de permisos por rol
 */
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
/**
 * Jerarquía de roles (mayor número = mayor jerarquía)
 */
export declare const ROLE_HIERARCHY: Record<UserRole, number>;
/**
 * Descripción de cada rol
 */
export declare const ROLE_DESCRIPTIONS: Record<UserRole, string>;
/**
 * Descripción de cada permiso
 */
export declare const PERMISSION_DESCRIPTIONS: Record<Permission, string>;
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
