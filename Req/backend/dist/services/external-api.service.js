"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalApiService = void 0;
const axios_1 = __importDefault(require("axios"));
const cache_service_1 = require("./cache.service");
const logger_1 = __importDefault(require("../utils/logger"));
class ExternalApiService {
    constructor(options) {
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
    initializeMetrics() {
        return {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            cacheHitRate: 0,
        };
    }
    createAxiosInstance() {
        const axiosConfig = {
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
                        axiosConfig.headers['Authorization'] = `Bearer ${this.config.auth.token}`;
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
                        axiosConfig.headers[this.config.auth.apiKeyHeader] = this.config.auth.apiKey;
                    }
                    break;
            }
        }
        return axios_1.default.create(axiosConfig);
    }
    setupInterceptors() {
        // Request interceptor
        this.axiosInstance.interceptors.request.use((config) => {
            if (this.enableLogging) {
                logger_1.default.info(`External API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                    params: config.params,
                    headers: this.sanitizeHeaders(config.headers),
                });
            }
            return config;
        }, (error) => {
            if (this.enableLogging) {
                logger_1.default.error('External API Request Error:', error);
            }
            return Promise.reject(error);
        });
        // Response interceptor
        this.axiosInstance.interceptors.response.use((response) => {
            if (this.enableLogging) {
                logger_1.default.info(`External API Response: ${response.status} ${response.statusText}`, {
                    url: response.config.url,
                    status: response.status,
                });
            }
            return response;
        }, (error) => {
            if (this.enableLogging) {
                logger_1.default.error('External API Response Error:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.message,
                });
            }
            return Promise.reject(error);
        });
    }
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'x-api-key', 'cookie'];
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });
        return sanitized;
    }
    defaultRetryCondition(error) {
        return (error.code === 'ECONNABORTED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ECONNRESET' ||
            (error.response && error.response.status >= 500));
    }
    generateCacheKey(request) {
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
    async getCachedResponse(cacheKey) {
        if (!this.cacheConfig.enabled) {
            return null;
        }
        try {
            const cached = await cache_service_1.cacheService.get(cacheKey);
            if (!cached) {
                return null;
            }
            const now = Date.now();
            if (now - cached.timestamp > cached.ttl * 1000) {
                await cache_service_1.cacheService.del(cacheKey);
                return null;
            }
            return cached.data;
        }
        catch (error) {
            logger_1.default.error('Error retrieving cached response:', error);
            return null;
        }
    }
    async setCachedResponse(cacheKey, data) {
        if (!this.cacheConfig.enabled) {
            return;
        }
        try {
            const cachedResponse = {
                data,
                timestamp: Date.now(),
                ttl: this.cacheConfig.ttl,
            };
            await cache_service_1.cacheService.set(cacheKey, cachedResponse, this.cacheConfig.ttl);
        }
        catch (error) {
            logger_1.default.error('Error caching response:', error);
        }
    }
    async executeWithRetry(requestFn, retryCount = 0) {
        try {
            return await requestFn();
        }
        catch (error) {
            const shouldRetry = retryCount < this.retryConfig.retries &&
                (this.retryConfig.retryCondition ?
                    this.retryConfig.retryCondition(error) :
                    this.defaultRetryCondition(error));
            if (shouldRetry) {
                const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount); // Exponential backoff
                if (this.retryConfig.onRetry) {
                    this.retryConfig.onRetry(retryCount + 1, error);
                }
                if (this.enableLogging) {
                    logger_1.default.warn(`Retrying request (attempt ${retryCount + 1}/${this.retryConfig.retries}) after ${delay}ms`);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.executeWithRetry(requestFn, retryCount + 1);
            }
            throw this.createExternalApiError(error);
        }
    }
    createExternalApiError(error) {
        const apiError = new Error(error.message || 'External API request failed');
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
    updateMetrics(success, responseTime, fromCache = false) {
        this.metrics.totalRequests++;
        this.metrics.lastRequestTime = new Date();
        if (success) {
            this.metrics.successfulRequests++;
        }
        else {
            this.metrics.failedRequests++;
        }
        // Update average response time
        const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime;
        this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests;
        // Update cache hit rate
        if (fromCache) {
            const cacheHits = this.metrics.cacheHitRate * (this.metrics.totalRequests - 1) + 1;
            this.metrics.cacheHitRate = cacheHits / this.metrics.totalRequests;
        }
        else {
            this.metrics.cacheHitRate = (this.metrics.cacheHitRate * (this.metrics.totalRequests - 1)) / this.metrics.totalRequests;
        }
    }
    async request(request) {
        const startTime = Date.now();
        const cacheKey = this.generateCacheKey(request);
        try {
            // Check cache for GET requests
            if (request.method === 'GET' && this.cacheConfig.enabled) {
                const cachedData = await this.getCachedResponse(cacheKey);
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
            const response = await this.executeWithRetry(() => {
                const axiosConfig = {
                    method: request.method,
                    url: request.url,
                    data: request.data,
                    params: request.params,
                    headers: request.headers,
                    timeout: request.timeout || this.config.timeout,
                };
                return this.axiosInstance.request(axiosConfig);
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
                headers: response.headers,
                config: request,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(false, responseTime);
            throw error;
        }
    }
    async get(url, params, headers) {
        return this.request({
            method: 'GET',
            url,
            params,
            headers,
        });
    }
    async post(url, data, headers) {
        return this.request({
            method: 'POST',
            url,
            data,
            headers,
        });
    }
    async put(url, data, headers) {
        return this.request({
            method: 'PUT',
            url,
            data,
            headers,
        });
    }
    async patch(url, data, headers) {
        return this.request({
            method: 'PATCH',
            url,
            data,
            headers,
        });
    }
    async delete(url, headers) {
        return this.request({
            method: 'DELETE',
            url,
            headers,
        });
    }
    getMetrics() {
        return { ...this.metrics };
    }
    resetMetrics() {
        this.metrics = this.initializeMetrics();
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.axiosInstance = this.createAxiosInstance();
        this.setupInterceptors();
    }
    updateRetryConfig(retryConfig) {
        this.retryConfig = { ...this.retryConfig, ...retryConfig };
    }
    updateCacheConfig(cacheConfig) {
        this.cacheConfig = { ...this.cacheConfig, ...cacheConfig };
    }
}
exports.ExternalApiService = ExternalApiService;
