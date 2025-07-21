import { createLogger, format, transports } from 'winston';
import { Request, Response } from 'express';

/**
 * Sistema de logging avanzado con debugging por componente
 */
export class DebugLogger {
  private static instance: DebugLogger;
  private logger: ReturnType<typeof createLogger>;
  private componentLevels: Map<string, string> = new Map();

  private constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
        format.printf(({ timestamp, level, message, component, ...meta }) => {
          const componentInfo = component ? `[${component}]` : '';
          const metaInfo = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} ${level.toUpperCase()} ${componentInfo} ${message} ${metaInfo}`;
        })
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        new transports.File({
          filename: 'logs/debug.log',
          level: 'debug'
        }),
        new transports.File({
          filename: 'logs/error.log',
          level: 'error'
        })
      ]
    });
  }

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  /**
   * Configura el nivel de logging para un componente específico
   */
  public setComponentLevel(component: string, level: string): void {
    this.componentLevels.set(component, level);
  }

  /**
   * Log de debug para un componente específico
   */
  public debug(component: string, message: string, meta?: any): void {
    const level = this.componentLevels.get(component) || 'info';
    if (this.shouldLog('debug', level)) {
      this.logger.debug(message, { component, ...meta });
    }
  }

  /**
   * Log de información para un componente específico
   */
  public info(component: string, message: string, meta?: any): void {
    const level = this.componentLevels.get(component) || 'info';
    if (this.shouldLog('info', level)) {
      this.logger.info(message, { component, ...meta });
    }
  }

  /**
   * Log de advertencia para un componente específico
   */
  public warn(component: string, message: string, meta?: any): void {
    const level = this.componentLevels.get(component) || 'info';
    if (this.shouldLog('warn', level)) {
      this.logger.warn(message, { component, ...meta });
    }
  }

  /**
   * Log de error para un componente específico
   */
  public error(component: string, message: string, error?: Error, meta?: any): void {
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
  public performance(component: string, operation: string, duration: number, meta?: any): void {
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
  public httpRequest(req: Request, res: Response, duration?: number): void {
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
  public dbQuery(query: string, duration: number, params?: any): void {
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
  public aiOperation(provider: string, operation: string, duration: number, tokens?: number, cost?: number): void {
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

  private shouldLog(messageLevel: string, componentLevel: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const messageLevelIndex = levels.indexOf(messageLevel);
    const componentLevelIndex = levels.indexOf(componentLevel);
    return messageLevelIndex >= componentLevelIndex;
  }
}

/**
 * Middleware para logging automático de requests HTTP
 */
export const httpLoggingMiddleware = (req: Request, res: Response, next: Function) => {
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
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    logger.httpRequest(req, res, duration);
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Decorator para logging automático de métodos
 */
export function LogMethod(component: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const logger = DebugLogger.getInstance();

    descriptor.value = async function (...args: any[]) {
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
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.error(component, `Error in ${methodName}`, error as Error, {
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
export function createComponentLogger(component: string) {
  const logger = DebugLogger.getInstance();

  return {
    debug: (message: string, meta?: any) => logger.debug(component, message, meta),
    info: (message: string, meta?: any) => logger.info(component, message, meta),
    warn: (message: string, meta?: any) => logger.warn(component, message, meta),
    error: (message: string, error?: Error, meta?: any) => logger.error(component, message, error, meta),
    performance: (operation: string, duration: number, meta?: any) => logger.performance(component, operation, duration, meta)
  };
}

export default DebugLogger;
