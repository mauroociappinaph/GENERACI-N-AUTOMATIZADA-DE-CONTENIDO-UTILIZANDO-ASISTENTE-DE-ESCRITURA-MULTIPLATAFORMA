import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import {
  Notification,
  NotificationPayload,
  NotificationFilter,
  NotificationStats,
  NotificationType
} from '@/types/notification';
import logger, { logError, logBusinessEvent } from '@/utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailWithAttachmentOptions extends EmailOptions {
  attachmentPath: string;
  attachmentName: string;
}

/**
 * Servicio para gestión de notificaciones
 * Responsabilidad: Lógica de negocio para notificaciones
 */
export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter(): void {
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
  async createNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<Notification> {
    try {
      const notification: Notification = {
        id: uuidv4(),
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

      logBusinessEvent('NOTIFICATION_CREATED', {
        notificationId: notification.id,
        userId,
        type: payload.type,
      }, userId);

      logger.info('Notification created successfully', {
        notificationId: notification.id,
        userId,
        type: payload.type,
      });

      return notification;
    } catch (error) {
      logError(error as Error, 'NotificationService.createNotification', { userId });
      throw error;
    }
  }

  /**
   * Obtiene notificaciones con filtros
   */
  async getNotifications(filter: NotificationFilter): Promise<Notification[]> {
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
      notifications = notifications.filter(n =>
        !n.expiresAt || n.expiresAt > now
      );

      // Ordenar por fecha de creación (más recientes primero)
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Aplicar paginación
      const offset = filter.offset || 0;
      const limit = filter.limit || 50;
      notifications = notifications.slice(offset, offset + limit);

      return notifications;
    } catch (error) {
      logError(error as Error, 'NotificationService.getNotifications', { filter });
      throw error;
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
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

      logBusinessEvent('NOTIFICATION_READ', {
        notificationId,
        userId,
      }, userId);

      return true;
    } catch (error) {
      logError(error as Error, 'NotificationService.markAsRead', {
        notificationId,
        userId
      });
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async markAllAsRead(userId: string): Promise<number> {
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
        logBusinessEvent('NOTIFICATIONS_BULK_READ', {
          userId,
          count,
        }, userId);
      }

      return count;
    } catch (error) {
      logError(error as Error, 'NotificationService.markAllAsRead', { userId });
      throw error;
    }
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notification = this.notifications.get(notificationId);

      if (!notification) {
        return false;
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized to delete this notification');
      }

      this.notifications.delete(notificationId);

      logBusinessEvent('NOTIFICATION_DELETED', {
        notificationId,
        userId,
      }, userId);

      return true;
    } catch (error) {
      logError(error as Error, 'NotificationService.deleteNotification', {
        notificationId,
        userId
      });
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de notificaciones para un usuario
   */
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const userNotifications = Array.from(this.notifications.values())
        .filter(n => n.userId === userId);

      const now = new Date();
      const activeNotifications = userNotifications.filter(n =>
        !n.expiresAt || n.expiresAt > now
      );

      const stats: NotificationStats = {
        total: activeNotifications.length,
        unread: activeNotifications.filter(n => !n.read).length,
        byType: {} as Record<NotificationType, number>,
      };

      // Inicializar contadores por tipo
      Object.values(NotificationType).forEach(type => {
        stats.byType[type] = 0;
      });

      // Contar por tipo
      activeNotifications.forEach(notification => {
        stats.byType[notification.type]++;
      });

      return stats;
    } catch (error) {
      logError(error as Error, 'NotificationService.getNotificationStats', { userId });
      throw error;
    }
  }

  /**
   * Limpia notificaciones expiradas
   */
  async cleanupExpiredNotifications(): Promise<number> {
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
        logger.info('Cleaned up expired notifications', { count: cleanedCount });
        logBusinessEvent('NOTIFICATIONS_CLEANUP', { count: cleanedCount });
      }

      return cleanedCount;
    } catch (error) {
      logError(error as Error, 'NotificationService.cleanupExpiredNotifications');
      throw error;
    }
  }

  /**
   * Crea notificaciones del sistema para todos los usuarios
   */
  async createSystemNotification(
    payload: Omit<NotificationPayload, 'type'>,
    userIds?: string[]
  ): Promise<Notification[]> {
    try {
      const notifications: Notification[] = [];

      // Si no se especifican usuarios, crear para todos los usuarios activos
      // Por ahora, usaremos una lista vacía ya que no tenemos acceso directo a usuarios
      const targetUsers = userIds || [];

      for (const userId of targetUsers) {
        const notification = await this.createNotification(userId, {
          ...payload,
          type: NotificationType.SYSTEM,
        });
        notifications.push(notification);
      }

      logBusinessEvent('SYSTEM_NOTIFICATION_BROADCAST', {
        count: notifications.length,
        title: payload.title,
      });

      return notifications;
    } catch (error) {
      logError(error as Error, 'NotificationService.createSystemNotification');
      throw error;
    }
  }

  /**
   * Sends an email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@sistema-gestion.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.emailTransporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
      });
    } catch (error) {
      logError(error as Error, 'NotificationService.sendEmail', { options });
      throw error;
    }
  }

  /**
   * Sends an email with attachment
   */
  async sendEmailWithAttachment(options: EmailWithAttachmentOptions): Promise<void> {
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

      logger.info('Email with attachment sent successfully', {
        to: options.to,
        subject: options.subject,
        attachment: options.attachmentName,
      });
    } catch (error) {
      logError(error as Error, 'NotificationService.sendEmailWithAttachment', { options });
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
