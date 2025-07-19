export interface ExternalApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers?: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
}

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: ApiRequest;
}

export interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (retryCount: number, error: any) => void;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  keyPrefix?: string;
  excludeHeaders?: string[];
}

export interface ExternalApiError extends Error {
  code?: string;
  status?: number;
  response?: {
    data: any;
    status: number;
    statusText: string;
  };
  config?: ApiRequest;
  isRetryable?: boolean;
}

export interface ApiClientOptions {
  config: ExternalApiConfig;
  retryConfig?: RetryConfig;
  cacheConfig?: CacheConfig;
  enableLogging?: boolean;
}

export interface CachedResponse<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  lastRequestTime?: Date;
}
