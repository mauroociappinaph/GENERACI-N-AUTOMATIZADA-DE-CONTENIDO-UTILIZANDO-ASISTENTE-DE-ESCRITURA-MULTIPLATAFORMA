import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import {
  Permission,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  RoleInfo,
  PermissionInfo,
  ROLE_DESCRIPTIONS,
  PERMISSION_DESCRIPTIONS,
} from '../types/roles';

/**
 * Middleware que verifica si el usuario tiene un rol específico
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const userRole = req.user.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permisos para acceder a este recurso',
          details: {
            requiredRoles: allowedRoles,
            userRole: userRole,
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware que verifica si el usuario tiene un permiso específico
 */
export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message:
            'No tienes los permisos necesarios para realizar esta acción',
          details: {
            requiredPermissions,
            userPermissions,
            userRole,
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware que permite acceso solo al propietario del recurso o a administradores
 */
export const requireOwnershipOrAdmin = (
  getResourceOwnerId: (_req: Request) => string | Promise<string>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const userRole = req.user.role as UserRole;

    // Los administradores tienen acceso completo
    if (userRole === UserRole.ADMIN) {
      next();
      return;
    }

    try {
      const resourceOwnerId = await getResourceOwnerId(req);

      if (req.user.id !== resourceOwnerId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Solo puedes acceder a tus propios recursos',
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al verificar permisos de propiedad',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  };
};

/**
 * Función helper para verificar si un usuario tiene un permiso específico
 */
export const hasPermission = (
  userRole: UserRole,
  permission: Permission
): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
};

/**
 * Función helper para obtener todos los permisos de un rol
 */
export const getRolePermissions = (role: UserRole): readonly Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Función helper para verificar si un rol es superior a otro
 */
export const isRoleHigherThan = (role1: UserRole, role2: UserRole): boolean => {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
};

/**
 * Función helper para obtener información completa de un rol
 */
export const getRoleInfo = (role: UserRole): RoleInfo => {
  return {
    role,
    name: role,
    description: ROLE_DESCRIPTIONS[role],
    permissions: ROLE_PERMISSIONS[role] || [],
    hierarchy: ROLE_HIERARCHY[role],
  };
};

/**
 * Función helper para obtener información completa de todos los roles
 */
export const getAllRolesInfo = (): RoleInfo[] => {
  return Object.values(UserRole).map(role => getRoleInfo(role));
};

/**
 * Función helper para obtener información de un permiso
 */
export const getPermissionInfo = (permission: Permission): PermissionInfo => {
  const [category] = permission.split(':');
  return {
    permission,
    description: PERMISSION_DESCRIPTIONS[permission],
    category,
  };
};

/**
 * Función helper para obtener información de todos los permisos
 */
export const getAllPermissionsInfo = (): PermissionInfo[] => {
  return Object.keys(PERMISSION_DESCRIPTIONS).map(permission =>
    getPermissionInfo(permission as Permission)
  );
};

/**
 * Función helper para verificar si un usuario puede gestionar a otro usuario
 * basado en la jerarquía de roles
 */
export const canManageUser = (
  managerRole: UserRole,
  targetRole: UserRole
): boolean => {
  // Los administradores pueden gestionar a todos
  if (managerRole === UserRole.ADMIN) {
    return true;
  }

  // Los managers pueden gestionar a usuarios y viewers, pero no a otros managers o admins
  if (managerRole === UserRole.MANAGER) {
    return targetRole === UserRole.USER || targetRole === UserRole.VIEWER;
  }

  // Los usuarios normales y viewers no pueden gestionar a nadie
  return false;
};

/**
 * Middleware que verifica si el usuario puede gestionar el rol objetivo
 */
export const requireRoleManagement = (
  getTargetRole: (_req: Request) => UserRole | Promise<UserRole>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    try {
      const userRole = req.user.role as UserRole;
      const targetRole = await getTargetRole(req);

      if (!canManageUser(userRole, targetRole)) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para gestionar usuarios con este rol',
            details: {
              userRole,
              targetRole,
            },
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al verificar permisos de gestión de roles',
          details: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  };
};
// Alias para compatibilidad
export const authorizationMiddleware = requirePermission;
