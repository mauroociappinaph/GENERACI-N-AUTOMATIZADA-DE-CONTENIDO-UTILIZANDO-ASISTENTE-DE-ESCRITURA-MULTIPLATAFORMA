import { Router } from 'express';
import { notificationController } from '@/controllers/notification.controller';
import { authenticateToken } from '@/middleware/auth.middleware';

/**
 * Rutas para gestión de notificaciones
 * Responsabilidad: Definición de endpoints para notificaciones
 */
const router = Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtiene las notificaciones del usuario autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, success, warning, error, system, user_action, data_update, report_ready]
 *         description: Filtrar por tipo de notificación
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de lectura
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Número máximo de notificaciones a retornar
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Número de notificaciones a omitir
 *     responses:
 *       200:
 *         description: Lista de notificaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       $ref: '#/components/schemas/NotificationStats'
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/', notificationController.getNotifications.bind(notificationController));

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Crea una nueva notificación para el usuario autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [info, success, warning, error, system, user_action, data_update, report_ready]
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *               data:
 *                 type: object
 *                 description: Datos adicionales de la notificación
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de expiración de la notificación
 *     responses:
 *       201:
 *         description: Notificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', notificationController.createNotification.bind(notificationController));

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Obtiene estadísticas de notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/NotificationStats'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/stats', notificationController.getStats.bind(notificationController));

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Marca todas las notificaciones del usuario como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     markedCount:
 *                       type: integer
 *                       description: Número de notificaciones marcadas como leídas
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch('/mark-all-read', notificationController.markAllAsRead.bind(notificationController));

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Marca una notificación específica como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la notificación
 *     responses:
 *       204:
 *         description: Notificación marcada como leída exitosamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.patch('/:notificationId/read', notificationController.markAsRead.bind(notificationController));

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Elimina una notificación específica
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la notificación
 *     responses:
 *       204:
 *         description: Notificación eliminada exitosamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.delete('/:notificationId', notificationController.deleteNotification.bind(notificationController));

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
