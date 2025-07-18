/**
 * Tipos para el sistema de notificaciones en tiempo real
 */

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
  USER_ACTION = 'user_action',
  DATA_UPDATE = 'data_update',
  REPORT_READY = 'report_ready',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  expiresAt?: Date;
}

export interface NotificationFilter {
  userId?: string;
  type?: NotificationType;
  read?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

// Socket.IO event types
export interface ServerToClientEvents {
  notification: (notification: Notification) => void;
  notification_read: (notificationId: string) => void;
  notification_deleted: (notificationId: string) => void;
  system_announcement: (message: string) => void;
}

export interface ClientToServerEvents {
  join_user_room: (userId: string) => void;
  leave_user_room: (userId: string) => void;
  mark_notification_read: (notificationId: string) => void;
  get_notifications: (filter: NotificationFilter) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  userRole?: string;
}
