import { ExternalApiService } from './external-api.service';
import { ApiClientOptions, ExternalApiConfig } from '../types/external-api';
export interface ApiClientRegistry {
    [clientName: string]: ExternalApiService;
}
export interface ExternalApiClientConfig {
    name: string;
    config: ExternalApiConfig;
    options?: Omit<ApiClientOptions, 'config'>;
}
export declare class ExternalApiFactory {
    private clients;
    private static instance;
    private constructor();
    static getInstance(): ExternalApiFactory;
    /**
     * Register a new external API client
     */
    registerClient(clientConfig: ExternalApiClientConfig): ExternalApiService;
    /**
     * Get an existing API client by name
     */
    getClient(name: string): ExternalApiService;
    /**
     * Check if a client exists
     */
    hasClient(name: string): boolean;
    /**
     * Remove a client from the registry
     */
    removeClient(name: string): boolean;
    /**
     * Get all registered client names
     */
    getClientNames(): string[];
    /**
     * Get metrics for all clients
     */
    getAllMetrics(): Record<string, any>;
    /**
     * Reset metrics for all clients
     */
    resetAllMetrics(): void;
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
    }): ExternalApiService;
    /**
     * Create a client for REST APIs
     */
    createRestClient(name: string, baseUrl: string, authToken?: string): ExternalApiService;
    /**
     * Create a client for webhook endpoints
     */
    createWebhookClient(name: string, baseUrl: string, options?: {
        timeout?: number;
        retries?: number;
        authToken?: string;
    }): ExternalApiService;
    /**
     * Health check for all clients
     */
    healthCheck(): Promise<Record<string, boolean>>;
}
export declare const externalApiFactory: ExternalApiFactory;
