import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '@/services/jwt.service';
import { UserService } from '@/services/user.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userService = new UserService(prisma);

/**
 * Middleware de autenticación que verifica el JWT token
 * Updated: 2025-07-21 - Testing security review hook
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

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
    const decoded: JwtPayload = JwtService.verifyAccessToken(token);

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
  } catch (error) {
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

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded: JwtPayload = JwtService.verifyAccessToken(token);
      const user = await userService.getUserById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En el middleware opcional, continuamos sin autenticación si hay error
    next();
  }
};
// Alias para compatibilidad
export const authMiddleware = authenticateToken;
