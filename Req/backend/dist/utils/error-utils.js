"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedResponse = exports.successResponse = exports.combine = exports.validators = exports.validateInput = exports.assertOwnershipOrAdmin = exports.assertUserPermission = exports.assertResourceExists = exports.asyncHandler = exports.handleControllerError = void 0;
const error_handler_1 = require("../middleware/error-handler");
const logger_1 = require("./logger");
/**
 * Utilidades para manejo consistente de errores
 * Responsabilidad: Funciones helper para manejo de errores en controladores
 */
/**
 * Maneja errores de manera consistente en controladores
 */
const handleControllerError = (error, res, context, metadata) => {
    // Log the error with context
    (0, logger_1.logError)(error, context, metadata);
    // Handle known error types
    if (error instanceof error_handler_1.BusinessError) {
        res.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString(),
            },
        });
        return;
    }
    if (error instanceof error_handler_1.ValidationError) {
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
exports.handleControllerError = handleControllerError;
/**
 * Crea un wrapper para funciones async de controladores
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(error => {
            (0, exports.handleControllerError)(error, res, `${req.method} ${req.path}`, {
                userId: req.user?.id,
                body: req.body,
                params: req.params,
                query: req.query,
            });
        });
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Valida que un recurso existe, lanza error si no
 */
const assertResourceExists = (resource, resourceType, resourceId) => {
    if (!resource) {
        throw new error_handler_1.BusinessError(`${resourceType} not found${resourceId ? ` with id: ${resourceId}` : ''}`, 'RESOURCE_NOT_FOUND', 404);
    }
};
exports.assertResourceExists = assertResourceExists;
/**
 * Valida permisos de usuario para un recurso
 */
const assertUserPermission = (hasPermission, action, resourceType) => {
    if (!hasPermission) {
        throw new error_handler_1.BusinessError(`Insufficient permissions to ${action} ${resourceType}`, 'INSUFFICIENT_PERMISSIONS', 403);
    }
};
exports.assertUserPermission = assertUserPermission;
/**
 * Valida que el usuario es el propietario del recurso o tiene permisos de admin
 */
const assertOwnershipOrAdmin = (userId, resourceOwnerId, userRole, resourceType) => {
    const isOwner = userId === resourceOwnerId;
    const isAdmin = userRole === 'ADMIN';
    if (!isOwner && !isAdmin) {
        throw new error_handler_1.BusinessError(`Access denied: You can only access your own ${resourceType}`, 'ACCESS_DENIED', 403);
    }
};
exports.assertOwnershipOrAdmin = assertOwnershipOrAdmin;
/**
 * Valida datos de entrada y lanza error de validación si hay problemas
 */
const validateInput = (data, rules) => {
    const errors = [];
    for (const [field, validator] of Object.entries(rules)) {
        const error = validator(data[field]);
        if (error) {
            errors.push({ field, message: error });
        }
    }
    if (errors.length > 0) {
        throw new error_handler_1.ValidationError('Validation failed', errors);
    }
};
exports.validateInput = validateInput;
/**
 * Validadores comunes
 */
exports.validators = {
    required: (value) => {
        if (value === null || value === undefined || value === '') {
            return 'This field is required';
        }
        return null;
    },
    email: (value) => {
        if (typeof value !== 'string')
            return 'Must be a string';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Must be a valid email address';
        }
        return null;
    },
    minLength: (min) => (value) => {
        if (typeof value !== 'string')
            return 'Must be a string';
        if (value.length < min) {
            return `Must be at least ${min} characters long`;
        }
        return null;
    },
    maxLength: (max) => (value) => {
        if (typeof value !== 'string')
            return 'Must be a string';
        if (value.length > max) {
            return `Must be no more than ${max} characters long`;
        }
        return null;
    },
    oneOf: (options) => (value) => {
        if (!options.includes(value)) {
            return `Must be one of: ${options.join(', ')}`;
        }
        return null;
    },
    uuid: (value) => {
        if (typeof value !== 'string')
            return 'Must be a string';
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            return 'Must be a valid UUID';
        }
        return null;
    },
};
/**
 * Combina múltiples validadores
 */
const combine = (...validators) => {
    return (value) => {
        for (const validator of validators) {
            const error = validator(value);
            if (error)
                return error;
        }
        return null;
    };
};
exports.combine = combine;
/**
 * Crea respuesta de éxito consistente
 */
const successResponse = (res, data, message, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};
exports.successResponse = successResponse;
/**
 * Crea respuesta paginada consistente
 */
const paginatedResponse = (res, data, pagination, message) => {
    res.json({
        success: true,
        message,
        data,
        pagination,
        timestamp: new Date().toISOString(),
    });
};
exports.paginatedResponse = paginatedResponse;
