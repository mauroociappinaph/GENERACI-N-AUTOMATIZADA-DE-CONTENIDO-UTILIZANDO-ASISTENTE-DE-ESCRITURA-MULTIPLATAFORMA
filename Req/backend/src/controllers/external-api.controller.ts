import { Request, Response } from 'express';
import { z } from 'zod';
import { externalApiFactory } from '../services/external-api-factory.service';
import { cacheService } from '../services/cache.service';
import logger from '../utils/logger';
import { ExternalApiClientConfig } from '../services/external-api-factory.service';

// Validation schemas
const registerClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  config: z.object({
    baseUrl: z.string().url('Invalid base URL'),
    timeout: z.number().min(1000).max(300000).default(30000),
    retries: z.number().min(0).max(10).default(3),
    retryDelay: z.number().min(100).max(10000).default(1000),
    headers: z.record(z.string(), z.string()).optional(),
    auth: z.object({
      type: z.enum(['bearer', 'basic', 'api-key']),
      token: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      apiKey: z.string().optional(),
      apiKeyHeader: z.string().optional(),
    }).optional(),
  }),
  options: z.object({
    retryConfig: z.object({
      retries: z.number().min(0).max(10).default(3),
      retryDelay: z.number().min(100).max(10000).default(1000),
    }).optional(),
    cacheConfig: z.object({
      enabled: z.boolean().default(false),
      ttl: z.number().min(60).max(86400).default(300),
      keyPrefix: z.string().optional(),
    }).optional(),
    enableLogging: z.boolean().default(true),
  }).optional(),
});

const apiRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  url: z.string().min(1, 'URL is required'),
  data: z.any().optional(),
  params: z.record(z.string(), z.any()).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  timeout: z.number().min(1000).max(300000).optional(),
});

export class ExternalApiController {
  /**
   * Register a new external API client
   */
  async registerClient(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = registerClientSchema.parse(req.body);

      const client = externalApiFactory.registerClient(validatedData as ExternalApiClientConfig);

      res.status(201).json({
        success: true,
        message: `API client '${validatedData.name}' registered successfully`,
        data: {
          name: validatedData.name,
          baseUrl: validatedData.config.baseUrl,
          metrics: client.getMetrics(),
        },
      });
    } catch (error: any) {
      logger.error('Error registering API client:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to register API client',
        error: error.message,
      });
    }
  }

  /**
   * Get list of registered clients
   */
  async getClients(req: Request, res: Response): Promise<void> {
    try {
      const clientNames = externalApiFactory.getClientNames();
      const metrics = externalApiFactory.getAllMetrics();

      res.json({
        success: true,
        data: {
          clients: clientNames,
          metrics,
        },
      });
    } catch (error: any) {
      logger.error('Error getting API clients:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get API clients',
        error: error.message,
      });
    }
  }

  /**
   * Remove an API client
   */
  async removeClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientName } = req.params;

      if (!clientName) {
        res.status(400).json({
          success: false,
          message: 'Client name is required',
        });
        return;
      }

      const removed = externalApiFactory.removeClient(clientName);

      if (removed) {
        res.json({
          success: true,
          message: `API client '${clientName}' removed successfully`,
        });
      } else {
        res.status(404).json({
          success: false,
          message: `API client '${clientName}' not found`,
        });
      }
    } catch (error: any) {
      logger.error('Error removing API client:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove API client',
        error: error.message,
      });
    }
  }

  /**
   * Make a request using a registered client
   */
  async makeRequest(req: Request, res: Response): Promise<void> {
    try {
      const { clientName } = req.params;
      const requestData = apiRequestSchema.parse(req.body);

      if (!externalApiFactory.hasClient(clientName)) {
        res.status(404).json({
          success: false,
          message: `API client '${clientName}' not found`,
        });
        return;
      }

      const client = externalApiFactory.getClient(clientName);
      const response = await client.request(requestData);

      res.json({
        success: true,
        data: response.data,
        metadata: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        },
      });
    } catch (error: any) {
      logger.error('Error making API request:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
        return;
      }

      // Handle external API errors
      if (error.name === 'ExternalApiError') {
        res.status(error.status || 500).json({
          success: false,
          message: 'External API request failed',
          error: {
            message: error.message,
            status: error.status,
            isRetryable: error.isRetryable,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to make API request',
        error: error.message,
      });
    }
  }

  /**
   * Get metrics for a specific client
   */
  async getClientMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { clientName } = req.params;

      if (!externalApiFactory.hasClient(clientName)) {
        res.status(404).json({
          success: false,
          message: `API client '${clientName}' not found`,
        });
        return;
      }

      const client = externalApiFactory.getClient(clientName);
      const metrics = client.getMetrics();

      res.json({
        success: true,
        data: {
          clientName,
          metrics,
        },
      });
    } catch (error: any) {
      logger.error('Error getting client metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get client metrics',
        error: error.message,
      });
    }
  }

  /**
   * Reset metrics for a specific client
   */
  async resetClientMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { clientName } = req.params;

      if (!externalApiFactory.hasClient(clientName)) {
        res.status(404).json({
          success: false,
          message: `API client '${clientName}' not found`,
        });
        return;
      }

      const client = externalApiFactory.getClient(clientName);
      client.resetMetrics();

      res.json({
        success: true,
        message: `Metrics reset for API client '${clientName}'`,
      });
    } catch (error: any) {
      logger.error('Error resetting client metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset client metrics',
        error: error.message,
      });
    }
  }

  /**
   * Health check for all clients
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = await externalApiFactory.healthCheck();
      const cacheHealth = await cacheService.ping();

      res.json({
        success: true,
        data: {
          apiClients: healthStatus,
          cache: cacheHealth,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Error performing health check:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message,
      });
    }
  }

  /**
   * Clear cache for external API responses
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      const { pattern } = req.query;

      if (pattern && typeof pattern === 'string') {
        const keys = await cacheService.keys(pattern);
        for (const key of keys) {
          await cacheService.del(key);
        }

        res.json({
          success: true,
          message: `Cleared ${keys.length} cache entries matching pattern '${pattern}'`,
        });
      } else {
        const success = await cacheService.flush();

        if (success) {
          res.json({
            success: true,
            message: 'All cache cleared successfully',
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Failed to clear cache',
          });
        }
      }
    } catch (error: any) {
      logger.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error.message,
      });
    }
  }
}

export const externalApiController = new ExternalApiController();
