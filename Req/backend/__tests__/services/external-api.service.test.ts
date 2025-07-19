import { ExternalApiService } from '../../src/services/external-api.service';
import { cacheService } from '../../src/services/cache.service';
import axios from 'axios';
import { ApiClientOptions } from '../../src/types/external-api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock cache service
jest.mock('../../src/services/cache.service');
const mockedCacheService = cacheService as jest.Mocked<typeof cacheService>;

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ExternalApiService', () => {
  let apiService: ExternalApiService;
  let mockAxiosInstance: any;

  const defaultOptions: ApiClientOptions = {
    config: {
      baseUrl: 'https://api.example.com',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
    },
    retryConfig: {
      retries: 3,
      retryDelay: 1000,
    },
    cacheConfig: {
      enabled: true,
      ttl: 300,
    },
    enableLogging: false, // Disable logging for tests
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    apiService = new ExternalApiService(defaultOptions);
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should setup bearer authentication when provided', () => {
      const optionsWithAuth: ApiClientOptions = {
        ...defaultOptions,
        config: {
          ...defaultOptions.config,
          auth: {
            type: 'bearer',
            token: 'test-token',
          },
        },
      };

      new ExternalApiService(optionsWithAuth);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
    });

    it('should setup API key authentication when provided', () => {
      const optionsWithAuth: ApiClientOptions = {
        ...defaultOptions,
        config: {
          ...defaultOptions.config,
          auth: {
            type: 'api-key',
            apiKey: 'test-key',
            apiKeyHeader: 'X-API-Key',
          },
        },
      };

      new ExternalApiService(optionsWithAuth);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-key',
        },
      });
    });
  });

  describe('request method', () => {
    it('should make successful GET request', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);
      mockedCacheService.get.mockResolvedValue(null);

      const result = await apiService.request({
        method: 'GET',
        url: '/users/1',
      });

      expect(result).toEqual({
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { method: 'GET', url: '/users/1' },
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/users/1',
        timeout: 30000,
      });
    });

    it('should return cached response for GET requests', async () => {
      const cachedData = { id: 1, name: 'Cached Test' };
      const cachedResponse = {
        data: cachedData,
        timestamp: Date.now(),
        ttl: 300,
      };
      mockedCacheService.get.mockResolvedValue(cachedResponse);

      const result = await apiService.request({
        method: 'GET',
        url: '/users/1',
      });

      expect(result).toEqual({
        data: cachedData,
        status: 200,
        statusText: 'OK (Cached)',
        headers: {},
        config: { method: 'GET', url: '/users/1' },
      });

      expect(mockAxiosInstance.request).not.toHaveBeenCalled();
    });

    it('should cache successful GET responses', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);
      mockedCacheService.get.mockResolvedValue(null);
      mockedCacheService.set.mockResolvedValue(true);

      await apiService.request({
        method: 'GET',
        url: '/users/1',
      });

      expect(mockedCacheService.set).toHaveBeenCalled();
    });

    it('should not cache POST requests', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test' },
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await apiService.request({
        method: 'POST',
        url: '/users',
        data: { name: 'Test' },
      });

      expect(mockedCacheService.set).not.toHaveBeenCalled();
    });

    it('should retry on retryable errors', async () => {
      const error = {
        code: 'ECONNRESET',
        message: 'Connection reset',
      };

      mockAxiosInstance.request
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
        });

      const result = await apiService.request({
        method: 'GET',
        url: '/test',
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(3);
      expect(result.data).toEqual({ success: true });
    });

    it('should throw ExternalApiError after max retries', async () => {
      const error = {
        code: 'ECONNRESET',
        message: 'Connection reset',
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      await expect(
        apiService.request({
          method: 'GET',
          url: '/test',
        })
      ).rejects.toMatchObject({
        name: 'ExternalApiError',
        message: 'Connection reset',
        code: 'ECONNRESET',
        isRetryable: true,
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should not retry on non-retryable errors', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Bad Request' },
          statusText: 'Bad Request',
        },
        message: 'Request failed with status code 400',
      };

      mockAxiosInstance.request.mockRejectedValue(error);

      await expect(
        apiService.request({
          method: 'GET',
          url: '/test',
        })
      ).rejects.toMatchObject({
        name: 'ExternalApiError',
        status: 400,
        isRetryable: false,
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      jest.spyOn(apiService, 'request').mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { method: 'GET', url: '/test' },
      });
    });

    it('should call request with GET method', async () => {
      await apiService.get('/test', { param: 'value' }, { 'X-Custom': 'header' });

      expect(apiService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test',
        params: { param: 'value' },
        headers: { 'X-Custom': 'header' },
      });
    });

    it('should call request with POST method', async () => {
      await apiService.post('/test', { data: 'value' }, { 'X-Custom': 'header' });

      expect(apiService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/test',
        data: { data: 'value' },
        headers: { 'X-Custom': 'header' },
      });
    });

    it('should call request with PUT method', async () => {
      await apiService.put('/test', { data: 'value' });

      expect(apiService.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/test',
        data: { data: 'value' },
      });
    });

    it('should call request with PATCH method', async () => {
      await apiService.patch('/test', { data: 'value' });

      expect(apiService.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/test',
        data: { data: 'value' },
      });
    });

    it('should call request with DELETE method', async () => {
      await apiService.delete('/test', { 'X-Custom': 'header' });

      expect(apiService.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/test',
        headers: { 'X-Custom': 'header' },
      });
    });
  });

  describe('metrics', () => {
    it('should track successful requests', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await apiService.request({
        method: 'GET',
        url: '/test',
      });

      const metrics = apiService.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
    });

    it('should track failed requests', async () => {
      mockAxiosInstance.request.mockRejectedValue(new Error('Request failed'));

      try {
        await apiService.request({
          method: 'GET',
          url: '/test',
        });
      } catch (error) {
        // Expected to fail
      }

      const metrics = apiService.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(1);
    });

    it('should reset metrics', () => {
      apiService.resetMetrics();
      const metrics = apiService.getMetrics();

      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', () => {
      apiService.updateConfig({
        baseUrl: 'https://new-api.example.com',
        timeout: 60000,
      });

      expect(mockedAxios.create).toHaveBeenCalledTimes(2); // Initial + update
    });

    it('should update retry configuration', () => {
      apiService.updateRetryConfig({
        retries: 5,
        retryDelay: 2000,
      });

      // Should not create new axios instance for retry config
      expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    });

    it('should update cache configuration', () => {
      apiService.updateCacheConfig({
        enabled: false,
        ttl: 600,
      });

      // Should not create new axios instance for cache config
      expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    });
  });
});
