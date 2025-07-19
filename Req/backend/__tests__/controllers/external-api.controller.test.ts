import { Request, Response } from 'express';
import { ExternalApiController } from '../../src/controllers/external-api.controller';
import { externalApiFactory } from '../../src/services/external-api-factory.service';
import { cacheService } from '../../src/services/cache.service';

// Mock services
jest.mock('../../src/services/external-api-factory.service');
jest.mock('../../src/services/cache.service');
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockedExternalApiFactory = externalApiFactory as jest.Mocked<typeof externalApiFactory>;
const mockedCacheService = cacheService as jest.Mocked<typeof cacheService>;

describe('ExternalApiController', () => {
  let controller: ExternalApiController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new ExternalApiController();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();

    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  describe('registerClient', () => {
    it('should register a new API client successfully', async () => {
      const clientData = {
        name: 'test-client',
        config: {
          baseUrl: 'https://api.example.com',
          timeout: 30000,
          retries: 3,
          retryDelay: 1000,
        },
      };

      const mockClient = {
        getMetrics: jest.fn().mockReturnValue({
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          cacheHitRate: 0,
        }),
      };

      mockRequest.body = clientData;
      mockedExternalApiFactory.registerClient.mockReturnValue(mockClient as any);

      await controller.registerClient(mockRequest as Request, mockResponse as Response);

      expect(mockedExternalApiFactory.registerClient).toHaveBeenCalledWith(clientData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "API client 'test-client' registered successfully",
        data: {
          name: 'test-client',
          baseUrl: 'https://api.example.com',
          metrics: expect.any(Object),
        },
      });
    });

    it('should return validation error for invalid data', async () => {
      mockRequest.body = {
        name: '', // Invalid: empty name
        config: {
          baseUrl: 'invalid-url', // Invalid: not a valid URL
        },
      };

      await controller.registerClient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: expect.any(Array),
      });
    });

    it('should handle registration errors', async () => {
      const clientData = {
        name: 'test-client',
        config: {
          baseUrl: 'https://api.example.com',
          timeout: 30000,
          retries: 3,
          retryDelay: 1000,
        },
      };

      mockRequest.body = clientData;
      mockedExternalApiFactory.registerClient.mockImplementation(() => {
        throw new Error('Registration failed');
      });

      await controller.registerClient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to register API client',
        error: 'Registration failed',
      });
    });
  });

  describe('getClients', () => {
    it('should return list of clients and metrics', async () => {
      const clientNames = ['client1', 'client2'];
      const metrics = {
        client1: { totalRequests: 10 },
        client2: { totalRequests: 5 },
      };

      mockedExternalApiFactory.getClientNames.mockReturnValue(clientNames);
      mockedExternalApiFactory.getAllMetrics.mockReturnValue(metrics);

      await controller.getClients(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          clients: clientNames,
          metrics,
        },
      });
    });

    it('should handle errors when getting clients', async () => {
      mockedExternalApiFactory.getClientNames.mockImplementation(() => {
        throw new Error('Failed to get clients');
      });

      await controller.getClients(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get API clients',
        error: 'Failed to get clients',
      });
    });
  });

  describe('removeClient', () => {
    it('should remove existing client successfully', async () => {
      mockRequest.params = { clientName: 'test-client' };
      mockedExternalApiFactory.removeClient.mockReturnValue(true);

      await controller.removeClient(mockRequest as Request, mockResponse as Response);

      expect(mockedExternalApiFactory.removeClient).toHaveBeenCalledWith('test-client');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "API client 'test-client' removed successfully",
      });
    });

    it('should return 404 for non-existent client', async () => {
      mockRequest.params = { clientName: 'non-existent' };
      mockedExternalApiFactory.removeClient.mockReturnValue(false);

      await controller.removeClient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "API client 'non-existent' not found",
      });
    });

    it('should return 400 for missing client name', async () => {
      mockRequest.params = {};

      await controller.removeClient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Client name is required',
      });
    });
  });

  describe('makeRequest', () => {
    it('should make successful API request', async () => {
      const requestData = {
        method: 'GET' as const,
        url: '/test',
      };

      const mockClient = {
        request: jest.fn().mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
        }),
      };

      mockRequest.params = { clientName: 'test-client' };
      mockRequest.body = requestData;

      mockedExternalApiFactory.hasClient.mockReturnValue(true);
      mockedExternalApiFactory.getClient.mockReturnValue(mockClient as any);

      await controller.makeRequest(mockRequest as Request, mockResponse as Response);

      expect(mockClient.request).toHaveBeenCalledWith(requestData);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { success: true },
        metadata: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
        },
      });
    });

    it('should return 404 for non-existent client', async () => {
      mockRequest.params = { clientName: 'non-existent' };
      mockRequest.body = { method: 'GET', url: '/test' };

      mockedExternalApiFactory.hasClient.mockReturnValue(false);

      await controller.makeRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "API client 'non-existent' not found",
      });
    });

    it('should handle external API errors', async () => {
      const requestData = {
        method: 'GET' as const,
        url: '/test',
      };

      const apiError = {
        name: 'ExternalApiError',
        message: 'Request failed',
        status: 500,
        isRetryable: true,
      };

      const mockClient = {
        request: jest.fn().mockRejectedValue(apiError),
      };

      mockRequest.params = { clientName: 'test-client' };
      mockRequest.body = requestData;

      mockedExternalApiFactory.hasClient.mockReturnValue(true);
      mockedExternalApiFactory.getClient.mockReturnValue(mockClient as any);

      await controller.makeRequest(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'External API request failed',
        error: {
          message: 'Request failed',
          status: 500,
          isRetryable: true,
        },
      });
    });
  });

  describe('getClientMetrics', () => {
    it('should return client metrics', async () => {
      const metrics = {
        totalRequests: 10,
        successfulRequests: 8,
        failedRequests: 2,
        averageResponseTime: 250,
        cacheHitRate: 0.3,
      };

      const mockClient = {
        getMetrics: jest.fn().mockReturnValue(metrics),
      };

      mockRequest.params = { clientName: 'test-client' };

      mockedExternalApiFactory.hasClient.mockReturnValue(true);
      mockedExternalApiFactory.getClient.mockReturnValue(mockClient as any);

      await controller.getClientMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          clientName: 'test-client',
          metrics,
        },
      });
    });

    it('should return 404 for non-existent client', async () => {
      mockRequest.params = { clientName: 'non-existent' };

      mockedExternalApiFactory.hasClient.mockReturnValue(false);

      await controller.getClientMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "API client 'non-existent' not found",
      });
    });
  });

  describe('resetClientMetrics', () => {
    it('should reset client metrics', async () => {
      const mockClient = {
        resetMetrics: jest.fn(),
      };

      mockRequest.params = { clientName: 'test-client' };

      mockedExternalApiFactory.hasClient.mockReturnValue(true);
      mockedExternalApiFactory.getClient.mockReturnValue(mockClient as any);

      await controller.resetClientMetrics(mockRequest as Request, mockResponse as Response);

      expect(mockClient.resetMetrics).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Metrics reset for API client 'test-client'",
      });
    });
  });

  describe('healthCheck', () => {
    it('should return health status for all services', async () => {
      const healthStatus = {
        'client1': true,
        'client2': false,
      };

      mockedExternalApiFactory.healthCheck.mockResolvedValue(healthStatus);
      mockedCacheService.ping.mockResolvedValue(true);

      await controller.healthCheck(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          apiClients: healthStatus,
          cache: true,
          timestamp: expect.any(String),
        },
      });
    });

    it('should handle health check errors', async () => {
      mockedExternalApiFactory.healthCheck.mockRejectedValue(new Error('Health check failed'));

      await controller.healthCheck(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Health check failed',
        error: 'Health check failed',
      });
    });
  });

  describe('clearCache', () => {
    it('should clear all cache when no pattern provided', async () => {
      mockRequest.query = {};
      mockedCacheService.flush.mockResolvedValue(true);

      await controller.clearCache(mockRequest as Request, mockResponse as Response);

      expect(mockedCacheService.flush).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'All cache cleared successfully',
      });
    });

    it('should clear cache by pattern', async () => {
      const keys = ['key1', 'key2', 'key3'];
      mockRequest.query = { pattern: 'test:*' };

      mockedCacheService.keys.mockResolvedValue(keys);
      mockedCacheService.del.mockResolvedValue(true);

      await controller.clearCache(mockRequest as Request, mockResponse as Response);

      expect(mockedCacheService.keys).toHaveBeenCalledWith('test:*');
      expect(mockedCacheService.del).toHaveBeenCalledTimes(3);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Cleared 3 cache entries matching pattern 'test:*'",
      });
    });

    it('should handle cache clear failures', async () => {
      mockRequest.query = {};
      mockedCacheService.flush.mockResolvedValue(false);

      await controller.clearCache(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to clear cache',
      });
    });
  });
});
