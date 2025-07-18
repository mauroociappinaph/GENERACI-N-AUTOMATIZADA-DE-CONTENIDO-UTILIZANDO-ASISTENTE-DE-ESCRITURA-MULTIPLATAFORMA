import { Request, Response, NextFunction } from 'express';
import { BusinessError, ValidationError } from '../middleware/error-handler';
import { logError } from './logger';

/**
 * Utilidades para manejo consistente de errores
 * Responsabilidad: Funciones helper para manejo de errores en controladores
 */

/**
 * Maneja errores de manera consistente en controladores
 */
export const handleControllerError = (
  error: unknown,
  res: Response,
  context: string,
  metadata?: Record<string, unknown>
): void => {
  // Log the error with context
  logError(error as Error, context, metadata);

  // Handle known error types
  if (error instanceof BusinessError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Crea un wrapper para funciones async de controladores
 */
export const asyncHandler = (
  fn: (
    req: Request & { user?: { id: string } },
    res: Response,
    next?: NextFunction
  ) => Promise<void>
) => {
  return (
    req: Request & { user?: { id: string } },
    res: Response,
    next: NextFunction
  ): void => {
    Promise.resolve(fn(req, res, next)).catch(error => {
      handleControllerError(error, res, `${req.method} ${req.path}`, {
        userId: req.user?.id,
        body: req.body,
        params: req.params,
        query: req.query,
      });
    });
  };
};

/**
 * Valida que un recurso existe, lanza error si no
 */
export const assertResourceExists = <T>(
  resource: T | null | undefined,
  resourceType: string,
  resourceId?: string
): asserts resource is T => {
  if (!resource) {
    throw new BusinessError(
      `${resourceType} not found${resourceId ? ` with id: ${resourceId}` : ''}`,
      'RESOURCE_NOT_FOUND',
      404
    );
  }
};

/**
 * Valida permisos de usuario para un recurso
 */
export const assertUserPermission = (
  hasPermission: boolean,
  action: string,
  resourceType: string
): void => {
  if (!hasPermission) {
    throw new BusinessError(
      `Insufficient permissions to ${action} ${resourceType}`,
      'INSUFFICIENT_PERMISSIONS',
      403
    );
  }
};

/**
 * Valida que el usuario es el propietario del recurso o tiene permisos de admin
 */
export const assertOwnershipOrAdmin = (
  userId: string,
  resourceOwnerId: string,
  userRole: string,
  resourceType: string
): void => {
  const isOwner = userId === resourceOwnerId;
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new BusinessError(
      `Access denied: You can only access your own ${resourceType}`,
      'ACCESS_DENIED',
      403
    );
  }
};

/**
 * Valida datos de entrada y lanza error de validación si hay problemas
 */
export const validateInput = (
  data: Record<string, unknown>,
  rules: Record<string, (value: unknown) => string | null>
): void => {
  const errors: Array<{ field: string; message: string }> = [];

  for (const [field, validator] of Object.entries(rules)) {
    const error = validator(data[field]);
    if (error) {
      errors.push({ field, message: error });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
};

/**
 * Validadores comunes
 */
export const validators = {
  required: (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  email: (value: unknown): string | null => {
    if (typeof value !== 'string') return 'Must be a string';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Must be a valid email address';
    }
    return null;
  },

  minLength:
    (min: number) =>
    (value: unknown): string | null => {
      if (typeof value !== 'string') return 'Must be a string';
      if (value.length < min) {
        return `Must be at least ${min} characters long`;
      }
      return null;
    },

  maxLength:
    (max: number) =>
    (value: unknown): string | null => {
      if (typeof value !== 'string') return 'Must be a string';
      if (value.length > max) {
        return `Must be no more than ${max} characters long`;
      }
      return null;
    },

  oneOf:
    (options: unknown[]) =>
    (value: unknown): string | null => {
      if (!options.includes(value)) {
        return `Must be one of: ${options.join(', ')}`;
      }
      return null;
    },

  uuid: (value: unknown): string | null => {
    if (typeof value !== 'string') return 'Must be a string';
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      return 'Must be a valid UUID';
    }
    return null;
  },
};

/**
 * Combina múltiples validadores
 */
export const combine = (
  ...validators: Array<(value: unknown) => string | null>
) => {
  return (value: unknown): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
};

/**
 * Crea respuesta de éxito consistente
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Crea respuesta paginada consistente
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message?: string
): void => {
  res.json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};
