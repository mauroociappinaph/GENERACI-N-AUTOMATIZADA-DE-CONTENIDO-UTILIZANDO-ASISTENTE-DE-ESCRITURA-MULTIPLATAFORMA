"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("@/services/user.service");
const prisma_1 = require("@/config/prisma");
const client_1 = require("@prisma/client");
class UserController {
    /**
     * Obtener todos los usuarios con paginación y filtros
     */
    static async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const role = req.query.role;
            const isActive = req.query.isActive === 'true'
                ? true
                : req.query.isActive === 'false'
                    ? false
                    : undefined;
            const result = await UserController.userService.getUsers(page, limit, role, isActive);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener usuarios',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener un usuario por ID
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserController.userService.getUserById(id);
            if (!user) {
                res.status(404).json({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'Usuario no encontrado',
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener usuario',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Crear un nuevo usuario
     */
    static async createUser(req, res) {
        try {
            const userData = req.body;
            const user = await UserController.userService.createUser(userData);
            res.status(201).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('email ya está registrado')) {
                    res.status(409).json({
                        error: {
                            code: 'EMAIL_ALREADY_EXISTS',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
                if (error.message.includes('Contraseña no válida')) {
                    res.status(400).json({
                        error: {
                            code: 'INVALID_PASSWORD',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al crear usuario',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Actualizar un usuario
     */
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const user = await UserController.userService.updateUser(id, updateData);
            res.json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Usuario no encontrado')) {
                    res.status(404).json({
                        error: {
                            code: 'USER_NOT_FOUND',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
                if (error.message.includes('email ya está registrado')) {
                    res.status(409).json({
                        error: {
                            code: 'EMAIL_ALREADY_EXISTS',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al actualizar usuario',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Cambiar contraseña de un usuario
     */
    static async changePassword(req, res) {
        try {
            const { id } = req.params;
            const passwordData = req.body;
            // Verificar que el usuario solo pueda cambiar su propia contraseña o sea admin
            if (req.user?.id !== id && req.user?.role !== client_1.$Enums.UserRole.ADMIN) {
                res.status(403).json({
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Solo puedes cambiar tu propia contraseña',
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            await UserController.userService.changePassword(id, passwordData);
            res.json({
                success: true,
                data: { message: 'Contraseña actualizada exitosamente' },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Usuario no encontrado')) {
                    res.status(404).json({
                        error: {
                            code: 'USER_NOT_FOUND',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
                if (error.message.includes('contraseña actual es incorrecta')) {
                    res.status(400).json({
                        error: {
                            code: 'INVALID_CURRENT_PASSWORD',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
                if (error.message.includes('Nueva contraseña no válida')) {
                    res.status(400).json({
                        error: {
                            code: 'INVALID_NEW_PASSWORD',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al cambiar contraseña',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Activar/desactivar un usuario
     */
    static async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            // Prevenir que un usuario se desactive a sí mismo
            if (req.user?.id === id) {
                res.status(400).json({
                    error: {
                        code: 'CANNOT_DEACTIVATE_SELF',
                        message: 'No puedes desactivar tu propia cuenta',
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            const user = await UserController.userService.toggleUserStatus(id);
            res.json({
                success: true,
                data: {
                    user,
                    message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
                },
            });
        }
        catch (error) {
            if (error instanceof Error &&
                error.message.includes('Usuario no encontrado')) {
                res.status(404).json({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al cambiar estado del usuario',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Eliminar un usuario (soft delete)
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            // Prevenir que un usuario se elimine a sí mismo
            if (req.user?.id === id) {
                res.status(400).json({
                    error: {
                        code: 'CANNOT_DELETE_SELF',
                        message: 'No puedes eliminar tu propia cuenta',
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            await UserController.userService.deleteUser(id);
            res.json({
                success: true,
                data: { message: 'Usuario eliminado exitosamente' },
            });
        }
        catch (error) {
            if (error instanceof Error &&
                error.message.includes('Usuario no encontrado')) {
                res.status(404).json({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al eliminar usuario',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener perfil del usuario actual
     */
    static async getProfile(req, res) {
        try {
            if (!req.user?.id) {
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
            const user = await UserController.userService.getUserById(req.user.id);
            if (!user) {
                res.status(404).json({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'Usuario no encontrado',
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener perfil',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Actualizar perfil del usuario actual
     */
    static async updateProfile(req, res) {
        try {
            if (!req.user?.id) {
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
            const updateData = req.body;
            // Remove role from update data - users can't change their own role
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { role: _, ...profileData } = updateData;
            const user = await UserController.userService.updateUser(req.user.id, profileData);
            res.json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Usuario no encontrado')) {
                    res.status(404).json({
                        error: {
                            code: 'USER_NOT_FOUND',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
                if (error.message.includes('email ya está registrado')) {
                    res.status(409).json({
                        error: {
                            code: 'EMAIL_ALREADY_EXISTS',
                            message: error.message,
                            timestamp: new Date().toISOString(),
                            requestId: req.headers['x-request-id'] || 'unknown',
                        },
                    });
                    return;
                }
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al actualizar perfil',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener roles disponibles
     */
    static async getRoles(req, res) {
        try {
            const roles = Object.values(client_1.$Enums.UserRole);
            res.json({
                success: true,
                data: { roles },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener roles',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener permisos de un rol específico
     */
    static async getRolePermissions(req, res) {
        try {
            const { role } = req.params;
            if (!Object.values(client_1.$Enums.UserRole).includes(role)) {
                res.status(400).json({
                    error: {
                        code: 'INVALID_ROLE',
                        message: 'Rol no válido',
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            const { getRolePermissions } = await Promise.resolve().then(() => __importStar(require('@/middleware/authorization.middleware')));
            const permissions = getRolePermissions(role);
            res.json({
                success: true,
                data: { role, permissions },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener permisos del rol',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener información completa de todos los roles
     */
    static async getAllRolesInfo(req, res) {
        try {
            const { getAllRolesInfo } = await Promise.resolve().then(() => __importStar(require('@/middleware/authorization.middleware')));
            const rolesInfo = getAllRolesInfo();
            res.json({
                success: true,
                data: { roles: rolesInfo },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener información de roles',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener información completa de todos los permisos
     */
    static async getAllPermissionsInfo(req, res) {
        try {
            const { getAllPermissionsInfo } = await Promise.resolve().then(() => __importStar(require('@/middleware/authorization.middleware')));
            const permissionsInfo = getAllPermissionsInfo();
            res.json({
                success: true,
                data: { permissions: permissionsInfo },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener información de permisos',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Verificar si el usuario actual tiene un permiso específico
     */
    static async checkUserPermission(req, res) {
        try {
            const { permission } = req.params;
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
            const { hasPermission } = await Promise.resolve().then(() => __importStar(require('@/middleware/authorization.middleware')));
            const hasAccess = hasPermission(req.user.role, permission);
            res.json({
                success: true,
                data: {
                    permission,
                    hasPermission: hasAccess,
                    userRole: req.user.role,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al verificar permiso',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
}
exports.UserController = UserController;
UserController.userService = new user_service_1.UserService(prisma_1.prisma);
