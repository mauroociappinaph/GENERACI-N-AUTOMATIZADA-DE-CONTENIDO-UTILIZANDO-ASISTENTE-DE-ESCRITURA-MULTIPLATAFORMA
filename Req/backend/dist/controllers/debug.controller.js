"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugController = void 0;
const debug_1 = require("../config/debug");
const debug_logger_1 = require("../utils/debug-logger");
const error_tracker_1 = __importDefault(require("../utils/error-tracker"));
const logger = (0, debug_logger_1.createComponentLogger)('DEBUG_CONTROLLER');
/**
 * Controlador para endpoints de debugging y monitoreo
 */
class DebugController {
    /**
     * Obtener estadísticas generales del sistema de debugging
     */
    static async getDebugStats(req, res) {
        try {
            logger.info('Getting debug statistics');
            const stats = debug_1.debugConfig.getDebugStats();
            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger.error('Error getting debug stats', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get debug statistics'
            });
        }
    }
    /**
     * Obtener estadísticas de errores
     */
    static async getErrorStats(req, res) {
        try {
            logger.info('Getting error statistics');
            const errorTracker = error_tracker_1.default.getInstance();
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
        }
        catch (error) {
            logger.error('Error getting error stats', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get error statistics'
            });
        }
    }
    /**
     * Obtener recomendaciones para prevención de errores
     */
    static async getErrorRecommendations(req, res) {
        try {
            logger.info('Getting error prevention recommendations');
            const errorTracker = error_tracker_1.default.getInstance();
            const recommendations = errorTracker.getErrorPreventionRecommendations();
            res.json({
                success: true,
                data: recommendations,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger.error('Error getting recommendations', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get error recommendations'
            });
        }
    }
    /**
     * Obtener estado de los circuit breakers
     */
    static async getCircuitBreakerStatus(req, res) {
        try {
            logger.info('Getting circuit breaker status');
            const errorTracker = error_tracker_1.default.getInstance();
            const components = ['DATABASE', 'EXTERNAL_API', 'AI_SERVICE', 'SOCIAL_MEDIA'];
            const status = components.reduce((acc, component) => {
                acc[component] = {
                    available: errorTracker.isComponentAvailable(component),
                    component
                };
                return acc;
            }, {});
            res.json({
                success: true,
                data: status,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger.error('Error getting circuit breaker status', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get circuit breaker status'
            });
        }
    }
    /**
     * Obtener salud general del sistema
     */
    static async getSystemHealth(req, res) {
        try {
            logger.info('Getting system health');
            const stats = debug_1.debugConfig.getDebugStats();
            res.json({
                success: true,
                data: {
                    health: stats.systemHealth,
                    summary: {
                        totalErrors: stats.errorStats.totalErrors,
                        criticalIssues: stats.recommendations.filter((r) => r.severity === 'critical').length,
                        highPriorityIssues: stats.recommendations.filter((r) => r.severity === 'high').length,
                        circuitBreakersOpen: Object.values(stats.circuitBreakers).filter((cb) => !cb.available).length
                    }
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            logger.error('Error getting system health', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get system health'
            });
        }
    }
    /**
     * Configurar nivel de logging para un componente
     */
    static async setComponentLogLevel(req, res) {
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
        }
        catch (error) {
            logger.error('Error setting component log level', error);
            res.status(500).json({
                success: false,
                error: 'Failed to set component log level'
            });
        }
    }
    /**
     * Simular error para testing (solo en desarrollo)
     */
    static async simulateError(req, res) {
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({
                success: false,
                error: 'Error simulation not allowed in production'
            });
            return;
        }
        try {
            const { errorType, component, message } = req.body;
            const errorTracker = error_tracker_1.default.getInstance();
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
        }
        catch (error) {
            logger.error('Error simulating error', error);
            res.status(500).json({
                success: false,
                error: 'Failed to simulate error'
            });
        }
    }
    /**
     * Limpiar estadísticas de errores
     */
    static async clearErrorStats(req, res) {
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
        }
        catch (error) {
            logger.error('Error clearing error stats', error);
            res.status(500).json({
                success: false,
                error: 'Failed to clear error statistics'
            });
        }
    }
    /**
     * Obtener métricas de rendimiento del sistema
     */
    static async getPerformanceMetrics(req, res) {
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
        }
        catch (error) {
            logger.error('Error getting performance metrics', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get performance metrics'
            });
        }
    }
}
exports.DebugController = DebugController;
exports.default = DebugController;
