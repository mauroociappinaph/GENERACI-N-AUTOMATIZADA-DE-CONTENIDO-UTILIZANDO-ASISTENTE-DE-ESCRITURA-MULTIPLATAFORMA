import { EventEmitter } from 'events';
/**
 * Sistema de tracking y prevención de errores en tiempo real
 */
export declare class ErrorTracker extends EventEmitter {
    private static instance;
    private errorCounts;
    private errorPatterns;
    private circuitBreakers;
    private logger;
    private constructor();
    static getInstance(): ErrorTracker;
    /**
     * Registra un error y analiza patrones
     */
    trackError(error: Error, context: ErrorContext): void;
    /**
     * Obtiene estadísticas de errores
     */
    getErrorStats(): ErrorStats;
    /**
     * Configura un circuit breaker para un componente
     */
    setupCircuitBreaker(component: string, config: CircuitBreakerConfig): void;
    /**
     * Verifica si un componente está disponible (circuit breaker)
     */
    isComponentAvailable(component: string): boolean;
    /**
     * Registra éxito en un componente (para circuit breaker)
     */
    recordSuccess(component: string): void;
    /**
     * Registra fallo en un componente (para circuit breaker)
     */
    recordFailure(component: string): void;
    /**
     * Obtiene recomendaciones para prevenir errores
     */
    getErrorPreventionRecommendations(): ErrorRecommendation[];
    private generateErrorKey;
    private analyzeErrorPattern;
    private calculateSeverity;
    private generateSuggestion;
    private setupErrorPatternDetection;
    private cleanupOldErrors;
    private detectCriticalPatterns;
}
export interface ErrorContext {
    component: string;
    operation: string;
    userId?: string;
    requestId?: string;
    metadata?: Record<string, any>;
}
export interface ErrorPattern {
    errorType: string;
    component: string;
    operation: string;
    frequency: number;
    firstOccurrence: Date;
    lastOccurrence: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
}
export interface ErrorStats {
    totalErrors: number;
    errorsByType: Map<string, number>;
    errorsByComponent: Map<string, number>;
    recentErrors: any[];
    criticalPatterns: ErrorPattern[];
}
export interface ErrorRecommendation {
    type: string;
    message: string;
    component: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestion: string;
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    timeout: number;
    successThreshold: number;
}
/**
 * Middleware para tracking automático de errores
 */
export declare const errorTrackingMiddleware: (error: Error, req: any, res: any, next: any) => void;
export default ErrorTracker;
