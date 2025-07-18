'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataRecord, SearchCriteria } from '@/types';
import { dataService } from '@/lib/data-service';
import { DataTable } from '@/components/data/data-table';
import { DataFilters } from '@/components/data/data-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

export default function DataPage() {
  const router = useRouter();
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    query: '',
    filters: {},
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  const [recordToDelete, setRecordToDelete] = useState<DataRecord | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchRecords = useCallback(async (criteria: SearchCriteria) => {
    try {
      setLoading(true);
      setError(null);

      const response = await dataService.getRecords(criteria);

      if (response.success && response.data) {
        setRecords(response.data.records);
        setPagination(response.data.pagination);
      } else {
        setError(response.error?.message || 'Error al cargar los registros');
      }
    } catch (err) {
      setError('Error de conexión al cargar los registros');
      if (err instanceof Error) {
        setError(`Error de conexión: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(searchCriteria);
  }, [searchCriteria, fetchRecords]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchCriteria(prev => ({ ...prev, query, page: 1 }));
  };

  const handleFilterChange = (filters: Record<string, unknown>) => {
    setSearchCriteria(prev => ({ ...prev, filters, page: 1 }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSearchCriteria(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchCriteria(prev => ({ ...prev, page }));
  };

  const handleCreateNew = () => {
    router.push('/data/new');
  };

  const handleEditRecord = (id: string) => {
    router.push(`/data/${id}/edit`);
  };

  const handleViewRecord = (id: string) => {
    router.push(`/data/${id}`);
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;

    try {
      const response = await dataService.deleteRecord(recordToDelete.id);
      if (response.success) {
        toast({
          title: 'Registro eliminado',
          description: `El registro "${recordToDelete.id}" fue eliminado correctamente.`,
        });
        fetchRecords(searchCriteria);
      } else {
        toast({
          title: 'Error al eliminar',
          description: response.error?.message || 'Error desconocido.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error de conexión',
        description: err instanceof Error ? err.message : 'Error desconocido.',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Datos</h1>
          <p className="text-gray-600 mt-1">
            Administre y consulte los registros de datos del sistema
          </p>
        </div>
        <Button onClick={handleCreateNew}>Crear Nuevo Registro</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda y Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar registros..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <DataFilters
            onFilterChange={handleFilterChange}
            currentFilters={searchCriteria.filters}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Registros de Datos
              {pagination.total > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({pagination.total} registros)
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <DataTable
            records={records}
            loading={loading}
            pagination={pagination}
            sortBy={searchCriteria.sortBy}
            sortOrder={searchCriteria.sortOrder}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onView={handleViewRecord}
            onEdit={handleEditRecord}
            onDelete={(id: string) => {
              const record = records.find(r => r.id === id) || null;
              setRecordToDelete(record);
              setShowDeleteDialog(true);
            }}
          />
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro{' '}
              <span className="font-semibold">
                {recordToDelete?.id || 'N/A'}
              </span>{' '}
              será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteRecord}>
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
