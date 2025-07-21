import { Request, Response, NextFunction } from 'express';
import { ZodType, z } from 'zod';
/**
 * Schema validation interface
 */
interface ValidationSchema {
    body?: ZodType<unknown>;
    query?: ZodType<unknown>;
    params?: ZodType<unknown>;
}
/**
 * Middleware de validación de requests
 * Responsabilidad: Validación de datos de entrada usando Zod
 */
export declare const validateRequest: (schema: ValidationSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Advanced request validation and sanitization middleware
 * Se aplica a todas las rutas de API para sanitización exhaustiva
 */
export declare const requestValidator: (req: Request, res: Response, next: NextFunction) => void;
export declare const commonSchemas: {
    uuidParam: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    paginationQuery: {
        query: z.ZodObject<{
            page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
            limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
        }, z.core.$strip>;
    };
    searchQuery: {
        query: z.ZodObject<{
            search: z.ZodOptional<z.ZodString>;
            sortBy: z.ZodOptional<z.ZodString>;
            sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                asc: "asc";
                desc: "desc";
            }>>>;
        }, z.core.$strip>;
    };
};
export {};
