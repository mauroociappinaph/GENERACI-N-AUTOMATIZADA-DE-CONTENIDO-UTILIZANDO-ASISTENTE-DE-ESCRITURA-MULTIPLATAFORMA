import { Router } from 'express';
import { externalApiController } from '../controllers/external-api.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ExternalApiConfig:
 *       type: object
 *       required:
 *         - baseUrl
 *       properties:
 *         baseUrl:
 *           type: string
 *           format: uri
 *           description: Base URL for the external API
 *         timeout:
 *           type: number
 *           minimum: 1000
 *           maximum: 300000
 *           default: 30000
 *           description: Request timeout in milliseconds
 *         retries:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *           default: 3
 *           description: Number of retry attempts
 *         retryDelay:
 *           type: number
 *           minimum: 100
 *           maximum: 10000
 *           default: 1000
 *           description: Delay between retries in milliseconds
 *         headers:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Default headers to include in requests
 *         auth:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [bearer, basic, api-key]
 *             token:
 *               type: string
 *             username:
 *               type: string
 *             password:
 *               type: string
 *             apiKey:
 *               type: string
 *             apiKeyHeader:
 *               type: string
 *
 *     ApiRequest:
 *       type: object
 *       required:
 *         - method
 *         - url
 *       properties:
 *         method:
 *           type: string
 *           enum: [GET, POST, PUT, DELETE, PATCH]
 *         url:
 *           type: string
 *           description: Endpoint URL (relative to base URL)
 *         data:
 *           type: object
 *           description: Request body data
 *         params:
 *           type: object
 *           description: Query parameters
 *         headers:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Request headers
 *         timeout:
 *           type: number
 *           minimum: 1000
 *           maximum: 300000
 *           description: Request timeout in milliseconds
 */

/**
 * @swagger
 * /api/external-api/clients:
 *   post:
 *     summary: Register a new external API client
 *     tags: [External API]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - config
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name for the API client
 *               config:
 *                 $ref: '#/components/schemas/ExternalApiConfig'
 *               options:
 *                 type: object
 *                 properties:
 *                   retryConfig:
 *                     type: object
 *                     properties:
 *                       retries:
 *                         type: number
 *                       retryDelay:
 *                         type: number
 *                   cacheConfig:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       ttl:
 *                         type: number
 *                       keyPrefix:
 *                         type: string
 *                   enableLogging:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: API client registered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/clients', authMiddleware, authorize(['admin']), externalApiController.registerClient);

/**
 * @swagger
 * /api/external-api/clients:
 *   get:
 *     summary: Get list of registered API clients
 *     tags: [External API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of registered API clients
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
 *                     clients:
 *                       type: array
 *                       items:
 *                         type: string
 *                     metrics:
 *                       type: object
 */
router.get('/clients', authMiddleware, authorize(['admin', 'manager']), externalApiController.getClients);

/**
 * @swagger
 * /api/external-api/clients/{clientName}:
 *   delete:
 *     summary: Remove an API client
 *     tags: [External API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the API client to remove
 *     responses:
 *       200:
 *         description: API client removed successfully
 *       404:
 *         description: API client not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/clients/:clientName', authMiddleware, authorize(['admin']), externalApiController.removeClient);

/**
 * @swagger
 * /api/external-api/clients/{clientName}/request:
 *   post:
 *     summary: Make a request using a registered API client
 *     tags: [External API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the API client to use
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiRequest'
 *     responses:
 *       200:
 *         description: Request successful
 *       400:
 *         description: Validation error
 *       404:
 *         description: API client not found
 *       500:
 *         description: External API request failed
 */
router.post('/clients/:clientName/request', authMiddleware, authorize(['admin', 'manager', 'user']), externalApiController.makeRequest);

/**
 * @swagger
 * /api/external-api/clients/{clientName}/metrics:
 *   get:
 *     summary: Get metrics for a specific API client
 *     tags: [External API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the API client
 *     responses:
 *       200:
 *         description: Client metrics retrieved successfully
 *       404:
 *         description: API client not found
 */
router.get('/clients/:clientName/metrics', authMiddleware, authorize(['admin', 'manager']), externalApiController.getClientMetrics);

/**
 * @swagger
 * /api/external-api/clients/{clientName}/metrics:
 *   delete:
 *     summary: Reset metrics for a specific API client
 *     tags: [External API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the API client
 *     responses:
 *       200:
 *         description: Metrics reset successfully
 *       404:
 *         description: API client not found
 */
router.delete('/clients/:clientName/metrics', authMiddleware, authorize(['admin']), externalApiController.resetClientMetrics);

/**
 * @swagger
 * /api/external-api/health:
 *   get:
 *     summary: Health check for all API clients and cache
 *     tags: [External API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health check results
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
 *                     apiClients:
 *                       type: object
 *                       additionalProperties:
 *                         type: boolean
 *                     cache:
 *                       type: boolean
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get('/health', authMiddleware, authorize(['admin', 'manager']), externalApiController.healthCheck);

/**
 * @swagger
 * /api/external-api/cache:
 *   delete:
 *     summary: Clear cache for external API responses
 *     tags: [External API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pattern
 *         schema:
 *           type: string
 *         description: Pattern to match cache keys (optional, clears all if not provided)
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *       500:
 *         description: Failed to clear cache
 */
router.delete('/cache', authMiddleware, authorize(['admin']), externalApiController.clearCache);

export default router;
