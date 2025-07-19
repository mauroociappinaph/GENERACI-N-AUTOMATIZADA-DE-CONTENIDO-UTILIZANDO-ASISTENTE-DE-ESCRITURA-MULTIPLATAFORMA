import { Request, Response } from 'express';
import { z } from 'zod';
import { AuditService } from '../services/audit.service';
import { logError } from '../utils/logger';

/**
 * Audit Controller
 * Responsabilidad: Endpoints para gestión y visualización de logs de auditoría
 */

// Validation schemas
const getAuditLogsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

const getAuditStatsSchema = z.object({
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  userId: z.string().uuid().optional(),
});

const getSecurityAlertsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
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
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedQuery = getAuditLogsSchema.parse(req.query);

    const result = await AuditService.getAuditLogs(validatedQuery);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    logError(error as Error, 'AuditController.getAuditLogs', {
      query: req.query,
      userId: (req as Request & { user?: { id: string } }).user?.id,
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
export const getAuditStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedQuery = getAuditStatsSchema.parse(req.query);

    const stats = await AuditService.getAuditStats(validatedQuery);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    logError(error as Error, 'AuditController.getAuditStats', {
      query: req.query,
      userId: (req as Request & { user?: { id: string } }).user?.id,
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
export const getSecurityAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedQuery = getSecurityAlertsSchema.parse(req.query);

    const result = await AuditService.getSecurityAlerts(validatedQuery);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    logError(error as Error, 'AuditController.getSecurityAlerts', {
      query: req.query,
      userId: (req as Request & { user?: { id: string } }).user?.id,
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
export const getSecurityMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await AuditService.getSecurityMetrics();

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error as Error, 'AuditController.getSecurityMetrics', {
      userId: (req as Request & { user?: { id: string } }).user?.id,
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
export const cleanupAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AuditService.cleanupOldLogs();

    res.json({
      success: true,
      data: {
        message: 'Audit logs cleanup completed successfully',
        deletedCount: result.deletedCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error as Error, 'AuditController.cleanupAuditLogs', {
      userId: (req as Request & { user?: { id: string } }).user?.id,
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
