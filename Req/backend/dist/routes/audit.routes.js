"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const authorization_middleware_1 = require("../middleware/authorization.middleware");
const validation_1 = require("../middleware/validation");
const audit_middleware_1 = require("../middleware/audit.middleware");
const zod_1 = require("zod");
/**
 * Audit Routes
 * Responsabilidad: Rutas para gestión de auditoría y logs de seguridad
 */
const router = (0, express_1.Router)();
// Apply authentication to all audit routes
router.use(auth_middleware_1.authMiddleware);
// Validation schemas
const queryParamsSchema = {
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        userId: zod_1.z.string().optional(),
        action: zod_1.z.string().optional(),
        resourceType: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
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
router.get('/logs', (0, authorization_middleware_1.authorizationMiddleware)(['ADMIN', 'AUDITOR']), (0, validation_1.validateRequest)(queryParamsSchema), audit_middleware_1.auditPresets.dataRecordViewed, // Audit the audit log access
audit_controller_1.getAuditLogs);
/**
 * GET /api/audit/stats
 * Obtiene estadísticas de auditoría (requiere permisos de administrador o auditor)
 */
router.get('/stats', (0, authorization_middleware_1.authorizationMiddleware)(['ADMIN', 'AUDITOR']), (0, validation_1.validateRequest)(queryParamsSchema), audit_controller_1.getAuditStats);
/**
 * GET /api/audit/security-alerts
 * Obtiene alertas de seguridad (requiere permisos de administrador)
 */
router.get('/security-alerts', (0, authorization_middleware_1.authorizationMiddleware)(['ADMIN']), (0, validation_1.validateRequest)({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
    }),
}), audit_controller_1.getSecurityAlerts);
/**
 * GET /api/audit/security-metrics
 * Obtiene métricas de seguridad en tiempo real (requiere permisos de administrador)
 */
router.get('/security-metrics', (0, authorization_middleware_1.authorizationMiddleware)(['ADMIN']), audit_controller_1.getSecurityMetrics);
/**
 * POST /api/audit/cleanup
 * Ejecuta limpieza de logs antiguos (solo administradores)
 */
router.post('/cleanup', (0, authorization_middleware_1.authorizationMiddleware)(['ADMIN']), audit_middleware_1.auditPresets.dataRecordDeleted, // Audit the cleanup operation
audit_controller_1.cleanupAuditLogs);
exports.default = router;
