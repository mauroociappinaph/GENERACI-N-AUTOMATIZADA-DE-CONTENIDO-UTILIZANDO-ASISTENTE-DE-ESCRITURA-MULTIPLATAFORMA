import { Server as HttpServer } from 'http';
import { Notification } from '@/types/notification';
/**
 * Servicio para gestión de WebSocket y notificaciones en tiempo real
 * Responsabilidad: Comunicación en tiempo real con clientes
 */
export declare class SocketService {
    private io;
    constructor(httpServer: HttpServer);
    /**
     * Configura los manejadores de eventos de Socket.IO
     */
    private setupEventHandlers;
    /**
     * Envía una notificación a un usuario específico
     */
    sendNotificationToUser(userId: string, notification: Notification): Promise<void>;
    /**
     * Envía una notificación a múltiples usuarios
     */
    sendNotificationToUsers(userIds: string[], notification: Notification): Promise<void>;
    /**
     * Envía un anuncio del sistema a todos los usuarios conectados
     */
    broadcastSystemAnnouncement(message: string): Promise<void>;
    /**
     * Obtiene el número de usuarios conectados
     */
    getConnectedUsersCount(): number;
    /**
     * Obtiene información de usuarios conectados
     */
    getConnectedUsersInfo(): Array<{
        socketId: string;
        userId?: string;
    }>;
    /**
     * Inicia el intervalo de limpieza de notificaciones expiradas
     */
    private startCleanupInterval;
    /**
     * Cierra el servidor de Socket.IO
     */
    close(): Promise<void>;
}
/**
 * Inicializa el servicio de Socket.IO
 */
export declare const initializeSocketService: (httpServer: HttpServer) => SocketService;
/**
 * Obtiene la instancia del servicio de Socket.IO
 */
export declare const getSocketService: () => SocketService;
