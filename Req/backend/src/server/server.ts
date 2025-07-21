import { Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer } from 'https';
import { readFileSync } from 'fs';
import { config } from '../config';
import { validateSecurityConfig } from '../config/security';
import { database } from '../config/database';
import { initializeSocketService } from '../services/socket.service';
import { cacheService } from '../services/cache.service';
import { cleanupSecurityData } from '../middleware/security';
import { ScheduledAuditService } from '../services/scheduled-audit.service';
import logger, { logError, logBusinessEvent } from '../utils/logger';

/**
 * Inicia el servidor con todas las configuraciones necesarias
 * Responsabilidad: Gestión del ciclo de vida del servidor
 */
export class Server {
  private app: Application;
  private httpServer: HttpServer;
  private httpsServer?: HttpsServer;
  private securityCleanupInterval?: NodeJS.Timeout;

  constructor(app: Application) {
    this.app = app;
    this.httpServer = createServer(app);

    // Create HTTPS server if certificates are available
    if (this.shouldUseHttps()) {
      try {
        const httpsOptions = this.getHttpsOptions();
        this.httpsServer = createHttpsServer(httpsOptions, app);
        console.log('🔒 HTTPS server configured');
      } catch (error) {
        console.warn('⚠️  HTTPS configuration failed, falling back to HTTP:', error);
      }
    }
  }

  /**
   * Inicia el servidor después de verificar la conexión a la base de datos
   */
  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting server...');

      // Validate security configuration first
      console.log('🔐 Validating security configuration...');
      if (!validateSecurityConfig()) {
        console.error('❌ Security configuration validation failed');
        process.exit(1);
      }
      console.log('✅ Security configuration validated');

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
        console.log(`🎉 HTTP Server started successfully on port ${config.port}`);
        console.log(`📍 Health check: http://localhost:${config.port}/health`);
        console.log(`📍 API: http://localhost:${config.port}/api`);
        console.log(`📍 WebSocket: ws://localhost:${config.port}`);

        logger.info('HTTP Server started successfully', {
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

      // Start HTTPS server if configured
      if (this.httpsServer) {
        const httpsPort = parseInt(process.env.HTTPS_PORT || '3443');
        console.log(`🔒 Starting HTTPS server on port ${httpsPort}...`);

        this.httpsServer.listen(httpsPort, () => {
          console.log(`🎉 HTTPS Server started successfully on port ${httpsPort}`);
          console.log(`📍 Secure API: https://localhost:${httpsPort}/api`);

          logger.info('HTTPS Server started successfully', {
            port: httpsPort,
            environment: process.env.NODE_ENV || 'development',
          });

          logBusinessEvent('HTTPS_SERVER_STARTED', { port: httpsPort });
        });

        // Initialize Socket.IO on HTTPS server as well
        initializeSocketService(this.httpsServer);
      }

      // Setup security cleanup interval
      this.setupSecurityCleanup();

      // Start scheduled audit jobs
      console.log('🕐 Starting scheduled audit jobs...');
      ScheduledAuditService.startScheduledJobs();
      console.log('✅ Scheduled audit jobs started');

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
        // Stop scheduled audit jobs
        ScheduledAuditService.stopScheduledJobs();

        // Clear security cleanup interval
        if (this.securityCleanupInterval) {
          clearInterval(this.securityCleanupInterval);
        }

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

  /**
   * Determina si se debe usar HTTPS basado en la configuración
   */
  private shouldUseHttps(): boolean {
    return config.nodeEnv === 'production' &&
           !!process.env.SSL_CERT_PATH &&
           !!process.env.SSL_KEY_PATH;
  }

  /**
   * Obtiene las opciones de configuración para HTTPS
   */
  private getHttpsOptions() {
    const certPath = process.env.SSL_CERT_PATH;
    const keyPath = process.env.SSL_KEY_PATH;
    const caPath = process.env.SSL_CA_PATH;

    if (!certPath || !keyPath) {
      throw new Error('SSL certificate and key paths are required for HTTPS');
    }

    const options: any = {
      cert: readFileSync(certPath),
      key: readFileSync(keyPath),
    };

    // Add CA certificate if provided (for self-signed certificates)
    if (caPath) {
      options.ca = readFileSync(caPath);
    }

    return options;
  }

  /**
   * Configura la limpieza periódica de datos de seguridad
   */
  private setupSecurityCleanup(): void {
    // Run security cleanup every hour
    this.securityCleanupInterval = setInterval(() => {
      try {
        cleanupSecurityData();
        logger.info('Security data cleanup completed');
      } catch (error) {
        logger.error('Security data cleanup failed', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    console.log('🧹 Security cleanup scheduled (every hour)');
  }
}
