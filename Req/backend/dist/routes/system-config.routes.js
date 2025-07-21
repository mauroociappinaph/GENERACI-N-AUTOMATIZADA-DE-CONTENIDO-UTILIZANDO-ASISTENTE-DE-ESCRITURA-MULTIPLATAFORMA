"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const system_config_controller_1 = require("@/controllers/system-config.controller");
const auth_middleware_1 = require("@/middleware/auth.middleware");
const authorization_middleware_1 = require("@/middleware/authorization.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Aplicar autenticación a todas las rutas
router.use(auth_middleware_1.authenticateToken);
/**
 * @swagger
 * /api/system-config:
 *   get:
 *     summary: Obtener configuración del sistema
 *     tags: [System Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
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
 *                     config:
 *                       type: object
 *                       properties:
 *                         siteName:
 *                           type: string
 *                         siteDescription:
 *                           type: string
 *                         maintenanceMode:
 *                           type: boolean
 *                         allowRegistration:
 *                           type: boolean
 *                         maxFileUploadSize:
 *                           type: number
 *                         sessionTimeout:
 *                           type: number
 *                         emailNotifications:
 *                           type: boolean
 *                         backupRetentionDays:
 *                           type: number
 *                         logLevel:
 *                           type: string
 *                           enum: [error, warn, info, debug]
 *                         maxLoginAttempts:
 *                           type: number
 *                         passwordMinLength:
 *                           type: number
 *                         requirePasswordComplexity:
 *                           type: boolean
 *       403:
 *         description: Sin permisos para ver configuración
 */
router.get('/', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN), system_config_controller_1.SystemConfigController.getSystemConfig);
/**
 * @swagger
 * /api/system-config:
 *   put:
 *     summary: Actualizar configuración del sistema
 *     tags: [System Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               siteDescription:
 *                 type: string
 *               maintenanceMode:
 *                 type: boolean
 *               allowRegistration:
 *                 type: boolean
 *               maxFileUploadSize:
 *                 type: number
 *               sessionTimeout:
 *                 type: number
 *               emailNotifications:
 *                 type: boolean
 *               backupRetentionDays:
 *                 type: number
 *               logLevel:
 *                 type: string
 *                 enum: [error, warn, info, debug]
 *               maxLoginAttempts:
 *                 type: number
 *               passwordMinLength:
 *                 type: number
 *               requirePasswordComplexity:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       400:
 *         description: Datos de configuración inválidos
 *       403:
 *         description: Sin permisos para actualizar configuración
 */
router.put('/', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN), system_config_controller_1.SystemConfigController.updateSystemConfig);
/**
 * @swagger
 * /api/system-config/backups:
 *   post:
 *     summary: Crear respaldo de base de datos
 *     tags: [System Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Descripción del respaldo
 *     responses:
 *       200:
 *         description: Respaldo creado exitosamente
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
 *                     backup:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         filename:
 *                           type: string
 *                         description:
 *                           type: string
 *                         size:
 *                           type: number
 *                         createdBy:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       403:
 *         description: Sin permisos para crear respaldos
 */
router.post('/backups', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN), system_config_controller_1.SystemConfigController.createDatabaseBackup);
/**
 * @swagger
 * /api/system-config/backups:
 *   get:
 *     summary: Obtener lista de respaldos
 *     tags: [System Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de respaldos por página
 *     responses:
 *       200:
 *         description: Lista de respaldos obtenida exitosamente
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
 *                     backups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           filename:
 *                             type: string
 *                           description:
 *                             type: string
 *                           size:
 *                             type: number
 *                           createdBy:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *       403:
 *         description: Sin permisos para ver respaldos
 */
router.get('/backups', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN), system_config_controller_1.SystemConfigController.getDatabaseBackups);
/**
 * @swagger
 * /api/system-config/backups/{id}/restore:
 *   post:
 *     summary: Restaurar respaldo de base de datos
 *     tags: [System Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del respaldo
 *     responses:
 *       200:
 *         description: Respaldo restaurado exitosamente
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
 *                     message:
 *                       type: string
 *       404:
 *         description: Respaldo no encontrado
 *       403:
 *         description: Sin permisos para restaurar respaldos
 */
router.post('/backups/:id/restore', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN), system_config_controller_1.SystemConfigController.restoreDatabaseBackup);
/**
 * @swagger
 * /api/system-config/logs:
 *   get:
 *     summary: Obtener logs del sistema
 *     tags: [System Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Cantidad de logs por página
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: Filtrar por nivel de log
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio para filtrar logs
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin para filtrar logs
 *     responses:
 *       200:
 *         description: Logs obtenidos exitosamente
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
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           level:
 *                             type: string
 *                           message:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *       403:
 *         description: Sin permisos para ver logs
 */
router.get('/logs', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN), system_config_controller_1.SystemConfigController.getSystemLogs);
/**
 * @swagger
 * /api/system-config/logs/cleanup:
 *   post:
 *     summary: Limpiar logs antiguos
 *     tags: [System Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: number
 *                 description: Días de antigüedad para eliminar logs
 *                 default: 30
 *     responses:
 *       200:
 *         description: Logs limpiados exitosamente
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
 *                     message:
 *                       type: string
 *                     deletedCount:
 *                       type: number
 *       403:
 *         description: Sin permisos para limpiar logs
 */
router.post('/logs/cleanup', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN), system_config_controller_1.SystemConfigController.cleanupOldLogs);
/**
 * @swagger
 * /api/system-config/metrics:
 *   get:
 *     summary: Obtener métricas del sistema
 *     tags: [System Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
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
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                         memoryUsage:
 *                           type: object
 *                           properties:
 *                             used:
 *                               type: number
 *                             total:
 *                               type: number
 *                             percentage:
 *                               type: number
 *                         diskUsage:
 *                           type: object
 *                           properties:
 *                             used:
 *                               type: number
 *                             total:
 *                               type: number
 *                             percentage:
 *                               type: number
 *                         databaseStats:
 *                           type: object
 *                           properties:
 *                             totalTables:
 *                               type: number
 *                             totalRecords:
 *                               type: number
 *                             databaseSize:
 *                               type: number
 *                         activeUsers:
 *                           type: number
 *                         requestsPerMinute:
 *                           type: number
 *       403:
 *         description: Sin permisos para ver métricas
 */
router.get('/metrics', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN), system_config_controller_1.SystemConfigController.getSystemMetrics);
exports.default = router;
