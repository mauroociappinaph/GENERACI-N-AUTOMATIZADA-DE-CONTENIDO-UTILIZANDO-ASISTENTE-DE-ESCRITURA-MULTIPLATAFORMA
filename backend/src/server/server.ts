import { Application } from 'express';
import { config } from '../config';
import { database } from '../config/database';
import logger, { logError, logBusinessEvent } from '../utils/logger';

/**
 * Inicia el servidor con todas las configuraciones necesarias
 * Responsabilidad: Gestión del ciclo de vida del servidor
 */
export class Server {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * Inicia el servidor después de verificar la conexión a la base de datos
   */
  public async start(): Promise<void> {
    try {
      // Test database connection on startup
      logger.info('Testing database connection...');
      const isDbConnected = await database.testConnection();

      if (!isDbConnected) {
        logger.warn('Database connection failed, but server will start anyway');
      } else {
        logger.info('Database connection test successful');
        logBusinessEvent('DATABASE_CONNECTED', { port: config.port });
      }

      // Start the server
      this.app.listen(config.port, () => {
        logger.info('Server started successfully', {
          port: config.port,
          environment: process.env.NODE_ENV || 'development',
          endpoints: {
            health: `http://localhost:${config.port}/health`,
            dbHealth: `http://localhost:${config.port}/health/db`,
            api: `http://localhost:${config.port}/api`,
          },
        });

        logBusinessEvent('SERVER_STARTED', { port: config.port });
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logError(error as Error, 'Server.start');
      process.exit(1);
    }
  }

  /**
   * Configura el cierre graceful del servidor
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down server gracefully...`);
      logBusinessEvent('SERVER_SHUTDOWN_INITIATED', { signal });

      try {
        await database.close();
        logger.info('Database connection closed successfully');
        logBusinessEvent('SERVER_SHUTDOWN_COMPLETED', { signal });
        process.exit(0);
      } catch (error) {
        logError(error as Error, 'Server.shutdown', { signal });
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}
