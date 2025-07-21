"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledAuditService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const audit_service_1 = require("./audit.service");
const security_1 = require("../middleware/security");
const logger_1 = require("../utils/logger");
const security_2 = require("../config/security");
/**
 * Scheduled Audit Service
 * Responsabilidad: Tareas programadas para mantenimiento de auditoría y seguridad
 */
class ScheduledAuditService {
    /**
     * Inicia todos los trabajos programados de auditoría
     */
    static startScheduledJobs() {
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
    static stopScheduledJobs() {
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
    static scheduleAuditLogCleanup() {
        const job = node_cron_1.default.schedule('0 2 * * *', async () => {
            try {
                console.log('🧹 Starting scheduled audit log cleanup...');
                const result = await audit_service_1.AuditService.cleanupOldLogs();
                console.log(`✅ Audit log cleanup completed. Deleted ${result.deletedCount} old logs`);
                (0, logger_1.logBusinessEvent)('SCHEDULED_AUDIT_CLEANUP_COMPLETED', {
                    deletedCount: result.deletedCount,
                    retentionDays: security_2.securityConfig.audit.retentionDays,
                });
            }
            catch (error) {
                console.error('❌ Scheduled audit log cleanup failed:', error);
                (0, logger_1.logError)(error, 'ScheduledAuditService.auditLogCleanup');
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
    static scheduleSecurityDataCleanup() {
        const job = node_cron_1.default.schedule('0 * * * *', async () => {
            try {
                console.log('🧹 Starting scheduled security data cleanup...');
                (0, security_1.cleanupSecurityData)();
                console.log('✅ Security data cleanup completed');
                (0, logger_1.logBusinessEvent)('SCHEDULED_SECURITY_CLEANUP_COMPLETED', {
                    timestamp: new Date().toISOString(),
                });
            }
            catch (error) {
                console.error('❌ Scheduled security data cleanup failed:', error);
                (0, logger_1.logError)(error, 'ScheduledAuditService.securityDataCleanup');
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
    static scheduleSecurityReports() {
        const job = node_cron_1.default.schedule('0 8 * * 1', async () => {
            try {
                console.log('📊 Generating weekly security report...');
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                const [auditStats, securityMetrics] = await Promise.all([
                    audit_service_1.AuditService.getAuditStats({ startDate, endDate }),
                    audit_service_1.AuditService.getSecurityMetrics(),
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
                (0, logger_1.logBusinessEvent)('WEEKLY_SECURITY_REPORT_GENERATED', report);
            }
            catch (error) {
                console.error('❌ Weekly security report generation failed:', error);
                (0, logger_1.logError)(error, 'ScheduledAuditService.weeklySecurityReport');
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
    static scheduleSuspiciousActivityMonitoring() {
        const job = node_cron_1.default.schedule('*/15 * * * *', async () => {
            try {
                const metrics = await audit_service_1.AuditService.getSecurityMetrics();
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
                    (0, logger_1.logBusinessEvent)('SECURITY_MONITORING_ALERT', {
                        concerns,
                        metrics,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
            catch (error) {
                console.error('❌ Suspicious activity monitoring failed:', error);
                (0, logger_1.logError)(error, 'ScheduledAuditService.suspiciousActivityMonitoring');
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
    static getJobsStatus() {
        const status = [];
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
    static async runJobManually(jobName) {
        switch (jobName) {
            case 'auditLogCleanup':
                await audit_service_1.AuditService.cleanupOldLogs();
                break;
            case 'securityDataCleanup':
                (0, security_1.cleanupSecurityData)();
                break;
            default:
                throw new Error(`Unknown job: ${jobName}`);
        }
    }
}
exports.ScheduledAuditService = ScheduledAuditService;
ScheduledAuditService.jobs = new Map();
exports.default = ScheduledAuditService;
