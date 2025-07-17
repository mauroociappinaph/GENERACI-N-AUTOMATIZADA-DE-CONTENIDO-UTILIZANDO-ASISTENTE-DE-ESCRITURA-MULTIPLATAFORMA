import { Application, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes';

/**
 * Configura todas las rutas de la aplicación
 * Responsabilidad: Configuración centralizada de rutas
 */
export const setupRoutes = (app: Application): void => {
  // Basic API info route
  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      message: 'Welcome to Sistema de Gestión #040 API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        users: '/api/users',
      },
    });
  });

  // Health check routes
  app.use('/health', healthRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
};
