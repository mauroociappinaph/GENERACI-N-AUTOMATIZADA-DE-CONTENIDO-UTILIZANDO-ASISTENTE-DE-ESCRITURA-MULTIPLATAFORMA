import { Request, Response } from 'express';
export declare class ReportController {
    private reportService;
    private scheduledReportService;
    constructor();
    /**
     * Generate a report
     * POST /api/reports/generate
     */
    generateReport(req: Request, res: Response): Promise<void>;
    /**
     * Download a generated report
     * GET /api/reports/download/:reportId
     */
    downloadReport(req: Request, res: Response): Promise<void>;
    /**
     * Get report templates
     * GET /api/reports/templates
     */
    getReportTemplates(req: Request, res: Response): Promise<void>;
    /**
     * Create a scheduled report
     * POST /api/reports/schedule
     */
    createScheduledReport(req: Request, res: Response): Promise<void>;
    /**
     * Get scheduled reports
     * GET /api/reports/scheduled
     */
    getScheduledReports(req: Request, res: Response): Promise<void>;
    /**
     * Update a scheduled report
     * PUT /api/reports/scheduled/:id
     */
    updateScheduledReport(req: Request, res: Response): Promise<void>;
    /**
     * Delete a scheduled report
     * DELETE /api/reports/scheduled/:id
     */
    deleteScheduledReport(req: Request, res: Response): Promise<void>;
    /**
     * Preview report data (without generating file)
     * POST /api/reports/preview
     */
    previewReport(req: Request, res: Response): Promise<void>;
}
export declare const reportController: ReportController;
