import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError, z } from 'zod';

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
export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        const validatedQuery = schema.query.parse(req.query);
        // Note: Express query type is complex, we'll extend the request object instead
        (req as Request & { validatedQuery: unknown }).validatedQuery =
          validatedQuery;
      }

      // Validate route parameters
      if (schema.params) {
        const validatedParams = schema.params.parse(req.params);
        req.params = validatedParams as Record<string, string>;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
            })),
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Middleware básico de validación de requests
 * Se aplica a todas las rutas de API para sanitización básica
 */
export const requestValidator = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Sanitize common XSS attempts in query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }
  }

  // Sanitize request body for basic XSS prevention
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
};

/**
 * Función auxiliar para sanitizar objetos recursivamente
 */
function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = (obj[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key] as Record<string, unknown>);
      }
    }
  }
}

// Export validation schemas for common use cases
export const commonSchemas = {
  // UUID parameter validation
  uuidParam: {
    params: z.object({
      id: z.string().uuid('Invalid UUID format'),
    }),
  },

  // Pagination query validation
  paginationQuery: {
    query: z.object({
      page: z
        .string()
        .optional()
        .transform((val: string | undefined) => {
          if (!val) return 1;
          const num = parseInt(val, 10);
          if (isNaN(num) || num < 1) {
            throw new Error('Page must be a positive integer');
          }
          return num;
        }),
      limit: z
        .string()
        .optional()
        .transform((val: string | undefined) => {
          if (!val) return 10;
          const num = parseInt(val, 10);
          if (isNaN(num) || num < 1 || num > 100) {
            throw new Error('Limit must be between 1 and 100');
          }
          return num;
        }),
    }),
  },

  // Search and filter query validation
  searchQuery: {
    query: z.object({
      search: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    }),
  },
};
