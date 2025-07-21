"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledReportService = void 0;
const client_1 = require("@prisma/client");
const cron = __importStar(require("node-cron"));
const report_service_1 = require("./report.service");
const notification_service_1 = require("./notification.service");
const logger_1 = __importDefault(require("../utils/logger"));
class ScheduledReportService {
    constructor() {
        this.scheduledJobs = new Map();
        this.prisma = new client_1.PrismaClient();
        this.reportService = new report_service_1.ReportService();
        this.notificationService = new notification_service_1.NotificationService();
        this.initializeScheduledReports();
    }
    async initializeScheduledReports() {
        try {
            // Load existing scheduled reports from database
            const scheduledReports = await this.getActiveScheduledReports();
            for (const report of scheduledReports) {
                this.scheduleReport(report);
            }
            logger_1.default.info('Initialized scheduled reports', {
                count: scheduledReports.length
            });
        }
        catch (error) {
            logger_1.default.error('Error initializing scheduled reports', { error });
        }
    }
    async createScheduledReport(request, createdBy) {
        try {
            // Validate cron expression
            if (!cron.validate(request.schedule)) {
                throw new Error('Invalid cron expression');
            }
            // Create scheduled report record
            const scheduledReportData = {
                id: `scheduled_${Date.now()}`,
                templateId: request.templateId,
                parameters: request.parameters,
                format: request.format,
                schedule: request.schedule,
                recipients: request.recipients,
                isActive: true,
                nextRun: this.getNextRunDate(request.schedule),
            };
            // Store in database (extend Prisma schema if needed)
            // For now, we'll store in a JSON file or memory
            const scheduledReport = {
                ...scheduledReportData,
                lastRun: undefined,
            };
            // Schedule the cron job
            this.scheduleReport(scheduledReport);
            logger_1.default.info('Created scheduled report', {
                id: scheduledReport.id,
                schedule: request.schedule
            });
            return scheduledReport;
        }
        catch (error) {
            logger_1.default.error('Error creating scheduled report', { error, request });
            throw error;
        }
    }
    scheduleReport(scheduledReport) {
        if (!cron.validate(scheduledReport.schedule)) {
            logger_1.default.error('Invalid cron expression for scheduled report', {
                id: scheduledReport.id,
                schedule: scheduledReport.schedule,
            });
            return;
        }
        const task = cron.schedule(scheduledReport.schedule, async () => {
            await this.executeScheduledReport(scheduledReport);
        }, {
            scheduled: false, // Don't start immediately
            timezone: 'America/New_York', // Configure as needed
        });
        this.scheduledJobs.set(scheduledReport.id, task);
        task.start();
        logger_1.default.info('Scheduled report job created', {
            id: scheduledReport.id,
            schedule: scheduledReport.schedule,
        });
    }
    async executeScheduledReport(scheduledReport) {
        try {
            logger_1.default.info('Executing scheduled report', { id: scheduledReport.id });
            // Generate the report
            const reportResult = await this.reportService.generateReport({
                templateId: scheduledReport.templateId,
                parameters: scheduledReport.parameters,
                format: scheduledReport.format,
                deliveryMethod: 'email',
            });
            // Send report to recipients
            for (const recipient of scheduledReport.recipients) {
                await this.sendReportByEmail(recipient, reportResult, scheduledReport);
            }
            // Update last run time
            scheduledReport.lastRun = new Date();
            scheduledReport.nextRun = this.getNextRunDate(scheduledReport.schedule);
            logger_1.default.info('Scheduled report executed successfully', {
                id: scheduledReport.id,
                recipients: scheduledReport.recipients.length,
            });
        }
        catch (error) {
            logger_1.default.error('Error executing scheduled report', {
                error,
                scheduledReportId: scheduledReport.id,
            });
            // Notify administrators about the failure
            await this.notifyReportFailure(scheduledReport, error);
        }
    }
    async sendReportByEmail(recipient, reportResult, scheduledReport) {
        try {
            // Get report template info
            const template = await this.prisma.report.findUnique({
                where: { id: scheduledReport.templateId },
            });
            const subject = `Scheduled Report: ${template?.name || 'Report'}`;
            const message = `
        <h2>Scheduled Report</h2>
        <p>Your scheduled report "${template?.name}" has been generated.</p>
        <p><strong>Generated at:</strong> ${reportResult.generatedAt.toLocaleString()}</p>
        <p><strong>Format:</strong> ${reportResult.format.toUpperCase()}</p>
        <p>Please find the report attached to this email.</p>
      `;
            // Send notification with attachment
            await this.notificationService.sendEmailWithAttachment({
                to: recipient,
                subject,
                html: message,
                attachmentPath: reportResult.filePath,
                attachmentName: `report.${reportResult.format}`,
            });
            logger_1.default.info('Report sent by email', {
                recipient,
                reportId: reportResult.id,
            });
        }
        catch (error) {
            logger_1.default.error('Error sending report by email', {
                error,
                recipient,
                reportId: reportResult.id,
            });
            throw error;
        }
    }
    async notifyReportFailure(scheduledReport, error) {
        try {
            // Get admin users
            const adminUsers = await this.prisma.user.findMany({
                where: { role: 'ADMIN', isActive: true },
            });
            const subject = 'Scheduled Report Failed';
            const message = `
        <h2>Scheduled Report Failure</h2>
        <p>A scheduled report failed to execute:</p>
        <ul>
          <li><strong>Report ID:</strong> ${scheduledReport.id}</li>
          <li><strong>Template ID:</strong> ${scheduledReport.templateId}</li>
          <li><strong>Schedule:</strong> ${scheduledReport.schedule}</li>
          <li><strong>Error:</strong> ${error.message}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Please check the system logs for more details.</p>
      `;
            for (const admin of adminUsers) {
                await this.notificationService.sendEmail({
                    to: admin.email,
                    subject,
                    html: message,
                });
            }
        }
        catch (notificationError) {
            logger_1.default.error('Error sending failure notification', {
                error: notificationError,
                originalError: error,
            });
        }
    }
    getNextRunDate(cronExpression) {
        try {
            // Simple implementation - in production, use a proper cron parser
            const now = new Date();
            const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to 24 hours
            return nextRun;
        }
        catch (error) {
            logger_1.default.error('Error calculating next run date', { error, cronExpression });
            return new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
    }
    async getActiveScheduledReports() {
        // In a real implementation, this would query the database
        // For now, return empty array
        return [];
    }
    async updateScheduledReport(id, updates) {
        try {
            // Stop existing job
            const existingJob = this.scheduledJobs.get(id);
            if (existingJob) {
                existingJob.stop();
                this.scheduledJobs.delete(id);
            }
            // Update the scheduled report
            // In a real implementation, update the database record
            const updatedReport = {
                id,
                templateId: updates.templateId || '',
                parameters: updates.parameters || {},
                format: updates.format || 'pdf',
                schedule: updates.schedule || '0 9 * * *',
                recipients: updates.recipients || [],
                isActive: updates.isActive !== undefined ? updates.isActive : true,
                lastRun: updates.lastRun,
                nextRun: updates.nextRun,
            };
            // Reschedule if active
            if (updatedReport.isActive) {
                this.scheduleReport(updatedReport);
            }
            logger_1.default.info('Updated scheduled report', { id });
            return updatedReport;
        }
        catch (error) {
            logger_1.default.error('Error updating scheduled report', { error, id });
            throw error;
        }
    }
    async deleteScheduledReport(id) {
        try {
            // Stop and remove the cron job
            const job = this.scheduledJobs.get(id);
            if (job) {
                job.stop();
                this.scheduledJobs.delete(id);
            }
            // Delete from database
            // In a real implementation, delete the database record
            logger_1.default.info('Deleted scheduled report', { id });
        }
        catch (error) {
            logger_1.default.error('Error deleting scheduled report', { error, id });
            throw error;
        }
    }
    async getScheduledReportStatus(id) {
        // In a real implementation, query the database
        return null;
    }
    shutdown() {
        // Stop all scheduled jobs
        for (const [id, job] of this.scheduledJobs) {
            job.stop();
            logger_1.default.info('Stopped scheduled report job', { id });
        }
        this.scheduledJobs.clear();
    }
}
exports.ScheduledReportService = ScheduledReportService;
