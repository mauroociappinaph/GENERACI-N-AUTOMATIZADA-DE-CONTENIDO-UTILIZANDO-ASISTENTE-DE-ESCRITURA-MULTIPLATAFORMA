'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';
import { DataRecordForm } from '@/components/data/data-record-form';
import { ConflictResolution } from '@/components/data/conflict-resolution';
import { RecordLoading } from '@/components/data/record-loading';
import { RecordError } from '@/components/data/record-error';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function EditRecordPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const [record, setRecord] = useState<DataRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);

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

  const handleSubmit = async (data: Partial<DataRecord>) => {
    if (!record) return;

    try {
      setSaving(true);
      const response = await dataService.updateRecord(record.id, data);

      if (response.success) {
        toast({
          title: 'Registro actualizado',
          description: 'El registro fue actualizado exitosamente.',
        });
        router.push(`/records/${record.id}`);
      } else if (response.error?.code === 'EDIT_CONFLICT') {
        // Handle edit conflict
        setHasConflict(true);
        setConflictData(response.error.details);
        toast({
          title: 'Conflicto de edición detectado',
          description:
            'Otro usuario ha modificado este registro. Resuelva el conflicto para continuar.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error al actualizar registro',
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
      setSaving(false);
    }
  };

  const handleConflictResolution = async (
    resolvedData: Partial<DataRecord>
  ) => {
    try {
      setSaving(true);
      const response = await dataService.updateRecord(
        record!.id,
        resolvedData,
        { forceUpdate: true }
      );

      if (response.success) {
        toast({
          title: 'Conflicto resuelto',
          description: 'El registro fue actualizado exitosamente.',
        });
        setHasConflict(false);
        setConflictData(null);
        router.push(`/records/${record!.id}`);
      } else {
        toast({
          title: 'Error al resolver conflicto',
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
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/records/${recordId}`);
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Registro</h1>
          <p className="text-gray-600 mt-1">ID: {record.id}</p>
        </div>
      </div>

      {hasConflict && conflictData && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Conflicto de Edición Detectado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              Otro usuario ha modificado este registro mientras usted lo
              editaba. Revise los cambios y seleccione cómo resolver el
              conflicto.
            </p>
            <ConflictResolution
              currentData={record}
              conflictData={conflictData}
              onResolve={handleConflictResolution}
              onCancel={() => {
                setHasConflict(false);
                setConflictData(null);
              }}
              loading={saving}
            />
          </CardContent>
        </Card>
      )}

      {!hasConflict && (
        <Card>
          <CardHeader>
            <CardTitle>Editar Información del Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <DataRecordForm
              initialData={record}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={saving}
              submitLabel="Actualizar Registro"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
