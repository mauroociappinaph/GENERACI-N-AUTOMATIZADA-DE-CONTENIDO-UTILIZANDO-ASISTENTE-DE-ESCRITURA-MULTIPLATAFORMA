import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';

export function useDataRecordEdit(recordId: string) {
  const router = useRouter();
  const [record, setRecord] = useState<DataRecord | null>(null);
  const [conflictingRecord, setConflictingRecord] = useState<DataRecord | null>(null);
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

        const response = await dataService.getRecord(recordId);

        if (response.success && response.data) {
          setRecord(response.data);
          setOriginalVersion(response.data.metadata?.version || 1);
        } else {
          setError(response.error?.message || 'Error al cargar el registro');
        }
      } catch (err) {
        setError('Error de conexión al cargar el registro');
        if (err instanceof Error) {
          setError(`Error de conexión: ${err.message}`);
        }
      } finally {
        setIsLoadingRecord(false);
      }
    };

    if (recordId) {
      loadRecord();
    }
  }, [recordId]);

  const checkForConflicts = async (): Promise<boolean> => {
    try {
      const response = await dataService.checkForConflicts(recordId, originalVersion);
      if (response.success && response.data?.hasConflict && response.data.currentRecord) {
        setConflictingRecord(response.data.currentRecord);
        setShowConflictResolution(true);
        return true;
      }
      return false;
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error checking conflicts: ${err.message}`);
      }
      return false;
    }
  };

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await dataService.getRecordHistory(recordId);
      if (response.success && response.data) {
        setHistory(response.data);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error loading history: ${err.message}`);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return {
    // State
    record,
    conflictingRecord,
    history,
    showConflictResolution,
    showVersionHistory,
    isLoading,
    isLoadingRecord,
    isLoadingHistory,
    error,
    originalVersion,

    // Actions
    setRecord,
    setConflictingRecord,
    setShowConflictResolution,
    setShowVersionHistory,
    setIsLoading,
    setError,
    checkForConflicts,
    loadHistory,
    router,
  };
}
