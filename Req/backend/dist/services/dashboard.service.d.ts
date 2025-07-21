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
export declare class DashboardService {
    /**
     * Get dashboard metrics for a user
     */
    static getDashboardMetrics(userId: string): Promise<DashboardMetrics>;
    /**
     * Get user's dashboard widgets configuration
     */
    static getUserWidgets(userId: string): Promise<DashboardWidget[]>;
    /**
     * Save user's dashboard widget configuration
     */
    static saveWidgetConfiguration(userId: string, widgets: DashboardWidget[]): Promise<boolean>;
    /**
     * Add a new widget to user's dashboard
     */
    static addWidget(userId: string, widgetData: Omit<DashboardWidget, 'id'>): Promise<DashboardWidget>;
    /**
     * Delete a widget from user's dashboard
     */
    static deleteWidget(userId: string, widgetId: string): Promise<boolean>;
    /**
     * Get data for a specific widget
     */
    static getWidgetData(userId: string, widgetId: string, dataSource: string): Promise<any>;
}
export declare const dashboardService: typeof DashboardService;
