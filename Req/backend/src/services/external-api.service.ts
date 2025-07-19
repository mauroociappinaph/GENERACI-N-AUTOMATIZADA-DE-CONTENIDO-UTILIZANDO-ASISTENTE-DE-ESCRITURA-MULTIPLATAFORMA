import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { cacheService } from './cache.service';
import logger from '../utils/logger';
import {
  ExternalApiConfig,
  ApiRequest,
  ApiResponse,
  RetryConfig,
  CacheConfig,
  ExternalApiError,
  ApiClientOptions,
  CachedResponse,
  ApiMetrics,
} from '../types/external-api';

export class ExternalApiService {
  private axiosInstance: AxiosInstance;
  private config: ExternalApiConfig;
  private retryConfig: RetryConfig;
  private cacheConfig: CacheConfig;
  private enableLogging: boolean;
  private metrics: ApiMetrics;

  constructor(options: ApiClientOptions) {
    this.config = options.config;
    this.retryConfig = options.retryConfig || {
      retries: 3,
      retryDelay: 1000,
      retryCondition: this.defaultRetryCondition,
    };
    this.cacheConfig = options.cacheConfig || {
      enabled: false,
      ttl: 300, // 5 minutes default
    };
    this.enableLogging = options.enableLogging ?? true;
    this.metrics = this.initializeMetrics();

    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private initializeMetrics(): ApiMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
    };
  }

  private createAxiosInstance(): AxiosInstance {
    const axiosConfig: AxiosRequestConfig = {
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    };

    // Setup authentication
    if (this.config.auth) {
      switch (this.config.auth.type) {
        case 'bearer':
          if (this.config.auth.token) {
            axiosConfig.headers!['Authorization'] = `Bearer ${this.config.auth.token}`;
          }
          break;
        case 'basic':
          if (this.config.auth.username && this.config.auth.password) {
            axiosConfig.auth = {
              username: this.config.auth.username,
              password: this.config.auth.password,
            };
          }
          break;
        case 'api-key':
          if (this.config.auth.apiKey && this.config.auth.apiKeyHeader) {
            axiosConfig.headers![this.config.auth.apiKeyHeader] = this.config.auth.apiKey;
          }
          break;
      }
    }

    return axios.create(axiosConfig);
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.enableLogging) {
          logger.info(`External API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            headers: this.sanitizeHeaders(config.headers),
          });
        }
        return config;
      },
      (error) => {
        if (this.enableLogging) {
          logger.error('External API Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.enableLogging) {
          logger.info(`External API Response: ${response.status} ${response.statusText}`, {
            url: response.config.url,
            status: response.status,
          });
        }
        return response;
      },
      (error) => {
        if (this.enableLogging) {
          logger.error('External API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  private sanitizeHeaders(headers: any): Record<string, string> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie'];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private defaultRetryCondition(error: any): boolean {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNRESET' ||
      (error.response && error.response.status >= 500)
    );
  }

  private generateCacheKey(request: ApiRequest): string {
    const { method, url, params, data } = request;
    const keyData = {
      method,
      url,
      params: params || {},
      data: method !== 'GET' ? data : undefined,
    };

    const keyString = JSON.stringify(keyData);
    const prefix = this.cacheConfig.keyPrefix || 'external-api';

    return `${prefix}:${Buffer.from(keyString).toString('base64')}`;
  }

  private async getCachedResponse<T>(cacheKey: string): Promise<T | null> {
    if (!this.cacheConfig.enabled) {
      return null;
    }

    try {
      const cached = await cacheService.get<CachedResponse<T>>(cacheKey);
      if (!cached) {
        return null;
      }

      const now = Date.now();
      if (now - cached.timestamp > cached.ttl * 1000) {
        await cacheService.del(cacheKey);
        return null;
      }

      return cached.data;
    } catch (error) {
      logger.error('Error retrieving cached response:', error);
      return null;
    }
  }

  private async setCachedResponse<T>(cacheKey: string, data: T): Promise<void> {
    if (!this.cacheConfig.enabled) {
      return;
    }

    try {
      const cachedResponse: CachedResponse<T> = {
        data,
        timestamp: Date.now(),
        ttl: this.cacheConfig.ttl,
      };

      await cacheService.set(cacheKey, cachedResponse, this.cacheConfig.ttl);
    } catch (error) {
      logger.error('Error caching response:', error);
    }
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retryCount: number = 0
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error: any) {
      const shouldRetry =
        retryCount < this.retryConfig.retries &&
        (this.retryConfig.retryCondition ?
          this.retryConfig.retryCondition(error) :
          this.defaultRetryCondition(error));

      if (shouldRetry) {
        const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount); // Exponential backoff

        if (this.retryConfig.onRetry) {
          this.retryConfig.onRetry(retryCount + 1, error);
        }

        if (this.enableLogging) {
          logger.warn(`Retrying request (attempt ${retryCount + 1}/${this.retryConfig.retries}) after ${delay}ms`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(requestFn, retryCount + 1);
      }

      throw this.createExternalApiError(error);
    }
  }

  private createExternalApiError(error: any): ExternalApiError {
    const apiError: ExternalApiError = new Error(error.message || 'External API request failed');
    apiError.name = 'ExternalApiError';
    apiError.code = error.code;
    apiError.status = error.response?.status;
    apiError.response = error.response ? {
      data: error.response.data,
      status: error.response.status,
      statusText: error.response.statusText,
    } : undefined;
    apiError.config = error.config;
    apiError.isRetryable = this.retryConfig.retryCondition ?
      this.retryConfig.retryCondition(error) :
      this.defaultRetryCondition(error);

    return apiError;
  }

  private updateMetrics(success: boolean, responseTime: number, fromCache: boolean = false): void {
    this.metrics.totalRequests++;
    this.metrics.lastRequestTime = new Date();

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime;
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests;

    // Update cache hit rate
    if (fromCache) {
      const cacheHits = this.metrics.cacheHitRate * (this.metrics.totalRequests - 1) + 1;
      this.metrics.cacheHitRate = cacheHits / this.metrics.totalRequests;
    } else {
      this.metrics.cacheHitRate = (this.metrics.cacheHitRate * (this.metrics.totalRequests - 1)) / this.metrics.totalRequests;
    }
  }

  async request<T = any>(request: ApiRequest): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);

    try {
      // Check cache for GET requests
      if (request.method === 'GET' && this.cacheConfig.enabled) {
        const cachedData = await this.getCachedResponse<T>(cacheKey);
        if (cachedData) {
          const responseTime = Date.now() - startTime;
          this.updateMetrics(true, responseTime, true);

          return {
            data: cachedData,
            status: 200,
            statusText: 'OK (Cached)',
            headers: {},
            config: request,
          };
        }
      }

      // Execute request with retry logic
      const response = await this.executeWithRetry<T>(() => {
        const axiosConfig: AxiosRequestConfig = {
          method: request.method,
          url: request.url,
          data: request.data,
          params: request.params,
          headers: request.headers,
          timeout: request.timeout || this.config.timeout,
        };

        return this.axiosInstance.request<T>(axiosConfig);
      });

      // Cache successful GET responses
      if (request.method === 'GET' && this.cacheConfig.enabled && response.status < 400) {
        await this.setCachedResponse(cacheKey, response.data);
      }

      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        config: request,
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      throw error;
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      headers,
    });
  }

  async post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      headers,
    });
  }

  async put<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      headers,
    });
  }

  async patch<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      headers,
    });
  }

  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      headers,
    });
  }

  getMetrics(): ApiMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }

  updateConfig(config: Partial<ExternalApiConfig>): void {
    this.config = { ...this.config, ...config };
    this.axiosInstance = this.createAxiosInstance();
    this.setupInterceptors();
  }

  updateRetryConfig(retryConfig: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...retryConfig };
  }

  updateCacheConfig(cacheConfig: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...cacheConfig };
  }
}
