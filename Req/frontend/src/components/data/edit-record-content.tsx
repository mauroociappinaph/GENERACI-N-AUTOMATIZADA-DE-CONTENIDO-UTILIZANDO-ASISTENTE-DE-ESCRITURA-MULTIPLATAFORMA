import { DataRecord } from '@/types';
import { DataRecordForm } from '@/components/data/data-record-form';
import { ConflictResolution } from '@/components/data/conflict-resolution';
import { VersionHistory } from '@/components/data/version-history';
import { RecordLoading } from '@/components/data/record-loading';
import { RecordError } from '@/components/data/record-error';
import { RecordHeader } from '@/components/data/record-header';
import { Card, CardContent } from '@/components/ui/card';

interface EditRecordContentProps {
  record: DataRecord | null;
  conflictingRecord: DataRecord | null;
  history: DataRecord[];
  showConflictResolution: boolean;
  showVersionHistory: boolean;
  isLoading: boolean;
  isLoadingRecord: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  onSave: (data: Partial<DataRecord>) => Promise<void>;
  onCancel: () => void;
  onConflictResolve: (
    resolution: 'current' | 'incoming' | 'merge',
    mergedData?: Partial<any>
  ) => Promise<void>;
  onConflictCancel: () => void;
  onRestoreVersion: (version: DataRecord) => Promise<void>;
  onShowHistory: () => Promise<void>;
  onCloseHistory: () => void;
}

export function EditRecordContent({
  record,
  conflictingRecord,
  history,
  showConflictResolution,
  showVersionHistory,
  isLoading,
  isLoadingRecord,
  isLoadingHistory,
  error,
  onSave,
  onCancel,
  onConflictResolve,
  onConflictCancel,
  onRestoreVersion,
  onShowHistory,
  onCloseHistory,
}: EditRecordContentProps) {
  if (isLoadingRecord) {
    return <RecordLoading />;
  }

  if (error && !record) {
    return <RecordError error={error} />;
  }

  if (showConflictResolution && record && conflictingRecord) {
    return (
      <div className="container mx-auto py-6">
        <ConflictResolution
          currentRecord={record}
          conflictingRecord={conflictingRecord}
          onResolve={onConflictResolve}
          onCancel={onConflictCancel}
        />
      </div>
    );
  }

  if (showVersionHistory && record) {
    return (
      <div className="container mx-auto py-6">
        <VersionHistory
          history={history}
          onRestore={onRestoreVersion}
          onClose={onCloseHistory}
          isLoading={isLoadingHistory}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <RecordHeader
        record={record}
        onShowHistory={onShowHistory}
        isLoadingHistory={isLoadingHistory}
      />

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
          onSave={onSave}
          onCancel={onCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
