import { Request, Response } from 'express';
/**
 * Controlador para endpoints de debugging y monitoreo
 */
export declare class DebugController {
    /**
     * Obtener estadísticas generales del sistema de debugging
     */
    static getDebugStats(req: Request, res: Response): Promise<void>;
    /**
     * Obtener estadísticas de errores
     */
    static getErrorStats(req: Request, res: Response): Promise<void>;
    /**
     * Obtener recomendaciones para prevención de errores
     */
    static getErrorRecommendations(req: Request, res: Response): Promise<void>;
    /**
     * Obtener estado de los circuit breakers
     */
    static getCircuitBreakerStatus(req: Request, res: Response): Promise<void>;
    /**
     * Obtener salud general del sistema
     */
    static getSystemHealth(req: Request, res: Response): Promise<void>;
    /**
     * Configurar nivel de logging para un componente
     */
    static setComponentLogLevel(req: Request, res: Response): Promise<void>;
    /**
     * Simular error para testing (solo en desarrollo)
     */
    static simulateError(req: Request, res: Response): Promise<void>;
    /**
     * Limpiar estadísticas de errores
     */
    static clearErrorStats(req: Request, res: Response): Promise<void>;
    /**
     * Obtener métricas de rendimiento del sistema
     */
    static getPerformanceMetrics(req: Request, res: Response): Promise<void>;
}
export default DebugController;
