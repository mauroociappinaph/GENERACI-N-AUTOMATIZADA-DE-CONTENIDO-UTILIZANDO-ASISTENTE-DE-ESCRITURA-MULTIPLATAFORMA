import {
  Notification,
  NotificationPayload,
  NotificationFilter,
  NotificationStats,
} from '@/types/notification';

/**
 * Interface for NotificationService
 * Prevents "property does not exist" errors
 */
export interface INotificationService {
  createNotification(userId: string, payload: NotificationPayload): Promise<Notification>;
  getNotifications(filter: NotificationFilter): Promise<Notification[]>;
  markAsRead(notificationId: string, userId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
  deleteNotification(notificationId: string, userId: string): Promise<boolean>;
  getNotificationStats(userId: string): Promise<NotificationStats>;
  cleanupExpiredNotifications(): Promise<number>;
  createSystemNotification(
    payload: Omit<NotificationPayload, 'type'>,
    userIds?: string[]
  ): Promise<Notification[]>;
  sendEmail(options: EmailOptions): Promise<void>;
  sendEmailWithAttachment(options: EmailWithAttachmentOptions): Promise<void>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailWithAttachmentOptions extends EmailOptions {
  attachmentPath: string;
  attachmentName: string;
}
