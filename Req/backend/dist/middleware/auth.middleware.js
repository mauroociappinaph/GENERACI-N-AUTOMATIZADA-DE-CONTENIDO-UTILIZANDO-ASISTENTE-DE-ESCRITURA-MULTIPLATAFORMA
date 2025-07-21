"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_service_1 = require("@/services/jwt.service");
const user_service_1 = require("@/services/user.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const userService = new user_service_1.UserService(prisma);
/**
 * Middleware de autenticación que verifica el JWT token
 * Updated: 2025-07-21 - Testing security review hook
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwt_service_1.JwtService.extractTokenFromHeader(authHeader);
        if (!token) {
            res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Token de acceso requerido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
            return;
        }
        // Verificar el token
        const decoded = jwt_service_1.JwtService.verifyAccessToken(token);
        // Verificar que el usuario aún existe y está activo
        const user = await userService.getUserById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Usuario no válido o inactivo',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
            return;
        }
        // Agregar información del usuario al request
        req.user = user;
        next();
    }
    catch (error) {
        let message = 'Error de autenticación';
        if (error instanceof Error) {
            message = error.message;
        }
        res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message,
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown',
            },
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwt_service_1.JwtService.extractTokenFromHeader(authHeader);
        if (token) {
            const decoded = jwt_service_1.JwtService.verifyAccessToken(token);
            const user = await userService.getUserById(decoded.userId);
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        // En el middleware opcional, continuamos sin autenticación si hay error
        next();
    }
};
exports.optionalAuth = optionalAuth;
// Alias para compatibilidad
exports.authMiddleware = exports.authenticateToken;
