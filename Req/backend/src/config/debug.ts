import DebugLogger from '../utils/debug-logger';
import ErrorTracker from '../utils/error-tracker';

/**
 * Configuración centralizada del sistema de debugging
 */
export class DebugConfig {
  private static instance: DebugConfig;
  private logger: DebugLogger;
  private errorTracker: ErrorTracker;

  private constructor() {
    this.logger = DebugLogger.getInstance();
    this.errorTracker = ErrorTracker.getInstance();
    this.setupDefaultConfiguration();
  }

  public static getInstance(): DebugConfig {
    if (!DebugConfig.instance) {
      DebugConfig.instance = new DebugConfig();
    }
    return DebugConfig.instance;
  }

  /**
   * Configuración por defecto del sistema de debugging
   */
  private setupDefaultConfiguration(): void {
    // Configurar niveles de logging por componente
    const logLevels = {
      'HTTP': process.env.LOG_LEVEL_HTTP || 'info',
      'DATABASE': process.env.LOG_LEVEL_DB || 'warn',
      'AUTH': process.env.LOG_LEVEL_AUTH || 'info',
      'AI': process.env.LOG_LEVEL_AI || 'info',
      'SOCIAL_MEDIA': process.env.LOG_LEVEL_SOCIAL || 'info',
      'VALIDATION': process.env.LOG_LEVEL_VALIDATION || 'warn',
      'CACHE': process.env.LOG_LEVEL_CACHE || 'warn',
      'NOTIFICATION': process.env.LOG_LEVEL_NOTIFICATION || 'info',
      'REPORT': process.env.LOG_LEVEL_REPORT || 'info',
      'AUDIT': process.env.LOG_LEVEL_AUDIT || 'info',
      'ERROR_TRACKER': process.env.LOG_LEVEL_ERROR_TRACKER || 'info'
    };

    // Aplicar configuración de logging
    Object.entries(logLevels).forEach(([component, level]) => {
      this.logger.setComponentLevel(component, level);
    });

    // Configurar circuit breakers
    this.setupCircuitBreakers();

    // Configurar listeners de eventos críticos
    this.setupCriticalEventListeners();

    console.log('Debug system initialized with configuration:', {
      logLevels,
      environment: process.env.NODE_ENV,
      debugMode: process.env.DEBUG_MODE === 'true'
    });
  }

  /**
   * Configurar circuit breakers para componentes críticos
   */
  private setupCircuitBreakers(): void {
    // Circuit breaker para base de datos
    this.errorTracker.setupCircuitBreaker('DATABASE', {
      failureThreshold: 5,
      timeout: 30000, // 30 segundos
      successThreshold: 3
    });

    // Circuit breaker para APIs externas
    this.errorTracker.setupCircuitBreaker('EXTERNAL_API', {
      failureThreshold: 3,
      timeout: 60000, // 1 minuto
      successThreshold: 2
    });

    // Circuit breaker para servicios de IA
    this.errorTracker.setupCircuitBreaker('AI_SERVICE', {
      failureThreshold: 5,
      timeout: 120000, // 2 minutos
      successThreshold: 3
    });

    // Circuit breaker para redes sociales
    this.errorTracker.setupCircuitBreaker('SOCIAL_MEDIA', {
      failureThreshold: 3,
      timeout: 300000, // 5 minutos
      successThreshold: 2
    });
  }

  /**
   * Configurar listeners para eventos críticos
   */
  private setupCriticalEventListeners(): void {
    // Listener para patrones críticos de error
    this.errorTracker.on('critical_pattern', (pattern) => {
      this.logger.error('SYSTEM', 'Critical error pattern detected', undefined, {
        pattern,
        timestamp: new Date().toISOString()
      });

      // Enviar notificación si está configurado
      if (process.env.CRITICAL_ERROR_WEBHOOK) {
        this.sendCriticalErrorNotification(pattern);
      }
    });

    // Listener para múltiples patrones críticos
    this.errorTracker.on('critical_patterns_detected', (patterns) => {
      this.logger.error('SYSTEM', 'Multiple critical error patterns detected', undefined, {
        patternCount: patterns.length,
        patterns,
        timestamp: new Date().toISOString()
      });
    });

    // Listener para errores individuales
    this.errorTracker.on('error', (errorEvent) => {
      if (errorEvent.count >= 10) {
        this.logger.warn('SYSTEM', 'High frequency error detected', undefined, {
          error: errorEvent.error.message,
          context: errorEvent.context,
          count: errorEvent.count
        });
      }
    });
  }

