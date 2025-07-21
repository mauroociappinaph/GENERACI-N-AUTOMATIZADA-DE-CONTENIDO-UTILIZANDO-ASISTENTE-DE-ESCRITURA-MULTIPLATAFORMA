"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
class DashboardService {
    /**
     * Get dashboard metrics for a user
     */
    static async getDashboardMetrics(userId) {
        try {
            // Get total users count
            const totalUsers = await prisma.user.count({
                where: { isActive: true },
            });
            // Get active records count
            const activeRecords = await prisma.dataRecord.count();
            // Get recent activity from audit logs
            const recentAuditLogs = await prisma.auditLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
            const recentActivity = recentAuditLogs.map(log => ({
                id: log.id,
                userId: log.userId,
                userName: `${log.user.firstName} ${log.user.lastName}`,
                action: log.action,
                resourceType: log.resourceType,
                resourceId: log.resourceId || '',
                timestamp: log.createdAt.toISOString(),
            }));
            // Calculate growth metrics (simplified - in real app would compare with previous period)
            const usersGrowth = Math.floor(Math.random() * 20); // Mock data
            const recordsGrowth = Math.floor(Math.random() * 15);
            const reportsGrowth = Math.floor(Math.random() * 25);
            // System health (simplified - in real app would check actual service status)
            const systemHealth = {
                status: 'operational',
                services: {
                    api: 'operational',
                    database: 'operational',
                    reports: 'operational',
                    notifications: 'operational',
                },
                message: 'Todos los servicios funcionando correctamente',
            };
            return {
                totalUsers,
                activeRecords,
                recentActivity,
                systemHealth,
                reportsGenerated: Math.floor(Math.random() * 100) + 50, // Mock data
                usersGrowth,
                recordsGrowth,
                reportsGrowth,
            };
        }
        catch (error) {
            console.error('Error fetching dashboard metrics:', error);
            throw error;
        }
    }
    /**
     * Get user's dashboard widgets configuration
     */
    static async getUserWidgets(userId) {
        try {
            // In a real implementation, this would fetch from a user_widgets table
            // For now, we'll return default widgets
            const defaultWidgets = [
                {
                    id: (0, uuid_1.v4)(),
                    type: 'metrics',
                    title: 'Usuarios Activos',
                    config: {
                        dataSource: 'users',
                        refreshInterval: 60000,
                    },
                    position: { x: 0, y: 0, w: 1, h: 1 },
                },
                {
                    id: (0, uuid_1.v4)(),
                    type: 'chart',
                    title: 'Registros por Mes',
                    config: {
                        dataSource: 'records',
                        chartType: 'bar',
                        refreshInterval: 300000,
                    },
                    position: { x: 1, y: 0, w: 2, h: 1 },
                },
                {
                    id: (0, uuid_1.v4)(),
                    type: 'table',
                    title: 'Últimos Registros',
                    config: {
                        dataSource: 'records',
                        refreshInterval: 120000,
                    },
                    position: { x: 0, y: 1, w: 2, h: 1 },
                },
                {
                    id: (0, uuid_1.v4)(),
                    type: 'activity',
                    title: 'Actividad Reciente',
                    config: {
                        dataSource: 'activity',
                        refreshInterval: 60000,
                    },
                    position: { x: 2, y: 1, w: 1, h: 1 },
                },
            ];
            return defaultWidgets;
        }
        catch (error) {
            console.error('Error fetching user widgets:', error);
            throw error;
        }
    }
    /**
     * Save user's dashboard widget configuration
     */
    static async saveWidgetConfiguration(userId, widgets) {
        try {
            // In a real implementation, this would save to a user_widgets table
            // For now, we'll just log the configuration
            console.log(`Saving widget configuration for user ${userId}:`, widgets);
            // TODO: Implement actual database persistence
            // await prisma.userWidget.deleteMany({ where: { userId } });
            // await prisma.userWidget.createMany({
            //   data: widgets.map(widget => ({
            //     userId,
            //     widgetId: widget.id,
            //     type: widget.type,
            //     title: widget.title,
            //     config: JSON.stringify(widget.config),
            //     position: JSON.stringify(widget.position),
            //   })),
            // });
            return true;
        }
        catch (error) {
            console.error('Error saving widget configuration:', error);
            throw error;
        }
    }
    /**
     * Add a new widget to user's dashboard
     */
    static async addWidget(userId, widgetData) {
        try {
            const newWidget = {
                ...widgetData,
                id: (0, uuid_1.v4)(),
            };
            // In a real implementation, this would save to database
            console.log(`Adding widget for user ${userId}:`, newWidget);
            return newWidget;
        }
        catch (error) {
            console.error('Error adding widget:', error);
            throw error;
        }
    }
    /**
     * Delete a widget from user's dashboard
     */
    static async deleteWidget(userId, widgetId) {
        try {
            // In a real implementation, this would delete from database
            console.log(`Deleting widget ${widgetId} for user ${userId}`);
            return true;
        }
        catch (error) {
            console.error('Error deleting widget:', error);
            throw error;
        }
    }
    /**
     * Get data for a specific widget
     */
    static async getWidgetData(userId, widgetId, dataSource) {
        try {
            // Generate mock data based on dataSource
            switch (dataSource) {
                case 'users':
                    const totalUsers = await prisma.user.count({ where: { isActive: true } });
                    return {
                        count: totalUsers,
                        trend: '+10%',
                        data: Array.from({ length: 12 }, (_, i) => totalUsers - 12 + i),
                        monthly: Array.from({ length: 12 }, (_, i) => totalUsers - 12 + i),
                    };
                case 'records':
                    const totalRecords = await prisma.dataRecord.count();
                    return {
                        count: totalRecords,
                        trend: '+5%',
                        data: Array.from({ length: 12 }, (_, i) => totalRecords - 12 + i),
                        monthly: Array.from({ length: 12 }, (_, i) => totalRecords - 12 + i),
                    };
                case 'reports':
                    // Mock reports data
                    const reportsCount = Math.floor(Math.random() * 100) + 50;
                    return {
                        count: reportsCount,
                        trend: '+12%',
                        data: Array.from({ length: 12 }, (_, i) => reportsCount - 12 + i),
                        monthly: Array.from({ length: 12 }, (_, i) => reportsCount - 12 + i),
                    };
                case 'activity':
                    const recentActivity = await this.getDashboardMetrics(userId);
                    return {
                        items: recentActivity.recentActivity,
                    };
                default:
                    return null;
            }
        }
        catch (error) {
            console.error(`Error fetching widget data for ${widgetId}:`, error);
            throw error;
        }
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = DashboardService;
