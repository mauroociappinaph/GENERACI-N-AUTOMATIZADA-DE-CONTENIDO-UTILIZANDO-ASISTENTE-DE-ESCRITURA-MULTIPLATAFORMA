"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const user_service_1 = require("@/services/user.service");
const jwt_service_1 = require("@/services/jwt.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const userService = new user_service_1.UserService(prisma);
// Validation schemas
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Contraseña requerida'),
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token requerido'),
});
class AuthController {
    /**
     * Login endpoint
     */
    static async login(req, res) {
        try {
            // Validar datos de entrada
            const { email, password } = loginSchema.parse(req.body);
            // Verificar credenciales
            const user = await userService.verifyCredentials(email, password);
            if (!user) {
                res.status(401).json({
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Email o contraseña incorrectos',
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            // Generar tokens
            const tokens = jwt_service_1.JwtService.generateTokenPair(user);
            // Respuesta exitosa
            res.status(200).json({
                success: true,
                data: {
                    user,
                    ...tokens,
                },
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Datos de entrada inválidos',
                        details: error.issues,
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            console.error('Login error:', error);
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Refresh token endpoint
     */
    static async refreshToken(req, res) {
        try {
            // Validar datos de entrada
            const { refreshToken } = refreshTokenSchema.parse(req.body);
            // Verificar refresh token
            const decoded = jwt_service_1.JwtService.verifyRefreshToken(refreshToken);
            // Verificar que el usuario aún existe y está activo
            const user = await userService.getUserById(decoded.userId);
            if (!user || !user.isActive) {
                res.status(401).json({
                    error: {
                        code: 'INVALID_USER',
                        message: 'Usuario no válido o inactivo',
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            // Generar nuevo access token
            const newAccessToken = jwt_service_1.JwtService.refreshAccessToken(refreshToken);
            // Respuesta exitosa
            res.status(200).json({
                success: true,
                data: {
                    accessToken: newAccessToken,
                    expiresIn: 15 * 60, // 15 minutes in seconds
                },
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Datos de entrada inválidos',
                        details: error.issues,
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            if (error instanceof Error) {
                res.status(401).json({
                    error: {
                        code: 'INVALID_TOKEN',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            console.error('Refresh token error:', error);
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Logout endpoint (client-side token invalidation)
     */
    static async logout(req, res) {
        try {
            // En una implementación más avanzada, aquí se podría:
            // 1. Agregar el token a una blacklist
            // 2. Registrar el logout en logs de auditoría
            // 3. Invalidar todas las sesiones del usuario
            res.status(200).json({
                success: true,
                data: {
                    message: 'Logout exitoso',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Get current user info
     */
    static async me(req, res) {
        try {
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
            // Obtener información completa del usuario
            const user = await userService.getUserById(req.user.id);
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
            res.status(200).json({
                success: true,
                data: { user },
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Get user info error:', error);
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
}
exports.AuthController = AuthController;
