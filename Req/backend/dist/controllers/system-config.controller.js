"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigController = void 0;
const system_config_service_1 = require("@/services/system-config.service");
const prisma_1 = require("@/config/prisma");
class SystemConfigController {
    /**
     * Obtener configuración del sistema
     */
    static async getSystemConfig(req, res) {
        try {
            const config = await SystemConfigController.systemConfigService.getSystemConfig();
            res.json({
                success: true,
                data: { config },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener configuración del sistema',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Actualizar configuración del sistema
     */
    static async updateSystemConfig(req, res) {
        try {
            const configData = req.body;
            const config = await SystemConfigController.systemConfigService.updateSystemConfig(configData, req.user?.id || 'system');
            res.json({
                success: true,
                data: { config },
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Configuración no válida')) {
                res.status(400).json({
                    error: {
                        code: 'INVALID_CONFIG',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al actualizar configuración del sistema',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Crear respaldo de base de datos
     */
    static async createDatabaseBackup(req, res) {
        try {
            const { description } = req.body;
            const backup = await SystemConfigController.systemConfigService.createDatabaseBackup(description, req.user?.id || 'system');
            res.json({
                success: true,
                data: { backup },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'BACKUP_ERROR',
                    message: 'Error al crear respaldo de base de datos',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener lista de respaldos
     */
    static async getDatabaseBackups(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await SystemConfigController.systemConfigService.getDatabaseBackups(page, limit);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener respaldos',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Restaurar respaldo de base de datos
     */
    static async restoreDatabaseBackup(req, res) {
        try {
            const { id } = req.params;
            await SystemConfigController.systemConfigService.restoreDatabaseBackup(id, req.user?.id || 'system');
            res.json({
                success: true,
                data: { message: 'Respaldo restaurado exitosamente' },
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('Respaldo no encontrado')) {
                res.status(404).json({
                    error: {
                        code: 'BACKUP_NOT_FOUND',
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        requestId: req.headers['x-request-id'] || 'unknown',
                    },
                });
                return;
            }
            res.status(500).json({
                error: {
                    code: 'RESTORE_ERROR',
                    message: 'Error al restaurar respaldo',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener logs del sistema
     */
    static async getSystemLogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const level = req.query.level;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const result = await SystemConfigController.systemConfigService.getSystemLogs({
                page,
                limit,
                level,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener logs del sistema',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Obtener métricas del sistema
     */
    static async getSystemMetrics(req, res) {
        try {
            const metrics = await SystemConfigController.systemConfigService.getSystemMetrics();
            res.json({
                success: true,
                data: { metrics },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al obtener métricas del sistema',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
    /**
     * Limpiar logs antiguos
     */
    static async cleanupOldLogs(req, res) {
        try {
            const { days } = req.body;
            const result = await SystemConfigController.systemConfigService.cleanupOldLogs(days || 30);
            res.json({
                success: true,
                data: {
                    message: `Se eliminaron ${result.deletedCount} logs antiguos`,
                    deletedCount: result.deletedCount
                },
            });
        }
        catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error al limpiar logs antiguos',
                    details: error instanceof Error ? error.message : 'Error desconocido',
                    timestamp: new Date().toISOString(),
                    requestId: req.headers['x-request-id'] || 'unknown',
                },
            });
        }
    }
}
exports.SystemConfigController = SystemConfigController;
SystemConfigController.systemConfigService = new system_config_service_1.SystemConfigService(prisma_1.prisma);
