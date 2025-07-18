import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSystemConfig } from '@/hooks/use-system-config';

export function SystemMetricsDisplay() {
  const { metrics, loading, error, fetchMetrics } = useSystemConfig();
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMetrics();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, fetchMetrics]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading && !metrics) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay métricas disponibles
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Métricas del Sistema
          </h3>
          <p className="text-sm text-gray-500">
            Monitoreo en tiempo real del estado del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <input
              id="autoRefresh"
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="autoRefresh"
              className="ml-2 block text-sm text-gray-900"
            >
              Auto-actualizar
            </label>
          </div>
          <Button variant="outline" onClick={fetchMetrics} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Tiempo de actividad */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">⏱️</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Tiempo Activo
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatUptime(metrics.uptime)}
              </div>
            </div>
          </div>
        </div>

        {/* Usuarios activos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Usuarios Activos
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.activeUsers}
              </div>
            </div>
          </div>
        </div>

        {/* Solicitudes por minuto */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">📈</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Req/min</div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.requestsPerMinute}
              </div>
            </div>
          </div>
        </div>

        {/* Total de registros */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">
                Total Registros
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.databaseStats.totalRecords.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uso de recursos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Uso de memoria */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Uso de Memoria
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Usado: {formatBytes(metrics.memoryUsage.used)}</span>
              <span>Total: {formatBytes(metrics.memoryUsage.total)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUsageColor(metrics.memoryUsage.percentage)}`}
                style={{ width: `${metrics.memoryUsage.percentage}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {metrics.memoryUsage.percentage}% utilizado
            </div>
          </div>
        </div>

        {/* Uso de disco */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Uso de Disco
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Usado: {formatBytes(metrics.diskUsage.used)}</span>
              <span>Total: {formatBytes(metrics.diskUsage.total)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUsageColor(metrics.diskUsage.percentage)}`}
                style={{ width: `${metrics.diskUsage.percentage}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {metrics.diskUsage.percentage}% utilizado
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de base de datos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Estadísticas de Base de Datos
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.databaseStats.totalTables}
            </div>
            <div className="text-sm text-gray-500">Tablas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.databaseStats.totalRecords.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Registros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatBytes(metrics.databaseStats.databaseSize)}
            </div>
            <div className="text-sm text-gray-500">Tamaño BD</div>
          </div>
        </div>
      </div>

      {/* Indicador de estado */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-medium text-gray-900">
              Sistema Operativo
            </span>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </div>
      </div>
    </div>
  );
}
