import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/authorization.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ReportRequest:
 *       type: object
 *       required:
 *         - templateId
 *         - format
 *       properties:
 *         templateId:
 *           type: string
 *           description: ID of the report template
 *         parameters:
 *           type: object
 *           description: Parameters for the report
 *         format:
 *           type: string
 *           enum: [pdf, excel, csv]
 *           description: Output format
 *         deliveryMethod:
 *           type: string
 *           enum: [download, email]
 *           description: How to deliver the report
 *         email:
 *           type: string
 *           description: Email address (required if deliveryMethod is email)
 *
 *     ReportScheduleRequest:
 *       type: object
 *       required:
 *         - templateId
 *         - schedule
 *         - recipients
 *       properties:
 *         templateId:
 *           type: string
 *           description: ID of the report template
 *         parameters:
 *           type: object
 *           description: Parameters for the report
 *         format:
 *           type: string
 *           enum: [pdf, excel, csv]
 *           description: Output format
 *         schedule:
 *           type: string
 *           description: Cron expression for scheduling
 *         recipients:
 *           type: array
 *           items:
 *             type: string
 *           description: Email addresses of recipients
 */

/**
 * @swagger
 * /api/reports/templates:
 *   get:
 *     summary: Get available report templates
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available report templates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/templates', authenticateToken, reportController.getReportTemplates.bind(reportController));

/**
 * @swagger
 * /api/reports/generate:
 *   post:
 *     summary: Generate a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportRequest'
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     reportId:
 *                       type: string
 *                     downloadUrl:
 *                       type: string
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/generate', authenticateToken, reportController.generateReport.bind(reportController));

/**
 * @swagger
 * /api/reports/preview:
 *   post:
 *     summary: Preview report data without generating file
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *             properties:
 *               templateId:
 *                 type: string
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Report preview data
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/preview', authenticateToken, reportController.previewReport.bind(reportController));

/**
 * @swagger
 * /api/reports/download/{reportId}:
 *   get:
 *     summary: Download a generated report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the generated report
 *     responses:
 *       200:
 *         description: Report file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *       404:
 *         description: Report not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/download/:reportId', authenticateToken, reportController.downloadReport.bind(reportController));

/**
 * @swagger
 * /api/reports/schedule:
 *   post:
 *     summary: Create a scheduled report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportScheduleRequest'
 *     responses:
 *       201:
 *         description: Scheduled report created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/schedule', authenticateToken, requireRole('ADMIN', 'MANAGER'), reportController.createScheduledReport.bind(reportController));

/**
 * @swagger
 * /api/reports/scheduled:
 *   get:
 *     summary: Get scheduled reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scheduled reports
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/scheduled', authenticateToken, requireRole('ADMIN', 'MANAGER'), reportController.getScheduledReports.bind(reportController));

/**
 * @swagger
 * /api/reports/scheduled/{id}:
 *   put:
 *     summary: Update a scheduled report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportScheduleRequest'
 *     responses:
 *       200:
 *         description: Scheduled report updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheduled report not found
 *       500:
 *         description: Internal server error
 */
router.put('/scheduled/:id', authenticateToken, requireRole('ADMIN', 'MANAGER'), reportController.updateScheduledReport.bind(reportController));

/**
 * @swagger
 * /api/reports/scheduled/{id}:
 *   delete:
 *     summary: Delete a scheduled report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled report deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scheduled report not found
 *       500:
 *         description: Internal server error
 */
router.delete('/scheduled/:id', authenticateToken, requireRole('ADMIN', 'MANAGER'), reportController.deleteScheduledReport.bind(reportController));

export default router;
