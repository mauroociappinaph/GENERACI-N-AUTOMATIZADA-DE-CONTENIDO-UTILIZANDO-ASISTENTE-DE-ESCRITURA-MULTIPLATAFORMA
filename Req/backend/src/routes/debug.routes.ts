import { Router } from 'express';
import { DebugController } from '../controllers/debug.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/authorization.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * Rutas para debugging y monitoreo del sistema
 * Todas las rutas requieren autenticación y rol de administrador
 */

// Middleware de autenticación y autorización para todas las rutas
router.use(authMiddleware);
router.use(requireRole(UserRole.ADMIN));

/**
 * @swagger
 * /api/debug/stats:
 *   get:
 *     summary: Obtener estadísticas generales del sistema de debugging
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de debugging obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     errorStats:
 *                       type: object
 *                     recommendations:
 *                       type: array
 *                     circuitBreakers:
 *                       type: object
 *                     systemHealth:
 *                       type: object
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - se requiere rol de administrador
 */
router.get('/stats', DebugController.getDebugStats);

/**
 * @swagger
 * /api/debug/errors:
 *   get:
 *     summary: Obtener estadísticas de errores
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de errores obtenidas exitosamente
 */
router.get('/errors', DebugController.getErrorStats);

/**
 * @swagger
 * /api/debug/recommendations:
 *   get:
 *     summary: Obtener recomendaciones para prevención de errores
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recomendaciones obtenidas exitosamente
 */
router.get('/recommendations', DebugController.getErrorRecommendations);

/**
 * @swagger
 * /api/debug/circuit-breakers:
 *   get:
 *     summary: Obtener estado de los circuit breakers
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de circuit breakers obtenido exitosamente
 */
router.get('/circuit-breakers', DebugController.getCircuitBreakerStatus);

/**
 * @swagger
 * /api/debug/health:
 *   get:
 *     summary: Obtener salud general del sistema
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Salud del sistema obtenida exitosamente
 */
router.get('/health', DebugController.getSystemHealth);

/**
 * @swagger
 * /api/debug/performance:
 *   get:
 *     summary: Obtener métricas de rendimiento del sistema
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de rendimiento obtenidas exitosamente
 */
router.get('/performance', DebugController.getPerformanceMetrics);

/**
 * @swagger
 * /api/debug/log-level:
 *   post:
 *     summary: Configurar nivel de logging para un componente
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - component
 *               - level
 *             properties:
 *               component:
 *                 type: string
 *                 description: Nombre del componente
 *                 example: "DATABASE"
 *               level:
 *                 type: string
 *                 enum: [debug, info, warn, error]
 *                 description: Nivel de logging
 *                 example: "debug"
 *     responses:
 *       200:
 *         description: Nivel de logging configurado exitosamente
 */
router.post('/log-level', DebugController.setComponentLogLevel);

/**
 * @swagger
 * /api/debug/simulate-error:
 *   post:
 *     summary: Simular error para testing (solo en desarrollo)
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errorType:
 *                 type: string
 *                 description: Tipo de error a simular
 *                 example: "ValidationError"
 *               component:
 *                 type: string
 *                 description: Componente donde simular el error
 *                 example: "TEST"
 *               message:
 *                 type: string
 *                 description: Mensaje del error
 *                 example: "Simulated error for testing"
 *     responses:
 *       200:
 *         description: Error simulado exitosamente
 *       403:
 *         description: No permitido en producción
 */
router.post('/simulate-error', DebugController.simulateError);

/**
 * @swagger
 * /api/debug/clear-stats:
 *   delete:
 *     summary: Limpiar estadísticas de errores
 *     tags: [Debug]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas limpiadas exitosamente
 */
router.delete('/clear-stats', DebugController.clearErrorStats);

export default router;
