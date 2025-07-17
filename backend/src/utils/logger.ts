import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Configuración de colores para consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuración de transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
  }),

  // Error logs - archivo diario rotativo
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),

  // Combined logs - archivo diario rotativo
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Crear logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Función para logging de requests HTTP
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.error(message);
    } else {
      logger.http(message);
    }
  });

  next();
};

// Función para logging de errores con contexto
export const logError = (error: Error, context?: string, metadata?: any) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context: context || 'Unknown',
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  logger.error('Application Error', errorInfo);
};

// Función para logging de eventos de negocio
export const logBusinessEvent = (event: string, data?: any, userId?: string) => {
  logger.info('Business Event', {
    event,
    userId,
    data,
    timestamp: new Date().toISOString(),
  });
};

// Función para logging de performance
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger.log(level, 'Performance', {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

export default logger;
