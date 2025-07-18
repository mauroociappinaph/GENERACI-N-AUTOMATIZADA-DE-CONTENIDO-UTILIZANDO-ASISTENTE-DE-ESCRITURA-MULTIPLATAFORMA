import { Request } from 'express';
import { prisma } from '../config';
import { CreateAuditLogData } from '../types/prisma';
import { logBusinessEvent, logError } from '../utils/logger';

/**
 * Audit Service
 * Responsabilidad: Gestión de logs de auditoría para tracking de actividades
 */
export class AuditService {
  /**
   * Crea un registro de auditoría
   */
  static async createAuditLog(data: CreateAuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
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

      // Log business event for monitoring
      logBusinessEvent(
        'AUDIT_LOG_CREATED',
        {
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
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
