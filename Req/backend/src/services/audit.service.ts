import { Request } from 'express';
import { prisma } from '../config';
import { CreateAuditLogData } from '../types/prisma';
import { logBusinessEvent, logError } from '../utils/logger';
import { NotificationService } from './notification.service';
import { securityConfig } from '../config/security';

/**
 * Audit Service
 * Responsabilidad: Gestión de logs de auditoría para tracking de actividades
 */
export class AuditService {
  /**
   * Crea un registro de auditoría con detección de actividades sospechosas
   */
  static async createAuditLog(data: CreateAuditLogData): Promise<void> {
    try {
      // Create the audit log
      const auditLog = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          oldValues: data.oldValues,
          newValues: data.newValues,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });

      // Check for suspicious activity patterns
      await this.checkSuspiciousActivity(data);

      // Log business event for monitoring
      logBusinessEvent(
        'AUDIT_LOG_CREATED',
        {
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          auditLogId: auditLog.id,
        },
        data.userId
      );
    } catch (error) {
      logError(error as Error, 'AuditService.createAuditLog', {
        userId: data.userId,
        action: data.action,
        resourceType: data.resourceType,
      });
      // Don't throw error to avoid breaking the main operation
      // Audit logging should be non-blocking
    }
  }

  /**
   * Crea un log de auditoría desde un request HTTP
   */
  static async logUserActivity(
    req: Request & { user?: { id: string } },
    action: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>
  ): Promise<void> {
    if (!req.user?.id) {
      return; // No user context, skip audit logging
    }

    const auditData: CreateAuditLogData = {
      userId: req.user.id,
      action,
      resourceType,
      resourceId,
      oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
      newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
      ipAddress: this.getClientIp(req),
      userAgent: req.get('User-Agent'),
    };

    await this.createAuditLog(auditData);
  }

  /**
   * Obtiene logs de auditoría con paginación y filtros
   */
  static async getAuditLogs(params: {
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
  }> {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      resourceType,
      startDate,
      endDate,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resourceType) where.resourceType = resourceType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate)
        (where.createdAt as Record<string, unknown>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, unknown>).lte = endDate;
    }

    try {
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.auditLog.count({ where }),
      ]);

      return {
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logError(error as Error, 'AuditService.getAuditLogs', params);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de actividad de auditoría
   */
  static async getAuditStats(params: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): Promise<{
    totalLogs: number;
    actionStats: Array<{ action: string; count: number }>;
    resourceStats: Array<{ resourceType: string; count: number }>;
    userStats: Array<{ userId: string; count: number }>;
  }> {
    const { startDate, endDate, userId } = params;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate)
        (where.createdAt as Record<string, unknown>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, unknown>).lte = endDate;
    }

    try {
      const [totalLogs, actionStats, resourceStats, userStats] =
        await Promise.all([
          // Total logs count
          prisma.auditLog.count({ where }),

          // Actions breakdown
          prisma.auditLog.groupBy({
            by: ['action'],
            where,
            _count: { action: true },
            orderBy: { _count: { action: 'desc' } },
            take: 10,
          }),

          // Resource types breakdown
          prisma.auditLog.groupBy({
            by: ['resourceType'],
            where,
            _count: { resourceType: true },
            orderBy: { _count: { resourceType: 'desc' } },
            take: 10,
          }),

          // Most active users (if not filtering by specific user)
          !userId
            ? prisma.auditLog.groupBy({
                by: ['userId'],
                where,
                _count: { userId: true },
                orderBy: { _count: { userId: 'desc' } },
                take: 10,
              })
            : [],
        ]);

      return {
        totalLogs,
        actionStats: actionStats.map(stat => ({
          action: stat.action,
          count: stat._count.action,
        })),
        resourceStats: resourceStats.map(stat => ({
          resourceType: stat.resourceType,
          count: stat._count.resourceType,
        })),
        userStats: userStats.map(stat => ({
          userId: stat.userId,
          count: stat._count.userId,
        })),
      };
    } catch (error) {
      logError(error as Error, 'AuditService.getAuditStats', params);
      throw error;
    }
  }

  /**
   * Detecta patrones de actividad sospechosa y genera alertas
   */
  private static async checkSuspiciousActivity(data: CreateAuditLogData): Promise<void> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Check for multiple failed login attempts
      if (data.action === auditActions.UNAUTHORIZED_ACCESS_ATTEMPT) {
        const recentFailedAttempts = await prisma.auditLog.count({
          where: {
            action: auditActions.UNAUTHORIZED_ACCESS_ATTEMPT,
            ipAddress: data.ipAddress,
            createdAt: { gte: oneHourAgo },
          },
        });

        if (recentFailedAttempts >= securityConfig.audit.alertThresholds.failedLogins) {
          await this.triggerSecurityAlert('MULTIPLE_FAILED_LOGINS', {
            ipAddress: data.ipAddress,
            attempts: recentFailedAttempts,
            timeWindow: '1 hour',
          });
        }
      }

      // Check for unusual activity patterns
      if (data.userId !== 'anonymous') {
        const userActivity = await prisma.auditLog.count({
          where: {
            userId: data.userId,
            createdAt: { gte: oneHourAgo },
          },
        });

        // Alert if user has excessive activity (potential account compromise)
        if (userActivity >= 100) {
          await this.triggerSecurityAlert('EXCESSIVE_USER_ACTIVITY', {
            userId: data.userId,
            activityCount: userActivity,
            timeWindow: '1 hour',
          });
        }
      }

      // Check for suspicious IP activity
      if (data.ipAddress) {
        const ipActivity = await prisma.auditLog.count({
          where: {
            ipAddress: data.ipAddress,
            createdAt: { gte: oneDayAgo },
          },
        });

        // Alert if IP has excessive activity from different users
        const uniqueUsers = await prisma.auditLog.findMany({
          where: {
            ipAddress: data.ipAddress,
            createdAt: { gte: oneDayAgo },
          },
          select: { userId: true },
          distinct: ['userId'],
        });

        if (uniqueUsers.length >= 10 && ipActivity >= 200) {
          await this.triggerSecurityAlert('SUSPICIOUS_IP_ACTIVITY', {
            ipAddress: data.ipAddress,
            uniqueUsers: uniqueUsers.length,
            totalActivity: ipActivity,
            timeWindow: '24 hours',
          });
        }
      }

      // Check for privilege escalation attempts
      if (data.action.includes('ADMIN') || data.resourceType === resourceTypes.SYSTEM) {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { role: true },
        });

        if (user && user.role !== 'ADMIN') {
          await this.triggerSecurityAlert('PRIVILEGE_ESCALATION_ATTEMPT', {
            userId: data.userId,
            userRole: user.role,
            attemptedAction: data.action,
            resourceType: data.resourceType,
          });
        }
      }
    } catch (error) {
      logError(error as Error, 'AuditService.checkSuspiciousActivity', {
        userId: data.userId,
        action: data.action,
      });
    }
  }

  /**
   * Dispara una alerta de seguridad
   */
  private static async triggerSecurityAlert(
    alertType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    try {
      // Log the security alert
      console.error(`🚨 SECURITY ALERT: ${alertType}`, details);

      // Create audit log for the alert itself
      await prisma.auditLog.create({
        data: {
          userId: 'system',
          action: 'SECURITY_ALERT_TRIGGERED',
          resourceType: resourceTypes.AUTH,
          newValues: {
            alertType,
            details,
            timestamp: new Date().toISOString(),
          },
          ipAddress: details.ipAddress as string || null,
          userAgent: 'system',
        },
      });

      // Send notification to administrators
      try {
        await NotificationService.createNotification({
          title: `Security Alert: ${alertType}`,
          message: `Security alert triggered: ${JSON.stringify(details)}`,
          type: 'SECURITY_ALERT',
          priority: 'HIGH',
          recipientType: 'ROLE',
          recipientId: 'ADMIN',
          data: details,
        });
      } catch (notificationError) {
        console.error('Failed to send security alert notification:', notificationError);
      }

      // Log business event for monitoring systems
      logBusinessEvent('SECURITY_ALERT_TRIGGERED', {
        alertType,
        details,
      });
    } catch (error) {
      logError(error as Error, 'AuditService.triggerSecurityAlert', {
        alertType,
        details,
      });
    }
  }

  /**
   * Obtiene alertas de seguridad recientes
   */
  static async getSecurityAlerts(params: {
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
  }> {
    const { page = 1, limit = 50, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      action: 'SECURITY_ALERT_TRIGGERED',
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, unknown>).lte = endDate;
    }

    try {
      const [alerts, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          select: {
            id: true,
            newValues: true,
            createdAt: true,
            ipAddress: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.auditLog.count({ where }),
      ]);

      const formattedAlerts = alerts.map(alert => {
        const newValues = alert.newValues as any;
        return {
          id: alert.id,
          alertType: newValues?.alertType || 'UNKNOWN',
          details: newValues?.details || {},
          createdAt: alert.createdAt,
          ipAddress: alert.ipAddress,
        };
      });

      return {
        data: formattedAlerts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logError(error as Error, 'AuditService.getSecurityAlerts', params);
      throw error;
    }
  }

  /**
   * Obtiene métricas de seguridad en tiempo real
   */
  static async getSecurityMetrics(): Promise<{
    failedLoginsLast24h: number;
    suspiciousActivitiesLast24h: number;
    blockedIPsCount: number;
    activeAlertsCount: number;
    topSuspiciousIPs: Array<{ ip: string; count: number }>;
    recentSecurityEvents: Array<{
      action: string;
      count: number;
      lastOccurrence: Date;
    }>;
  }> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        failedLoginsLast24h,
        suspiciousActivitiesLast24h,
        activeAlertsCount,
        topSuspiciousIPs,
        recentSecurityEvents,
      ] = await Promise.all([
        // Failed logins in last 24 hours
        prisma.auditLog.count({
          where: {
            action: auditActions.UNAUTHORIZED_ACCESS_ATTEMPT,
            createdAt: { gte: oneDayAgo },
          },
        }),

        // Suspicious activities in last 24 hours
        prisma.auditLog.count({
          where: {
            action: auditActions.SUSPICIOUS_ACTIVITY_DETECTED,
            createdAt: { gte: oneDayAgo },
          },
        }),

        // Active security alerts count
        prisma.auditLog.count({
          where: {
            action: 'SECURITY_ALERT_TRIGGERED',
            createdAt: { gte: oneDayAgo },
          },
        }),

        // Top suspicious IPs
        prisma.auditLog.groupBy({
          by: ['ipAddress'],
          where: {
            action: {
              in: [
                auditActions.UNAUTHORIZED_ACCESS_ATTEMPT,
                auditActions.SUSPICIOUS_ACTIVITY_DETECTED,
                auditActions.RATE_LIMIT_EXCEEDED,
              ],
            },
            createdAt: { gte: oneWeekAgo },
            ipAddress: { not: null },
          },
          _count: { ipAddress: true },
          orderBy: { _count: { ipAddress: 'desc' } },
          take: 10,
        }),

        // Recent security events summary
        prisma.auditLog.groupBy({
          by: ['action'],
          where: {
            action: {
              in: [
                auditActions.UNAUTHORIZED_ACCESS_ATTEMPT,
                auditActions.SUSPICIOUS_ACTIVITY_DETECTED,
                auditActions.RATE_LIMIT_EXCEEDED,
                'SECURITY_ALERT_TRIGGERED',
              ],
            },
            createdAt: { gte: oneWeekAgo },
          },
          _count: { action: true },
          _max: { createdAt: true },
          orderBy: { _count: { action: 'desc' } },
        }),
      ]);

      return {
        failedLoginsLast24h,
        suspiciousActivitiesLast24h,
        blockedIPsCount: 0, // This would come from the security middleware in production
        activeAlertsCount,
        topSuspiciousIPs: topSuspiciousIPs.map(ip => ({
          ip: ip.ipAddress || 'unknown',
          count: ip._count.ipAddress,
        })),
        recentSecurityEvents: recentSecurityEvents.map(event => ({
          action: event.action,
          count: event._count.action,
          lastOccurrence: event._max.createdAt || new Date(),
        })),
      };
    } catch (error) {
      logError(error as Error, 'AuditService.getSecurityMetrics');
      throw error;
    }
  }

  /**
   * Limpia logs de auditoría antiguos según la política de retención
   */
  static async cleanupOldLogs(): Promise<{ deletedCount: number }> {
    try {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - securityConfig.audit.retentionDays);

      const result = await prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: retentionDate },
          // Keep security alerts longer
          action: { not: 'SECURITY_ALERT_TRIGGERED' },
        },
      });

      logBusinessEvent('AUDIT_LOGS_CLEANUP', {
        deletedCount: result.count,
        retentionDays: securityConfig.audit.retentionDays,
      });

      return { deletedCount: result.count };
    } catch (error) {
      logError(error as Error, 'AuditService.cleanupOldLogs');
      throw error;
    }
  }

  /**
   * Extrae la IP del cliente del request
   */
  private static getClientIp(req: Request): string {
    const forwarded = req.get('X-Forwarded-For');
    const realIp = req.get('X-Real-IP');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (realIp) {
      return realIp;
    }

    return req.socket.remoteAddress || 'unknown';
  }
}

