import { Request, Response, NextFunction } from 'express';

import {
  AuditService,
  auditActions,
  resourceTypes,
} from '../services/audit.service';

/**
 * Middleware para logging automático de auditoría
 * Responsabilidad: Capturar automáticamente actividades de API para auditoría
 */

interface AuditConfig {
  action: string;
  resourceType: string;
  getResourceId?: (req: Request) => string | undefined;
  captureRequestBody?: boolean;
  captureResponseBody?: boolean;
  skipIf?: (req: Request) => boolean;
}

/**
 * Crea middleware de auditoría para endpoints específicos
 */
export const auditMiddleware = (config: AuditConfig) => {
  return async (
    req: Request & { user?: { id: string } },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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
    let responseData: unknown;

    if (config.captureResponseBody) {
      res.json = function (this: Response, body: unknown): Response {
        responseData = body;
        return originalJson.call(this, body);
      };
    }

    // Store original res.end to trigger audit logging
    const originalEnd = res.end;
    res.end = function (this: Response, ...args: unknown[]): Response {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Don't await to avoid blocking the response
        AuditService.logUserActivity(
          req,
          config.action,
          config.resourceType,
          resourceId,
          oldValues,
          config.captureResponseBody
            ? (responseData as Record<string, unknown>)
            : undefined
        ).catch(error => {
          console.error('Audit logging failed:', error);
        });
      }

      // Call original end method with all arguments
      return originalEnd.apply(this, args as Parameters<typeof originalEnd>);
    };

    next();
  };
};

/**
 * Middleware preconfigurado para operaciones CRUD comunes
 */
export const auditPresets = {
  // User operations
  userCreated: auditMiddleware({
    action: auditActions.USER_CREATED,
    resourceType: resourceTypes.USER,
    captureResponseBody: true,
  }),

  userUpdated: auditMiddleware({
    action: auditActions.USER_UPDATED,
    resourceType: resourceTypes.USER,
    getResourceId: req => req.params.id,
    captureRequestBody: true,
    captureResponseBody: true,
  }),

  userDeleted: auditMiddleware({
    action: auditActions.USER_DELETED,
    resourceType: resourceTypes.USER,
    getResourceId: req => req.params.id,
  }),

  // Data record operations
  dataRecordCreated: auditMiddleware({
    action: auditActions.DATA_RECORD_CREATED,
    resourceType: resourceTypes.DATA_RECORD,
    captureRequestBody: true,
    captureResponseBody: true,
  }),

  dataRecordUpdated: auditMiddleware({
    action: auditActions.DATA_RECORD_UPDATED,
    resourceType: resourceTypes.DATA_RECORD,
    getResourceId: req => req.params.id,
    captureRequestBody: true,
    captureResponseBody: true,
  }),

  dataRecordDeleted: auditMiddleware({
    action: auditActions.DATA_RECORD_DELETED,
    resourceType: resourceTypes.DATA_RECORD,
    getResourceId: req => req.params.id,
  }),

  dataRecordViewed: auditMiddleware({
    action: auditActions.DATA_RECORD_VIEWED,
    resourceType: resourceTypes.DATA_RECORD,
    getResourceId: req => req.params.id,
    // Skip audit for list operations to avoid too many logs
    skipIf: req => !req.params.id,
  }),

  // Report operations
  reportCreated: auditMiddleware({
    action: auditActions.REPORT_CREATED,
    resourceType: resourceTypes.REPORT,
    captureRequestBody: true,
    captureResponseBody: true,
  }),

  reportUpdated: auditMiddleware({
    action: auditActions.REPORT_UPDATED,
    resourceType: resourceTypes.REPORT,
    getResourceId: req => req.params.id,
    captureRequestBody: true,
    captureResponseBody: true,
  }),

  reportDeleted: auditMiddleware({
    action: auditActions.REPORT_DELETED,
    resourceType: resourceTypes.REPORT,
    getResourceId: req => req.params.id,
  }),

  reportGenerated: auditMiddleware({
    action: auditActions.REPORT_GENERATED,
    resourceType: resourceTypes.REPORT,
    getResourceId: req => req.params.id,
    captureRequestBody: true,
  }),

  // Authentication operations
  userLogin: auditMiddleware({
    action: auditActions.USER_LOGIN,
    resourceType: resourceTypes.AUTH,
    captureRequestBody: false, // Don't capture password
  }),

  userLogout: auditMiddleware({
    action: auditActions.USER_LOGOUT,
    resourceType: resourceTypes.AUTH,
  }),
};

/**
 * Middleware para capturar intentos de acceso no autorizado
 */
export const auditUnauthorizedAccess = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // This middleware should be called when authorization fails
  AuditService.createAuditLog({
    userId:
      (req as Request & { user?: { id: string } }).user?.id || 'anonymous',
    action: auditActions.UNAUTHORIZED_ACCESS_ATTEMPT,
    resourceType: resourceTypes.AUTH,
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

/**
 * Middleware para capturar actividad sospechosa
 */
export const auditSuspiciousActivity = (
  reason: string,
  additionalData?: Record<string, unknown>
) => {
  return (
    req: Request & { user?: { id: string } },
    _res: Response,
    next: NextFunction
  ): void => {
    AuditService.createAuditLog({
      userId: req.user?.id || 'anonymous',
      action: auditActions.SUSPICIOUS_ACTIVITY_DETECTED,
      resourceType: resourceTypes.AUTH,
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
