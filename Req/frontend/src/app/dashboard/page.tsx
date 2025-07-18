'use client';

import { useEffect, useState, useCallback } from 'react';
import { ProtectedPage } from '@/components/auth/protected-page';
import { DashboardWidget } from '@/types';
import { dashboardService, DashboardMetrics } from '@/lib/dashboard-service';
import { WidgetLayoutManager } from '@/components/dashboard/widget-layout-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { NotificationTest } from '@/components/notifications/notification-test';

// Component for key metrics cards
const MetricCard = ({ title, value, trend }: { title: string; value: string | number; trend?: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && <p className="text-xs text-gray-500">{trend}</p>}
    </CardContent>
  </Card>
);

// Component for system health status
const SystemHealthStatus = ({ systemHealth }: { systemHealth: DashboardMetrics['systemHealth'] }) => {
  const statusColors = {
    operational: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    outage: 'bg-red-100 text-red-800'
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          Estado del Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Estado General</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[systemHealth.status]
            }`}>
              {systemHealth.status === 'operational'
                ? 'Operativo'
                : systemHealth.status === 'degraded'
                  ? 'Degradado'
                  : 'Inactivo'}
            </span>
          </div>

          {Object.entries(systemHealth.services).map(([service, status]) => (
            <div key={service} className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {service === 'api'
                  ? 'API'
                  : service === 'database'
                    ? 'Base de Datos'
                    : service === 'reports'
                      ? 'Reportes'
                      : 'Notificaciones'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[status]
              }`}>
                {status === 'operational'
                  ? 'Operativo'
                  : status === 'degraded'
                    ? 'Degradado'
                    : 'Inactivo'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for recent activity
const RecentActivity = ({ activities }: { activities: DashboardMetrics['recentActivity'] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => {
            // Get initials for avatar
            const initials = activity.userName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);

            // Calculate time ago
            const timestamp = new Date(activity.timestamp);
            const now = new Date();
            const diffMinutes = Math.floor(
              (now.getTime() - timestamp.getTime()) / (1000 * 60)
            );
            const timeAgo = diffMinutes < 60
              ? `Hace ${diffMinutes} minutos`
              : `Hace ${Math.floor(diffMinutes / 60)} horas`;

            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium">{initials}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {activity.userName} {activity.action} {' '}
                    {activity.resourceType === 'record'
                      ? 'un registro'
                      : 'un reporte'}
                  </p>
                  <p className="text-xs text-gray-500">{timeAgo}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle widgets change from the layout manager
  const handleWidgetsChange = useCallback((updatedWidgets: DashboardWidget[]) => {
    setWidgets(updatedWidgets);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Try to load saved widget configuration first
        const savedWidgets = await dashboardService.loadSavedWidgetConfiguration();

        // Fetch dashboard metrics and widgets in parallel
        const [metricsData, defaultWidgetsData] = await Promise.all([
          dashboardService.getDashboardMetrics(),
          // Only fetch default widgets if no saved configuration exists
          savedWidgets ? Promise.resolve([]) : dashboardService.getUserWidgets()
        ]);

        setMetrics(metricsData);
        // Use saved widgets if available, otherwise use default widgets
        setWidgets(savedWidgets || defaultWidgetsData);
        setError(null);
      } catch (err) {
        // Use a more generic error handling approach to avoid console.error
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



  if (loading) {
    return (
      <ProtectedPage title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage title="Dashboard">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage title="Dashboard">
      <div className="space-y-6">
        {/* Key metrics section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Usuarios"
            value={metrics?.totalUsers || 0}
            trend={`+${metrics?.usersGrowth || 0}% desde el mes pasado`}
          />

          <MetricCard
            title="Registros Activos"
            value={(metrics?.activeRecords || 0).toLocaleString()}
            trend={`+${metrics?.recordsGrowth || 0}% desde el mes pasado`}
          />

          <MetricCard
            title="Reportes Generados"
            value={metrics?.reportsGenerated || 0}
            trend={`+${metrics?.reportsGrowth || 0}% desde el mes pasado`}
          />

          <MetricCard
            title="Estado del Sistema"
            value={metrics?.systemHealth.status === 'operational'
              ? 'Operativo'
              : metrics?.systemHealth.status === 'degraded'
                ? 'Degradado'
                : 'Inactivo'}
            trend={metrics?.systemHealth.message || 'Todos los servicios funcionando correctamente'}
          />
        </div>

        {/* Customizable Widgets Section */}
        <WidgetLayoutManager
          widgets={widgets}
          onWidgetsChange={handleWidgetsChange}
          gridCols={4}
          gridRows={6}
          enableEdit={true}
          className="mb-6"
        />

        {/* Notification Test Section */}
        <div className="mt-8">
          <NotificationTest />
        </div>

        {/* System status and activity section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {metrics?.systemHealth && <SystemHealthStatus systemHealth={metrics.systemHealth} />}
          {metrics?.recentActivity && <RecentActivity activities={metrics.recentActivity} />}
        </div>
      </div>
    </ProtectedPage>
  );
}
