/**
 * Tipos para configuración de proveedores de IA
 */
import { AIProvider } from './base';
export interface AIProviderConfig {
    provider: AIProvider;
    apiKey: string;
    baseUrl?: string;
    model: string;
    maxTokens: number;
    temperature: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    rateLimits: {
        requestsPerMinute: number;
        tokensPerMinute: number;
        requestsPerDay: number;
        tokensPerDay: number;
    };
    costPerToken: {
        input: number;
        output: number;
    };
    isActive: boolean;
    priority: number;
    fallbackProviders?: AIProvider[];
}
export interface AIUsageStats {
    provider: AIProvider;
    period: {
        start: Date;
        end: Date;
    };
    requests: number;
    tokensUsed: number;
    cost: number;
    averageResponseTime: number;
    successRate: number;
    errorCount: number;
    topErrors: Array<{
        error: string;
        count: number;
    }>;
}
