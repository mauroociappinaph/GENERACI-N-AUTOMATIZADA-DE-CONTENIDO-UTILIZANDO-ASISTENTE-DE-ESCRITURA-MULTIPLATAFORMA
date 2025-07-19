import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';

interface UseDataRecordActionsProps {
  recordId: string;
  originalVersion: number;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkForConflicts: () => Promise<boolean>;
  router: any;
}

export function useDataRecordActions({
  recordId,
  originalVersion,
  setIsLoading,
  setError,
  checkForConflicts,
  router,
}: UseDataRecordActionsProps) {

  const handleSave = async (data: Partial<DataRecord>) => {
    try {
      setIsLoading(true);
      setError(null);

      const hasConflict = await checkForConflicts();
      if (hasConflict) {
        setIsLoading(false);
        return;
      }

      const response = await dataService.updateRecordWithVersion(
        recordId,
        data,
        originalVersion
      );

      if (response.success) {
        router.push('/data');
      } else {
        if (response.error?.code === 'CONFLICT') {
          await checkForConflicts();
        } else {
          setError(response.error?.message || 'Error al actualizar el registro');
        }
      }
    } catch (err) {
      setError('Error de conexión al actualizar el registro');
      if (err instanceof Error) {
        setError(`Error de conexión: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConflictResolve = async (
    resolution: 'current' | 'incoming' | 'merge',
    record: DataRecord | null,
    conflictingRecord: DataRecord | null,
    mergedData?: Partial<DataRecord>
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      let dataToSave: Partial<DataRecord>;

      switch (resolution) {
        case 'current':
          dataToSave = record!;
          break;
        case 'incoming':
          dataToSave = conflictingRecord!;
          break;
        case 'merge':
          dataToSave = mergedData!;
          break;
      }

      const response = await dataService.updateRecord(recordId, dataToSave);

      if (response.success) {
        router.push('/data');
      } else {
        setError(response.error?.message || 'Error al resolver el conflicto');
      }
    } catch (err) {
      setError('Error de conexión al resolver el conflicto');
      if (err instanceof Error) {
        setError(`Error de conexión: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreVersion = async (version: DataRecord) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dataService.updateRecord(recordId, {
        type: version.type,
        data: version.data,
        metadata: version.metadata,
      });

      if (response.success) {
        router.push('/data');
      } else {
        setError(response.error?.message || 'Error al restaurar la versión');
      }
    } catch (err) {
      setError('Error de conexión al restaurar la versión');
      if (err instanceof Error) {
        setError(`Error de conexión: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/data');
  };

  return {
    handleSave,
    handleConflictResolve,
    handleRestoreVersion,
    handleCancel,
  };
}
