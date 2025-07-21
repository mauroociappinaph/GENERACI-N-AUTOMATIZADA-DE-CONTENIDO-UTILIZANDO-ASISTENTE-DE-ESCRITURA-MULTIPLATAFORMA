"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupAuditLogs = exports.getSecurityMetrics = exports.getSecurityAlerts = exports.getAuditStats = exports.getAuditLogs = void 0;
const zod_1 = require("zod");
const audit_service_1 = require("../services/audit.service");
const logger_1 = require("../utils/logger");
/**
 * Audit Controller
 * Responsabilidad: Endpoints para gestión y visualización de logs de auditoría
 */
// Validation schemas
const getAuditLogsSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
    userId: zod_1.z.string().uuid().optional(),
    action: zod_1.z.string().optional(),
    resourceType: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    endDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
});
const getAuditStatsSchema = zod_1.z.object({
    startDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    endDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    userId: zod_1.z.string().uuid().optional(),
});
const getSecurityAlertsSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
    startDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    endDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
});
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
const getAuditLogs = async (req, res) => {
    try {
        const validatedQuery = getAuditLogsSchema.parse(req.query);
        const result = await audit_service_1.AuditService.getAuditLogs(validatedQuery);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid query parameters',
                    details: error.issues,
                    timestamp: new Date().toISOString(),
                },
            });
            return;
        }
        (0, logger_1.logError)(error, 'AuditController.getAuditLogs', {
            query: req.query,
            userId: req.user?.id,
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve audit logs',
                timestamp: new Date().toISOString(),
            },
        });
    }
};
exports.getAuditLogs = getAuditLogs;
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
const getAuditStats = async (req, res) => {
    try {
        const validatedQuery = getAuditStatsSchema.parse(req.query);
        const stats = await audit_service_1.AuditService.getAuditStats(validatedQuery);
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid query parameters',
                    details: error.issues,
                    timestamp: new Date().toISOString(),
                },
            });
            return;
        }
        (0, logger_1.logError)(error, 'AuditController.getAuditStats', {
            query: req.query,
            userId: req.user?.id,
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve audit statistics',
                timestamp: new Date().toISOString(),
            },
        });
    }
};
exports.getAuditStats = getAuditStats;
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
const getSecurityAlerts = async (req, res) => {
    try {
        const validatedQuery = getSecurityAlertsSchema.parse(req.query);
        const result = await audit_service_1.AuditService.getSecurityAlerts(validatedQuery);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid query parameters',
                    details: error.issues,
                    timestamp: new Date().toISOString(),
                },
            });
            return;
        }
        (0, logger_1.logError)(error, 'AuditController.getSecurityAlerts', {
            query: req.query,
            userId: req.user?.id,
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve security alerts',
                timestamp: new Date().toISOString(),
            },
        });
    }
};
exports.getSecurityAlerts = getSecurityAlerts;
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
const getSecurityMetrics = async (req, res) => {
    try {
        const metrics = await audit_service_1.AuditService.getSecurityMetrics();
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        (0, logger_1.logError)(error, 'AuditController.getSecurityMetrics', {
            userId: req.user?.id,
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve security metrics',
                timestamp: new Date().toISOString(),
            },
        });
    }
};
exports.getSecurityMetrics = getSecurityMetrics;
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
const cleanupAuditLogs = async (req, res) => {
    try {
        const result = await audit_service_1.AuditService.cleanupOldLogs();
        res.json({
            success: true,
            data: {
                message: 'Audit logs cleanup completed successfully',
                deletedCount: result.deletedCount,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        (0, logger_1.logError)(error, 'AuditController.cleanupAuditLogs', {
            userId: req.user?.id,
        });
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to cleanup audit logs',
                timestamp: new Date().toISOString(),
            },
        });
    }
};
exports.cleanupAuditLogs = cleanupAuditLogs;
