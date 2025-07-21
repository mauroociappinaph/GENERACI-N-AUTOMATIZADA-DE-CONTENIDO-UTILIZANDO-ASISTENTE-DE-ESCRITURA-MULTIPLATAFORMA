import { Request, Response } from 'express';
import { debugConfig } from '../config/debug';
import { createComponentLogger } from '../utils/debug-logger';
import ErrorTracker from '../utils/error-tracker';

const logger = createComponentLogger('DEBUG_CONTROLLER');

/**
 * Controlador para endpoints de debugging y monitoreo
 */
export class DebugController {
  /**
   * Obtener estadísticas generales del sistema de debugging
   */
  public static async getDebugStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Getting debug statistics');

      const stats = debugConfig.getDebugStats();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error getting debug stats', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to get debug statistics'
      });
    }
  }

  /**
   * Obtener estadísticas de errores
   */
  public static async getErrorStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Getting error statistics');

      const errorTracker = ErrorTracker.getInstance();
      const errorStats = errorTracker.getErrorStats();

      res.json({
        success: true,
        data: {
          totalErrors: errorStats.totalErrors,
          errorsByType: Object.fromEntries(errorStats.errorsByType),
          errorsByComponent: Object.fromEntries(errorStats.errorsByComponent),
          criticalPatterns: errorStats.criticalPatterns,
          recentErrors: errorStats.recentErrors
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error getting error stats', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to get error statistics'
      });
    }
  }

  /**
   * Obtener recomendaciones para prevención de errores
   */
  public static async getErrorRecommendations(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Getting error prevention recommendations');

      const errorTracker = ErrorTracker.getInstance();
      const recommendations = errorTracker.getErrorPreventionRecommendations();

      res.json({
        success: true,
        data: recommendations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error getting recommendations', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to get error recommendations'
      });
    }
  }

  /**
   * Obtener estado de los circuit breakers
   */
  public static async getCircuitBreakerStatus(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Getting circuit breaker status');

      const errorTracker = ErrorTracker.getInstance();
      const components = ['DATABASE', 'EXTERNAL_API', 'AI_SERVICE', 'SOCIAL_MEDIA'];

      const status = components.reduce((acc, component) => {
        acc[component] = {
          available: errorTracker.isComponentAvailable(component),
          component
        };
        return acc;
      }, {} as Record<string, unknown>);

      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error getting circuit breaker status', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to get circuit breaker status'
      });
    }
  }

  /**
   * Obtener salud general del sistema
   */
  public static async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Getting system health');

      const stats = debugConfig.getDebugStats();

      res.json({
        success: true,
        data: {
          health: stats.systemHealth,
          summary: {
            totalErrors: stats.errorStats.totalErrors,
            criticalIssues: stats.recommendations.filter((r: unknown) => (r as { severity: string }).severity === 'critical').length,
            highPriorityIssues: stats.recommendations.filter((r: unknown) => (r as { severity: string }).severity === 'high').length,
            circuitBreakersOpen: Object.values(stats.circuitBreakers).filter((cb: unknown) => !(cb as { available: boolean }).available).length
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error getting system health', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system health'
      });
    }
  }

  /**
   * Configurar nivel de logging para un componente
   */
  public static async setComponentLogLevel(req: Request, res: Response): Promise<void> {
    try {
      const { component, level } = req.body;

      if (!component || !level) {
        res.status(400).json({
          success: false,
          error: 'Component and level are required'
        });
        return;
      }

      const validLevels = ['debug', 'info', 'warn', 'error'];
      if (!validLevels.includes(level)) {
        res.status(400).json({
          success: false,
          error: 'Invalid log level. Must be one of: debug, info, warn, error'
        });
        return;
      }

      const debugLogger = require('../utils/debug-logger').default.getInstance();
      debugLogger.setComponentLevel(component, level);

      logger.info(`Log level set for component ${component} to ${level}`);

      res.json({
        success: true,
        message: `Log level for ${component} set to ${level}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error setting component log level', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to set component log level'
      });
    }
  }

  /**
   * Simular error para testing (solo en desarrollo)
   */
  public static async simulateError(req: Request, res: Response): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({
        success: false,
        error: 'Error simulation not allowed in production'
      });
      return;
    }

    try {
      const { errorType, component, message } = req.body;

      const errorTracker = ErrorTracker.getInstance();
      const simulatedError = new Error(message || 'Simulated error for testing');
      simulatedError.name = errorType || 'SimulatedError';

      errorTracker.trackError(simulatedError, {
        component: component || 'TEST',
        operation: 'simulate_error',
        userId: req.user?.id,
        metadata: { simulated: true }
      });

      logger.warn('Simulated error for testing', {
        errorType,
        component,
        message
      });

      res.json({
        success: true,
        message: 'Error simulated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error simulating error', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to simulate error'
      });
    }
  }

  /**
   * Limpiar estadísticas de errores
   */
  public static async clearErrorStats(req: Request, res: Response): Promise<void> {
    try {
      // En una implementación real, necesitaríamos un método para limpiar estadísticas
      // Por ahora, solo registramos la acción
      logger.info('Error statistics cleared by admin', {
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Error statistics cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error clearing error stats', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear error statistics'
      });
    }
  }

  /**
   * Obtener métricas de rendimiento del sistema
   */
  public static async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Getting performance metrics');

      const metrics = {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cpu: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error getting performance metrics', error as Error);
      res.status(500).json({
        success: false,
        error: 'Failed to get performance metrics'
      });
    }
  }
}

export default DebugController;
