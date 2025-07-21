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
exports.getSocketService = exports.initializeSocketService = exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const notification_service_1 = require("./notification.service");
const logger_1 = __importStar(require("@/utils/logger"));
/**
 * Servicio para gestión de WebSocket y notificaciones en tiempo real
 * Responsabilidad: Comunicación en tiempo real con clientes
 */
class SocketService {
    constructor(httpServer) {
        console.log('🔌 Creating Socket.IO server...');
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        console.log('🔌 Socket.IO server created, setting up event handlers...');
        this.setupEventHandlers();
        console.log('🔌 Starting cleanup interval...');
        this.startCleanupInterval();
        console.log('🔌 Socket.IO service constructor completed');
    }
    /**
     * Configura los manejadores de eventos de Socket.IO
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.default.info('Client connected to WebSocket', {
                socketId: socket.id,
                userAgent: socket.handshake.headers['user-agent']
            });
            // Manejar unión a sala de usuario
            socket.on('join_user_room', async (userId) => {
                try {
                    socket.data.userId = userId;
                    await socket.join(`user:${userId}`);
                    logger_1.default.info('User joined room', {
                        socketId: socket.id,
                        userId
                    });
                    (0, logger_1.logBusinessEvent)('SOCKET_USER_JOINED', {
                        socketId: socket.id,
                        userId
                    }, userId);
                    // Enviar estadísticas de notificaciones al conectarse
                    const stats = await notification_service_1.notificationService.getNotificationStats(userId);
                    socket.emit('notification', {
                        id: 'stats',
                        userId,
                        type: 'info',
                        title: 'Notificaciones',
                        message: `Tienes ${stats.unread} notificaciones sin leer`,
                        data: { stats },
                        read: true,
                        createdAt: new Date()
                    });
                }
                catch (error) {
                    (0, logger_1.logError)(error, 'SocketService.join_user_room', {
                        socketId: socket.id,
                        userId
                    });
                }
            });
            // Manejar salida de sala de usuario
            socket.on('leave_user_room', async (userId) => {
                try {
                    await socket.leave(`user:${userId}`);
                    socket.data.userId = undefined;
                    logger_1.default.info('User left room', {
                        socketId: socket.id,
                        userId
                    });
                    (0, logger_1.logBusinessEvent)('SOCKET_USER_LEFT', {
                        socketId: socket.id,
                        userId
                    }, userId);
                }
                catch (error) {
                    (0, logger_1.logError)(error, 'SocketService.leave_user_room', {
                        socketId: socket.id,
                        userId
                    });
                }
            });
            // Manejar marcado de notificación como leída
            socket.on('mark_notification_read', async (notificationId) => {
                try {
                    const userId = socket.data.userId;
                    if (!userId) {
                        return;
                    }
                    const success = await notification_service_1.notificationService.markAsRead(notificationId, userId);
                    if (success) {
                        // Notificar a todos los sockets del usuario
                        this.io.to(`user:${userId}`).emit('notification_read', notificationId);
                        logger_1.default.info('Notification marked as read', {
                            notificationId,
                            userId
                        });
                    }
                }
                catch (error) {
                    (0, logger_1.logError)(error, 'SocketService.mark_notification_read', {
                        socketId: socket.id,
                        notificationId
                    });
                }
            });
            // Manejar solicitud de notificaciones
            socket.on('get_notifications', async (filter) => {
                try {
                    const userId = socket.data.userId;
                    if (!userId) {
                        return;
                    }
                    const notifications = await notification_service_1.notificationService.getNotifications({
                        ...filter,
                        userId
                    });
                    // Enviar notificaciones al cliente
                    notifications.forEach(notification => {
                        socket.emit('notification', notification);
                    });
                }
                catch (error) {
                    (0, logger_1.logError)(error, 'SocketService.get_notifications', {
                        socketId: socket.id,
                        filter
                    });
                }
            });
            // Manejar desconexión
            socket.on('disconnect', (reason) => {
                const userId = socket.data.userId;
                logger_1.default.info('Client disconnected from WebSocket', {
                    socketId: socket.id,
                    userId,
                    reason
                });
                if (userId) {
                    (0, logger_1.logBusinessEvent)('SOCKET_USER_DISCONNECTED', {
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
    async sendNotificationToUser(userId, notification) {
        try {
            this.io.to(`user:${userId}`).emit('notification', notification);
            logger_1.default.info('Notification sent to user', {
                notificationId: notification.id,
                userId,
                type: notification.type
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'SocketService.sendNotificationToUser', {
                userId,
                notificationId: notification.id
            });
        }
    }
    /**
     * Envía una notificación a múltiples usuarios
     */
    async sendNotificationToUsers(userIds, notification) {
        try {
            const promises = userIds.map(userId => this.sendNotificationToUser(userId, notification));
            await Promise.all(promises);
            logger_1.default.info('Notification sent to multiple users', {
                notificationId: notification.id,
                userCount: userIds.length,
                type: notification.type
            });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'SocketService.sendNotificationToUsers', {
                userIds,
                notificationId: notification.id
            });
        }
    }
    /**
     * Envía un anuncio del sistema a todos los usuarios conectados
     */
    async broadcastSystemAnnouncement(message) {
        try {
            this.io.emit('system_announcement', message);
            logger_1.default.info('System announcement broadcasted', { message });
            (0, logger_1.logBusinessEvent)('SYSTEM_ANNOUNCEMENT_BROADCAST', { message });
        }
        catch (error) {
            (0, logger_1.logError)(error, 'SocketService.broadcastSystemAnnouncement', { message });
        }
    }
    /**
     * Obtiene el número de usuarios conectados
     */
    getConnectedUsersCount() {
        return this.io.sockets.sockets.size;
    }
    /**
     * Obtiene información de usuarios conectados
     */
    getConnectedUsersInfo() {
        const users = [];
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
    startCleanupInterval() {
        console.log('🔌 Setting up cleanup interval...');
        // Limpiar notificaciones expiradas cada 30 minutos
        setInterval(async () => {
            try {
                console.log('🧹 Running notification cleanup...');
                await notification_service_1.notificationService.cleanupExpiredNotifications();
                console.log('✅ Notification cleanup completed');
            }
            catch (error) {
                console.error('❌ Notification cleanup failed:', error);
                (0, logger_1.logError)(error, 'SocketService.cleanupInterval');
            }
        }, 30 * 60 * 1000); // 30 minutos
        console.log('✅ Cleanup interval configured');
    }
    /**
     * Cierra el servidor de Socket.IO
     */
    async close() {
        return new Promise((resolve) => {
            this.io.close(() => {
                logger_1.default.info('Socket.IO server closed');
                resolve();
            });
        });
    }
}
exports.SocketService = SocketService;
let socketService = null;
/**
 * Inicializa el servicio de Socket.IO
 */
const initializeSocketService = (httpServer) => {
    if (!socketService) {
        socketService = new SocketService(httpServer);
        logger_1.default.info('Socket.IO service initialized');
    }
    return socketService;
};
exports.initializeSocketService = initializeSocketService;
/**
 * Obtiene la instancia del servicio de Socket.IO
 */
const getSocketService = () => {
    if (!socketService) {
        throw new Error('Socket service not initialized. Call initializeSocketService first.');
    }
    return socketService;
};
exports.getSocketService = getSocketService;
