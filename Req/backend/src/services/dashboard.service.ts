import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface DashboardWidget {
  id: string;
  type: 'metrics' | 'chart' | 'table' | 'activity';
  title: string;
  config: {
    dataSource?: string;
    refreshInterval?: number;
    filters?: Record<string, unknown>;
    chartType?: 'line' | 'bar' | 'pie' | 'doughnut';
  };
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface DashboardMetrics {
  totalUsers: number;
  activeRecords: number;
  recentActivity: ActivityItem[];
  systemHealth: HealthStatus;
  reportsGenerated: number;
  recordsGrowth?: number;
  usersGrowth?: number;
  reportsGrowth?: number;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}

export interface HealthStatus {
  status: 'operational' | 'degraded' | 'outage';
  services: {
    api: 'operational' | 'degraded' | 'outage';
    database: 'operational' | 'degraded' | 'outage';
    reports: 'operational' | 'degraded' | 'outage';
    notifications: 'operational' | 'degraded' | 'outage';
  };
  message?: string;
}

export class DashboardService {
  /**
   * Get dashboard metrics for a user
   */
  static async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
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

      const recentActivity: ActivityItem[] = recentAuditLogs.map(log => ({
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
      const systemHealth: HealthStatus = {
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
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get user's dashboard widgets configuration
   */
  static async getUserWidgets(userId: string): Promise<DashboardWidget[]> {
    try {
      // In a real implementation, this would fetch from a user_widgets table
      // For now, we'll return default widgets
      const defaultWidgets: DashboardWidget[] = [
        {
          id: uuidv4(),
          type: 'metrics',
          title: 'Usuarios Activos',
          config: {
            dataSource: 'users',
            refreshInterval: 60000,
          },
          position: { x: 0, y: 0, w: 1, h: 1 },
        },
        {
          id: uuidv4(),
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
          id: uuidv4(),
          type: 'table',
          title: 'Últimos Registros',
          config: {
            dataSource: 'records',
            refreshInterval: 120000,
          },
          position: { x: 0, y: 1, w: 2, h: 1 },
        },
        {
          id: uuidv4(),
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
    } catch (error) {
      console.error('Error fetching user widgets:', error);
      throw error;
    }
  }

  /**
   * Save user's dashboard widget configuration
   */
  static async saveWidgetConfiguration(
    userId: string,
    widgets: DashboardWidget[]
  ): Promise<boolean> {
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
    } catch (error) {
      console.error('Error saving widget configuration:', error);
      throw error;
    }
  }

  /**
   * Add a new widget to user's dashboard
   */
  static async addWidget(
    userId: string,
    widgetData: Omit<DashboardWidget, 'id'>
  ): Promise<DashboardWidget> {
    try {
      const newWidget: DashboardWidget = {
        ...widgetData,
        id: uuidv4(),
      };

      // In a real implementation, this would save to database
      console.log(`Adding widget for user ${userId}:`, newWidget);

      return newWidget;
    } catch (error) {
      console.error('Error adding widget:', error);
      throw error;
    }
  }

  /**
   * Delete a widget from user's dashboard
   */
  static async deleteWidget(userId: string, widgetId: string): Promise<boolean> {
    try {
      // In a real implementation, this would delete from database
      console.log(`Deleting widget ${widgetId} for user ${userId}`);

      return true;
    } catch (error) {
      console.error('Error deleting widget:', error);
      throw error;
    }
  }

  /**
   * Get data for a specific widget
   */
  static async getWidgetData(
    userId: string,
    widgetId: string,
    dataSource: string
  ): Promise<any> {
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
    } catch (error) {
      console.error(`Error fetching widget data for ${widgetId}:`, error);
      throw error;
    }
  }
}

export const dashboardService = DashboardService;
