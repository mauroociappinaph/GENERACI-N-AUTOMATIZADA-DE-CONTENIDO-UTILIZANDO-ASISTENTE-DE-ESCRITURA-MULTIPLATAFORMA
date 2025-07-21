import { EventEmitter } from 'events';
import { createComponentLogger } from './debug-logger';

/**
 * Sistema de tracking y prevención de errores en tiempo real
 */
export class ErrorTracker extends EventEmitter {
  private static instance: ErrorTracker;
  private errorCounts: Map<string, number> = new Map();
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private logger = createComponentLogger('ERROR_TRACKER');

  private constructor() {
    super();
    this.setupErrorPatternDetection();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Registra un error y analiza patrones
   */
  public trackError(error: Error, context: ErrorContext): void {
    const errorKey = this.generateErrorKey(error, context);
    const currentCount = this.errorCounts.get(errorKey) || 0;

    this.errorCounts.set(errorKey, currentCount + 1);

    // Analizar patrones de error
    this.analyzeErrorPattern(error, context, currentCount + 1);

    // Emitir evento de error
    this.emit('error', {
      error,
      context,
      count: currentCount + 1,
      timestamp: new Date()
    });

    this.logger.error('Error tracked', error, {
      context,
      count: currentCount + 1,
      errorKey
    });
  }

  /**
   * Obtiene estadísticas de errores
   */
  public getErrorStats(): ErrorStats {
    const stats: ErrorStats = {
      totalErrors: 0,
      errorsByType: new Map(),
      errorsByComponent: new Map(),
      recentErrors: [],
      criticalPatterns: []
    };

    // Calcular estadísticas
    for (const [key, count] of this.errorCounts.entries()) {
      stats.totalErrors += count;

      const [type, component] = key.split('|');
      stats.errorsByType.set(type, (stats.errorsByType.get(type) || 0) + count);
      stats.errorsByComponent.set(component, (stats.errorsByComponent.get(component) || 0) + count);
    }

    // Obtener patrones críticos
    for (const [key, pattern] of this.errorPatterns.entries()) {
      if (pattern.severity === 'critical') {
        stats.criticalPatterns.push(pattern);
      }
    }

    return stats;
  }

  /**
   * Configura un circuit breaker para un componente
   */
  public setupCircuitBreaker(component: string, config: CircuitBreakerConfig): void {
    const circuitBreaker = new CircuitBreaker(component, config);
    this.circuitBreakers.set(component, circuitBreaker);

    this.logger.info('Circuit breaker configured', {
      component,
      config
    });
  }

  /**
   * Verifica si un componente está disponible (circuit breaker)
   */
  public isComponentAvailable(component: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(component);
    return circuitBreaker ? circuitBreaker.isAvailable() : true;
  }

  /**
   * Registra éxito en un componente (para circuit breaker)
   */
  public recordSuccess(component: string): void {
    const circuitBreaker = this.circuitBreakers.get(component);
    if (circuitBreaker) {
      circuitBreaker.recordSuccess();
    }
  }

  /**
   * Registra fallo en un componente (para circuit breaker)
   */
  public recordFailure(component: string): void {
    const circuitBreaker = this.circuitBreakers.get(component);
    if (circuitBreaker) {
      circuitBreaker.recordFailure();
    }
  }

  /**
   * Obtiene recomendaciones para prevenir errores
   */
  public getErrorPreventionRecommendations(): ErrorRecommendation[] {
    const recommendations: ErrorRecommendation[] = [];

    // Analizar patrones de error para generar recomendaciones
    for (const [key, pattern] of this.errorPatterns.entries()) {
      if (pattern.frequency > 5) {
        recommendations.push({
          type: 'high_frequency',
          message: `High frequency error detected: ${pattern.errorType}`,
          component: pattern.component,
          severity: pattern.severity,
          suggestion: this.generateSuggestion(pattern)
        });
      }
    }

    // Verificar circuit breakers
    for (const [component, breaker] of this.circuitBreakers.entries()) {
      if (breaker.getState() === 'OPEN') {
        recommendations.push({
          type: 'circuit_breaker',
          message: `Circuit breaker is OPEN for ${component}`,
          component,
          severity: 'critical',
          suggestion: 'Check component health and consider scaling or fixing underlying issues'
        });
      }
    }

    return recommendations;
  }

  private generateErrorKey(error: Error, context: ErrorContext): string {
    return `${error.constructor.name}|${context.component}|${context.operation}`;
  }

  private analyzeErrorPattern(error: Error, context: ErrorContext, count: number): void {
    const patternKey = this.generateErrorKey(error, context);
    const existingPattern = this.errorPatterns.get(patternKey);

    const pattern: ErrorPattern = {
      errorType: error.constructor.name,
      component: context.component,
      operation: context.operation,
      frequency: count,
      lastOccurrence: new Date(),
      severity: this.calculateSeverity(count, error),
      message: error.message
    };

    if (existingPattern) {
      pattern.firstOccurrence = existingPattern.firstOccurrence;
    } else {
      pattern.firstOccurrence = new Date();
    }

    this.errorPatterns.set(patternKey, pattern);

    // Emitir alerta si es crítico
    if (pattern.severity === 'critical') {
      this.emit('critical_pattern', pattern);
    }
  }

  private calculateSeverity(count: number, error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (count >= 20) return 'critical';
    if (count >= 10) return 'high';
    if (count >= 5) return 'medium';
    return 'low';
  }

  private generateSuggestion(pattern: ErrorPattern): string {
    const suggestions = {
      'ValidationError': 'Consider adding client-side validation or improving input sanitization',
      'DatabaseError': 'Check database connection, query optimization, or consider connection pooling',
      'NetworkError': 'Implement retry logic, check network connectivity, or add circuit breakers',
      'AuthenticationError': 'Review authentication logic, token expiration, or session management',
      'AuthorizationError': 'Check permission logic, role assignments, or access control rules'
    };

    return suggestions[pattern.errorType as keyof typeof suggestions] ||
           'Review error logs and consider implementing specific error handling for this case';
  }

  private setupErrorPatternDetection(): void {
    // Limpiar estadísticas antiguas cada hora
    setInterval(() => {
      this.cleanupOldErrors();
    }, 60 * 60 * 1000);

    // Detectar patrones críticos cada 5 minutos
    setInterval(() => {
      this.detectCriticalPatterns();
    }, 5 * 60 * 1000);
  }

  private cleanupOldErrors(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const [key, pattern] of this.errorPatterns.entries()) {
      if (pattern.lastOccurrence < oneHourAgo) {
        this.errorPatterns.delete(key);
        this.errorCounts.delete(key);
      }
    }

    this.logger.info('Cleaned up old error patterns');
  }

