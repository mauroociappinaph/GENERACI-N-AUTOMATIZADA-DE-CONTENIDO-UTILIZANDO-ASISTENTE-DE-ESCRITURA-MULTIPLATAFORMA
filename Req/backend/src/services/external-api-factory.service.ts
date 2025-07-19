import { ExternalApiService } from './external-api.service';
import { ApiClientOptions, ExternalApiConfig } from '../types/external-api';
import logger from '../utils/logger';

export interface ApiClientRegistry {
  [clientName: string]: ExternalApiService;
}

export interface ExternalApiClientConfig {
  name: string;
  config: ExternalApiConfig;
  options?: Omit<ApiClientOptions, 'config'>;
}

export class ExternalApiFactory {
  private clients: ApiClientRegistry = {};
  private static instance: ExternalApiFactory;

  private constructor() {}

  static getInstance(): ExternalApiFactory {
    if (!ExternalApiFactory.instance) {
      ExternalApiFactory.instance = new ExternalApiFactory();
    }
    return ExternalApiFactory.instance;
  }

  /**
   * Register a new external API client
   */
  registerClient(clientConfig: ExternalApiClientConfig): ExternalApiService {
    const { name, config, options = {} } = clientConfig;

    if (this.clients[name]) {
      logger.warn(`API client '${name}' already exists. Replacing with new configuration.`);
    }

    const clientOptions: ApiClientOptions = {
      config,
      ...options,
    };

    const client = new ExternalApiService(clientOptions);
    this.clients[name] = client;

    logger.info(`External API client '${name}' registered successfully`);
    return client;
  }

  /**
   * Get an existing API client by name
   */
  getClient(name: string): ExternalApiService {
    const client = this.clients[name];
    if (!client) {
      throw new Error(`API client '${name}' not found. Make sure to register it first.`);
    }
    return client;
  }

  /**
   * Check if a client exists
   */
  hasClient(name: string): boolean {
    return name in this.clients;
  }

  /**
   * Remove a client from the registry
   */
  removeClient(name: string): boolean {
    if (this.clients[name]) {
      delete this.clients[name];
      logger.info(`External API client '${name}' removed`);
      return true;
    }
    return false;
  }

  /**
   * Get all registered client names
   */
  getClientNames(): string[] {
    return Object.keys(this.clients);
  }

  /**
   * Get metrics for all clients
   */
  getAllMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    for (const [name, client] of Object.entries(this.clients)) {
      metrics[name] = client.getMetrics();
    }

    return metrics;
  }

  /**
   * Reset metrics for all clients
   */
  resetAllMetrics(): void {
    for (const client of Object.values(this.clients)) {
      client.resetMetrics();
    }
    logger.info('All API client metrics reset');
  }

  /**
   * Create a client with common configurations
   */
  createStandardClient(name: string, baseUrl: string, options?: {
    timeout?: number;
    retries?: number;
    cacheEnabled?: boolean;
    cacheTtl?: number;
    authToken?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  }): ExternalApiService {
    const config: ExternalApiConfig = {
      baseUrl,
      timeout: options?.timeout || 30000,
      retries: options?.retries || 3,
      retryDelay: 1000,
    };

    // Setup authentication
    if (options?.authToken) {
      config.auth = {
        type: 'bearer',
        token: options.authToken,
      };
    } else if (options?.apiKey && options?.apiKeyHeader) {
      config.auth = {
        type: 'api-key',
        apiKey: options.apiKey,
        apiKeyHeader: options.apiKeyHeader,
      };
    }

    const clientOptions: Omit<ApiClientOptions, 'config'> = {
      retryConfig: {
        retries: options?.retries || 3,
        retryDelay: 1000,
      },
      cacheConfig: {
        enabled: options?.cacheEnabled || false,
        ttl: options?.cacheTtl || 300,
        keyPrefix: `api-${name}`,
      },
      enableLogging: true,
    };

    return this.registerClient({
      name,
      config,
      options: clientOptions,
    });
  }

  /**
   * Create a client for REST APIs
   */
  createRestClient(name: string, baseUrl: string, authToken?: string): ExternalApiService {
    return this.createStandardClient(name, baseUrl, {
      timeout: 30000,
      retries: 3,
      cacheEnabled: true,
      cacheTtl: 300,
      authToken,
    });
  }

  /**
   * Create a client for webhook endpoints
   */
  createWebhookClient(name: string, baseUrl: string, options?: {
    timeout?: number;
    retries?: number;
    authToken?: string;
  }): ExternalApiService {
    return this.createStandardClient(name, baseUrl, {
      timeout: options?.timeout || 10000,
      retries: options?.retries || 1, // Webhooks usually shouldn't retry much
      cacheEnabled: false, // Webhooks shouldn't be cached
      authToken: options?.authToken,
    });
  }

  /**
   * Health check for all clients
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};

    for (const [name, client] of Object.entries(this.clients)) {
      try {
        // Try a simple GET request to the base URL or health endpoint
        await client.get('/health');
        healthStatus[name] = true;
      } catch (error) {
        healthStatus[name] = false;
        logger.warn(`Health check failed for API client '${name}':`, error);
      }
    }

    return healthStatus;
  }
}

// Export singleton instance
export const externalApiFactory = ExternalApiFactory.getInstance();
