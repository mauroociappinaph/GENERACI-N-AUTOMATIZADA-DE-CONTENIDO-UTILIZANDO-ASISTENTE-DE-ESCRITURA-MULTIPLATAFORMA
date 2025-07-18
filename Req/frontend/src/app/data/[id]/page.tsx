'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ViewDataRecordPageProps {
  params: {
    id: string;
  };
}

export default function ViewDataRecordPage({
  params,
}: ViewDataRecordPageProps) {
  const router = useRouter();
  const [record, setRecord] = useState<DataRecord | null>(null);
  const [history, setHistory] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await dataService.getRecord(params.id);

        if (response.success && response.data) {
          setRecord(response.data);
        } else {
          setError(response.error?.message || 'Error al cargar el registro');
        }
      } catch (err) {
        setError('Error de conexión al cargar el registro');
        console.error('Error loading record:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadRecord();
    }
  }, [params.id]);

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await dataService.getRecordHistory(params.id);

      if (response.success && response.data) {
        setHistory(response.data);
      }
    } catch (err) {
      console.error('Error loading record history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleShowHistory = () => {
    if (!showHistory && history.length === 0) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const handleEdit = () => {
    router.push(`/data/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de que desea eliminar este registro?')) {
      return;
    }

    try {
      const response = await dataService.deleteRecord(params.id);
      if (response.success) {
        router.push('/data');
      } else {
        alert(response.error?.message || 'Error al eliminar el registro');
      }
    } catch (err) {
      alert('Error de conexión al eliminar el registro');
      console.error('Error deleting record:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return dateString;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando registro...</span>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error || 'Registro no encontrado'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Detalle del Registro
          </h1>
          <p className="text-gray-600 mt-1">
            Información completa del registro de datos
          </p>
          <p className="text-sm text-gray-500 mt-1">ID: {record.id}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/data')}>
            Volver al Listado
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            Editar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{record.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoría
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {record.metadata?.category || 'Sin categoría'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prioridad
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                      record.metadata?.priority
                    )}`}
                  >
                    {record.metadata?.priority || 'normal'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Versión
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {record.metadata?.version || 1}
                  </p>
                </div>
              </div>

              {record.metadata?.tags && record.metadata.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {record.metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos del Registro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(record.data).map(([key, value]) => (
                  <div
                    key={key}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key}
                    </label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                        {renderValue(value)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Creado
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(record.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Actualizado
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(record.updatedAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Creado por
                </label>
                <p className="mt-1 text-sm text-gray-900">{record.createdBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Actualizado por
                </label>
                <p className="mt-1 text-sm text-gray-900">{record.updatedBy}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historial</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowHistory}
                  isLoading={isLoadingHistory}
                >
                  {showHistory ? 'Ocultar' : 'Ver'} Historial
                </Button>
              </div>
            </CardHeader>
            {showHistory && (
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((historyRecord, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-blue-200 pl-4"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          Versión {historyRecord.metadata?.version || index + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(historyRecord.updatedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          por {historyRecord.updatedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No hay historial disponible
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
