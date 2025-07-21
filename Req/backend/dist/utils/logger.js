"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPerformance = exports.logBusinessEvent = exports.logError = exports.httpLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
// Configuración de colores para consola
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
// Formato personalizado para logs
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`));
// Formato para archivos (sin colores)
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Configuración de transports
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        format: logFormat,
    }),
    // Error logs - archivo diario rotativo
    new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '14d',
    }),
    // Combined logs - archivo diario rotativo
    new winston_daily_rotate_file_1.default({
        filename: path_1.default.join('logs', 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '14d',
    }),
];
// Crear logger
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: fileFormat,
    transports,
    exitOnError: false,
});
// Función para logging de requests HTTP
const httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
        if (res.statusCode >= 400) {
            logger.error(message);
        }
        else {
            logger.http(message);
        }
    });
    next();
};
exports.httpLogger = httpLogger;
// Función para logging de errores con contexto
const logError = (error, context, metadata) => {
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        context: context || 'Unknown',
        timestamp: new Date().toISOString(),
        ...metadata,
    };
    logger.error('Application Error', errorInfo);
};
exports.logError = logError;
// Función para logging de eventos de negocio
const logBusinessEvent = (event, data, userId) => {
    logger.info('Business Event', {
        event,
        userId,
        data,
        timestamp: new Date().toISOString(),
    });
};
exports.logBusinessEvent = logBusinessEvent;
// Función para logging de performance
const logPerformance = (operation, duration, metadata) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger.log(level, 'Performance', {
        operation,
        duration: `${duration}ms`,
        ...metadata,
    });
};
exports.logPerformance = logPerformance;
exports.default = logger;
