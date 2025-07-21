"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const http_1 = require("http");
const https_1 = require("https");
const fs_1 = require("fs");
const config_1 = require("../config");
const security_1 = require("../config/security");
const database_1 = require("../config/database");
const socket_service_1 = require("../services/socket.service");
const cache_service_1 = require("../services/cache.service");
const security_2 = require("../middleware/security");
const scheduled_audit_service_1 = require("../services/scheduled-audit.service");
const logger_1 = __importStar(require("../utils/logger"));
/**
 * Inicia el servidor con todas las configuraciones necesarias
 * Responsabilidad: Gestión del ciclo de vida del servidor
 */
class Server {
    constructor(app) {
        this.app = app;
        this.httpServer = (0, http_1.createServer)(app);
        // Create HTTPS server if certificates are available
        if (this.shouldUseHttps()) {
            try {
                const httpsOptions = this.getHttpsOptions();
                this.httpsServer = (0, https_1.createServer)(httpsOptions, app);
                console.log('🔒 HTTPS server configured');
            }
            catch (error) {
                console.warn('⚠️  HTTPS configuration failed, falling back to HTTP:', error);
            }
        }
    }
    /**
     * Inicia el servidor después de verificar la conexión a la base de datos
     */
    async start() {
        try {
            console.log('🚀 Starting server...');
            // Validate security configuration first
            console.log('🔐 Validating security configuration...');
            if (!(0, security_1.validateSecurityConfig)()) {
                console.error('❌ Security configuration validation failed');
                process.exit(1);
            }
            console.log('✅ Security configuration validated');
            // Test database connection on startup
            logger_1.default.info('Testing database connection...');
            console.log('📊 Testing database connection...');
            const isDbConnected = await database_1.database.testConnection();
            if (!isDbConnected) {
                logger_1.default.warn('Database connection failed, but server will start anyway');
                console.log('⚠️  Database connection failed, but server will start anyway');
            }
            else {
                logger_1.default.info('Database connection test successful');
                console.log('✅ Database connection test successful');
                (0, logger_1.logBusinessEvent)('DATABASE_CONNECTED', { port: config_1.config.port });
            }
            // Initialize Cache service
            console.log('🗄️  Initializing Cache service...');
            try {
                await cache_service_1.cacheService.connect();
                logger_1.default.info('Cache service initialized successfully');
                console.log('✅ Cache service initialized successfully');
            }
            catch (error) {
                logger_1.default.warn('Cache service initialization failed, continuing without cache', error);
                console.log('⚠️  Cache service initialization failed, continuing without cache');
            }
            // Initialize Socket.IO service
            console.log('🔌 Initializing Socket.IO service...');
            (0, socket_service_1.initializeSocketService)(this.httpServer);
            logger_1.default.info('Socket.IO service initialized');
            console.log('✅ Socket.IO service initialized');
            // Start the HTTP server
            console.log(`🌐 Starting HTTP server on port ${config_1.config.port}...`);
            this.httpServer.listen(config_1.config.port, () => {
                console.log(`🎉 HTTP Server started successfully on port ${config_1.config.port}`);
                console.log(`📍 Health check: http://localhost:${config_1.config.port}/health`);
                console.log(`📍 API: http://localhost:${config_1.config.port}/api`);
                console.log(`📍 WebSocket: ws://localhost:${config_1.config.port}`);
                logger_1.default.info('HTTP Server started successfully', {
                    port: config_1.config.port,
                    environment: process.env.NODE_ENV || 'development',
                    endpoints: {
                        health: `http://localhost:${config_1.config.port}/health`,
                        dbHealth: `http://localhost:${config_1.config.port}/health/db`,
                        api: `http://localhost:${config_1.config.port}/api`,
                        notifications: `http://localhost:${config_1.config.port}/api/notifications`,
                        websocket: `ws://localhost:${config_1.config.port}`,
                    },
                });
                (0, logger_1.logBusinessEvent)('SERVER_STARTED', { port: config_1.config.port });
            });
            // Start HTTPS server if configured
            if (this.httpsServer) {
                const httpsPort = parseInt(process.env.HTTPS_PORT || '3443');
                console.log(`🔒 Starting HTTPS server on port ${httpsPort}...`);
                this.httpsServer.listen(httpsPort, () => {
                    console.log(`🎉 HTTPS Server started successfully on port ${httpsPort}`);
                    console.log(`📍 Secure API: https://localhost:${httpsPort}/api`);
                    logger_1.default.info('HTTPS Server started successfully', {
                        port: httpsPort,
                        environment: process.env.NODE_ENV || 'development',
                    });
                    (0, logger_1.logBusinessEvent)('HTTPS_SERVER_STARTED', { port: httpsPort });
                });
                // Initialize Socket.IO on HTTPS server as well
                (0, socket_service_1.initializeSocketService)(this.httpsServer);
            }
            // Setup security cleanup interval
            this.setupSecurityCleanup();
            // Start scheduled audit jobs
            console.log('🕐 Starting scheduled audit jobs...');
            scheduled_audit_service_1.ScheduledAuditService.startScheduledJobs();
            console.log('✅ Scheduled audit jobs started');
            // Setup graceful shutdown
            this.setupGracefulShutdown();
            console.log('✅ Graceful shutdown handlers configured');
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            (0, logger_1.logError)(error, 'Server.start');
            process.exit(1);
        }
    }
    /**
     * Configura el cierre graceful del servidor
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            logger_1.default.info(`Received ${signal}. Shutting down server gracefully...`);
            (0, logger_1.logBusinessEvent)('SERVER_SHUTDOWN_INITIATED', { signal });
            try {
                // Stop scheduled audit jobs
                scheduled_audit_service_1.ScheduledAuditService.stopScheduledJobs();
                // Clear security cleanup interval
                if (this.securityCleanupInterval) {
                    clearInterval(this.securityCleanupInterval);
                }
                await cache_service_1.cacheService.disconnect();
                logger_1.default.info('Cache service disconnected successfully');
                await database_1.database.close();
                logger_1.default.info('Database connection closed successfully');
                (0, logger_1.logBusinessEvent)('SERVER_SHUTDOWN_COMPLETED', { signal });
                process.exit(0);
            }
            catch (error) {
                (0, logger_1.logError)(error, 'Server.shutdown', { signal });
                process.exit(1);
            }
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
    /**
     * Determina si se debe usar HTTPS basado en la configuración
     */
    shouldUseHttps() {
        return config_1.config.nodeEnv === 'production' &&
            !!process.env.SSL_CERT_PATH &&
            !!process.env.SSL_KEY_PATH;
    }
    /**
     * Obtiene las opciones de configuración para HTTPS
     */
    getHttpsOptions() {
        const certPath = process.env.SSL_CERT_PATH;
        const keyPath = process.env.SSL_KEY_PATH;
        const caPath = process.env.SSL_CA_PATH;
        if (!certPath || !keyPath) {
            throw new Error('SSL certificate and key paths are required for HTTPS');
        }
        const options = {
            cert: (0, fs_1.readFileSync)(certPath),
            key: (0, fs_1.readFileSync)(keyPath),
        };
        // Add CA certificate if provided (for self-signed certificates)
        if (caPath) {
            options.ca = (0, fs_1.readFileSync)(caPath);
        }
        return options;
    }
    /**
     * Configura la limpieza periódica de datos de seguridad
     */
    setupSecurityCleanup() {
        // Run security cleanup every hour
        this.securityCleanupInterval = setInterval(() => {
            try {
                (0, security_2.cleanupSecurityData)();
                logger_1.default.info('Security data cleanup completed');
            }
            catch (error) {
                logger_1.default.error('Security data cleanup failed', error);
            }
        }, 60 * 60 * 1000); // 1 hour
        console.log('🧹 Security cleanup scheduled (every hour)');
    }
}
exports.Server = Server;
