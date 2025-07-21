import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { Permission, RoleInfo, PermissionInfo } from '../types/roles';
/**
 * Middleware que verifica si el usuario tiene un rol específico
 */
export declare const requireRole: (...allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware que verifica si el usuario tiene un permiso específico
 */
export declare const requirePermission: (...requiredPermissions: Permission[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware que permite acceso solo al propietario del recurso o a administradores
 */
export declare const requireOwnershipOrAdmin: (getResourceOwnerId: (_req: Request) => string | Promise<string>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Función helper para verificar si un usuario tiene un permiso específico
 */
export declare const hasPermission: (userRole: UserRole, permission: Permission) => boolean;
/**
 * Función helper para obtener todos los permisos de un rol
 */
export declare const getRolePermissions: (role: UserRole) => readonly Permission[];
/**
 * Función helper para verificar si un rol es superior a otro
 */
export declare const isRoleHigherThan: (role1: UserRole, role2: UserRole) => boolean;
/**
 * Función helper para obtener información completa de un rol
 */
export declare const getRoleInfo: (role: UserRole) => RoleInfo;
/**
 * Función helper para obtener información completa de todos los roles
 */
export declare const getAllRolesInfo: () => RoleInfo[];
/**
 * Función helper para obtener información de un permiso
 */
export declare const getPermissionInfo: (permission: Permission) => PermissionInfo;
/**
 * Función helper para obtener información de todos los permisos
 */
export declare const getAllPermissionsInfo: () => PermissionInfo[];
/**
 * Función helper para verificar si un usuario puede gestionar a otro usuario
 * basado en la jerarquía de roles
 */
export declare const canManageUser: (managerRole: UserRole, targetRole: UserRole) => boolean;
/**
 * Middleware que verifica si el usuario puede gestionar el rol objetivo
 */
export declare const requireRoleManagement: (getTargetRole: (_req: Request) => UserRole | Promise<UserRole>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizationMiddleware: (...requiredPermissions: Permission[]) => (req: Request, res: Response, next: NextFunction) => void;
