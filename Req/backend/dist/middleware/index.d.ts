import { Application } from 'express';
/**
 * Configura todos los middlewares de la aplicación
 * Responsabilidad: Configuración centralizada de middlewares
 */
export declare const setupMiddleware: (app: Application) => void;
export { errorHandler } from './error-handler';
export { requestValidator } from './validation';
export { authLimiter, adminLimiter, sensitiveDataLimiter, reportLimiter, failedLoginLimiter } from './rate-limiting';
export { auditMiddleware, auditPresets, auditUnauthorizedAccess, auditSuspiciousActivity, } from './audit.middleware';
export { ipBlockingMiddleware, suspiciousActivityDetection, requestFingerprinting, cleanupSecurityData, getSecurityStats, blockIP, unblockIP, } from './security';
