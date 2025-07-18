'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdvancedChart } from '@/components/charts/advanced-charts';
import {
  RealTimeChart,
  MultiSeriesRealTimeChart,
} from '@/components/charts/real-time-chart';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalRecords: number;
    totalReports: number;
    systemHealth: number;
  };
  trends: {
    users: number[];
    records: number[];
    reports: number[];
    months: string[];
  };
  distribution: {
    usersByRole: Array<{ name: string; value: number }>;
    recordsByType: Array<{ name: string; value: number }>;
    reportsByStatus: Array<{ name: string; value: number }>;
  };
  performance: {
    responseTime: number[];
    throughput: number[];
    errorRate: number[];
    timestamps: string[];
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '7d' | '30d' | '90d' | '1y'
  >('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate mock analytics data
  const generateMockAnalyticsData = useCallback(
    async (timeRange: string): Promise<AnalyticsData> => {
      // Simulate API delay
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 500);
      });

      const periods =
        timeRange === '7d'
          ? 7
          : timeRange === '30d'
            ? 30
            : timeRange === '90d'
              ? 90
              : 365;
      const months = [
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
      ];

      return {
        overview: {
          totalUsers: Math.floor(Math.random() * 1000) + 500,
          totalRecords: Math.floor(Math.random() * 10000) + 5000,
          totalReports: Math.floor(Math.random() * 500) + 100,
          systemHealth: Math.floor(Math.random() * 20) + 80,
        },
        trends: {
          users: Array.from(
            { length: Math.min(periods, 12) },
            () => Math.floor(Math.random() * 200) + 800
          ),
          records: Array.from(
            { length: Math.min(periods, 12) },
            () => Math.floor(Math.random() * 500) + 1200
          ),
          reports: Array.from(
            { length: Math.min(periods, 12) },
            () => Math.floor(Math.random() * 50) + 20
          ),
          months: months.slice(0, Math.min(periods, 12)),
        },
        distribution: {
          usersByRole: [
            {
              name: 'Administradores',
              value: Math.floor(Math.random() * 50) + 10,
            },
            { name: 'Editores', value: Math.floor(Math.random() * 200) + 100 },
            { name: 'Usuarios', value: Math.floor(Math.random() * 500) + 300 },
            { name: 'Invitados', value: Math.floor(Math.random() * 100) + 50 },
          ],
          recordsByType: [
            {
              name: 'Documentos',
              value: Math.floor(Math.random() * 1000) + 500,
            },
            { name: 'Imágenes', value: Math.floor(Math.random() * 800) + 400 },
            { name: 'Videos', value: Math.floor(Math.random() * 300) + 100 },
            { name: 'Otros', value: Math.floor(Math.random() * 200) + 50 },
          ],
          reportsByStatus: [
            { name: 'Completados', value: Math.floor(Math.random() * 80) + 60 },
            { name: 'En Proceso', value: Math.floor(Math.random() * 20) + 10 },
            { name: 'Pendientes', value: Math.floor(Math.random() * 15) + 5 },
            { name: 'Fallidos', value: Math.floor(Math.random() * 5) + 1 },
          ],
        },
        performance: {
          responseTime: Array.from(
            { length: 24 },
            () => Math.floor(Math.random() * 200) + 100
          ),
          throughput: Array.from(
            { length: 24 },
            () => Math.floor(Math.random() * 1000) + 500
          ),
          errorRate: Array.from({ length: 24 }, () => Math.random() * 5),
          timestamps: Array.from(
            { length: 24 },
            (_, i) => `${i.toString().padStart(2, '0')}:00`
          ),
        },
      };
    },
    []
  );

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const analyticsData = await generateMockAnalyticsData(selectedTimeRange);
      setData(analyticsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error loading analytics data'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange, generateMockAnalyticsData]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadAnalyticsData, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, loadAnalyticsData]);

  const timeRangeOptions = [
    { value: '7d', label: '7 días' },
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' },
    { value: '1y', label: '1 año' },
  ];

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error al cargar analytics
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={loadAnalyticsData}
            variant="outline"
            className="border-red-300 text-red-700"
          >
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard de Analytics
          </h2>
          <p className="text-gray-600">
            Visualización de datos y métricas en tiempo real
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Período:
            </label>
            <select
              value={selectedTimeRange}
              onChange={e =>
                setSelectedTimeRange(
                  e.target.value as '7d' | '30d' | '90d' | '1y'
                )
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? 'primary' : 'outline'}
            size="sm"
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>

          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Usuarios
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Registros
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalRecords.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Reportes
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.totalReports.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Salud del Sistema
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.overview.systemHealth}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <AdvancedChart
            data={data.trends.months.map((month, index) => ({
              name: month,
              value: data.trends.users[index] || 0,
            }))}
            type="area"
            title="Tendencia de Usuarios"
            height={300}
            colors={['#3b82f6']}
          />
        </Card>

        <Card className="p-6">
          <AdvancedChart
            data={data.trends.months.map((month, index) => ({
              name: month,
              value: data.trends.records[index] || 0,
              trend: data.trends.reports[index] || 0,
            }))}
            type="composed"
            title="Registros vs Reportes"
            height={300}
            colors={['#10b981', '#f59e0b']}
          />
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <AdvancedChart
            data={data.distribution.usersByRole}
            type="pie"
            title="Distribución de Usuarios por Rol"
            height={300}
            showLegend={true}
          />
        </Card>

        <Card className="p-6">
          <AdvancedChart
            data={data.distribution.recordsByType}
            type="bar"
            title="Registros por Tipo"
            height={300}
            colors={['#8b5cf6']}
          />
        </Card>

        <Card className="p-6">
          <AdvancedChart
            data={data.distribution.reportsByStatus}
            type="radial"
            title="Estado de Reportes"
            height={300}
            colors={['#10b981', '#f59e0b', '#ef4444', '#6b7280']}
          />
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart
          title="Actividad de Usuarios en Tiempo Real"
          dataSource="users"
          updateInterval={3000}
          chartType="line"
          color="#3b82f6"
          height={300}
        />

        <RealTimeChart
          title="Creación de Registros en Tiempo Real"
          dataSource="records"
          updateInterval={5000}
          chartType="area"
          color="#10b981"
          height={300}
        />
      </div>

      {/* Multi-series Real-time Chart */}
      <Card className="p-6">
        <MultiSeriesRealTimeChart
          title="Métricas del Sistema en Tiempo Real"
          series={[
            { name: 'Usuarios Activos', dataSource: 'users', color: '#3b82f6' },
            {
              name: 'Registros Procesados',
              dataSource: 'records',
              color: '#10b981',
            },
            {
              name: 'Reportes Generados',
              dataSource: 'reports',
              color: '#f59e0b',
            },
          ]}
          updateInterval={4000}
          height={400}
        />
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <AdvancedChart
            data={data.performance.timestamps.map((time, index) => ({
              name: time,
              value: data.performance.responseTime[index] || 0,
            }))}
            type="line"
            title="Tiempo de Respuesta (ms)"
            height={300}
            colors={['#ef4444']}
          />
        </Card>

        <Card className="p-6">
          <AdvancedChart
            data={data.performance.timestamps.map((time, index) => ({
              name: time,
              value: data.performance.throughput[index] || 0,
            }))}
            type="bar"
            title="Throughput (req/min)"
            height={300}
            colors={['#06b6d4']}
          />
        </Card>
      </div>
    </div>
  );
}
