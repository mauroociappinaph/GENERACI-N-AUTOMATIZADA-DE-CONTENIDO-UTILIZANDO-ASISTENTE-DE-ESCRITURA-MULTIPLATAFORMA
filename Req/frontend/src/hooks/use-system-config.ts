import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface SystemConfig {
  siteName: string;
  siteDescription?: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxFileUploadSize: number;
  sessionTimeout: number;
  emailNotifications: boolean;
  backupRetentionDays: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxLoginAttempts: number;
  passwordMinLength: number;
  requirePasswordComplexity: boolean;
}

interface DatabaseBackup {
  id: string;
  filename: string;
  description?: string;
  size: number;
  createdBy: string;
  createdAt: string;
}

interface SystemLog {
  id: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  databaseStats: {
    totalTables: number;
    totalRecords: number;
    databaseSize: number;
  };
  activeUsers: number;
  requestsPerMinute: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupPagination, setBackupPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [logPagination, setLogPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const fetchSystemConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/system-config');

      if (response.data.success) {
        setConfig(response.data.data.config);
      } else {
        throw new Error('Error al obtener configuración del sistema');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Error al obtener configuración del sistema'
      );
      console.error('Error fetching system config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSystemConfig = useCallback(
    async (configData: Partial<SystemConfig>) => {
      try {
        setError(null);
        const response = await api.put('/system-config', configData);

        if (!response.data.success) {
          throw new Error('Error al actualizar configuración del sistema');
        }

        setConfig(response.data.data.config);
        return response.data.data.config;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error?.message ||
          'Error al actualizar configuración del sistema';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const fetchBackups = useCallback(
    async (page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          `/system-config/backups?page=${page}&limit=${limit}`
        );

        if (response.data.success) {
          setBackups(response.data.data.backups);
          setBackupPagination({
            page: response.data.data.page,
            limit: response.data.data.limit || 10,
            total: response.data.data.total,
            totalPages: response.data.data.totalPages,
          });
        } else {
          throw new Error('Error al obtener respaldos');
        }
      } catch (err: any) {
        setError(
          err.response?.data?.error?.message || 'Error al obtener respaldos'
        );
        console.error('Error fetching backups:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createBackup = useCallback(async (description?: string) => {
    try {
      setError(null);
      const response = await api.post('/system-config/backups', {
        description,
      });

      if (!response.data.success) {
        throw new Error('Error al crear respaldo');
      }

      return response.data.data.backup;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || 'Error al crear respaldo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const restoreBackup = useCallback(async (backupId: string) => {
    try {
      setError(null);
      const response = await api.post(
        `/system-config/backups/${backupId}/restore`
      );

      if (!response.data.success) {
        throw new Error('Error al restaurar respaldo');
      }

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || 'Error al restaurar respaldo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const fetchLogs = useCallback(
    async (
      options: {
        page?: number;
        limit?: number;
        level?: string;
        startDate?: string;
        endDate?: string;
      } = {}
    ) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (options.page) queryParams.append('page', options.page.toString());
        if (options.limit)
          queryParams.append('limit', options.limit.toString());
        if (options.level) queryParams.append('level', options.level);
        if (options.startDate)
          queryParams.append('startDate', options.startDate);
        if (options.endDate) queryParams.append('endDate', options.endDate);

        const response = await api.get(
          `/system-config/logs?${queryParams.toString()}`
        );

        if (response.data.success) {
          setLogs(response.data.data.logs);
          setLogPagination({
            page: response.data.data.page,
            limit: response.data.data.limit || 50,
            total: response.data.data.total,
            totalPages: response.data.data.totalPages,
          });
        } else {
          throw new Error('Error al obtener logs');
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Error al obtener logs');
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cleanupLogs = useCallback(async (days: number = 30) => {
    try {
      setError(null);
      const response = await api.post('/system-config/logs/cleanup', { days });

      if (!response.data.success) {
        throw new Error('Error al limpiar logs');
      }

      return response.data.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message || 'Error al limpiar logs';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/system-config/metrics');

      if (response.data.success) {
        setMetrics(response.data.data.metrics);
      } else {
        throw new Error('Error al obtener métricas');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Error al obtener métricas'
      );
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    config,
    backups,
    logs,
    metrics,
    loading,
    error,
    backupPagination,
    logPagination,
    fetchSystemConfig,
    updateSystemConfig,
    fetchBackups,
    createBackup,
    restoreBackup,
    fetchLogs,
    cleanupLogs,
    fetchMetrics,
  };
}
