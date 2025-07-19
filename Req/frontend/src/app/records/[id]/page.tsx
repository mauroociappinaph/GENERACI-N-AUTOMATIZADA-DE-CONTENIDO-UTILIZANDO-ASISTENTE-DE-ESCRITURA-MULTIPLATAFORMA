'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';
import { RecordHeader } from '@/components/data/record-header';
import { RecordGeneralInfo } from '@/components/data/record-general-info';
import { RecordDataDisplay } from '@/components/data/record-data-display';
import { RecordMetadata } from '@/components/data/record-metadata';
import { VersionHistory } from '@/components/data/version-history';
import { RecordLoading } from '@/components/data/record-loading';
import { RecordError } from '@/components/data/record-error';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Trash2, History } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

export default function RecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const [record, setRecord] = useState<DataRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await dataService.getRecordById(recordId);

        if (response.success && response.data) {
          setRecord(response.data);
        } else {
          setError(response.error?.message || 'Error al cargar el registro');
        }
      } catch (err) {
        setError('Error de conexión al cargar el registro');
        if (err instanceof Error) {
          setError(`Error de conexión: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (recordId) {
      fetchRecord();
    }
  }, [recordId]);

  const handleEdit = () => {
    router.push(`/records/${recordId}/edit`);
  };

  const handleDelete = async () => {
    if (!record) return;

    try {
      const response = await dataService.deleteRecord(record.id);
      if (response.success) {
        toast({
          title: 'Registro eliminado',
          description: 'El registro fue eliminado correctamente.',
        });
        router.push('/records');
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
    }
  };

  if (loading) {
    return <RecordLoading />;
  }

  if (error) {
    return (
      <RecordError error={error} onRetry={() => window.location.reload()} />
    );
  }

  if (!record) {
    return (
      <RecordError
        error="Registro no encontrado"
        onRetry={() => router.push('/records')}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalle del Registro
            </h1>
            <p className="text-gray-600 mt-1">ID: {record.id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowVersionHistory(true)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Historial
          </Button>
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <RecordHeader record={record} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecordGeneralInfo record={record} />
          <RecordDataDisplay record={record} />
        </div>

        <div className="space-y-6">
          <RecordMetadata record={record} />
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flexstify-betenter">
                <h2 className="text-xl font-semibold">
                  Historial de Versiones
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowVersionHistory(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <VersionHistory recordId={record.id} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro{' '}
              <span className="font-semibold">{record.id}</span> será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
