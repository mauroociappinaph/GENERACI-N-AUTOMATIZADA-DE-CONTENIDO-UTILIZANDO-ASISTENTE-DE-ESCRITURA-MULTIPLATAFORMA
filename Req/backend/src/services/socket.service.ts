import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Notification,
  NotificationFilter
} from '@/types/notification';
import { notificationService } from './notification.service';
import logger, { logError, logBusinessEvent } from '@/utils/logger';

/**
 * Servicio para gestión de WebSocket y notificaciones en tiempo real
 * Responsabilidad: Comunicación en tiempo real con clientes
 */
export class SocketService {
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  /**
   * Configura los manejadores de eventos de Socket.IO
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info('Client connected to WebSocket', {
        socketId: socket.id,
        userAgent: socket.handshake.headers['user-agent']
      });

      // Manejar unión a sala de usuario
      socket.on('join_user_room', async (userId: string) => {
        try {
          socket.data.userId = userId;
          await socket.join(`user:${userId}`);

          logger.info('User joined room', {
            socketId: socket.id,
            userId
          });

          logBusinessEvent('SOCKET_USER_JOINED', {
            socketId: socket.id,
            userId
          }, userId);

          // Enviar estadísticas de notificaciones al conectarse
          const stats = await notificationService.getNotificationStats(userId);
          socket.emit('notification', {
            id: 'stats',
            userId,
            type: 'info' as any,
            title: 'Notificaciones',
            message: `Tienes ${stats.unread} notificaciones sin leer`,
            data: { stats },
            read: true,
            createdAt: new Date()
          });

        } catch (error) {
          logError(error as Error, 'SocketService.join_user_room', {
            socketId: socket.id,
            userId
          });
        }
      });

      // Manejar salida de sala de usuario
      socket.on('leave_user_room', async (userId: string) => {
        try {
          await socket.leave(`user:${userId}`);
          socket.data.userId = undefined;

          logger.info('User left room', {
            socketId: socket.id,
            userId
          });

          logBusinessEvent('SOCKET_USER_LEFT', {
            socketId: socket.id,
            userId
          }, userId);

        } catch (error) {
          logError(error as Error, 'SocketService.leave_user_room', {
            socketId: socket.id,
            userId
          });
        }
      });

      // Manejar marcado de notificación como leída
      socket.on('mark_notification_read', async (notificationId: string) => {
        try {
          const userId = socket.data.userId;
          if (!userId) {
            return;
          }

          const success = await notificationService.markAsRead(notificationId, userId);

          if (success) {
            // Notificar a todos los sockets del usuario
            this.io.to(`user:${userId}`).emit('notification_read', notificationId);

            logger.info('Notification marked as read', {
              notificationId,
              userId
            });
          }

        } catch (error) {
          logError(error as Error, 'SocketService.mark_notification_read', {
            socketId: socket.id,
            notificationId
          });
        }
      });

      // Manejar solicitud de notificaciones
      socket.on('get_notifications', async (filter: NotificationFilter) => {
        try {
          const userId = socket.data.userId;
          if (!userId) {
            return;
          }

          const notifications = await notificationService.getNotifications({
            ...filter,
            userId
          });

          // Enviar notificaciones al cliente
          notifications.forEach(notification => {
            socket.emit('notification', notification);
          });

        } catch (error) {
          logError(error as Error, 'SocketService.get_notifications', {
            socketId: socket.id,
            filter
          });
        }
      });

      // Manejar desconexión
      socket.on('disconnect', (reason) => {
        const userId = socket.data.userId;

        logger.info('Client disconnected from WebSocket', {
          socketId: socket.id,
          userId,
          reason
        });

        if (userId) {
          logBusinessEvent('SOCKET_USER_DISCONNECTED', {
            socketId: socket.id,
            userId,
            reason
          }, userId);
        }
      });
    });
  }

  /**
   * Envía una notificación a un usuario específico
   */
  async sendNotificationToUser(userId: string, notification: Notification): Promise<void> {
    try {
      this.io.to(`user:${userId}`).emit('notification', notification);

      logger.info('Notification sent to user', {
        notificationId: notification.id,
        userId,
        type: notification.type
      });

    } catch (error) {
      logError(error as Error, 'SocketService.sendNotificationToUser', {
        userId,
        notificationId: notification.id
      });
    }
  }

  /**
   * Envía una notificación a múltiples usuarios
   */
  async sendNotificationToUsers(userIds: string[], notification: Notification): Promise<void> {
    try {
      const promises = userIds.map(userId =>
        this.sendNotificationToUser(userId, notification)
      );

      await Promise.all(promises);

      logger.info('Notification sent to multiple users', {
        notificationId: notification.id,
        userCount: userIds.length,
        type: notification.type
      });

    } catch (error) {
      logError(error as Error, 'SocketService.sendNotificationToUsers', {
        userIds,
        notificationId: notification.id
      });
    }
  }

  /**
   * Envía un anuncio del sistema a todos los usuarios conectados
   */
  async broadcastSystemAnnouncement(message: string): Promise<void> {
    try {
      this.io.emit('system_announcement', message);

      logger.info('System announcement broadcasted', { message });
      logBusinessEvent('SYSTEM_ANNOUNCEMENT_BROADCAST', { message });

    } catch (error) {
      logError(error as Error, 'SocketService.broadcastSystemAnnouncement', { message });
    }
  }

  /**
   * Obtiene el número de usuarios conectados
   */
  getConnectedUsersCount(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * Obtiene información de usuarios conectados
   */
  getConnectedUsersInfo(): Array<{ socketId: string; userId?: string }> {
    const users: Array<{ socketId: string; userId?: string }> = [];

    this.io.sockets.sockets.forEach((socket) => {
      users.push({
        socketId: socket.id,
        userId: socket.data.userId
      });
    });

    return users;
  }

  /**
   * Inicia el intervalo de limpieza de notificaciones expiradas
   */
  private startCleanupInterval(): void {
    // Limpiar notificaciones expiradas cada 30 minutos
    setInterval(async () => {
      try {
        await notificationService.cleanupExpiredNotifications();
      } catch (error) {
        logError(error as Error, 'SocketService.cleanupInterval');
      }
    }, 30 * 60 * 1000); // 30 minutos
  }

  /**
   * Cierra el servidor de Socket.IO
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        logger.info('Socket.IO server closed');
        resolve();
      });
    });
  }
}

let socketService: SocketService | null = null;

/**
 * Inicializa el servicio de Socket.IO
 */
export const initializeSocketService = (httpServer: HttpServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(httpServer);
    logger.info('Socket.IO service initialized');
  }
  return socketService;
};

/**
 * Obtiene la instancia del servicio de Socket.IO
 */
export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call initializeSocketService first.');
  }
  return socketService;
};
