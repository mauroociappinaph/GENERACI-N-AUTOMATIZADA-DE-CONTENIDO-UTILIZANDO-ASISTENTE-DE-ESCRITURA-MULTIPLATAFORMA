import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { notificationService } from '@/services/notification.service';
import { getSocketService } from '@/services/socket.service';
import { NotificationType, NotificationPayload } from '@/types/notification';
import logger, { logError, logBusinessEvent } from '@/utils/logger';

// Esquemas de validación
const createNotificationSchema = z.object({
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  data: z.record(z.string(), z.any()).optional(),
  expiresAt: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

const getNotificationsSchema = z.object({
  type: z.nativeEnum(NotificationType).optional(),
  read: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => parseInt(val, 10)).optional(),
  offset: z.string().transform(val => parseInt(val, 10)).optional(),
});

const markAsReadSchema = z.object({
  notificationId: z.string().uuid(),
});

/**
 * Controlador para gestión de notificaciones
 * Responsabilidad: Manejo de endpoints HTTP para notificaciones
 */
export class NotificationController {
  /**
   * Obtiene las notificaciones del usuario autenticado
   */
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const queryValidation = getNotificationsSchema.safeParse(req.query);
      if (!queryValidation.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: queryValidation.error.issues,
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const { type, read, limit, offset } = queryValidation.data;

      const notifications = await notificationService.getNotifications({
        userId,
        type,
        read,
        limit,
        offset,
      });

      const stats = await notificationService.getNotificationStats(userId);

      res.json({
        data: notifications,
        meta: {
          stats,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });

      logBusinessEvent('NOTIFICATIONS_RETRIEVED', {
        userId,
        count: notifications.length,
        filters: { type, read, limit, offset },
      }, userId);

    } catch (error) {
      logError(error as Error, 'NotificationController.getNotifications', {
        userId: req.user?.id,
        query: req.query,
      });
      next(error);
    }
  }

  /**
   * Crea una nueva notificación para el usuario autenticado
   */
  async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const bodyValidation = createNotificationSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid notification data',
            details: bodyValidation.error.issues,
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const payload: NotificationPayload = bodyValidation.data;
      const notification = await notificationService.createNotification(userId, payload);

      // Enviar notificación en tiempo real
      try {
        const socketService = getSocketService();
        await socketService.sendNotificationToUser(userId, notification);
      } catch (socketError) {
        // Log error but don't fail the request
        logError(socketError as Error, 'NotificationController.createNotification.socket');
      }

      res.status(201).json({
        data: notification,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });

    } catch (error) {
      logError(error as Error, 'NotificationController.createNotification', {
        userId: req.user?.id,
        body: req.body,
      });
      next(error);
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const paramsValidation = markAsReadSchema.safeParse(req.params);
      if (!paramsValidation.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid notification ID',
            details: paramsValidation.error.issues,
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const { notificationId } = paramsValidation.data;
      const success = await notificationService.markAsRead(notificationId, userId);

      if (!success) {
        res.status(404).json({
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notification not found or unauthorized',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      // Notificar cambio en tiempo real
      try {
        const socketService = getSocketService();
        socketService.sendNotificationToUser(userId, {
          id: 'read_confirmation',
          userId,
          type: NotificationType.INFO,
          title: 'Notificación leída',
          message: 'La notificación ha sido marcada como leída',
          data: { readNotificationId: notificationId },
          read: true,
          createdAt: new Date(),
        });
      } catch (socketError) {
        logError(socketError as Error, 'NotificationController.markAsRead.socket');
      }

      res.status(204).send();

    } catch (error) {
      logError(error as Error, 'NotificationController.markAsRead', {
        userId: req.user?.id,
        notificationId: req.params.notificationId,
      });
      next(error);
    }
  }

  /**
   * Marca todas las notificaciones del usuario como leídas
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const count = await notificationService.markAllAsRead(userId);

      res.json({
        data: {
          markedCount: count,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });

    } catch (error) {
      logError(error as Error, 'NotificationController.markAllAsRead', {
        userId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const paramsValidation = markAsReadSchema.safeParse(req.params);
      if (!paramsValidation.success) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid notification ID',
            details: paramsValidation.error.issues,
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const { notificationId } = paramsValidation.data;
      const success = await notificationService.deleteNotification(notificationId, userId);

      if (!success) {
        res.status(404).json({
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notification not found or unauthorized',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      res.status(204).send();

    } catch (error) {
      logError(error as Error, 'NotificationController.deleteNotification', {
        userId: req.user?.id,
        notificationId: req.params.notificationId,
      });
      next(error);
    }
  }

  /**
   * Obtiene estadísticas de notificaciones del usuario
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }

      const stats = await notificationService.getNotificationStats(userId);

      res.json({
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      });

    } catch (error) {
      logError(error as Error, 'NotificationController.getStats', {
        userId: req.user?.id,
      });
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
