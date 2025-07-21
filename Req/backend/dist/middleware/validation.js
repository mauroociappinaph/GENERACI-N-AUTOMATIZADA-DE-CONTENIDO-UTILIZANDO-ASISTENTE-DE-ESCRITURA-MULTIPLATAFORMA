"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.requestValidator = exports.validateRequest = void 0;
const zod_1 = require("zod");
/**
 * Middleware de validación de requests
 * Responsabilidad: Validación de datos de entrada usando Zod
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Validate request body
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            // Validate query parameters
            if (schema.query) {
                const validatedQuery = schema.query.parse(req.query);
                // Note: Express query type is complex, we'll extend the request object instead
                req.validatedQuery =
                    validatedQuery;
            }
            // Validate route parameters
            if (schema.params) {
                const validatedParams = schema.params.parse(req.params);
                req.params = validatedParams;
            }
            next();
        }
        catch (error) {
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
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
/**
 * Advanced request validation and sanitization middleware
 * Se aplica a todas las rutas de API para sanitización exhaustiva
 */
const requestValidator = (req, res, next) => {
    try {
        // Check for suspicious patterns in URL
        if (containsSuspiciousPatterns(req.url)) {
            console.warn(`Suspicious URL pattern detected: ${req.url} from IP: ${req.ip}`);
            res.status(400).json({
                error: {
                    code: 'SUSPICIOUS_REQUEST',
                    message: 'Request contains potentially malicious content',
                    timestamp: new Date().toISOString(),
                },
            });
            return;
        }
        // Validate and sanitize headers
        validateHeaders(req);
        // Sanitize query parameters with enhanced protection
        if (req.query) {
            req.query = sanitizeQueryParams(req.query);
        }
        // Sanitize request body with comprehensive protection
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }
        // Check request size limits
        const contentLength = parseInt(req.get('content-length') || '0');
        if (contentLength > 10 * 1024 * 1024) { // 10MB limit
            res.status(413).json({
                error: {
                    code: 'PAYLOAD_TOO_LARGE',
                    message: 'Request payload exceeds maximum allowed size',
                    timestamp: new Date().toISOString(),
                },
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Request validation error:', error);
        res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request format',
                timestamp: new Date().toISOString(),
            },
        });
    }
};
exports.requestValidator = requestValidator;
/**
 * Enhanced function to sanitize objects recursively with comprehensive protection
 */
function sanitizeObject(obj) {
    const sanitized = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const sanitizedKey = sanitizeString(key);
            if (typeof obj[key] === 'string') {
                sanitized[sanitizedKey] = sanitizeString(obj[key]);
            }
            else if (Array.isArray(obj[key])) {
                sanitized[sanitizedKey] = obj[key].map(item => typeof item === 'string' ? sanitizeString(item) :
                    typeof item === 'object' && item !== null ? sanitizeObject(item) :
                        item);
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitized[sanitizedKey] = sanitizeObject(obj[key]);
            }
            else {
                sanitized[sanitizedKey] = obj[key];
            }
        }
    }
    return sanitized;
}
/**
 * Comprehensive string sanitization function
 */
function sanitizeString(str) {
    if (typeof str !== 'string')
        return str;
    return str
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove event handlers
        .replace(/on\w+\s*=/gi, '')
        // Remove data: URLs with javascript
        .replace(/data:text\/html[^,]*,.*<script/gi, '')
        // Remove vbscript: protocol
        .replace(/vbscript:/gi, '')
        // Remove expression() CSS
        .replace(/expression\s*\(/gi, '')
        // Remove import statements
        .replace(/@import/gi, '')
        // Remove HTML comments that might contain scripts
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove potential XSS vectors
        .replace(/&lt;script/gi, '')
        .replace(/&lt;\/script/gi, '')
        // Limit string length to prevent DoS
        .substring(0, 10000);
}
/**
 * Sanitize query parameters with enhanced protection
 */
function sanitizeQueryParams(query) {
    const sanitized = {};
    for (const key in query) {
        if (Object.prototype.hasOwnProperty.call(query, key)) {
            const sanitizedKey = sanitizeString(key);
            if (typeof query[key] === 'string') {
                sanitized[sanitizedKey] = sanitizeString(query[key]);
            }
            else if (Array.isArray(query[key])) {
                sanitized[sanitizedKey] = query[key].map(item => typeof item === 'string' ? sanitizeString(item) : item);
            }
            else {
                sanitized[sanitizedKey] = query[key];
            }
        }
    }
    return sanitized;
}
/**
 * Check for suspicious patterns in URLs and content
 */
function containsSuspiciousPatterns(url) {
    const suspiciousPatterns = [
        // SQL injection patterns
        /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
        // Path traversal
        /\.\.[\/\\]/,
        // Command injection
        /[;&|`$(){}[\]]/,
        // XSS patterns
        /<script|javascript:|vbscript:|onload=|onerror=/i,
        // Null bytes
        /\x00/,
        // Excessive length (potential DoS)
        /.{2000,}/,
    ];
    return suspiciousPatterns.some(pattern => pattern.test(url));
}
/**
 * Validate and sanitize HTTP headers
 */
function validateHeaders(req) {
    const dangerousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
    // Remove potentially dangerous headers
    dangerousHeaders.forEach(header => {
        if (req.headers[header]) {
            delete req.headers[header];
        }
    });
    // Validate User-Agent length
    const userAgent = req.get('User-Agent');
    if (userAgent && userAgent.length > 500) {
        req.headers['user-agent'] = userAgent.substring(0, 500);
    }
    // Validate Referer header
    const referer = req.get('Referer');
    if (referer && referer.length > 1000) {
        req.headers['referer'] = referer.substring(0, 1000);
    }
}
// Export validation schemas for common use cases
exports.commonSchemas = {
    // UUID parameter validation
    uuidParam: {
        params: zod_1.z.object({
            id: zod_1.z.string().uuid('Invalid UUID format'),
        }),
    },
    // Pagination query validation
    paginationQuery: {
        query: zod_1.z.object({
            page: zod_1.z
                .string()
                .optional()
                .transform((val) => {
                if (!val)
                    return 1;
                const num = parseInt(val, 10);
                if (isNaN(num) || num < 1) {
                    throw new Error('Page must be a positive integer');
                }
                return num;
            }),
            limit: zod_1.z
                .string()
                .optional()
                .transform((val) => {
                if (!val)
                    return 10;
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
        query: zod_1.z.object({
            search: zod_1.z.string().optional(),
            sortBy: zod_1.z.string().optional(),
            sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc'),
        }),
    },
};
