import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  Notification,
  NotificationFilter,
  NotificationStats,
  NotificationType,
  ApiResponse
} from '@/types';

/**
 * Servicio para gestión de notificaciones en tiempo real
 * Responsabilidad: Comunicación con WebSocket y API de notificaciones
 */
export class NotificationService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Inicializa la conexión WebSocket
   */
  async connect(userId: string, token: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    this.socket = io(backendUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers(userId);

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.on('connect', () => {
        console.log('✅ Connected to notification service');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Join user room
        this.socket?.emit('join_user_room', userId);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Failed to connect to notification service:', error);
        this.isConnected = false;
        reject(error);
      });
    });
  }

  /**
   * Configura los manejadores de eventos del WebSocket
   */
  private setupEventHandlers(userId: string): void {
    if (!this.socket) return;

    // Manejar notificaciones entrantes
    this.socket.on('notification', (notification: Notification) => {
      this.handleIncomingNotification(notification);
    });

    // Manejar notificaciones marcadas como leídas
    this.socket.on('notification_read', (notificationId: string) => {
      console.log('Notification marked as read:', notificationId);
      // Aquí podrías actualizar el estado local si tienes un store
    });

    // Manejar anuncios del sistema
    this.socket.on('system_announcement', (message: string) => {
      toast(message, {
        icon: '📢',
        duration: 6000,
        position: 'top-center',
      });
    });

    // Manejar reconexión
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected to notification service (attempt ${attemptNumber})`);
      this.isConnected = true;
      this.socket?.emit('join_user_room', userId);
    });

    // Manejar desconexión
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from notification service:', reason);
      this.isConnected = false;
    });
  }

  /**
   * Maneja las notificaciones entrantes
   */
  private handleIncomingNotification(notification: Notification): void {
    // Mostrar toast según el tipo de notificación
    const toastOptions = {
      duration: this.getToastDuration(notification.type),
      position: 'top-right' as const,
    };

    switch (notification.type) {
      case NotificationType.SUCCESS:
        toast.success(notification.message, {
          ...toastOptions,
          icon: '✅',
        });
        break;
      case NotificationType.ERROR:
        toast.error(notification.message, {
          ...toastOptions,
          icon: '❌',
        });
        break;
      case NotificationType.WARNING:
        toast(notification.message, {
          ...toastOptions,
          icon: '⚠️',
        });
        break;
      case NotificationType.INFO:
        toast(notification.message, {
          ...toastOptions,
          icon: 'ℹ️',
        });
        break;
      case NotificationType.SYSTEM:
        toast(notification.message, {
          ...toastOptions,
          icon: '🔧',
        });
        break;
      case NotificationType.REPORT_READY:
        toast(notification.message, {
          ...toastOptions,
          icon: '📊',
        });
        break;
      default:
        toast(notification.message, toastOptions);
    }

    // Emitir evento personalizado para que otros componentes puedan escuchar
    window.dispatchEvent(new CustomEvent('notification-received', {
      detail: notification
    }));
  }

  /**
   * Obtiene la duración del toast según el tipo de notificación
   */
  private getToastDuration(type: NotificationType): number {
    switch (type) {
      case NotificationType.ERROR:
        return 8000; // 8 segundos para errores
      case NotificationType.WARNING:
        return 6000; // 6 segundos para advertencias
      case NotificationType.SUCCESS:
        return 4000; // 4 segundos para éxito
      case NotificationType.SYSTEM:
        return 10000; // 10 segundos para sistema
      default:
        return 5000; // 5 segundos por defecto
    }
  }

  /**
   * Obtiene notificaciones del servidor
   */
  async getNotifications(filter: NotificationFilter = {}): Promise<Notification[]> {
    try {
      const params = new URLSearchParams();

      if (filter.type) params.append('type', filter.type);
      if (filter.read !== undefined) params.append('read', filter.read.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.offset) params.append('offset', filter.offset.toString());

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/notifications?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<Notification[]> = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<NotificationStats> = await response.json();
      return result.data || { total: 0, unread: 0, byType: {} as Record<NotificationType, number> };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // También notificar via WebSocket
      this.socket?.emit('mark_notification_read', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<number> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ markedCount: number }> = await response.json();
      return result.data?.markedCount || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Solicita notificaciones via WebSocket
   */
  requestNotifications(filter: NotificationFilter = {}): void {
    if (this.socket?.connected) {
      this.socket.emit('get_notifications', filter);
    }
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Verifica si está conectado
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Obtiene el token de autenticación
   */
  private getToken(): string {
    // Intentar obtener del localStorage primero (para compatibilidad)
    const storedToken = localStorage.getItem('auth-storage');
    if (storedToken) {
      try {
        const authData = JSON.parse(storedToken);
        return authData.state?.token || '';
      } catch (error) {
        console.warn('Error parsing auth storage:', error);
      }
    }
    return '';
  }
}

// Instancia singleton del servicio
export const notificationService = new NotificationService();
