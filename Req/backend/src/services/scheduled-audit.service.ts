import cron from 'node-cron';
import { AuditService } from './audit.service';
import { cleanupSecurityData } from '../middleware/security';
import { logBusinessEvent, logError } from '../utils/logger';
import { securityConfig } from '../config/security';

/**
 * Scheduled Audit Service
 * Responsabilidad: Tareas programadas para mantenimiento de auditoría y seguridad
 */

export class ScheduledAuditService {
  private static jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Inicia todos los trabajos programados de auditoría
   */
  static startScheduledJobs(): void {
    console.log('🕐 Starting scheduled audit jobs...');

    // Cleanup old audit logs daily at 2 AM
    this.scheduleAuditLogCleanup();

    // Security data cleanup every hour
    this.scheduleSecurityDataCleanup();

    // Generate security reports weekly
    this.scheduleSecurityReports();

    // Monitor suspicious activity every 15 minutes
    this.scheduleSuspiciousActivityMonitoring();

    console.log('✅ All scheduled audit jobs started');
  }

  /**
   * Detiene todos los trabajos programados
   */
  static stopScheduledJobs(): void {
    console.log('🛑 Stopping scheduled audit jobs...');

    this.jobs.forEach((job, name) => {
      job.destroy();
      console.log(`Stopped job: ${name}`);
    });

    this.jobs.clear();
    console.log('✅ All scheduled audit jobs stopped');
  }

  /**
   * Programa la limpieza de logs de auditoría antiguos
   */
  private static scheduleAuditLogCleanup(): void {
    const job = cron.schedule('0 2 * * *', async () => {
      try {
        console.log('🧹 Starting scheduled audit log cleanup...');

        const result = await AuditService.cleanupOldLogs();

        console.log(`✅ Audit log cleanup completed. Deleted ${result.deletedCount} old logs`);

        logBusinessEvent('SCHEDULED_AUDIT_CLEANUP_COMPLETED', {
          deletedCount: result.deletedCount,
          retentionDays: securityConfig.audit.retentionDays,
        });
      } catch (error) {
        console.error('❌ Scheduled audit log cleanup failed:', error);
        logError(error as Error, 'ScheduledAuditService.auditLogCleanup');
      }
    }, {
      scheduled: false,
      timezone: 'UTC',
    });

    job.start();
    this.jobs.set('auditLogCleanup', job);
    console.log('📅 Scheduled audit log cleanup (daily at 2 AM UTC)');
  }

  /**
   * Programa la limpieza de datos de seguridad
   */
  private static scheduleSecurityDataCleanup(): void {
    const job = cron.schedule('0 * * * *', async () => {
      try {
        console.log('🧹 Starting scheduled security data cleanup...');

        cleanupSecurityData();

        console.log('✅ Security data cleanup completed');

        logBusinessEvent('SCHEDULED_SECURITY_CLEANUP_COMPLETED', {
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('❌ Scheduled security data cleanup failed:', error);
        logError(error as Error, 'ScheduledAuditService.securityDataCleanup');
      }
    }, {
      scheduled: false,
      timezone: 'UTC',
    });

    job.start();
    this.jobs.set('securityDataCleanup', job);
    console.log('📅 Scheduled security data cleanup (hourly)');
  }

  /**
   * Programa la generación de reportes de seguridad semanales
   */
  private static scheduleSecurityReports(): void {
    const job = cron.schedule('0 8 * * 1', async () => {
      try {
        console.log('📊 Generating weekly security report...');

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const [auditStats, securityMetrics] = await Promise.all([
          AuditService.getAuditStats({ startDate, endDate }),
          AuditService.getSecurityMetrics(),
        ]);

        const report = {
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          auditStats,
          securityMetrics,
          generatedAt: new Date().toISOString(),
        };

        console.log('📈 Weekly security report generated:', {
          totalLogs: auditStats.totalLogs,
          failedLogins: securityMetrics.failedLoginsLast24h,
          suspiciousActivities: securityMetrics.suspiciousActivitiesLast24h,
          activeAlerts: securityMetrics.activeAlertsCount,
        });

        logBusinessEvent('WEEKLY_SECURITY_REPORT_GENERATED', report);
      } catch (error) {
        console.error('❌ Weekly security report generation failed:', error);
        logError(error as Error, 'ScheduledAuditService.weeklySecurityReport');
      }
    }, {
      scheduled: false,
      timezone: 'UTC',
    });

    job.start();
    this.jobs.set('weeklySecurityReport', job);
    console.log('📅 Scheduled weekly security reports (Mondays at 8 AM UTC)');
  }

  /**
   * Programa el monitoreo de actividad sospechosa
   */
  private static scheduleSuspiciousActivityMonitoring(): void {
    const job = cron.schedule('*/15 * * * *', async () => {
      try {
        const metrics = await AuditService.getSecurityMetrics();

        // Check for concerning patterns
        const concerns = [];

        if (metrics.failedLoginsLast24h > 50) {
          concerns.push(`High number of failed logins: ${metrics.failedLoginsLast24h}`);
        }

        if (metrics.suspiciousActivitiesLast24h > 20) {
          concerns.push(`High suspicious activity: ${metrics.suspiciousActivitiesLast24h}`);
        }

        if (metrics.activeAlertsCount > 10) {
          concerns.push(`Many active alerts: ${metrics.activeAlertsCount}`);
        }

        if (concerns.length > 0) {
          console.warn('⚠️ Security concerns detected:', concerns);

          logBusinessEvent('SECURITY_MONITORING_ALERT', {
            concerns,
            metrics,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('❌ Suspicious activity monitoring failed:', error);
        logError(error as Error, 'ScheduledAuditService.suspiciousActivityMonitoring');
      }
    }, {
      scheduled: false,
      timezone: 'UTC',
    });

    job.start();
    this.jobs.set('suspiciousActivityMonitoring', job);
    console.log('📅 Scheduled suspicious activity monitoring (every 15 minutes)');
  }

  /**
   * Obtiene el estado de todos los trabajos programados
   */
  static getJobsStatus(): Array<{
    name: string;
    running: boolean;
    nextRun?: Date;
  }> {
    const status: Array<{ name: string; running: boolean; nextRun?: Date }> = [];

    this.jobs.forEach((job, name) => {
      status.push({
        name,
        running: job.getStatus() === 'scheduled',
        // Note: node-cron doesn't provide next run time directly
        // In a production environment, you might want to use a more advanced scheduler
      });
    });

    return status;
  }

  /**
   * Ejecuta manualmente un trabajo específico
   */
  static async runJobManually(jobName: string): Promise<void> {
    switch (jobName) {
      case 'auditLogCleanup':
        await AuditService.cleanupOldLogs();
        break;
      case 'securityDataCleanup':
        cleanupSecurityData();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}

export default ScheduledAuditService;
