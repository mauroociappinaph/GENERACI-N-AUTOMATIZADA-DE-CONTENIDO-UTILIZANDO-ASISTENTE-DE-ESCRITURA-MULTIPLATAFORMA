'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';
import { DataRecordForm } from '@/components/data/data-record-form';
import { ConflictResolution } from '@/components/data/conflict-resolution';
import { VersionHistory } from '@/components/data/version-history';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EditDataRecordPageProps {
  params: {
    id: string;
  };
}

export default function EditDataRecordPage({
  params,
}: EditDataRecordPageProps) {
  const router = useRouter();
  const [record, setRecord] = useState<DataRecord | null>(null);
  const [conflictingRecord, setConflictingRecord] = useState<DataRecord | null>(
    null
  );
  const [history, setHistory] = useState<DataRecord[]>([]);
  const [showConflictResolution, setShowConflictResolution] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalVersion, setOriginalVersion] = useState<number>(1);

  useEffect(() => {
    const loadRecord = async () => {
      try {
        setIsLoadingRecord(true);
        setError(null);

        const response = await dataService.getRecord(params.id);

        if (response.success && response.data) {
          setRecord(response.data);
          setOriginalVersion(response.data.metadata?.version || 1);
        } else {
          setError(response.error?.message || 'Error al cargar el registro');
        }
      } catch (err) {
        setError('Error de conexión al cargar el registro');
        console.error('Error loading record:', err);
      } finally {
        setIsLoadingRecord(false);
      }
    };

    if (params.id) {
      loadRecord();
    }
  }, [params.id]);

  const checkForConflicts = async (): Promise<boolean> => {
    try {
      const response = await dataService.checkForConflicts(
        params.id,
        originalVersion
      );
      if (
        response.success &&
        response.data?.hasConflict &&
        response.data.currentRecord
      ) {
        setConflictingRecord(response.data.currentRecord);
        setShowConflictResolution(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking for conflicts:', err);
      return false;
    }
  };

  const handleSave = async (data: Partial<DataRecord>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check for conflicts before saving
      const hasConflict = await checkForConflicts();
      if (hasConflict) {
        setIsLoading(false);
        return;
      }

      const response = await dataService.updateRecordWithVersion(
        params.id,
        data,
        originalVersion
      );

      if (response.success) {
        router.push('/data');
      } else {
        // If we get a conflict error, show conflict resolution
        if (response.error?.code === 'CONFLICT') {
          await checkForConflicts();
        } else {
          setError(
            response.error?.message || 'Error al actualizar el registro'
          );
        }
      }
    } catch (err) {
      setError('Error de conexión al actualizar el registro');
      console.error('Error updating record:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConflictResolve = async (
    resolution: 'current' | 'incoming' | 'merge',
    mergedData?: Partial<DataRecord>
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      let dataToSave: Partial<DataRecord>;

      switch (resolution) {
        case 'current':
          // Keep the current form data
          dataToSave = record!;
          break;
        case 'incoming':
          // Use the server version
          dataToSave = conflictingRecord!;
          setRecord(conflictingRecord);
          break;
        case 'merge':
          // Use the merged data
          dataToSave = mergedData!;
          break;
      }

      const response = await dataService.updateRecord(params.id, dataToSave);

      if (response.success) {
        setShowConflictResolution(false);
        router.push('/data');
      } else {
        setError(response.error?.message || 'Error al resolver el conflicto');
      }
    } catch (err) {
      setError('Error de conexión al resolver el conflicto');
      console.error('Error resolving conflict:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConflictCancel = () => {
    setShowConflictResolution(false);
    setConflictingRecord(null);
  };

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await dataService.getRecordHistory(params.id);
      if (response.success && response.data) {
        setHistory(response.data);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleShowHistory = async () => {
    if (!showVersionHistory && history.length === 0) {
      await loadHistory();
    }
    setShowVersionHistory(true);
  };

  const handleRestoreVersion = async (version: DataRecord) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dataService.updateRecord(params.id, {
        type: version.type,
        data: version.data,
        metadata: version.metadata,
      });

      if (response.success) {
        setShowVersionHistory(false);
        router.push('/data');
      } else {
        setError(response.error?.message || 'Error al restaurar la versión');
      }
    } catch (err) {
      setError('Error de conexión al restaurar la versión');
      console.error('Error restoring version:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/data');
  };

  if (isLoadingRecord) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando registro...</span>
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show conflict resolution if there's a conflict
  if (showConflictResolution && record && conflictingRecord) {
    return (
      <div className="container mx-auto py-6">
        <ConflictResolution
          currentRecord={record}
          conflictingRecord={conflictingRecord}
          onResolve={handleConflictResolve}
          onCancel={handleConflictCancel}
        />
      </div>
    );
  }

  // Show version history if requested
  if (showVersionHistory && record) {
    return (
      <div className="container mx-auto py-6">
        <VersionHistory
          currentRecord={record}
          history={history}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
          isLoading={isLoadingHistory}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Registro</h1>
          <p className="text-gray-600 mt-1">
            Modifique la información del registro de datos
          </p>
          {record && (
            <p className="text-sm text-gray-500 mt-1">
              ID: {record.id} | Tipo: {record.type} | Versión:{' '}
              {record.metadata?.version || 1}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleShowHistory}
            disabled={isLoadingHistory}
          >
            Ver Historial
          </Button>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {record && (
        <DataRecordForm
          record={record}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
