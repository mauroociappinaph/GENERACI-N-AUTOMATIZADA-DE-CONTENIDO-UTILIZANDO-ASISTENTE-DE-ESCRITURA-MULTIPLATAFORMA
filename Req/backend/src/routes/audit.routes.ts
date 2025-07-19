import { Router } from 'express';
import {
  getAuditLogs,
  getAuditStats,
  getSecurityAlerts,
  getSecurityMetrics,
  cleanupAuditLogs,
} from '../controllers/audit.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizationMiddleware } from '../middleware/authorization.middleware';
import { validateRequest } from '../middleware/validation';
import { auditPresets } from '../middleware/audit.middleware';
import { z } from 'zod';

/**
 * Audit Routes
 * Responsabilidad: Rutas para gestión de auditoría y logs de seguridad
 */

const router = Router();

// Apply authentication to all audit routes
router.use(authMiddleware);

// Validation schemas
const queryParamsSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    userId: z.string().optional(),
    action: z.string().optional(),
    resourceType: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
};

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Audit and security logging endpoints
 */

/**
 * GET /api/audit/logs
 * Obtiene logs de auditoría (requiere permisos de administrador o auditor)
 */
router.get(
  '/logs',
  authorizationMiddleware(['ADMIN', 'AUDITOR']),
  validateRequest(queryParamsSchema),
  auditPresets.dataRecordViewed, // Audit the audit log access
  getAuditLogs
);

/**
 * GET /api/audit/stats
 * Obtiene estadísticas de auditoría (requiere permisos de administrador o auditor)
 */
router.get(
  '/stats',
  authorizationMiddleware(['ADMIN', 'AUDITOR']),
  validateRequest(queryParamsSchema),
  getAuditStats
);

/**
 * GET /api/audit/security-alerts
 * Obtiene alertas de seguridad (requiere permisos de administrador)
 */
router.get(
  '/security-alerts',
  authorizationMiddleware(['ADMIN']),
  validateRequest({
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  }),
  getSecurityAlerts
);

/**
 * GET /api/audit/security-metrics
 * Obtiene métricas de seguridad en tiempo real (requiere permisos de administrador)
 */
router.get(
  '/security-metrics',
  authorizationMiddleware(['ADMIN']),
  getSecurityMetrics
);

/**
 * POST /api/audit/cleanup
 * Ejecuta limpieza de logs antiguos (solo administradores)
 */
router.post(
  '/cleanup',
  authorizationMiddleware(['ADMIN']),
  auditPresets.dataRecordDeleted, // Audit the cleanup operation
  cleanupAuditLogs
);

export default router;
