import { PrismaClient } from '@prisma/client';
import * as cron from 'node-cron';
import { ReportService } from './report.service';
import { NotificationService } from './notification.service';
import {
  ScheduledReport,
  ReportScheduleRequest,
  ReportFormat,
} from '../types/report';
import logger from '../utils/logger';

export class ScheduledReportService {
  private prisma: PrismaClient;
  private reportService: ReportService;
  private notificationService: NotificationService;
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.reportService = new ReportService();
    this.notificationService = new NotificationService();
    this.initializeScheduledReports();
  }

  private async initializeScheduledReports(): Promise<void> {
    try {
      // Load existing scheduled reports from database
      const scheduledReports = await this.getActiveScheduledReports();

      for (const report of scheduledReports) {
        this.scheduleReport(report);
      }

      logger.info('Initialized scheduled reports', {
        count: scheduledReports.length
      });
    } catch (error) {
      logger.error('Error initializing scheduled reports', { error });
    }
  }

  async createScheduledReport(
    request: ReportScheduleRequest,
    createdBy: string
  ): Promise<ScheduledReport> {
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
      const scheduledReport: ScheduledReport = {
        ...scheduledReportData,
        lastRun: undefined,
      };

      // Schedule the cron job
      this.scheduleReport(scheduledReport);

      logger.info('Created scheduled report', {
        id: scheduledReport.id,
        schedule: request.schedule
      });

      return scheduledReport;
    } catch (error) {
      logger.error('Error creating scheduled report', { error, request });
      throw error;
    }
  }

  private scheduleReport(scheduledReport: ScheduledReport): void {
    if (!cron.validate(scheduledReport.schedule)) {
      logger.error('Invalid cron expression for scheduled report', {
        id: scheduledReport.id,
        schedule: scheduledReport.schedule,
      });
      return;
    }

    const task = cron.schedule(
      scheduledReport.schedule,
      async () => {
        await this.executeScheduledReport(scheduledReport);
      },
      {
        scheduled: false, // Don't start immediately
        timezone: 'America/New_York', // Configure as needed
      }
    );

    this.scheduledJobs.set(scheduledReport.id, task);
    task.start();

    logger.info('Scheduled report job created', {
      id: scheduledReport.id,
      schedule: scheduledReport.schedule,
    });
  }

  private async executeScheduledReport(scheduledReport: ScheduledReport): Promise<void> {
    try {
      logger.info('Executing scheduled report', { id: scheduledReport.id });

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

      logger.info('Scheduled report executed successfully', {
        id: scheduledReport.id,
        recipients: scheduledReport.recipients.length,
      });
    } catch (error) {
      logger.error('Error executing scheduled report', {
        error,
        scheduledReportId: scheduledReport.id,
      });

      // Notify administrators about the failure
      await this.notifyReportFailure(scheduledReport, error);
    }
  }

  private async sendReportByEmail(
    recipient: string,
    reportResult: any,
    scheduledReport: ScheduledReport
  ): Promise<void> {
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

      logger.info('Report sent by email', {
        recipient,
        reportId: reportResult.id,
      });
    } catch (error) {
      logger.error('Error sending report by email', {
        error,
        recipient,
        reportId: reportResult.id,
      });
      throw error;
    }
  }

  private async notifyReportFailure(
    scheduledReport: ScheduledReport,
    error: any
  ): Promise<void> {
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
    } catch (notificationError) {
      logger.error('Error sending failure notification', {
        error: notificationError,
        originalError: error,
      });
    }
  }

  private getNextRunDate(cronExpression: string): Date {
    try {
      // Simple implementation - in production, use a proper cron parser
      const now = new Date();
      const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to 24 hours
      return nextRun;
    } catch (error) {
      logger.error('Error calculating next run date', { error, cronExpression });
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }

  async getActiveScheduledReports(): Promise<ScheduledReport[]> {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }

  async updateScheduledReport(
    id: string,
    updates: Partial<ScheduledReport>
  ): Promise<ScheduledReport> {
    try {
      // Stop existing job
      const existingJob = this.scheduledJobs.get(id);
      if (existingJob) {
        existingJob.stop();
        this.scheduledJobs.delete(id);
      }

      // Update the scheduled report
      // In a real implementation, update the database record
      const updatedReport: ScheduledReport = {
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

      logger.info('Updated scheduled report', { id });
      return updatedReport;
    } catch (error) {
      logger.error('Error updating scheduled report', { error, id });
      throw error;
    }
  }

  async deleteScheduledReport(id: string): Promise<void> {
    try {
      // Stop and remove the cron job
      const job = this.scheduledJobs.get(id);
      if (job) {
        job.stop();
        this.scheduledJobs.delete(id);
      }

      // Delete from database
      // In a real implementation, delete the database record

      logger.info('Deleted scheduled report', { id });
    } catch (error) {
      logger.error('Error deleting scheduled report', { error, id });
      throw error;
    }
  }

  async getScheduledReportStatus(id: string): Promise<ScheduledReport | null> {
    // In a real implementation, query the database
    return null;
  }

  shutdown(): void {
    // Stop all scheduled jobs
    for (const [id, job] of this.scheduledJobs) {
      job.stop();
      logger.info('Stopped scheduled report job', { id });
    }
    this.scheduledJobs.clear();
  }
}
