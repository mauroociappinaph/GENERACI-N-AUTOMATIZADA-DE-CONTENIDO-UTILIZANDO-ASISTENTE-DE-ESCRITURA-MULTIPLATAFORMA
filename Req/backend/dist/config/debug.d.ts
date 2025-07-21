/**
 * Configuración centralizada del sistema de debugging
 */
export declare class DebugConfig {
    private static instance;
    private logger;
    private errorTracker;
    private constructor();
    static getInstance(): DebugConfig;
    /**
     * Configuración por defecto del sistema de debugging
     */
    private setupDefaultConfiguration;
    /**
     * Configurar circuit breakers para componentes críticos
     */
    private setupCircuitBreakers;
    /**
     * Configurar listeners para eventos críticos
     */
    private setupCriticalEventListeners;
    /**
     * Enviar notificación de error crítico
     */
    private sendCriticalErrorNotification;
    /**
     * Obtener estadísticas del sistema de debugging
     */
    getDebugStats(): DebugStats;
    /**
     * Obtener estado de los circuit breakers
     */
    private getCircuitBreakerStatus;
    /**
     * Calcular salud general del sistema
     */
    private calculateSystemHealth;
    /**
     * Configurar debugging para desarrollo
     */
    enableDevelopmentMode(): void;
    /**
     * Configurar debugging para producción
     */
    enableProductionMode(): void;
}
interface DebugStats {
    errorStats: any;
    recommendations: any[];
    circuitBreakers: Record<string, any>;
    systemHealth: SystemHealth;
}
interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    issues: number;
    message: string;
}
export declare const debugConfig: DebugConfig;
export default debugConfig;
