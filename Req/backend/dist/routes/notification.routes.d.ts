/**
 * Rutas para gestión de notificaciones
 * Responsabilidad: Definición de endpoints para notificaciones
 */
declare const router: import("express-serve-static-core").Router;
export { router as notificationRoutes };
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [info, success, warning, error, system, user_action, data_update, report_ready]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         read:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     NotificationStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         unread:
 *           type: integer
 *         byType:
 *           type: object
 *           additionalProperties:
 *             type: integer
 */
