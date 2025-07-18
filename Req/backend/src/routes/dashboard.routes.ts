import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
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
 *                     totalUsers:
 *                       type: number
 *                     activeRecords:
 *                       type: number
 *                     reportsGenerated:
 *                       type: number
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                     systemHealth:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/metrics', DashboardController.getDashboardMetrics);

/**
 * @swagger
 * /api/dashboard/widgets:
 *   get:
 *     summary: Get user's dashboard widgets
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Widgets retrieved successfully
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [metrics, chart, table, activity]
 *                       title:
 *                         type: string
 *                       config:
 *                         type: object
 *                       position:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/widgets', DashboardController.getUserWidgets);

/**
 * @swagger
 * /api/dashboard/widgets:
 *   post:
 *     summary: Save user's dashboard widget configuration
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               widgets:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [metrics, chart, table, activity]
 *                     title:
 *                       type: string
 *                     config:
 *                       type: object
 *                     position:
 *                       type: object
 *     responses:
 *       200:
 *         description: Widget configuration saved successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/widgets', DashboardController.saveWidgetConfiguration);

/**
 * @swagger
 * /api/dashboard/widgets/add:
 *   post:
 *     summary: Add a new widget to the dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [metrics, chart, table, activity]
 *               title:
 *                 type: string
 *               config:
 *                 type: object
 *               position:
 *                 type: object
 *     responses:
 *       201:
 *         description: Widget added successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/widgets/add', DashboardController.addWidget);

/**
 * @swagger
 * /api/dashboard/widgets/{widgetId}:
 *   delete:
 *     summary: Delete a widget from the dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: widgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Widget ID to delete
 *     responses:
 *       200:
 *         description: Widget deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Widget not found
 *       500:
 *         description: Internal server error
 */
router.delete('/widgets/:widgetId', DashboardController.deleteWidget);

/**
 * @swagger
 * /api/dashboard/widgets/{widgetId}/data:
 *   get:
 *     summary: Get data for a specific widget
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: widgetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Widget ID
 *       - in: query
 *         name: dataSource
 *         required: true
 *         schema:
 *           type: string
 *         description: Data source for the widget
 *     responses:
 *       200:
 *         description: Widget data retrieved successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/widgets/:widgetId/data', DashboardController.getWidgetData);

export default router;
