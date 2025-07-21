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
exports.reportController = exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
const scheduled_report_service_1 = require("../services/scheduled-report.service");
const logger_1 = __importDefault(require("../utils/logger"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class ReportController {
    constructor() {
        this.reportService = new report_service_1.ReportService();
        this.scheduledReportService = new scheduled_report_service_1.ScheduledReportService();
    }
    /**
     * Generate a report
     * POST /api/reports/generate
     */
    async generateReport(req, res) {
        try {
            const reportRequest = req.body;
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
        }
        catch (error) {
            logger_1.default.error('Error generating report', { error, body: req.body });
            res.status(500).json({
                error: 'Failed to generate report',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Download a generated report
     * GET /api/reports/download/:reportId
     */
    async downloadReport(req, res) {
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
            logger_1.default.info('Report downloaded', { reportId, fileName });
        }
        catch (error) {
            logger_1.default.error('Error downloading report', { error, reportId: req.params.reportId });
            res.status(500).json({
                error: 'Failed to download report',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get report templates
     * GET /api/reports/templates
     */
    async getReportTemplates(req, res) {
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
        }
        catch (error) {
            logger_1.default.error('Error getting report templates', { error });
            res.status(500).json({
                error: 'Failed to get report templates',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Create a scheduled report
     * POST /api/reports/schedule
     */
    async createScheduledReport(req, res) {
        try {
            const scheduleRequest = req.body;
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
            const scheduledReport = await this.scheduledReportService.createScheduledReport(scheduleRequest, userId);
            res.status(201).json({
                success: true,
                data: scheduledReport,
            });
        }
        catch (error) {
            logger_1.default.error('Error creating scheduled report', { error, body: req.body });
            res.status(500).json({
                error: 'Failed to create scheduled report',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get scheduled reports
     * GET /api/reports/scheduled
     */
    async getScheduledReports(req, res) {
        try {
            const scheduledReports = await this.scheduledReportService.getActiveScheduledReports();
            res.json({
                success: true,
                data: scheduledReports,
            });
        }
        catch (error) {
            logger_1.default.error('Error getting scheduled reports', { error });
            res.status(500).json({
                error: 'Failed to get scheduled reports',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Update a scheduled report
     * PUT /api/reports/scheduled/:id
     */
    async updateScheduledReport(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const updatedReport = await this.scheduledReportService.updateScheduledReport(id, updates);
            res.json({
                success: true,
                data: updatedReport,
            });
        }
        catch (error) {
            logger_1.default.error('Error updating scheduled report', { error, id: req.params.id });
            res.status(500).json({
                error: 'Failed to update scheduled report',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Delete a scheduled report
     * DELETE /api/reports/scheduled/:id
     */
    async deleteScheduledReport(req, res) {
        try {
            const { id } = req.params;
            await this.scheduledReportService.deleteScheduledReport(id);
            res.json({
                success: true,
                message: 'Scheduled report deleted successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Error deleting scheduled report', { error, id: req.params.id });
            res.status(500).json({
                error: 'Failed to delete scheduled report',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Preview report data (without generating file)
     * POST /api/reports/preview
     */
    async previewReport(req, res) {
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
        }
        catch (error) {
            logger_1.default.error('Error previewing report', { error, body: req.body });
            res.status(500).json({
                error: 'Failed to preview report',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();
