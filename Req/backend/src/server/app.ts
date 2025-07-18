import express, { Application } from 'express';
import { setupMiddleware } from '../middleware';
import { setupRoutes } from '../routes';

/**
 * Crea y configura la aplicación Express
 * Responsabilidad: Configuración de la aplicación Express
 */
export const createApp = (): Application => {
  const app = express();

  // Setup middleware
  setupMiddleware(app);

  // Setup routes
  setupRoutes(app);

  return app;
};
