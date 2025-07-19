import { Application } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '../config';
import { httpLogger } from '../utils/logger';
import { errorHandler } from './error-handler';
import { requestValidator } from './validation';
import {
  generalLimiter,
  authLimiter,
  adminLimiter,
  sensitiveDataLimiter,
  reportLimiter,
  failedLoginLimiter
} from './rate-limiting';
import { corsDebugMiddleware } from './cors-debug';
import {
  ipBlockingMiddleware,
  suspiciousActivityDetection,
  requestFingerprinting
} from './security';

/**
 * Configura todos los middlewares de la aplicación
 * Responsabilidad: Configuración centralizada de middlewares
 */
export const setupMiddleware = (app: Application): void => {
  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Enhanced security middleware with comprehensive headers
  app.use(
    helmet({
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
          upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null,
        },
        reportOnly: config.nodeEnv === 'development',
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
    })
  );

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
  app.use(ipBlockingMiddleware);
  app.use(suspiciousActivityDetection);
  app.use(requestFingerprinting);

  // CORS debug middleware (development only)
  if (config.nodeEnv === 'development') {
    app.use(corsDebugMiddleware);
  }

  // CORS configuration - must be before rate limiting to handle preflight requests
  app.use(cors(config.cors));

  // Handle preflight requests explicitly
  app.options('*', cors(config.cors));

  // Rate limiting - apply specific limiters to different endpoints
  app.use('/api/auth/login', failedLoginLimiter); // Most restrictive for login attempts
  app.use('/api/auth', authLimiter); // General auth endpoints
  app.use('/api/admin', adminLimiter); // Admin operations
  app.use('/api/reports', reportLimiter); // Report generation
  app.use('/api/users/profile', sensitiveDataLimiter); // Sensitive user data
  app.use('/api/data-records', sensitiveDataLimiter); // Sensitive data records

  // General rate limiting for all other API endpoints
  app.use('/api', generalLimiter);

  // HTTP request logging
  app.use(httpLogger);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
          url: `http://localhost:${config.port}`,
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

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Sistema de Gestión #040 API Documentation',
    })
  );

  // Make swagger spec available as JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Request validation middleware (will be applied per route)
  app.use('/api', requestValidator);

  // Error handling middleware (must be last)
  app.use(errorHandler);
};

// Export individual middlewares for specific use
export { errorHandler } from './error-handler';
export { requestValidator } from './validation';
export {
  authLimiter,
  adminLimiter,
  sensitiveDataLimiter,
  reportLimiter,
  failedLoginLimiter
} from './rate-limiting';
export {
  auditMiddleware,
  auditPresets,
  auditUnauthorizedAccess,
  auditSuspiciousActivity,
} from './audit.middleware';
export {
  ipBlockingMiddleware,
  suspiciousActivityDetection,
  requestFingerprinting,
  cleanupSecurityData,
  getSecurityStats,
  blockIP,
  unblockIP,
} from './security';
