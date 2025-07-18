import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemConfig } from '@/hooks/use-system-config';

export function SystemLogsViewer() {
  const { logs, loading, error, logPagination, fetchLogs, cleanupLogs } =
    useSystemConfig();

  const [filters, setFilters] = useState({
    level: '',
    startDate: '',
    endDate: '',
  });
  const [cleaning, setCleaning] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs({
      page: 1,
      limit: logPagination.limit,
      level: filters.level || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      level: '',
      startDate: '',
      endDate: '',
    });
    fetchLogs({ page: 1, limit: logPagination.limit });
  };

  const handleCleanupLogs = async () => {
    if (
      !window.confirm(
        `¿Está seguro de que desea eliminar logs anteriores a ${cleanupDays} días?`
      )
    ) {
      return;
    }

    try {
      setCleaning(true);
      const result = await cleanupLogs(cleanupDays);
      alert(`Se eliminaron ${result.deletedCount} logs antiguos`);
      fetchLogs(); // Refresh the list
    } catch (error) {
      console.error('Error cleaning up logs:', error);
    } finally {
      setCleaning(false);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      error: 'bg-red-100 text-red-800',
      warn: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      debug: 'bg-gray-100 text-gray-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelIcon = (level: string) => {
    const icons = {
      error: '🔴',
      warn: '🟡',
      info: '🔵',
      debug: '⚪',
    };
    return icons[level as keyof typeof icons] || '⚪';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handlePageChange = (page: number) => {
    fetchLogs({
      page,
      limit: logPagination.limit,
      level: filters.level || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header y controles */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Logs del Sistema
          </h3>
          <p className="text-sm text-gray-500">
            Visualice y gestione los logs del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={cleanupDays}
            onChange={e => setCleanupDays(parseInt(e.target.value))}
            min="1"
            max="365"
            className="w-20"
          />
          <Button
            variant="outline"
            onClick={handleCleanupLogs}
            disabled={cleaning}
          >
            {cleaning ? 'Limpiando...' : 'Limpiar Logs'}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label
              htmlFor="level"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nivel
            </label>
            <select
              id="level"
              value={filters.level}
              onChange={e => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los niveles</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Inicio
            </label>
            <Input
              id="startDate"
              type="datetime-local"
              value={filters.startDate}
              onChange={e => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Fin
            </label>
            <Input
              id="endDate"
              type="datetime-local"
              value={filters.endDate}
              onChange={e => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Lista de logs */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading && logs.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay logs disponibles
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {logs.map(log => (
              <li key={log.id} className="px-6 py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getLevelIcon(log.level)}</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}
                        >
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-900">{log.message}</p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          <details>
                            <summary className="cursor-pointer hover:text-gray-700">
                              Ver metadatos
                            </summary>
                            <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Paginación */}
      {logPagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {(logPagination.page - 1) * logPagination.limit + 1} a{' '}
            {Math.min(
              logPagination.page * logPagination.limit,
              logPagination.total
            )}{' '}
            de {logPagination.total} logs
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(logPagination.page - 1)}
              disabled={logPagination.page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(logPagination.page + 1)}
              disabled={logPagination.page >= logPagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
