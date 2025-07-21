import { Request, Response, NextFunction } from 'express';
/**
 * Utilidades para manejo consistente de errores
 * Responsabilidad: Funciones helper para manejo de errores en controladores
 */
/**
 * Maneja errores de manera consistente en controladores
 */
export declare const handleControllerError: (error: unknown, res: Response, context: string, metadata?: Record<string, unknown>) => void;
/**
 * Crea un wrapper para funciones async de controladores
 */
export declare const asyncHandler: (fn: (req: Request & {
    user?: {
        id: string;
    };
}, res: Response, next?: NextFunction) => Promise<void>) => (req: Request & {
    user?: {
        id: string;
    };
}, res: Response, next: NextFunction) => void;
/**
 * Valida que un recurso existe, lanza error si no
 */
export declare const assertResourceExists: <T>(resource: T | null | undefined, resourceType: string, resourceId?: string) => asserts resource is T;
/**
 * Valida permisos de usuario para un recurso
 */
export declare const assertUserPermission: (hasPermission: boolean, action: string, resourceType: string) => void;
/**
 * Valida que el usuario es el propietario del recurso o tiene permisos de admin
 */
export declare const assertOwnershipOrAdmin: (userId: string, resourceOwnerId: string, userRole: string, resourceType: string) => void;
/**
 * Valida datos de entrada y lanza error de validación si hay problemas
 */
export declare const validateInput: (data: Record<string, unknown>, rules: Record<string, (value: unknown) => string | null>) => void;
/**
 * Validadores comunes
 */
export declare const validators: {
    required: (value: unknown) => string | null;
    email: (value: unknown) => string | null;
    minLength: (min: number) => (value: unknown) => string | null;
    maxLength: (max: number) => (value: unknown) => string | null;
    oneOf: (options: unknown[]) => (value: unknown) => string | null;
    uuid: (value: unknown) => string | null;
};
/**
 * Combina múltiples validadores
 */
export declare const combine: (...validators: Array<(value: unknown) => string | null>) => (value: unknown) => string | null;
/**
 * Crea respuesta de éxito consistente
 */
export declare const successResponse: <T>(res: Response, data: T, message?: string, statusCode?: number) => void;
/**
 * Crea respuesta paginada consistente
 */
export declare const paginatedResponse: <T>(res: Response, data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}, message?: string) => void;
