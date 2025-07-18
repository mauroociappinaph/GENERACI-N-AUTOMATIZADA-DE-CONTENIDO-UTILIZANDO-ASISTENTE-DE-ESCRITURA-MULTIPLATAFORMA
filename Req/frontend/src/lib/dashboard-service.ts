import { ApiResponse, DashboardWidget, WidgetType } from '@/types';
import apiClient from './api';

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

// In a real application, these would be API calls to the backend
// For now, we'll simulate the API responses

export const dashboardService = {
  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/api/dashboard/metrics');
      // return response.data.data!;

      // For now, return mock data
      return {
        totalUsers: 120,
        activeRecords: 1453,
        reportsGenerated: 85,
        usersGrowth: 10,
        recordsGrowth: 5,
        reportsGrowth: 12,
        recentActivity: [
          {
            id: '1',
            userId: 'user1',
            userName: 'Ana Martínez',
            action: 'actualizó',
            resourceType: 'record',
            resourceId: 'rec123',
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          },
          {
            id: '2',
            userId: 'user2',
            userName: 'Carlos López',
            action: 'creó',
            resourceType: 'record',
            resourceId: 'rec456',
            timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
          },
          {
            id: '3',
            userId: 'user3',
            userName: 'María González',
            action: 'generó',
            resourceType: 'report',
            resourceId: 'rep789',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: '4',
            userId: 'user4',
            userName: 'Roberto Sánchez',
            action: 'eliminó',
            resourceType: 'record',
            resourceId: 'rec789',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          },
          {
            id: '5',
            userId: 'user5',
            userName: 'Laura Gómez',
            action: 'modificó',
            resourceType: 'report',
            resourceId: 'rep456',
            timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
          },
        ],
        systemHealth: {
          status: 'operational',
          services: {
            api: 'operational',
            database: 'operational',
            reports: 'operational',
            notifications: 'operational',
          },
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  /**
   * Get user's dashboard widgets
   */
  async getUserWidgets(): Promise<DashboardWidget[]> {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.get<ApiResponse<DashboardWidget[]>>('/api/dashboard/widgets');
      // return response.data.data!;

      // For now, return mock data
      return [
        {
          id: '1',
          type: WidgetType.METRICS,
          title: 'Usuarios Activos',
          config: {
            dataSource: 'users',
            refreshInterval: 60000,
          },
          position: { x: 0, y: 0, w: 1, h: 1 },
        },
        {
          id: '2',
          type: WidgetType.CHART,
          title: 'Registros por Mes',
          config: {
            dataSource: 'records',
            chartType: 'bar',
            refreshInterval: 300000,
          },
          position: { x: 1, y: 0, w: 2, h: 1 },
        },
        {
          id: '3',
          type: WidgetType.TABLE,
          title: 'Últimos Registros',
          config: {
            dataSource: 'records',
            refreshInterval: 120000,
          },
          position: { x: 0, y: 1, w: 2, h: 1 },
        },
        {
          id: '4',
          type: WidgetType.ACTIVITY,
          title: 'Actividad Reciente',
          config: {
            dataSource: 'activity',
            refreshInterval: 60000,
          },
          position: { x: 2, y: 1, w: 1, h: 1 },
        },
        {
          id: '5',
          type: WidgetType.CHART,
          title: 'Reportes Generados',
          config: {
            dataSource: 'reports',
            chartType: 'line',
            refreshInterval: 300000,
          },
          position: { x: 0, y: 2, w: 3, h: 1 },
        },
      ];
    } catch (error) {
      console.error('Error fetching user widgets:', error);
      throw error;
    }
  },

  /**
   * Get data for a specific widget
   */
  async getWidgetData(widgetId: string, dataSource: string): Promise<any> {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.get<ApiResponse<any>>(`/api/dashboard/widgets/${widgetId}/data`);
      // return response.data.data!;

      // For now, return mock data based on dataSource
      switch (dataSource) {
        case 'users':
          return {
            count: 120,
            trend: '+10%',
            data: [100, 105, 110, 115, 120],
            monthly: [95, 98, 102, 105, 108, 110, 112, 115, 117, 118, 119, 120],
          };
        case 'records':
          return {
            count: 1453,
            trend: '+5%',
            data: [1200, 1250, 1300, 1400, 1453],
            monthly: [
              1120, 1145, 1182, 1215, 1248, 1290, 1310, 1345, 1375, 1400, 1430,
              1453,
            ],
          };
        case 'reports':
          return {
            count: 85,
            trend: '+12%',
            data: [65, 70, 75, 80, 85],
            monthly: [55, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85],
            lineData: {
              labels: [
                'Ene',
                'Feb',
                'Mar',
                'Abr',
                'May',
                'Jun',
                'Jul',
                'Ago',
                'Sep',
                'Oct',
                'Nov',
                'Dic',
              ],
              datasets: [
                {
                  label: 'Reportes Generados',
                  data: [55, 58, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85],
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
              ],
            },
          };
        case 'activity':
          return {
            items: [
              {
                id: '1',
                userId: 'user1',
                userName: 'Ana Martínez',
                action: 'actualizó',
                resourceType: 'record',
                resourceId: 'rec123',
                timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
              },
              {
                id: '2',
                userId: 'user2',
                userName: 'Carlos López',
                action: 'creó',
                resourceType: 'record',
                resourceId: 'rec456',
                timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
              },
              {
                id: '3',
                userId: 'user3',
                userName: 'María González',
                action: 'generó',
                resourceType: 'report',
                resourceId: 'rep789',
                timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
              },
              {
                id: '4',
                userId: 'user4',
                userName: 'Roberto Sánchez',
                action: 'eliminó',
                resourceType: 'record',
                resourceId: 'rec789',
                timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
              },
            ],
          };
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error fetching data for widget ${widgetId}:`, error);
      throw error;
    }
  },

  /**
   * Save user's dashboard widget configuration
   * In a real app, this would persist the configuration to the backend
   */
  async saveWidgetConfiguration(widgets: DashboardWidget[]): Promise<boolean> {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.post<ApiResponse<boolean>>('/api/dashboard/widgets', { widgets });
      // return response.data.data!;

      // For now, just simulate a successful save
      console.log('Saving widget configuration:', widgets);

      // Store in localStorage for persistence between sessions
      localStorage.setItem('dashboard_widgets', JSON.stringify(widgets));

      // Also store a timestamp for cache invalidation
      localStorage.setItem(
        'dashboard_widgets_timestamp',
        Date.now().toString()
      );

      return true;
    } catch (error) {
      console.error('Error saving widget configuration:', error);
      throw error;
    }
  },

  /**
   * Add a new widget to the dashboard
   * In a real app, this would create a new widget on the backend
   */
  async addWidget(
    widget: Omit<DashboardWidget, 'id'>
  ): Promise<DashboardWidget> {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.post<ApiResponse<DashboardWidget>>('/api/dashboard/widgets/add', widget);
      // return response.data.data!;

      // For now, just simulate adding a widget with a generated ID
      const newWidget: DashboardWidget = {
        ...widget,
        id: `widget_${Date.now()}`,
      };

      // Get current widgets and add the new one
      const currentWidgets = await this.getUserWidgets();
      const updatedWidgets = [...currentWidgets, newWidget];

      // Save the updated configuration
      await this.saveWidgetConfiguration(updatedWidgets);

      console.log('Adding new widget:', newWidget);
      return newWidget;
    } catch (error) {
      console.error('Error adding widget:', error);
      throw error;
    }
  },

  /**
   * Update widget positions after drag-and-drop
   * This updates the positions of all widgets based on their new arrangement
   */
  async updateWidgetPositions(widgets: DashboardWidget[]): Promise<boolean> {
    try {
      // In a real app, this would be an API call to update positions
      // const response = await apiClient.put<ApiResponse<boolean>>('/api/dashboard/widgets/positions', { widgets });
      // return response.data.data!;

      // For now, just save the updated configuration
      return await this.saveWidgetConfiguration(widgets);
    } catch (error) {
      console.error('Error updating widget positions:', error);
      throw error;
    }
  },

  /**
   * Delete a widget from the dashboard
   */
  async deleteWidget(widgetId: string): Promise<boolean> {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.delete<ApiResponse<boolean>>(`/api/dashboard/widgets/${widgetId}`);
      // return response.data.data!;

      // Get current widgets and filter out the one to delete
      const currentWidgets = await this.getUserWidgets();
      const updatedWidgets = currentWidgets.filter(w => w.id !== widgetId);

      // Save the updated configuration
      return await this.saveWidgetConfiguration(updatedWidgets);
    } catch (error) {
      console.error('Error deleting widget:', error);
      throw error;
    }
  },

  /**
   * Load widget configuration from localStorage if available
   * This allows for persistence between sessions in the demo
   */
  async loadSavedWidgetConfiguration(): Promise<DashboardWidget[] | null> {
    try {
      const savedConfig = localStorage.getItem('dashboard_widgets');
      if (savedConfig) {
        return JSON.parse(savedConfig) as DashboardWidget[];
      }
      return null;
    } catch (error) {
      console.error('Error loading saved widget configuration:', error);
      return null;
    }
  },
};
