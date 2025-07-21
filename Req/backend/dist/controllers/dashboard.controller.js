"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const zod_1 = require("zod");
// Validation schemas
const WidgetConfigSchema = zod_1.z.object({
    dataSource: zod_1.z.string().optional(),
    refreshInterval: zod_1.z.number().optional(),
    filters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    chartType: zod_1.z.enum(['line', 'bar', 'pie', 'doughnut']).optional(),
});
const DashboardWidgetSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['metrics', 'chart', 'table', 'activity']),
    title: zod_1.z.string(),
    config: WidgetConfigSchema,
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        w: zod_1.z.number(),
        h: zod_1.z.number(),
    }),
});
const SaveWidgetConfigurationSchema = zod_1.z.object({
    widgets: zod_1.z.array(DashboardWidgetSchema),
});
const AddWidgetSchema = zod_1.z.object({
    type: zod_1.z.enum(['metrics', 'chart', 'table', 'activity']),
    title: zod_1.z.string(),
    config: WidgetConfigSchema,
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        w: zod_1.z.number(),
        h: zod_1.z.number(),
    }),
});
class DashboardController {
    /**
     * Get dashboard metrics
     */
    static async getDashboardMetrics(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                    },
                });
            }
            const metrics = await dashboard_service_1.dashboardService.getDashboardMetrics(userId);
            res.json({
                success: true,
                data: metrics,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Error fetching dashboard metrics:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                },
            });
        }
    }
    /**
     * Get user's dashboard widgets
     */
    static async getUserWidgets(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                    },
                });
            }
            const widgets = await dashboard_service_1.dashboardService.getUserWidgets(userId);
            res.json({
                success: true,
                data: widgets,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Error fetching user widgets:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                },
            });
        }
    }
    /**
     * Save user's dashboard widget configuration
     */
    static async saveWidgetConfiguration(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                    },
                });
            }
            // Validate request body
            const validation = SaveWidgetConfigurationSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Datos de entrada inválidos',
                        details: validation.error.issues,
                    },
                });
            }
            const { widgets } = validation.data;
            const success = await dashboard_service_1.dashboardService.saveWidgetConfiguration(userId, widgets);
            res.json({
                success,
                data: success,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Error saving widget configuration:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                },
            });
        }
    }
    /**
     * Add a new widget to the dashboard
     */
    static async addWidget(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                    },
                });
            }
            // Validate request body
            const validation = AddWidgetSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Datos de entrada inválidos',
                        details: validation.error.issues,
                    },
                });
            }
            const widgetData = validation.data;
            const newWidget = await dashboard_service_1.dashboardService.addWidget(userId, widgetData);
            res.status(201).json({
                success: true,
                data: newWidget,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Error adding widget:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                },
            });
        }
    }
    /**
     * Delete a widget from the dashboard
     */
    static async deleteWidget(req, res) {
        try {
            const userId = req.user?.id;
            const { widgetId } = req.params;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                    },
                });
            }
            if (!widgetId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'ID de widget requerido',
                    },
                });
            }
            const success = await dashboard_service_1.dashboardService.deleteWidget(userId, widgetId);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Widget no encontrado',
                    },
                });
            }
            res.json({
                success: true,
                data: success,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Error deleting widget:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                },
            });
        }
    }
    /**
     * Get data for a specific widget
     */
    static async getWidgetData(req, res) {
        try {
            const userId = req.user?.id;
            const { widgetId } = req.params;
            const { dataSource } = req.query;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Usuario no autenticado',
                    },
                });
            }
            if (!widgetId || !dataSource) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'ID de widget y fuente de datos requeridos',
                    },
                });
            }
            const data = await dashboard_service_1.dashboardService.getWidgetData(userId, widgetId, dataSource);
            res.json({
                success: true,
                data,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Error fetching widget data:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Error interno del servidor',
                },
            });
        }
    }
}
exports.DashboardController = DashboardController;