// Convenience functions for common audit actions
export const auditActions = {
  // User actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',

  // Data record actions
  DATA_RECORD_CREATED: 'DATA_RECORD_CREATED',
  DATA_RECORD_UPDATED: 'DATA_RECORD_UPDATED',
  DATA_RECORD_DELETED: 'DATA_RECORD_DELETED',
  DATA_RECORD_VIEWED: 'DATA_RECORD_VIEWED',

  // Report actions
  REPORT_CREATED: 'REPORT_CREATED',
  REPORT_UPDATED: 'REPORT_UPDATED',
  REPORT_DELETED: 'REPORT_DELETED',
  REPORT_GENERATED: 'REPORT_GENERATED',
  REPORT_DOWNLOADED: 'REPORT_DOWNLOADED',

  // System actions
  SYSTEM_CONFIG_UPDATED: 'SYSTEM_CONFIG_UPDATED',
  BACKUP_CREATED: 'BACKUP_CREATED',
  BACKUP_RESTORED: 'BACKUP_RESTORED',

  // Security actions
  UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  SUSPICIOUS_ACTIVITY_DETECTED: 'SUSPICIOUS_ACTIVITY_DETECTED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export const resourceTypes = {
  USER: 'USER',
  DATA_RECORD: 'DATA_RECORD',
  REPORT: 'REPORT',
  SYSTEM: 'SYSTEM',
  AUTH: 'AUTH',
} as const;

export default AuditService;
