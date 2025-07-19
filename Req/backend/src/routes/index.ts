import { Application, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes';
import dataRecordRoutes from './data-record.routes';
import dashboardRoutes from './dashboard.routes';
import { notificationRoutes } from './notification.routes';
import reportRoutes from './report.routes';
import systemConfigRoutes from './system-config.routes';
import externalApiRoutes from './external-api.routes';

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
        dataRecords: '/api/data-records',
        dashboard: '/api/dashboard',
        notifications: '/api/notifications',
        reports: '/api/reports',
        systemConfig: '/api/system-config',
        externalApi: '/api/external-api',
      },
    });
  });

  // Health check routes
  app.use('/health', healthRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/data-records', dataRecordRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/system-config', systemConfigRoutes);
  app.use('/api/external-api', externalApiRoutes);
};
