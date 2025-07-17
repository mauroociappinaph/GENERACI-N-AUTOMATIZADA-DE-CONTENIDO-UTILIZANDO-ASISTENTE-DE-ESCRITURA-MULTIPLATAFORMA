import { Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '@/services/user.service';
import { JwtService } from '@/services/jwt.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const userService = new UserService(prisma);

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export class AuthController {
  /**
   * Login endpoint
   */
  static async login(req: Request, res: Response): Promise<void> {
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
      const tokens = JwtService.generateTokenPair(user);

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
    } catch (error) {
      if (error instanceof z.ZodError) {
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
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      // Verificar refresh token
      const decoded = JwtService.verifyRefreshToken(refreshToken);

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
      const newAccessToken = JwtService.refreshAccessToken(refreshToken);

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
    } catch (error) {
      if (error instanceof z.ZodError) {
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
  static async logout(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
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
  static async me(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
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
