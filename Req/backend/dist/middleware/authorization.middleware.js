"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizationMiddleware = exports.requireRoleManagement = exports.canManageUser = exports.getAllPermissionsInfo = exports.getPermissionInfo = exports.getAllRolesInfo = exports.getRoleInfo = exports.isRoleHigherThan = exports.getRolePermissions = exports.hasPermission = exports.requireOwnershipOrAdmin = exports.requirePermission = exports.requireRole = void 0;
const client_1 = require("@prisma/client");
const roles_1 = require("../types/roles");
/**
 * Middleware que verifica si el usuario tiene un rol específico
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
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
        const userRole = req.user.role;
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
exports.requireRole = requireRole;
/**
 * Middleware que verifica si el usuario tiene un permiso específico
 */
const requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
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
        const userRole = req.user.role;
        const userPermissions = roles_1.ROLE_PERMISSIONS[userRole] || [];
        const hasAllPermissions = requiredPermissions.every(permission => userPermissions.includes(permission));
        if (!hasAllPermissions) {
            res.status(403).json({
                error: {
                    code: 'FORBIDDEN',
                    message: 'No tienes los permisos necesarios para realizar esta acción',
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
exports.requirePermission = requirePermission;
/**
 * Middleware que permite acceso solo al propietario del recurso o a administradores
 */
const requireOwnershipOrAdmin = (getResourceOwnerId) => {
    return async (req, res, next) => {
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
        const userRole = req.user.role;
        // Los administradores tienen acceso completo
        if (userRole === client_1.UserRole.ADMIN) {
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
        }
        catch (error) {
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
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
/**
 * Función helper para verificar si un usuario tiene un permiso específico
 */
const hasPermission = (userRole, permission) => {
    const userPermissions = roles_1.ROLE_PERMISSIONS[userRole] || [];
    return userPermissions.includes(permission);
};
exports.hasPermission = hasPermission;
/**
 * Función helper para obtener todos los permisos de un rol
 */
const getRolePermissions = (role) => {
    return roles_1.ROLE_PERMISSIONS[role] || [];
};
exports.getRolePermissions = getRolePermissions;
/**
 * Función helper para verificar si un rol es superior a otro
 */
const isRoleHigherThan = (role1, role2) => {
    return roles_1.ROLE_HIERARCHY[role1] > roles_1.ROLE_HIERARCHY[role2];
};
exports.isRoleHigherThan = isRoleHigherThan;
/**
 * Función helper para obtener información completa de un rol
 */
const getRoleInfo = (role) => {
    return {
        role,
        name: role,
        description: roles_1.ROLE_DESCRIPTIONS[role],
        permissions: roles_1.ROLE_PERMISSIONS[role] || [],
        hierarchy: roles_1.ROLE_HIERARCHY[role],
    };
};
exports.getRoleInfo = getRoleInfo;
/**
 * Función helper para obtener información completa de todos los roles
 */
const getAllRolesInfo = () => {
    return Object.values(client_1.UserRole).map(role => (0, exports.getRoleInfo)(role));
};
exports.getAllRolesInfo = getAllRolesInfo;
/**
 * Función helper para obtener información de un permiso
 */
const getPermissionInfo = (permission) => {
    const [category] = permission.split(':');
    return {
        permission,
        description: roles_1.PERMISSION_DESCRIPTIONS[permission],
        category,
    };
};
exports.getPermissionInfo = getPermissionInfo;
/**
 * Función helper para obtener información de todos los permisos
 */
const getAllPermissionsInfo = () => {
    return Object.keys(roles_1.PERMISSION_DESCRIPTIONS).map(permission => (0, exports.getPermissionInfo)(permission));
};
exports.getAllPermissionsInfo = getAllPermissionsInfo;
/**
 * Función helper para verificar si un usuario puede gestionar a otro usuario
 * basado en la jerarquía de roles
 */
const canManageUser = (managerRole, targetRole) => {
    // Los administradores pueden gestionar a todos
    if (managerRole === client_1.UserRole.ADMIN) {
        return true;
    }
    // Los managers pueden gestionar a usuarios y viewers, pero no a otros managers o admins
    if (managerRole === client_1.UserRole.MANAGER) {
        return targetRole === client_1.UserRole.USER || targetRole === client_1.UserRole.VIEWER;
    }
    // Los usuarios normales y viewers no pueden gestionar a nadie
    return false;
};
exports.canManageUser = canManageUser;
/**
 * Middleware que verifica si el usuario puede gestionar el rol objetivo
 */
const requireRoleManagement = (getTargetRole) => {
    return async (req, res, next) => {
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
            const userRole = req.user.role;
            const targetRole = await getTargetRole(req);
            if (!(0, exports.canManageUser)(userRole, targetRole)) {
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
        }
        catch (error) {
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
exports.requireRoleManagement = requireRoleManagement;
// Alias para compatibilidad
exports.authorizationMiddleware = exports.requirePermission;
