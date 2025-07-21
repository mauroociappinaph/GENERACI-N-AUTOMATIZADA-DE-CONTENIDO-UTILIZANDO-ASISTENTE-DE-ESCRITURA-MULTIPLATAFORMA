import { Request, Response } from 'express';
/**
 * @swagger
 * /api/audit/logs:
 *   get:
 *     summary: Obtiene logs de auditoría con filtros y paginación
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Elementos por página
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por acción
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de recurso
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Lista de logs de auditoría
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos suficientes
 */
export declare const getAuditLogs: (req: Request, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/audit/stats:
 *   get:
 *     summary: Obtiene estadísticas de auditoría
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario
 *     responses:
 *       200:
 *         description: Estadísticas de auditoría
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos suficientes
 */
export declare const getAuditStats: (req: Request, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/audit/security-alerts:
 *   get:
 *     summary: Obtiene alertas de seguridad
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Elementos por página
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Lista de alertas de seguridad
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos suficientes
 */
export declare const getSecurityAlerts: (req: Request, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/audit/security-metrics:
 *   get:
 *     summary: Obtiene métricas de seguridad en tiempo real
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de seguridad
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos suficientes
 */
export declare const getSecurityMetrics: (req: Request, res: Response) => Promise<void>;
/**
 * @swagger
 * /api/audit/cleanup:
 *   post:
 *     summary: Ejecuta limpieza de logs antiguos (solo administradores)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Limpieza ejecutada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos suficientes
 */
export declare const cleanupAuditLogs: (req: Request, res: Response) => Promise<void>;
