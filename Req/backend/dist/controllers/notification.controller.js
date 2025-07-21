"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const zod_1 = require("zod");
const notification_service_1 = require("@/services/notification.service");
const socket_service_1 = require("@/services/socket.service");
const notification_1 = require("@/types/notification");
const logger_1 = require("@/utils/logger");
// Esquemas de validación
const createNotificationSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(notification_1.NotificationType),
    title: zod_1.z.string().min(1).max(200),
    message: zod_1.z.string().min(1).max(1000),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    expiresAt: zod_1.z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});
const getNotificationsSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(notification_1.NotificationType).optional(),
    read: zod_1.z.string().transform(val => val === 'true').optional(),
    limit: zod_1.z.string().transform(val => parseInt(val, 10)).optional(),
    offset: zod_1.z.string().transform(val => parseInt(val, 10)).optional(),
});
const markAsReadSchema = zod_1.z.object({
    notificationId: zod_1.z.string().uuid(),
});
/**
 * Controlador para gestión de notificaciones
 * Responsabilidad: Manejo de endpoints HTTP para notificaciones
 */
class NotificationController {
    /**
     * Obtiene las notificaciones del usuario autenticado
     */
    async getNotifications(req, res, next) {
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
            const notifications = await notification_service_1.notificationService.getNotifications({
                userId,
                type,
                read,
                limit,
                offset,
            });
            const stats = await notification_service_1.notificationService.getNotificationStats(userId);
            res.json({
                data: notifications,
                meta: {
                    stats,
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
            (0, logger_1.logBusinessEvent)('NOTIFICATIONS_RETRIEVED', {
                userId,
                count: notifications.length,
                filters: { type, read, limit, offset },
            }, userId);
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationController.getNotifications', {
                userId: req.user?.id,
                query: req.query,
            });
            next(error);
        }
    }
    /**
     * Crea una nueva notificación para el usuario autenticado
     */
    async createNotification(req, res, next) {
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
            const payload = bodyValidation.data;
            const notification = await notification_service_1.notificationService.createNotification(userId, payload);
            // Enviar notificación en tiempo real
            try {
                const socketService = (0, socket_service_1.getSocketService)();
                await socketService.sendNotificationToUser(userId, notification);
            }
            catch (socketError) {
                // Log error but don't fail the request
                (0, logger_1.logError)(socketError, 'NotificationController.createNotification.socket');
            }
            res.status(201).json({
                data: notification,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationController.createNotification', {
                userId: req.user?.id,
                body: req.body,
            });
            next(error);
        }
    }
    /**
     * Marca una notificación como leída
     */
    async markAsRead(req, res, next) {
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
            const success = await notification_service_1.notificationService.markAsRead(notificationId, userId);
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
                const socketService = (0, socket_service_1.getSocketService)();
                socketService.sendNotificationToUser(userId, {
                    id: 'read_confirmation',
                    userId,
                    type: notification_1.NotificationType.INFO,
                    title: 'Notificación leída',
                    message: 'La notificación ha sido marcada como leída',
                    data: { readNotificationId: notificationId },
                    read: true,
                    createdAt: new Date(),
                });
            }
            catch (socketError) {
                (0, logger_1.logError)(socketError, 'NotificationController.markAsRead.socket');
            }
            res.status(204).send();
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationController.markAsRead', {
                userId: req.user?.id,
                notificationId: req.params.notificationId,
            });
            next(error);
        }
    }
    /**
     * Marca todas las notificaciones del usuario como leídas
     */
    async markAllAsRead(req, res, next) {
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
            const count = await notification_service_1.notificationService.markAllAsRead(userId);
            res.json({
                data: {
                    markedCount: count,
                },
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationController.markAllAsRead', {
                userId: req.user?.id,
            });
            next(error);
        }
    }
    /**
     * Elimina una notificación
     */
    async deleteNotification(req, res, next) {
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
            const success = await notification_service_1.notificationService.deleteNotification(notificationId, userId);
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
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationController.deleteNotification', {
                userId: req.user?.id,
                notificationId: req.params.notificationId,
            });
            next(error);
        }
    }
    /**
     * Obtiene estadísticas de notificaciones del usuario
     */
    async getStats(req, res, next) {
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
            const stats = await notification_service_1.notificationService.getNotificationStats(userId);
            res.json({
                data: stats,
                meta: {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                },
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationController.getStats', {
                userId: req.user?.id,
            });
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
