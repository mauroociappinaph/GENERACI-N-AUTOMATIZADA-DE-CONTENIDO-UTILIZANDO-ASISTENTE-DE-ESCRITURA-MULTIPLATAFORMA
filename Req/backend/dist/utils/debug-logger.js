"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLoggingMiddleware = exports.DebugLogger = void 0;
exports.LogMethod = LogMethod;
exports.createComponentLogger = createComponentLogger;
const winston_1 = require("winston");
/**
 * Sistema de logging avanzado con debugging por componente
 * Updated: 2025-07-21 - Testing hook system
 */
class DebugLogger {
    constructor() {
        this.componentLevels = new Map();
        this.logger = (0, winston_1.createLogger)({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.json(), winston_1.format.printf(({ timestamp, level, message, component, ...meta }) => {
                const componentInfo = component ? `[${component}]` : '';
                const metaInfo = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
                return `${timestamp} ${level.toUpperCase()} ${componentInfo} ${message} ${metaInfo}`;
            })),
            transports: [
                new winston_1.transports.Console({
                    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
                }),
                new winston_1.transports.File({
                    filename: 'logs/debug.log',
                    level: 'debug'
                }),
                new winston_1.transports.File({
                    filename: 'logs/error.log',
                    level: 'error'
                })
            ]
        });
    }
    static getInstance() {
        if (!DebugLogger.instance) {
            DebugLogger.instance = new DebugLogger();
        }
        return DebugLogger.instance;
    }
    /**
     * Configura el nivel de logging para un componente específico
     */
    setComponentLevel(component, level) {
        this.componentLevels.set(component, level);
    }
    /**
     * Log de debug para un componente específico
     */
    debug(component, message, meta) {
        const level = this.componentLevels.get(component) || 'info';
        if (this.shouldLog('debug', level)) {
            this.logger.debug(message, { component, ...meta });
        }
    }
    /**
     * Log de información para un componente específico
     */
    info(component, message, meta) {
        const level = this.componentLevels.get(component) || 'info';
        if (this.shouldLog('info', level)) {
            this.logger.info(message, { component, ...meta });
        }
    }
    /**
     * Log de advertencia para un componente específico
     */
    warn(component, message, meta) {
        const level = this.componentLevels.get(component) || 'info';
        if (this.shouldLog('warn', level)) {
            this.logger.warn(message, { component, ...meta });
        }
    }
    /**
     * Log de error para un componente específico
     */
    error(component, message, error, meta) {
        const level = this.componentLevels.get(component) || 'info';
        if (this.shouldLog('error', level)) {
            this.logger.error(message, {
                component,
                error: error?.message,
                stack: error?.stack,
                ...meta
            });
        }
    }
    /**
     * Log de rendimiento para un componente específico
     */
    performance(component, operation, duration, meta) {
        const level = this.componentLevels.get(component) || 'info';
        if (this.shouldLog('info', level)) {
            this.logger.info(`Performance: ${operation} completed in ${duration}ms`, {
                component,
                operation,
                duration,
                type: 'performance',
                ...meta
            });
        }
    }
    /**
     * Log de request HTTP
     */
    httpRequest(req, res, duration) {
        const meta = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            duration: duration ? `${duration}ms` : undefined
        };
        this.logger.info(`HTTP ${req.method} ${req.url} - ${res.statusCode}`, {
            component: 'HTTP',
            type: 'request',
            ...meta
        });
    }
    /**
     * Log de query de base de datos
     */
    dbQuery(query, duration, params) {
        this.logger.debug(`DB Query executed in ${duration}ms`, {
            component: 'DATABASE',
            type: 'query',
            query,
            duration,
            params
        });
    }
    /**
     * Log de operación de IA
     */
    aiOperation(provider, operation, duration, tokens, cost) {
        this.logger.info(`AI Operation: ${provider} ${operation} completed`, {
            component: 'AI',
            type: 'ai_operation',
            provider,
            operation,
            duration,
            tokens,
            cost
        });
    }
    shouldLog(messageLevel, componentLevel) {
        const levels = ['debug', 'info', 'warn', 'error'];
        const messageLevelIndex = levels.indexOf(messageLevel);
        const componentLevelIndex = levels.indexOf(componentLevel);
        return messageLevelIndex >= componentLevelIndex;
    }
}
exports.DebugLogger = DebugLogger;
/**
 * Middleware para logging automático de requests HTTP
 */
const httpLoggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const logger = DebugLogger.getInstance();
    // Log del request entrante
    logger.debug('HTTP', `Incoming ${req.method} ${req.url}`, {
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
    });
    // Override del método end para capturar la respuesta
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime;
        logger.httpRequest(req, res, duration);
        originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.httpLoggingMiddleware = httpLoggingMiddleware;
/**
 * Decorator para logging automático de métodos
 */
function LogMethod(component) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        const logger = DebugLogger.getInstance();
        descriptor.value = async function (...args) {
            const startTime = Date.now();
            const methodName = `${target.constructor.name}.${propertyName}`;
            logger.debug(component, `Starting ${methodName}`, { args });
            try {
                const result = await method.apply(this, args);
                const duration = Date.now() - startTime;
                logger.performance(component, methodName, duration, {
                    success: true,
                    resultType: typeof result
                });
                return result;
            }
            catch (error) {
                const duration = Date.now() - startTime;
                logger.error(component, `Error in ${methodName}`, error, {
                    duration,
                    args
                });
                throw error;
            }
        };
        return descriptor;
    };
}
/**
 * Función helper para crear loggers específicos por componente
 */
function createComponentLogger(component) {
    const logger = DebugLogger.getInstance();
    return {
        debug: (message, meta) => logger.debug(component, message, meta),
        info: (message, meta) => logger.info(component, message, meta),
        warn: (message, meta) => logger.warn(component, message, meta),
        error: (message, error, meta) => logger.error(component, message, error, meta),
        performance: (operation, duration, meta) => logger.performance(component, operation, duration, meta)
    };
}
exports.default = DebugLogger;