  /**
   * Enviar notificación de error crítico
   */
  private async sendCriticalErrorNotification(pattern: any): Promise<void> {
    try {
      const webhookUrl = process.env.CRITICAL_ERROR_WEBHOOK;
      if (!webhookUrl) return;

      const payload = {
        text: `🚨 Critical Error Pattern Detected`,
        attachments: [{
          color: 'danger',
          fields: [
            {
              title: 'Component',
              value: pattern.component,
              short: true
            },
            {
              title: 'Error Type',
              value: pattern.errorType,
              short: true
            },
            {
              title: 'Frequency',
              value: pattern.frequency.toString(),
              short: true
            },
            {
              title: 'Severity',
              value: pattern.severity,
              short: true
            },
            {
              title: 'Message',
              value: pattern.message,
              short: false
            }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        this.logger.error('SYSTEM', 'Failed to send critical error notification', undefined, {
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      this.logger.error('SYSTEM', 'Error sending critical error notification', error as Error);
    }
  }

  /**
   * Obtener estadísticas del sistema de debugging
   */
  public getDebugStats(): DebugStats {
    const errorStats = this.errorTracker.getErrorStats();
    const recommendations = this.errorTracker.getErrorPreventionRecommendations();

    return {
      errorStats,
      recommendations,
      circuitBreakers: this.getCircuitBreakerStatus(),
      systemHealth: this.calculateSystemHealth(errorStats, recommendations)
    };
  }

  /**
   * Obtener estado de los circuit breakers
   */
  private getCircuitBreakerStatus(): Record<string, any> {
    const components = ['DATABASE', 'EXTERNAL_API', 'AI_SERVICE', 'SOCIAL_MEDIA'];
    const status: Record<string, any> = {};

    components.forEach(component => {
      status[component] = {
        available: this.errorTracker.isComponentAvailable(component),
        // Note: No podemos acceder al estado interno del circuit breaker desde aquí
        // En una implementación real, necesitaríamos exponer estos métodos
      };
    });

    return status;
  }

  /**
   * Calcular salud general del sistema
   */
  private calculateSystemHealth(errorStats: any, recommendations: any[]): SystemHealth {
    const criticalRecommendations = recommendations.filter(r => r.severity === 'critical');
    const highRecommendations = recommendations.filter(r => r.severity === 'high');

    if (criticalRecommendations.length > 0) {
      return {
        status: 'critical',
        score: 25,
        issues: criticalRecommendations.length,
        message: 'System has critical issues that need immediate attention'
      };
    }

    if (highRecommendations.length > 2) {
      return {
        status: 'warning',
        score: 60,
        issues: highRecommendations.length,
        message: 'System has multiple high-priority issues'
      };
    }

    if (errorStats.totalErrors > 100) {
      return {
        status: 'warning',
        score: 70,
        issues: errorStats.totalErrors,
        message: 'High error count detected'
      };
    }

    return {
      status: 'healthy',
      score: 95,
      issues: 0,
      message: 'System is operating normally'
    };
  }

  /**
   * Configurar debugging para desarrollo
   */
  public enableDevelopmentMode(): void {
    // Habilitar logging detallado en desarrollo
    const components = ['HTTP', 'DATABASE', 'AUTH', 'AI', 'SOCIAL_MEDIA', 'VALIDATION', 'CACHE'];
    components.forEach(component => {
      this.logger.setComponentLevel(component, 'debug');
    });

    this.logger.info('SYSTEM', 'Development debugging mode enabled');
  }

  /**
   * Configurar debugging para producción
   */
  public enableProductionMode(): void {
    // Configuración más restrictiva para producción
    const components = ['HTTP', 'DATABASE', 'AUTH', 'AI', 'SOCIAL_MEDIA', 'VALIDATION', 'CACHE'];
    components.forEach(component => {
      this.logger.setComponentLevel(component, 'warn');
    });

    this.logger.info('SYSTEM', 'Production debugging mode enabled');
  }
}

// Interfaces
interface DebugStats {
  errorStats: any;
  recommendations: any[];
  circuitBreakers: Record<string, any>;
  systemHealth: SystemHealth;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: number;
  message: string;
}

// Inicializar configuración de debugging
export const debugConfig = DebugConfig.getInstance();

// Configurar modo según el entorno
if (process.env.NODE_ENV === 'development') {
  debugConfig.enableDevelopmentMode();
} else {
  debugConfig.enableProductionMode();
}

export default debugConfig;
