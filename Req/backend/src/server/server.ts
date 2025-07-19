import { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { config } from '../config';
import { database } from '../config/database';
import { initializeSocketService } from '../services/socket.service';
import { cacheService } from '../services/cache.service';
import logger, { logError, logBusinessEvent } from '../utils/logger';

/**
 * Inicia el servidor con todas las configuraciones necesarias
 * Responsabilidad: Gestión del ciclo de vida del servidor
 */
export class Server {
  private app: Application;
  private httpServer: HttpServer;

  constructor(app: Application) {
    this.app = app;
    this.httpServer = createServer(app);
  }

  /**
   * Inicia el servidor después de verificar la conexión a la base de datos
   */
  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting server...');

      // Test database connection on startup
      logger.info('Testing database connection...');
      console.log('📊 Testing database connection...');

      const isDbConnected = await database.testConnection();

      if (!isDbConnected) {
        logger.warn('Database connection failed, but server will start anyway');
        console.log('⚠️  Database connection failed, but server will start anyway');
      } else {
        logger.info('Database connection test successful');
        console.log('✅ Database connection test successful');
        logBusinessEvent('DATABASE_CONNECTED', { port: config.port });
      }

      // Initialize Cache service
      console.log('🗄️  Initializing Cache service...');
      try {
        await cacheService.connect();
        logger.info('Cache service initialized successfully');
        console.log('✅ Cache service initialized successfully');
      } catch (error) {
        logger.warn('Cache service initialization failed, continuing without cache', error);
        console.log('⚠️  Cache service initialization failed, continuing without cache');
      }

      // Initialize Socket.IO service
      console.log('🔌 Initializing Socket.IO service...');
      initializeSocketService(this.httpServer);
      logger.info('Socket.IO service initialized');
      console.log('✅ Socket.IO service initialized');

      // Start the HTTP server
      console.log(`🌐 Starting HTTP server on port ${config.port}...`);
      this.httpServer.listen(config.port, () => {
        console.log(`🎉 Server started successfully on port ${config.port}`);
        console.log(`📍 Health check: http://localhost:${config.port}/health`);
        console.log(`📍 API: http://localhost:${config.port}/api`);
        console.log(`📍 WebSocket: ws://localhost:${config.port}`);

        logger.info('Server started successfully', {
          port: config.port,
          environment: process.env.NODE_ENV || 'development',
          endpoints: {
            health: `http://localhost:${config.port}/health`,
            dbHealth: `http://localhost:${config.port}/health/db`,
            api: `http://localhost:${config.port}/api`,
            notifications: `http://localhost:${config.port}/api/notifications`,
            websocket: `ws://localhost:${config.port}`,
          },
        });

        logBusinessEvent('SERVER_STARTED', { port: config.port });
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();
      console.log('✅ Graceful shutdown handlers configured');

    } catch (error) {
      console.error('❌ Failed to start server:', error);
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
        await cacheService.disconnect();
        logger.info('Cache service disconnected successfully');

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
