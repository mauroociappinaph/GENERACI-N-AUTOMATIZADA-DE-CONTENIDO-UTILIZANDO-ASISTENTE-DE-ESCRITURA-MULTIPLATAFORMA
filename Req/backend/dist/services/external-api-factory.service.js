"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalApiFactory = exports.ExternalApiFactory = void 0;
const external_api_service_1 = require("./external-api.service");
const logger_1 = __importDefault(require("../utils/logger"));
class ExternalApiFactory {
    constructor() {
        this.clients = {};
    }
    static getInstance() {
        if (!ExternalApiFactory.instance) {
            ExternalApiFactory.instance = new ExternalApiFactory();
        }
        return ExternalApiFactory.instance;
    }
    /**
     * Register a new external API client
     */
    registerClient(clientConfig) {
        const { name, config, options = {} } = clientConfig;
        if (this.clients[name]) {
            logger_1.default.warn(`API client '${name}' already exists. Replacing with new configuration.`);
        }
        const clientOptions = {
            config,
            ...options,
        };
        const client = new external_api_service_1.ExternalApiService(clientOptions);
        this.clients[name] = client;
        logger_1.default.info(`External API client '${name}' registered successfully`);
        return client;
    }
    /**
     * Get an existing API client by name
     */
    getClient(name) {
        const client = this.clients[name];
        if (!client) {
            throw new Error(`API client '${name}' not found. Make sure to register it first.`);
        }
        return client;
    }
    /**
     * Check if a client exists
     */
    hasClient(name) {
        return name in this.clients;
    }
    /**
     * Remove a client from the registry
     */
    removeClient(name) {
        if (this.clients[name]) {
            delete this.clients[name];
            logger_1.default.info(`External API client '${name}' removed`);
            return true;
        }
        return false;
    }
    /**
     * Get all registered client names
     */
    getClientNames() {
        return Object.keys(this.clients);
    }
    /**
     * Get metrics for all clients
     */
    getAllMetrics() {
        const metrics = {};
        for (const [name, client] of Object.entries(this.clients)) {
            metrics[name] = client.getMetrics();
        }
        return metrics;
    }
    /**
     * Reset metrics for all clients
     */
    resetAllMetrics() {
        for (const client of Object.values(this.clients)) {
            client.resetMetrics();
        }
        logger_1.default.info('All API client metrics reset');
    }
    /**
     * Create a client with common configurations
     */
    createStandardClient(name, baseUrl, options) {
        const config = {
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
        }
        else if (options?.apiKey && options?.apiKeyHeader) {
            config.auth = {
                type: 'api-key',
                apiKey: options.apiKey,
                apiKeyHeader: options.apiKeyHeader,
            };
        }
        const clientOptions = {
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
    createRestClient(name, baseUrl, authToken) {
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
    createWebhookClient(name, baseUrl, options) {
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
    async healthCheck() {
        const healthStatus = {};
        for (const [name, client] of Object.entries(this.clients)) {
            try {
                // Try a simple GET request to the base URL or health endpoint
                await client.get('/health');
                healthStatus[name] = true;
            }
            catch (error) {
                healthStatus[name] = false;
                logger_1.default.warn(`Health check failed for API client '${name}':`, error);
            }
        }
        return healthStatus;
    }
}
exports.ExternalApiFactory = ExternalApiFactory;
// Export singleton instance
exports.externalApiFactory = ExternalApiFactory.getInstance();
