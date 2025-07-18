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
import { generalLimiter, authLimiter } from './rate-limiting';

/**
 * Configura todos los middlewares de la aplicación
 * Responsabilidad: Configuración centralizada de middlewares
 */
export const setupMiddleware = (app: Application): void => {
  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(cors(config.cors));

  // Rate limiting - apply auth limiter to auth endpoints first
  app.use('/api/auth', authLimiter);

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
export { authLimiter } from './rate-limiting';
export {
  auditMiddleware,
  auditPresets,
  auditUnauthorizedAccess,
  auditSuspiciousActivity,
} from './audit.middleware';
