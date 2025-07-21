import { Request, Response, NextFunction } from 'express';
/**
 * Custom error classes
 */
export declare class BusinessError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class ValidationError extends Error {
    details: Array<{
        field: string;
        message: string;
        code?: string;
    }>;
    statusCode: number;
    constructor(message: string, details: Array<{
        field: string;
        message: string;
        code?: string;
    }>, statusCode?: number);
}
/**
 * Centralized error handling middleware
 * Responsabilidad: Manejo consistente de errores en toda la aplicación
 */
export declare const errorHandler: (error: Error, req: Request, res: Response, _next: NextFunction) => void;
