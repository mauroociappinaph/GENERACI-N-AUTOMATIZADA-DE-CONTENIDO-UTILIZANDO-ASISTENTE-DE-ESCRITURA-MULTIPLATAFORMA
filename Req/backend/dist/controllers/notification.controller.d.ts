import { Request, Response, NextFunction } from 'express';
/**
 * Controlador para gestión de notificaciones
 * Responsabilidad: Manejo de endpoints HTTP para notificaciones
 */
export declare class NotificationController {
    /**
     * Obtiene las notificaciones del usuario autenticado
     */
    getNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Crea una nueva notificación para el usuario autenticado
     */
    createNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Marca una notificación como leída
     */
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Marca todas las notificaciones del usuario como leídas
     */
    markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Elimina una notificación
     */
    deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Obtiene estadísticas de notificaciones del usuario
     */
    getStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const notificationController: NotificationController;