  private detectCriticalPatterns(): void {
    const criticalPatterns = Array.from(this.errorPatterns.values())
      .filter(pattern => pattern.severity === 'critical');

    if (criticalPatterns.length > 0) {
      this.emit('critical_patterns_detected', criticalPatterns);
      this.logger.warn('Critical error patterns detected', {
        count: criticalPatterns.length,
        patterns: criticalPatterns
      });
    }
  }
}

/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime?: Date;
  private successCount = 0;

  constructor(
    private component: string,
    private config: CircuitBreakerConfig
  ) {}

  public isAvailable(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      const now = new Date();
      const timeSinceLastFailure = this.lastFailureTime ?
        now.getTime() - this.lastFailureTime.getTime() : 0;

      if (timeSinceLastFailure >= this.config.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN state
    return true;
  }

  public recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
    } else if (this.state === 'CLOSED') {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  public recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
    } else if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  public getState(): string {
    return this.state;
  }
}

// Interfaces
export interface ErrorContext {
  component: string;
  operation: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorPattern {
  errorType: string;
  component: string;
  operation: string;
  frequency: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Map<string, number>;
  errorsByComponent: Map<string, number>;
  recentErrors: any[];
  criticalPatterns: ErrorPattern[];
}

export interface ErrorRecommendation {
  type: string;
  message: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number; // milliseconds
  successThreshold: number;
}

/**
 * Middleware para tracking automático de errores
 */
export const errorTrackingMiddleware = (error: Error, req: any, res: any, next: any) => {
  const tracker = ErrorTracker.getInstance();

  tracker.trackError(error, {
    component: 'HTTP',
    operation: `${req.method} ${req.path}`,
    userId: req.user?.id,
    requestId: req.id,
    metadata: {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body
    }
  });

  next(error);
};

export default ErrorTracker;
