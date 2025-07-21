import { Request, Response } from 'express';
/**
 * Sistema de logging avanzado con debugging por componente
 * Updated: 2025-07-21 - Testing hook system
 */
export declare class DebugLogger {
    private static instance;
    private logger;
    private componentLevels;
    private constructor();
    static getInstance(): DebugLogger;
    /**
     * Configura el nivel de logging para un componente específico
     */
    setComponentLevel(component: string, level: string): void;
    /**
     * Log de debug para un componente específico
     */
    debug(component: string, message: string, meta?: any): void;
    /**
     * Log de información para un componente específico
     */
    info(component: string, message: string, meta?: any): void;
    /**
     * Log de advertencia para un componente específico
     */
    warn(component: string, message: string, meta?: any): void;
    /**
     * Log de error para un componente específico
     */
    error(component: string, message: string, error?: Error, meta?: any): void;
    /**
     * Log de rendimiento para un componente específico
     */
    performance(component: string, operation: string, duration: number, meta?: any): void;
    /**
     * Log de request HTTP
     */
    httpRequest(req: Request, res: Response, duration?: number): void;
    /**
     * Log de query de base de datos
     */
    dbQuery(query: string, duration: number, params?: any): void;
    /**
     * Log de operación de IA
     */
    aiOperation(provider: string, operation: string, duration: number, tokens?: number, cost?: number): void;
    private shouldLog;
}
/**
 * Middleware para logging automático de requests HTTP
 */
export declare const httpLoggingMiddleware: (req: Request, res: Response, next: Function) => void;
/**
 * Decorator para logging automático de métodos
 */
export declare function LogMethod(component: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Función helper para crear loggers específicos por componente
 */
export declare function createComponentLogger(component: string): {
    debug: (message: string, meta?: any) => void;
    info: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    error: (message: string, error?: Error, meta?: any) => void;
    performance: (operation: string, duration: number, meta?: unknown) => void;
};
export default DebugLogger;
