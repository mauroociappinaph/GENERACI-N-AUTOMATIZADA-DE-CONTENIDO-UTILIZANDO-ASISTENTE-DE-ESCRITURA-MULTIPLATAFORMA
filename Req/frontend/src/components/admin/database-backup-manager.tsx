import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSystemConfig } from '@/hooks/use-system-config';

export function DatabaseBackupManager() {
  const {
    backups,
    loading,
    error,
    backupPagination,
    fetchBackups,
    createBackup,
    restoreBackup,
  } = useSystemConfig();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backupDescription, setBackupDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);
      await createBackup(backupDescription || undefined);
      setBackupDescription('');
      setShowCreateModal(false);
      fetchBackups(); // Refresh the list
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (
      !window.confirm(
        '¿Está seguro de que desea restaurar este respaldo? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    try {
      setRestoring(backupId);
      await restoreBackup(backupId);
      alert('Respaldo restaurado exitosamente');
    } catch (error) {
      console.error('Error restoring backup:', error);
    } finally {
      setRestoring(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePageChange = (page: number) => {
    fetchBackups(page, backupPagination.limit);
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de crear respaldo */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Respaldos de Base de Datos
          </h3>
          <p className="text-sm text-gray-500">
            Gestione los respaldos de la base de datos del sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Crear Respaldo</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Lista de respaldos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading && backups.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay respaldos disponibles
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {backups.map(backup => (
              <li key={backup.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-medium">💾</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {backup.filename}
                        </div>
                        {backup.description && (
                          <div className="text-sm text-gray-500">
                            {backup.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {formatFileSize(backup.size)} • Creado por{' '}
                          {backup.createdBy} • {formatDate(backup.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={restoring === backup.id}
                    >
                      {restoring === backup.id ? 'Restaurando...' : 'Restaurar'}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Paginación */}
      {backupPagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {(backupPagination.page - 1) * backupPagination.limit + 1}{' '}
            a{' '}
            {Math.min(
              backupPagination.page * backupPagination.limit,
              backupPagination.total
            )}{' '}
            de {backupPagination.total} respaldos
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(backupPagination.page - 1)}
              disabled={backupPagination.page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(backupPagination.page + 1)}
              disabled={backupPagination.page >= backupPagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de crear respaldo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Respaldo</h2>

            <form onSubmit={handleCreateBackup} className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción (opcional)
                </label>
                <Input
                  id="description"
                  type="text"
                  value={backupDescription}
                  onChange={e => setBackupDescription(e.target.value)}
                  placeholder="Descripción del respaldo..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setBackupDescription('');
                  }}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creando...' : 'Crear Respaldo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
