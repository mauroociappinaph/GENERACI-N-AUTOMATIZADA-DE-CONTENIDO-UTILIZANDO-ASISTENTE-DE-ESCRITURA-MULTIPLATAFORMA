"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTrackingMiddleware = exports.ErrorTracker = void 0;
const events_1 = require("events");
const debug_logger_1 = require("./debug-logger");
/**
 * Sistema de tracking y prevención de errores en tiempo real
 */
class ErrorTracker extends events_1.EventEmitter {
    constructor() {
        super();
        this.errorCounts = new Map();
        this.errorPatterns = new Map();
        this.circuitBreakers = new Map();
        this.logger = (0, debug_logger_1.createComponentLogger)('ERROR_TRACKER');
        this.setupErrorPatternDetection();
    }
    static getInstance() {
        if (!ErrorTracker.instance) {
            ErrorTracker.instance = new ErrorTracker();
        }
        return ErrorTracker.instance;
    }
    /**
     * Registra un error y analiza patrones
     */
    trackError(error, context) {
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
    getErrorStats() {
        const stats = {
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
    setupCircuitBreaker(component, config) {
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
    isComponentAvailable(component) {
        const circuitBreaker = this.circuitBreakers.get(component);
        return circuitBreaker ? circuitBreaker.isAvailable() : true;
    }
    /**
     * Registra éxito en un componente (para circuit breaker)
     */
    recordSuccess(component) {
        const circuitBreaker = this.circuitBreakers.get(component);
        if (circuitBreaker) {
            circuitBreaker.recordSuccess();
        }
    }
    /**
     * Registra fallo en un componente (para circuit breaker)
     */
    recordFailure(component) {
        const circuitBreaker = this.circuitBreakers.get(component);
        if (circuitBreaker) {
            circuitBreaker.recordFailure();
        }
    }
    /**
     * Obtiene recomendaciones para prevenir errores
     */
    getErrorPreventionRecommendations() {
        const recommendations = [];
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
    generateErrorKey(error, context) {
        return `${error.constructor.name}|${context.component}|${context.operation}`;
    }
    analyzeErrorPattern(error, context, count) {
        const patternKey = this.generateErrorKey(error, context);
        const existingPattern = this.errorPatterns.get(patternKey);
        const pattern = {
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
        }
        else {
            pattern.firstOccurrence = new Date();
        }
        this.errorPatterns.set(patternKey, pattern);
        // Emitir alerta si es crítico
        if (pattern.severity === 'critical') {
            this.emit('critical_pattern', pattern);
        }
    }
    calculateSeverity(count, error) {
        if (count >= 20)
            return 'critical';
        if (count >= 10)
            return 'high';
        if (count >= 5)
            return 'medium';
        return 'low';
    }
    generateSuggestion(pattern) {
        const suggestions = {
            'ValidationError': 'Consider adding client-side validation or improving input sanitization',
            'DatabaseError': 'Check database connection, query optimization, or consider connection pooling',
            'NetworkError': 'Implement retry logic, check network connectivity, or add circuit breakers',
            'AuthenticationError': 'Review authentication logic, token expiration, or session management',
            'AuthorizationError': 'Check permission logic, role assignments, or access control rules'
        };
        return suggestions[pattern.errorType] ||
            'Review error logs and consider implementing specific error handling for this case';
    }
    setupErrorPatternDetection() {
        // Limpiar estadísticas antiguas cada hora
        setInterval(() => {
            this.cleanupOldErrors();
        }, 60 * 60 * 1000);
        // Detectar patrones críticos cada 5 minutos
        setInterval(() => {
            this.detectCriticalPatterns();
        }, 5 * 60 * 1000);
    }
    cleanupOldErrors() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        for (const [key, pattern] of this.errorPatterns.entries()) {
            if (pattern.lastOccurrence < oneHourAgo) {
                this.errorPatterns.delete(key);
                this.errorCounts.delete(key);
            }
        }
        this.logger.info('Cleaned up old error patterns');
    }
    detectCriticalPatterns() {
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
exports.ErrorTracker = ErrorTracker;
/**
 * Circuit Breaker implementation
 */
class CircuitBreaker {
    constructor(component, config) {
        this.component = component;
        this.config = config;
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
    }
    isAvailable() {
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
    recordSuccess() {
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.state = 'CLOSED';
                this.failureCount = 0;
            }
        }
        else if (this.state === 'CLOSED') {
            this.failureCount = Math.max(0, this.failureCount - 1);
        }
    }
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = new Date();
        if (this.state === 'HALF_OPEN') {
            this.state = 'OPEN';
        }
        else if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
            this.state = 'OPEN';
        }
    }
    getState() {
        return this.state;
    }
}
/**
 * Middleware para tracking automático de errores
 */
const errorTrackingMiddleware = (error, req, res, next) => {
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
exports.errorTrackingMiddleware = errorTrackingMiddleware;
exports.default = ErrorTracker;
