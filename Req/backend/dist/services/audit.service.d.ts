import { Request } from 'express';
import { CreateAuditLogData } from '../types/prisma';
/**
 * Audit Service
 * Responsabilidad: Gestión de logs de auditoría para tracking de actividades
 */
export declare class AuditService {
    /**
     * Crea un registro de auditoría con detección de actividades sospechosas
     */
    static createAuditLog(data: CreateAuditLogData): Promise<void>;
    /**
     * Crea un log de auditoría desde un request HTTP
     */
    static logUserActivity(req: Request & {
        user?: {
            id: string;
        };
    }, action: string, resourceType: string, resourceId?: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>): Promise<void>;
    /**
     * Obtiene logs de auditoría con paginación y filtros
     */
    static getAuditLogs(params: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
        resourceType?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        data: Array<{
            id: string;
            userId: string;
            action: string;
            resourceType: string;
            resourceId: string | null;
            oldValues: unknown;
            newValues: unknown;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                role: string;
            };
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Obtiene estadísticas de actividad de auditoría
     */
    static getAuditStats(params: {
        startDate?: Date;
        endDate?: Date;
        userId?: string;
    }): Promise<{
        totalLogs: number;
        actionStats: Array<{
            action: string;
            count: number;
        }>;
        resourceStats: Array<{
            resourceType: string;
            count: number;
        }>;
        userStats: Array<{
            userId: string;
            count: number;
        }>;
    }>;
    /**
     * Detecta patrones de actividad sospechosa y genera alertas
     */
    private static checkSuspiciousActivity;
    /**
     * Dispara una alerta de seguridad
     */
    private static triggerSecurityAlert;
    /**
     * Obtiene alertas de seguridad recientes
     */
    static getSecurityAlerts(params: {
        page?: number;
        limit?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        data: Array<{
            id: string;
            alertType: string;
            details: unknown;
            createdAt: Date;
            ipAddress: string | null;
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    /**
     * Obtiene métricas de seguridad en tiempo real
     */
    static getSecurityMetrics(): Promise<{
        failedLoginsLast24h: number;
        suspiciousActivitiesLast24h: number;
        blockedIPsCount: number;
        activeAlertsCount: number;
        topSuspiciousIPs: Array<{
            ip: string;
            count: number;
        }>;
        recentSecurityEvents: Array<{
            action: string;
            count: number;
            lastOccurrence: Date;
        }>;
    }>;
    /**
     * Limpia logs de auditoría antiguos según la política de retención
     */
    static cleanupOldLogs(): Promise<{
        deletedCount: number;
    }>;
    /**
     * Extrae la IP del cliente del request
     */
    private static getClientIp;
}
export declare const auditActions: {
    readonly USER_LOGIN: "USER_LOGIN";
    readonly USER_LOGOUT: "USER_LOGOUT";
    readonly USER_CREATED: "USER_CREATED";
    readonly USER_UPDATED: "USER_UPDATED";
    readonly USER_DELETED: "USER_DELETED";
    readonly USER_ACTIVATED: "USER_ACTIVATED";
    readonly USER_DEACTIVATED: "USER_DEACTIVATED";
    readonly PASSWORD_CHANGED: "PASSWORD_CHANGED";
    readonly PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED";
    readonly PASSWORD_RESET_COMPLETED: "PASSWORD_RESET_COMPLETED";
    readonly DATA_RECORD_CREATED: "DATA_RECORD_CREATED";
    readonly DATA_RECORD_UPDATED: "DATA_RECORD_UPDATED";
    readonly DATA_RECORD_DELETED: "DATA_RECORD_DELETED";
    readonly DATA_RECORD_VIEWED: "DATA_RECORD_VIEWED";
    readonly REPORT_CREATED: "REPORT_CREATED";
    readonly REPORT_UPDATED: "REPORT_UPDATED";
    readonly REPORT_DELETED: "REPORT_DELETED";
    readonly REPORT_GENERATED: "REPORT_GENERATED";
    readonly REPORT_DOWNLOADED: "REPORT_DOWNLOADED";
    readonly SYSTEM_CONFIG_UPDATED: "SYSTEM_CONFIG_UPDATED";
    readonly BACKUP_CREATED: "BACKUP_CREATED";
    readonly BACKUP_RESTORED: "BACKUP_RESTORED";
    readonly UNAUTHORIZED_ACCESS_ATTEMPT: "UNAUTHORIZED_ACCESS_ATTEMPT";
    readonly SUSPICIOUS_ACTIVITY_DETECTED: "SUSPICIOUS_ACTIVITY_DETECTED";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
};
export declare const resourceTypes: {
    readonly USER: "USER";
    readonly DATA_RECORD: "DATA_RECORD";
    readonly REPORT: "REPORT";
    readonly SYSTEM: "SYSTEM";
    readonly AUTH: "AUTH";
};
export default AuditService;
