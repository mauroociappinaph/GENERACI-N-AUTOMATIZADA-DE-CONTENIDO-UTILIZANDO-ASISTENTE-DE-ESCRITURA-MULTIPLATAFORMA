import { Notification, NotificationPayload, NotificationFilter, NotificationStats } from '@/types/notification';
import { INotificationService, EmailOptions, EmailWithAttachmentOptions } from './interfaces/notification.interface';
/**
 * Servicio para gestión de notificaciones
 * Responsabilidad: Lógica de negocio para notificaciones
 */
export declare class NotificationService implements INotificationService {
    private notifications;
    private emailTransporter;
    constructor();
    private initializeEmailTransporter;
    /**
     * Crea una nueva notificación
     */
    createNotification(userId: string, payload: NotificationPayload): Promise<Notification>;
    /**
     * Obtiene notificaciones con filtros
     */
    getNotifications(filter: NotificationFilter): Promise<Notification[]>;
    /**
     * Marca una notificación como leída
     */
    markAsRead(notificationId: string, userId: string): Promise<boolean>;
    /**
     * Marca todas las notificaciones de un usuario como leídas
     */
    markAllAsRead(userId: string): Promise<number>;
    /**
     * Elimina una notificación
     */
    deleteNotification(notificationId: string, userId: string): Promise<boolean>;
    /**
     * Obtiene estadísticas de notificaciones para un usuario
     */
    getNotificationStats(userId: string): Promise<NotificationStats>;
    /**
     * Limpia notificaciones expiradas
     */
    cleanupExpiredNotifications(): Promise<number>;
    /**
     * Crea notificaciones del sistema para todos los usuarios
     */
    createSystemNotification(payload: Omit<NotificationPayload, 'type'>, userIds?: string[]): Promise<Notification[]>;
    /**
     * Sends an email
     */
    sendEmail(options: EmailOptions): Promise<void>;
    /**
     * Sends an email with attachment
     */
    sendEmailWithAttachment(options: EmailWithAttachmentOptions): Promise<void>;
}
export declare const notificationService: NotificationService;
