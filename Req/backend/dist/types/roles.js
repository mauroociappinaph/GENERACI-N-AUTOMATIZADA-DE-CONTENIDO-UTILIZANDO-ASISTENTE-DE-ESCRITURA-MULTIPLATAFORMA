"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_DESCRIPTIONS = exports.ROLE_DESCRIPTIONS = exports.ROLE_HIERARCHY = exports.ROLE_PERMISSIONS = void 0;
const client_1 = require("@prisma/client");
/**
 * Definición de permisos por rol
 */
exports.ROLE_PERMISSIONS = {
    [client_1.UserRole.ADMIN]: [
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
    [client_1.UserRole.MANAGER]: [
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
    [client_1.UserRole.USER]: ['data:create', 'data:read', 'data:update', 'reports:read'],
    [client_1.UserRole.VIEWER]: ['data:read', 'reports:read'],
};
/**
 * Jerarquía de roles (mayor número = mayor jerarquía)
 */
exports.ROLE_HIERARCHY = {
    [client_1.UserRole.VIEWER]: 1,
    [client_1.UserRole.USER]: 2,
    [client_1.UserRole.MANAGER]: 3,
    [client_1.UserRole.ADMIN]: 4,
};
/**
 * Descripción de cada rol
 */
exports.ROLE_DESCRIPTIONS = {
    [client_1.UserRole.ADMIN]: 'Administrador del sistema con acceso completo',
    [client_1.UserRole.MANAGER]: 'Gerente con permisos de gestión y supervisión',
    [client_1.UserRole.USER]: 'Usuario estándar con permisos básicos de operación',
    [client_1.UserRole.VIEWER]: 'Usuario con permisos de solo lectura',
};
/**
 * Descripción de cada permiso
 */
exports.PERMISSION_DESCRIPTIONS = {
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
