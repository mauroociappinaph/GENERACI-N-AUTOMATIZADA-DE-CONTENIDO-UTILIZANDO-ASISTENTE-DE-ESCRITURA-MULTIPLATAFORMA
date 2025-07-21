"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditSuspiciousActivity = exports.auditUnauthorizedAccess = exports.auditPresets = exports.auditMiddleware = void 0;
const audit_service_1 = require("../services/audit.service");
/**
 * Crea middleware de auditoría para endpoints específicos
 */
const auditMiddleware = (config) => {
    return async (req, res, next) => {
        // Skip audit if condition is met
        if (config.skipIf && config.skipIf(req)) {
            next();
            return;
        }
        // Skip if no user context (for public endpoints)
        if (!req.user?.id) {
            next();
            return;
        }
        const resourceId = config.getResourceId
            ? config.getResourceId(req)
            : undefined;
        const oldValues = config.captureRequestBody ? req.body : undefined;
        // Store original res.json to capture response
        const originalJson = res.json;
        let responseData;
        if (config.captureResponseBody) {
            res.json = function (body) {
                responseData = body;
                return originalJson.call(this, body);
            };
        }
        // Store original res.end to trigger audit logging
        const originalEnd = res.end;
        res.end = function (...args) {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Don't await to avoid blocking the response
                audit_service_1.AuditService.logUserActivity(req, config.action, config.resourceType, resourceId, oldValues, config.captureResponseBody
                    ? responseData
                    : undefined).catch(error => {
                    console.error('Audit logging failed:', error);
                });
            }
            // Call original end method with all arguments
            return originalEnd.apply(this, args);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
/**
 * Middleware preconfigurado para operaciones CRUD comunes
 */
exports.auditPresets = {
    // User operations
    userCreated: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.USER_CREATED,
        resourceType: audit_service_1.resourceTypes.USER,
        captureResponseBody: true,
    }),
    userUpdated: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.USER_UPDATED,
        resourceType: audit_service_1.resourceTypes.USER,
        getResourceId: req => req.params.id,
        captureRequestBody: true,
        captureResponseBody: true,
    }),
    userDeleted: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.USER_DELETED,
        resourceType: audit_service_1.resourceTypes.USER,
        getResourceId: req => req.params.id,
    }),
    // Data record operations
    dataRecordCreated: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.DATA_RECORD_CREATED,
        resourceType: audit_service_1.resourceTypes.DATA_RECORD,
        captureRequestBody: true,
        captureResponseBody: true,
    }),
    dataRecordUpdated: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.DATA_RECORD_UPDATED,
        resourceType: audit_service_1.resourceTypes.DATA_RECORD,
        getResourceId: req => req.params.id,
        captureRequestBody: true,
        captureResponseBody: true,
    }),
    dataRecordDeleted: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.DATA_RECORD_DELETED,
        resourceType: audit_service_1.resourceTypes.DATA_RECORD,
        getResourceId: req => req.params.id,
    }),
    dataRecordViewed: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.DATA_RECORD_VIEWED,
        resourceType: audit_service_1.resourceTypes.DATA_RECORD,
        getResourceId: req => req.params.id,
        // Skip audit for list operations to avoid too many logs
        skipIf: req => !req.params.id,
    }),
    // Report operations
    reportCreated: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.REPORT_CREATED,
        resourceType: audit_service_1.resourceTypes.REPORT,
        captureRequestBody: true,
        captureResponseBody: true,
    }),
    reportUpdated: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.REPORT_UPDATED,
        resourceType: audit_service_1.resourceTypes.REPORT,
        getResourceId: req => req.params.id,
        captureRequestBody: true,
        captureResponseBody: true,
    }),
    reportDeleted: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.REPORT_DELETED,
        resourceType: audit_service_1.resourceTypes.REPORT,
        getResourceId: req => req.params.id,
    }),
    reportGenerated: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.REPORT_GENERATED,
        resourceType: audit_service_1.resourceTypes.REPORT,
        getResourceId: req => req.params.id,
        captureRequestBody: true,
    }),
    // Authentication operations
    userLogin: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.USER_LOGIN,
        resourceType: audit_service_1.resourceTypes.AUTH,
        captureRequestBody: false, // Don't capture password
    }),
    userLogout: (0, exports.auditMiddleware)({
        action: audit_service_1.auditActions.USER_LOGOUT,
        resourceType: audit_service_1.resourceTypes.AUTH,
    }),
};
/**
 * Middleware para capturar intentos de acceso no autorizado
 */
const auditUnauthorizedAccess = (req, _res, next) => {
    // This middleware should be called when authorization fails
    audit_service_1.AuditService.createAuditLog({
        userId: req.user?.id || 'anonymous',
        action: audit_service_1.auditActions.UNAUTHORIZED_ACCESS_ATTEMPT,
        resourceType: audit_service_1.resourceTypes.AUTH,
        newValues: {
            path: req.path,
            method: req.method,
            userAgent: req.get('User-Agent'),
        },
        ipAddress: req.socket.remoteAddress,
        userAgent: req.get('User-Agent'),
    }).catch(error => {
        console.error('Failed to log unauthorized access:', error);
    });
    next();
};
exports.auditUnauthorizedAccess = auditUnauthorizedAccess;
/**
 * Middleware para capturar actividad sospechosa
 */
const auditSuspiciousActivity = (reason, additionalData) => {
    return (req, _res, next) => {
        audit_service_1.AuditService.createAuditLog({
            userId: req.user?.id || 'anonymous',
            action: audit_service_1.auditActions.SUSPICIOUS_ACTIVITY_DETECTED,
            resourceType: audit_service_1.resourceTypes.AUTH,
            newValues: {
                reason,
                path: req.path,
                method: req.method,
                userAgent: req.get('User-Agent'),
                ...additionalData,
            },
            ipAddress: req.socket.remoteAddress,
            userAgent: req.get('User-Agent'),
        }).catch(error => {
            console.error('Failed to log suspicious activity:', error);
        });
        next();
    };
};
exports.auditSuspiciousActivity = auditSuspiciousActivity;
