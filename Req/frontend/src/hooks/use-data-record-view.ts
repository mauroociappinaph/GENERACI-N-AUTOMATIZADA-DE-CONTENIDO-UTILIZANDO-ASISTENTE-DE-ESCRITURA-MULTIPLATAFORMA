import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataRecord } from '@/types';
import { dataService } from '@/lib/data-service';

export function useDataRecordView(recordId: string) {
  const router = useRouter();
  const [record, setRecord] = useState<DataRecord | null>(null);
  const [history, setHistory] = useState<DataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadRecord = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dataService.getRecord(recordId);

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
      setIsLoading(false);
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

  const handleShowHistory = () => {
    if (!showHistory && history.length === 0) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const handleEdit = () => {
    router.push(`/data/${recordId}/edit`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      '¿Está seguro de que desea eliminar este registro?'
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await dataService.deleteRecord(recordId);
      if (response.success) {
        router.push('/data');
      } else {
        window.alert(
          response.error?.message || 'Error al eliminar el registro'
        );
      }
    } catch (err) {
      window.alert('Error de conexión al eliminar el registro');
      if (err instanceof Error) {
        window.alert(`Error: ${err.message}`);
      }
    }
  };

  const handleBackToList = () => {
    router.push('/data');
  };

  useEffect(() => {
    if (recordId) {
      loadRecord();
    }
  }, [recordId]);

  return {
    record,
    history,
    isLoading,
    isLoadingHistory,
    error,
    showHistory,
    handleShowHistory,
    handleEdit,
    handleDelete,
    handleBackToList,
  };
}
