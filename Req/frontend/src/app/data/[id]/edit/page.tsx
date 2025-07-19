'use client';

import { EditRecordContent } from '@/components/data/edit-record-content';
import { useDataRecordEdit } from '@/hooks/use-data-record-edit';
import { useDataRecordActions } from '@/hooks/use-data-record-actions';

interface EditDataRecordPageProps {
  params: {
    id: string;
  };
}

export default function EditDataRecordPage({
  params,
}: EditDataRecordPageProps) {
  const {
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
    setShowConflictResolution,
    setShowVersionHistory,
    setConflictingRecord,
    checkForConflicts,
    loadHistory,
    router,
    setIsLoading,
    setError,
  } = useDataRecordEdit(params.id);

  const {
    handleSave,
    handleConflictResolve,
    handleRestoreVersion,
    handleCancel,
  } = useDataRecordActions({
    recordId: params.id,
    originalVersion,
    setIsLoading,
    setError,
    checkForConflicts,
    router,
  });

  const handleConflictCancel = () => {
    setShowConflictResolution(false);
    setConflictingRecord(null);
  };

  const handleShowHistory = async () => {
    if (!showVersionHistory && history.length === 0) {
      await loadHistory();
    }
    setShowVersionHistory(true);
  };

  const onConflictResolve = async (
    resolution: 'current' | 'incoming' | 'merge',
    mergedData?: Partial<unknown>
  ) => {
    await handleConflictResolve(
      resolution,
      record,
      conflictingRecord,
      mergedData
    );
    setShowConflictResolution(false);
  };

  return (
    <EditRecordContent
      record={record}
      conflictingRecord={conflictingRecord}
      history={history}
      showConflictResolution={showConflictResolution}
      showVersionHistory={showVersionHistory}
      isLoading={isLoading}
      isLoadingRecord={isLoadingRecord}
      isLoadingHistory={isLoadingHistory}
      error={error}
      onSave={handleSave}
      onCancel={handleCancel}
      onConflictResolve={onConflictResolve}
      onConflictCancel={handleConflictCancel}
      onRestoreVersion={handleRestoreVersion}
      onShowHistory={handleShowHistory}
      onCloseHistory={() => setShowVersionHistory(false)}
    />
  );
}
