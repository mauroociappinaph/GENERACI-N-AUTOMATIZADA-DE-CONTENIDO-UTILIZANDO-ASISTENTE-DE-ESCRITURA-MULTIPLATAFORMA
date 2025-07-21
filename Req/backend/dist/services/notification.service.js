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
exports.notificationService = exports.NotificationService = void 0;
const uuid_1 = require("uuid");
const nodemailer = __importStar(require("nodemailer"));
const fs = __importStar(require("fs/promises"));
const notification_1 = require("@/types/notification");
const logger_1 = __importStar(require("@/utils/logger"));
/**
 * Servicio para gestión de notificaciones
 * Responsabilidad: Lógica de negocio para notificaciones
 */
class NotificationService {
    constructor() {
        this.notifications = new Map();
        this.initializeEmailTransporter();
    }
    initializeEmailTransporter() {
        // Configure email transporter based on environment
        const emailConfig = {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };
        this.emailTransporter = nodemailer.createTransport(emailConfig);
    }
    /**
     * Crea una nueva notificación
     */
    async createNotification(userId, payload) {
        try {
            const notification = {
                id: (0, uuid_1.v4)(),
                userId,
                type: payload.type,
                title: payload.title,
                message: payload.message,
                data: payload.data,
                read: false,
                createdAt: new Date(),
                expiresAt: payload.expiresAt,
            };
            this.notifications.set(notification.id, notification);
            (0, logger_1.logBusinessEvent)('NOTIFICATION_CREATED', {
                notificationId: notification.id,
                userId,
                type: payload.type,
            }, userId);
            logger_1.default.info('Notification created successfully', {
                notificationId: notification.id,
                userId,
                type: payload.type,
            });
            return notification;
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.createNotification', { userId });
            throw error;
        }
    }
    /**
     * Obtiene notificaciones con filtros
     */
    async getNotifications(filter) {
        try {
            let notifications = Array.from(this.notifications.values());
            // Filtrar por usuario
            if (filter.userId) {
                notifications = notifications.filter(n => n.userId === filter.userId);
            }
            // Filtrar por tipo
            if (filter.type) {
                notifications = notifications.filter(n => n.type === filter.type);
            }
            // Filtrar por estado de lectura
            if (filter.read !== undefined) {
                notifications = notifications.filter(n => n.read === filter.read);
            }
            // Filtrar notificaciones expiradas
            const now = new Date();
            notifications = notifications.filter(n => !n.expiresAt || n.expiresAt > now);
            // Ordenar por fecha de creación (más recientes primero)
            notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            // Aplicar paginación
            const offset = filter.offset || 0;
            const limit = filter.limit || 50;
            notifications = notifications.slice(offset, offset + limit);
            return notifications;
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.getNotifications', { filter });
            throw error;
        }
    }
    /**
     * Marca una notificación como leída
     */
    async markAsRead(notificationId, userId) {
        try {
            const notification = this.notifications.get(notificationId);
            if (!notification) {
                return false;
            }
            if (notification.userId !== userId) {
                throw new Error('Unauthorized to mark this notification as read');
            }
            notification.read = true;
            this.notifications.set(notificationId, notification);
            (0, logger_1.logBusinessEvent)('NOTIFICATION_READ', {
                notificationId,
                userId,
            }, userId);
            return true;
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.markAsRead', {
                notificationId,
                userId
            });
            throw error;
        }
    }
    /**
     * Marca todas las notificaciones de un usuario como leídas
     */
    async markAllAsRead(userId) {
        try {
            let count = 0;
            for (const [id, notification] of this.notifications.entries()) {
                if (notification.userId === userId && !notification.read) {
                    notification.read = true;
                    this.notifications.set(id, notification);
                    count++;
                }
            }
            if (count > 0) {
                (0, logger_1.logBusinessEvent)('NOTIFICATIONS_BULK_READ', {
                    userId,
                    count,
                }, userId);
            }
            return count;
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.markAllAsRead', { userId });
            throw error;
        }
    }
    /**
     * Elimina una notificación
     */
    async deleteNotification(notificationId, userId) {
        try {
            const notification = this.notifications.get(notificationId);
            if (!notification) {
                return false;
            }
            if (notification.userId !== userId) {
                throw new Error('Unauthorized to delete this notification');
            }
            this.notifications.delete(notificationId);
            (0, logger_1.logBusinessEvent)('NOTIFICATION_DELETED', {
                notificationId,
                userId,
            }, userId);
            return true;
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.deleteNotification', {
                notificationId,
                userId
            });
            throw error;
        }
    }
    /**
     * Obtiene estadísticas de notificaciones para un usuario
     */
    async getNotificationStats(userId) {
        try {
            const userNotifications = Array.from(this.notifications.values())
                .filter(n => n.userId === userId);
            const now = new Date();
            const activeNotifications = userNotifications.filter(n => !n.expiresAt || n.expiresAt > now);
            const stats = {
                total: activeNotifications.length,
                unread: activeNotifications.filter(n => !n.read).length,
                byType: {},
            };
            // Inicializar contadores por tipo
            Object.values(notification_1.NotificationType).forEach(type => {
                stats.byType[type] = 0;
            });
            // Contar por tipo
            activeNotifications.forEach(notification => {
                stats.byType[notification.type]++;
            });
            return stats;
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.getNotificationStats', { userId });
            throw error;
        }
    }
    /**
     * Limpia notificaciones expiradas
     */
    async cleanupExpiredNotifications() {
        try {
            const now = new Date();
            let cleanedCount = 0;
            for (const [id, notification] of this.notifications.entries()) {
                if (notification.expiresAt && notification.expiresAt <= now) {
                    this.notifications.delete(id);
                    cleanedCount++;
                }
            }
            if (cleanedCount > 0) {
                logger_1.default.info('Cleaned up expired notifications', { count: cleanedCount });
                (0, logger_1.logBusinessEvent)('NOTIFICATIONS_CLEANUP', { count: cleanedCount });
            }
            return cleanedCount;
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.cleanupExpiredNotifications');
            throw error;
        }
    }
    /**
     * Crea notificaciones del sistema para todos los usuarios
     */
    async createSystemNotification(payload, userIds) {
        try {
            const notifications = [];
            // Si no se especifican usuarios, crear para todos los usuarios activos
            // Por ahora, usaremos una lista vacía ya que no tenemos acceso directo a usuarios
            const targetUsers = userIds || [];
            for (const userId of targetUsers) {
                const notification = await this.createNotification(userId, {
                    ...payload,
                    type: notification_1.NotificationType.SYSTEM,
                });
                notifications.push(notification);
            }
            (0, logger_1.logBusinessEvent)('SYSTEM_NOTIFICATION_BROADCAST', {
                count: notifications.length,
                title: payload.title,
            });
            return notifications;
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.createSystemNotification');
            throw error;
        }
    }
    /**
     * Sends an email
     */
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@sistema-gestion.com',
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            };
            await this.emailTransporter.sendMail(mailOptions);
            logger_1.default.info('Email sent successfully', {
                to: options.to,
                subject: options.subject,
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.sendEmail', { options });
            throw error;
        }
    }
    /**
     * Sends an email with attachment
     */
    async sendEmailWithAttachment(options) {
        try {
            const attachment = await fs.readFile(options.attachmentPath);
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@sistema-gestion.com',
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                attachments: [
                    {
                        filename: options.attachmentName,
                        content: attachment,
                    },
                ],
            };
            await this.emailTransporter.sendMail(mailOptions);
            logger_1.default.info('Email with attachment sent successfully', {
                to: options.to,
                subject: options.subject,
                attachment: options.attachmentName,
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'NotificationService.sendEmailWithAttachment', { options });
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
