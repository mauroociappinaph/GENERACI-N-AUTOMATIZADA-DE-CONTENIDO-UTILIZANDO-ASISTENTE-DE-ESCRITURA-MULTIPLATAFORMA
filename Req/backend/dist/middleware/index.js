"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unblockIP = exports.blockIP = exports.getSecurityStats = exports.cleanupSecurityData = exports.requestFingerprinting = exports.suspiciousActivityDetection = exports.ipBlockingMiddleware = exports.auditSuspiciousActivity = exports.auditUnauthorizedAccess = exports.auditPresets = exports.auditMiddleware = exports.failedLoginLimiter = exports.reportLimiter = exports.sensitiveDataLimiter = exports.adminLimiter = exports.authLimiter = exports.requestValidator = exports.errorHandler = exports.setupMiddleware = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const error_handler_1 = require("./error-handler");
const validation_1 = require("./validation");
const rate_limiting_1 = require("./rate-limiting");
const cors_debug_1 = require("./cors-debug");
const security_1 = require("./security");
/**
 * Configura todos los middlewares de la aplicación
 * Responsabilidad: Configuración centralizada de middlewares
 */
const setupMiddleware = (app) => {
    // Trust proxy for rate limiting behind reverse proxy
    app.set('trust proxy', 1);
    // Enhanced security middleware with comprehensive headers
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
                connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
                mediaSrc: ["'self'"],
                objectSrc: ["'none'"],
                childSrc: ["'self'"],
                frameSrc: ["'none'"],
                workerSrc: ["'self'"],
                manifestSrc: ["'self'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
                upgradeInsecureRequests: config_1.config.nodeEnv === 'production' ? [] : null,
            },
            reportOnly: config_1.config.nodeEnv === 'development',
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        },
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: false,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true,
    }));
    // Additional security headers
    app.use((req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY');
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        // Enable XSS protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        // Prevent information disclosure
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');
        // Cache control for sensitive endpoints
        if (req.path.includes('/api/auth') || req.path.includes('/api/admin')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
        // Security headers for API responses
        if (req.path.startsWith('/api/')) {
            res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
        }
        next();
    });
    // Advanced security middleware - apply early in the chain
    app.use(security_1.ipBlockingMiddleware);
    app.use(security_1.suspiciousActivityDetection);
    app.use(security_1.requestFingerprinting);
    // CORS debug middleware (development only)
    if (config_1.config.nodeEnv === 'development') {
        app.use(cors_debug_1.corsDebugMiddleware);
    }
    // CORS configuration - must be before rate limiting to handle preflight requests
    app.use((0, cors_1.default)(config_1.config.cors));
    // Handle preflight requests explicitly
    app.options('*', (0, cors_1.default)(config_1.config.cors));
    // Rate limiting - apply specific limiters to different endpoints
    app.use('/api/auth/login', rate_limiting_1.failedLoginLimiter); // Most restrictive for login attempts
    app.use('/api/auth', rate_limiting_1.authLimiter); // General auth endpoints
    app.use('/api/admin', rate_limiting_1.adminLimiter); // Admin operations
    app.use('/api/reports', rate_limiting_1.reportLimiter); // Report generation
    app.use('/api/users/profile', rate_limiting_1.sensitiveDataLimiter); // Sensitive user data
    app.use('/api/data-records', rate_limiting_1.sensitiveDataLimiter); // Sensitive data records
    // General rate limiting for all other API endpoints
    app.use('/api', rate_limiting_1.generalLimiter);
    // HTTP request logging
    app.use(logger_1.httpLogger);
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Swagger documentation
    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Sistema de Gestión #040 API',
                version: '1.0.0',
                description: 'API documentation for Sistema de Gestión #040',
                contact: {
                    name: 'API Support',
                    email: 'support@sistema-gestion-040.com',
                },
            },
            servers: [
                {
                    url: `http://localhost:${config_1.config.port}`,
                    description: 'Development server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
    };
    const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Sistema de Gestión #040 API Documentation',
    }));
    // Make swagger spec available as JSON
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    // Request validation middleware (will be applied per route)
    app.use('/api', validation_1.requestValidator);
    // Error handling middleware (must be last)
    app.use(error_handler_1.errorHandler);
};
exports.setupMiddleware = setupMiddleware;
// Export individual middlewares for specific use
var error_handler_2 = require("./error-handler");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return error_handler_2.errorHandler; } });
var validation_2 = require("./validation");
Object.defineProperty(exports, "requestValidator", { enumerable: true, get: function () { return validation_2.requestValidator; } });
var rate_limiting_2 = require("./rate-limiting");
Object.defineProperty(exports, "authLimiter", { enumerable: true, get: function () { return rate_limiting_2.authLimiter; } });
Object.defineProperty(exports, "adminLimiter", { enumerable: true, get: function () { return rate_limiting_2.adminLimiter; } });
Object.defineProperty(exports, "sensitiveDataLimiter", { enumerable: true, get: function () { return rate_limiting_2.sensitiveDataLimiter; } });
Object.defineProperty(exports, "reportLimiter", { enumerable: true, get: function () { return rate_limiting_2.reportLimiter; } });
Object.defineProperty(exports, "failedLoginLimiter", { enumerable: true, get: function () { return rate_limiting_2.failedLoginLimiter; } });
var audit_middleware_1 = require("./audit.middleware");
Object.defineProperty(exports, "auditMiddleware", { enumerable: true, get: function () { return audit_middleware_1.auditMiddleware; } });
Object.defineProperty(exports, "auditPresets", { enumerable: true, get: function () { return audit_middleware_1.auditPresets; } });
Object.defineProperty(exports, "auditUnauthorizedAccess", { enumerable: true, get: function () { return audit_middleware_1.auditUnauthorizedAccess; } });
Object.defineProperty(exports, "auditSuspiciousActivity", { enumerable: true, get: function () { return audit_middleware_1.auditSuspiciousActivity; } });
var security_2 = require("./security");
Object.defineProperty(exports, "ipBlockingMiddleware", { enumerable: true, get: function () { return security_2.ipBlockingMiddleware; } });
Object.defineProperty(exports, "suspiciousActivityDetection", { enumerable: true, get: function () { return security_2.suspiciousActivityDetection; } });
Object.defineProperty(exports, "requestFingerprinting", { enumerable: true, get: function () { return security_2.requestFingerprinting; } });
Object.defineProperty(exports, "cleanupSecurityData", { enumerable: true, get: function () { return security_2.cleanupSecurityData; } });
Object.defineProperty(exports, "getSecurityStats", { enumerable: true, get: function () { return security_2.getSecurityStats; } });
Object.defineProperty(exports, "blockIP", { enumerable: true, get: function () { return security_2.blockIP; } });
Object.defineProperty(exports, "unblockIP", { enumerable: true, get: function () { return security_2.unblockIP; } });
