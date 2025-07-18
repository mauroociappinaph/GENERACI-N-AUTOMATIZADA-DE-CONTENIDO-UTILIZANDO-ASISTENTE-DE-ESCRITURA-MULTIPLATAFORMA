import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { ScheduledReportService } from '../services/scheduled-report.service';
import { ReportRequest, ReportScheduleRequest } from '../types/report';
import logger from '../utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ReportController {
  private reportService: ReportService;
  private scheduledReportService: ScheduledReportService;

  constructor() {
    this.reportService = new ReportService();
    this.scheduledReportService = new ScheduledReportService();
  }

  /**
   * Generate a report
   * POST /api/reports/generate
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const reportRequest: ReportRequest = req.body;

      // Validate request
      if (!reportRequest.templateId || !reportRequest.format) {
        res.status(400).json({
          error: 'Missing required fields: templateId and format are required',
        });
        return;
      }

      const result = await this.reportService.generateReport(reportRequest);

      res.json({
        success: true,
        data: {
          reportId: result.id,
          templateId: result.templateId,
          format: result.format,
          generatedAt: result.generatedAt,
          downloadUrl: result.downloadUrl,
          recordCount: result.data.length,
        },
      });
    } catch (error) {
      logger.error('Error generating report', { error, body: req.body });
      res.status(500).json({
        error: 'Failed to generate report',
        message: error.message,
      });
    }
  }

  /**
   * Download a generated report
   * GET /api/reports/download/:reportId
   */
  async downloadReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;

      const filePath = await this.reportService.getReportFile(reportId);

      if (!filePath) {
        res.status(404).json({
          error: 'Report not found or expired',
        });
        return;
      }

      // Get file info
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);
      const fileExtension = path.extname(fileName).toLowerCase();

      // Set appropriate content type
      let contentType = 'application/octet-stream';
      switch (fileExtension) {
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.xlsx':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case '.csv':
          contentType = 'text/csv';
          break;
      }

      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      // Stream the file
      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);

      logger.info('Report downloaded', { reportId, fileName });
    } catch (error) {
      logger.error('Error downloading report', { error, reportId: req.params.reportId });
      res.status(500).json({
        error: 'Failed to download report',
        message: error.message,
      });
    }
  }

  /**
   * Get report templates
   * GET /api/reports/templates
   */
  async getReportTemplates(req: Request, res: Response): Promise<void> {
    try {
      // This would typically query the database for available templates
      // For now, return some example templates
      const templates = [
        {
          id: 'user-activity-report',
          name: 'User Activity Report',
          description: 'Report showing user activity and login statistics',
          parameters: [
            {
              name: 'startDate',
              type: 'date',
              label: 'Start Date',
              required: true,
            },
            {
              name: 'endDate',
              type: 'date',
              label: 'End Date',
              required: true,
            },
            {
              name: 'userRole',
              type: 'select',
              label: 'User Role',
              required: false,
              options: [
                { value: 'ADMIN', label: 'Administrator' },
                { value: 'MANAGER', label: 'Manager' },
                { value: 'USER', label: 'User' },
                { value: 'VIEWER', label: 'Viewer' },
              ],
            },
          ],
          formats: ['pdf', 'excel', 'csv'],
        },
        {
          id: 'data-records-report',
          name: 'Data Records Report',
          description: 'Report showing data records with filtering options',
          parameters: [
            {
              name: 'recordType',
              type: 'string',
              label: 'Record Type',
              required: false,
            },
            {
              name: 'createdAfter',
              type: 'date',
              label: 'Created After',
              required: false,
            },
            {
              name: 'includeDeleted',
              type: 'boolean',
              label: 'Include Deleted Records',
              required: false,
              defaultValue: false,
            },
          ],
          formats: ['pdf', 'excel', 'csv'],
        },
        {
          id: 'audit-log-report',
          name: 'Audit Log Report',
          description: 'Security and audit log report',
          parameters: [
            {
              name: 'startDate',
              type: 'date',
              label: 'Start Date',
              required: true,
            },
            {
              name: 'endDate',
              type: 'date',
              label: 'End Date',
              required: true,
            },
            {
              name: 'action',
              type: 'string',
              label: 'Action Filter',
              required: false,
            },
          ],
          formats: ['pdf', 'excel', 'csv'],
        },
      ];

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      logger.error('Error getting report templates', { error });
      res.status(500).json({
        error: 'Failed to get report templates',
        message: error.message,
      });
    }
  }

  /**
   * Create a scheduled report
   * POST /api/reports/schedule
   */
  async createScheduledReport(req: Request, res: Response): Promise<void> {
    try {
      const scheduleRequest: ReportScheduleRequest = req.body;
      const userId = req.user?.id; // Assuming user is attached to request by auth middleware

      if (!userId) {
        res.status(401).json({
          error: 'Authentication required',
        });
        return;
      }

      // Validate request
      if (!scheduleRequest.templateId || !scheduleRequest.schedule || !scheduleRequest.recipients?.length) {
        res.status(400).json({
          error: 'Missing required fields: templateId, schedule, and recipients are required',
        });
        return;
      }

      const scheduledReport = await this.scheduledReportService.createScheduledReport(
        scheduleRequest,
        userId
      );

      res.status(201).json({
        success: true,
        data: scheduledReport,
      });
    } catch (error) {
      logger.error('Error creating scheduled report', { error, body: req.body });
      res.status(500).json({
        error: 'Failed to create scheduled report',
        message: error.message,
      });
    }
  }

  /**
   * Get scheduled reports
   * GET /api/reports/scheduled
   */
  async getScheduledReports(req: Request, res: Response): Promise<void> {
    try {
      const scheduledReports = await this.scheduledReportService.getActiveScheduledReports();

      res.json({
        success: true,
        data: scheduledReports,
      });
    } catch (error) {
      logger.error('Error getting scheduled reports', { error });
      res.status(500).json({
        error: 'Failed to get scheduled reports',
        message: error.message,
      });
    }
  }

  /**
   * Update a scheduled report
   * PUT /api/reports/scheduled/:id
   */
  async updateScheduledReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedReport = await this.scheduledReportService.updateScheduledReport(id, updates);

      res.json({
        success: true,
        data: updatedReport,
      });
    } catch (error) {
      logger.error('Error updating scheduled report', { error, id: req.params.id });
      res.status(500).json({
        error: 'Failed to update scheduled report',
        message: error.message,
      });
    }
  }

  /**
   * Delete a scheduled report
   * DELETE /api/reports/scheduled/:id
   */
  async deleteScheduledReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.scheduledReportService.deleteScheduledReport(id);

      res.json({
        success: true,
        message: 'Scheduled report deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting scheduled report', { error, id: req.params.id });
      res.status(500).json({
        error: 'Failed to delete scheduled report',
        message: error.message,
      });
    }
  }

  /**
   * Preview report data (without generating file)
   * POST /api/reports/preview
   */
  async previewReport(req: Request, res: Response): Promise<void> {
    try {
      const { templateId, parameters } = req.body;

      if (!templateId) {
        res.status(400).json({
          error: 'templateId is required',
        });
        return;
      }

      // Generate report data without creating file
      const result = await this.reportService.generateReport({
        templateId,
        parameters: parameters || {},
        format: 'csv', // Use CSV for preview as it's lightweight
        deliveryMethod: 'download',
      });

      // Return first 100 rows for preview
      const previewData = result.data.slice(0, 100);

      res.json({
        success: true,
        data: {
          templateId,
          totalRecords: result.data.length,
          previewRecords: previewData.length,
          data: previewData,
          generatedAt: result.generatedAt,
        },
      });
    } catch (error) {
      logger.error('Error previewing report', { error, body: req.body });
      res.status(500).json({
        error: 'Failed to preview report',
        message: error.message,
      });
    }
  }
}

export const reportController = new ReportController();
