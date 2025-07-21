"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ValidationError = exports.BusinessError = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
/**
 * Custom error classes
 */
class BusinessError extends Error {
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'BusinessError';
    }
}
exports.BusinessError = BusinessError;
class ValidationError extends Error {
    constructor(message, details, statusCode = 400) {
        super(message);
        this.details = details;
        this.statusCode = statusCode;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * Centralized error handling middleware
 * Responsabilidad: Manejo consistente de errores en toda la aplicación
 */
const errorHandler = (error, req, res, _next) => {
    // Log error with context
    (0, logger_1.logError)(error, req.path, {
        method: req.method,
        userId: req.user?.id,
        body: req.body,
        query: req.query,
        params: req.params,
    });
    // Handle Zod validation errors
    if (error instanceof zod_1.ZodError) {
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
    // Handle custom business errors
    if (error instanceof BusinessError) {
        res.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        });
        return;
    }
    // Handle custom validation errors
    if (error instanceof ValidationError) {
        res.status(error.statusCode).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: error.message,
                details: error.details,
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        });
        return;
    }
    // Handle Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
        switch (prismaError.code) {
            case 'P2002':
                res.status(409).json({
                    error: {
                        code: 'DUPLICATE_ENTRY',
                        message: 'A record with this information already exists',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            case 'P2025':
                res.status(404).json({
                    error: {
                        code: 'RECORD_NOT_FOUND',
                        message: 'The requested record was not found',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
            default:
                res.status(500).json({
                    error: {
                        code: 'DATABASE_ERROR',
                        message: 'A database error occurred',
                        timestamp: new Date().toISOString(),
                        path: req.path,
                    },
                });
                return;
        }
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        });
        return;
    }
    if (error.name === 'TokenExpiredError') {
        res.status(401).json({
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        });
        return;
    }
    // Default error response for unhandled errors
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            timestamp: new Date().toISOString(),
            path: req.path,
        },
    });
};
exports.errorHandler = errorHandler;
