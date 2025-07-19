'use client';

import { useDataRecordView } from '@/hooks/use-data-record-view';
import { RecordViewHeader } from '@/components/data/record-view-header';
import { RecordGeneralInfo } from '@/components/data/record-general-info';
import { RecordDataDisplay } from '@/components/data/record-data-display';
import { RecordMetadata } from '@/components/data/record-metadata';
import { VersionHistory } from '@/components/data/version-history';
import { RecordLoading } from '@/components/data/record-loading';
import { RecordError } from '@/components/data/record-error';

interface ViewDataRecordPageProps {
  params: {
    id: string;
  };
}

export default function ViewDataRecordPage({
  params,
}: ViewDataRecordPageProps) {
  const {
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
  } = useDataRecordView(params.id);

  if (isLoading) {
    return <RecordLoading />;
  }

  if (error) {
    return <RecordError error={error} />;
  }

  if (!record) {
    return <RecordError error="Registro no encontrado" />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <RecordViewHeader
        record={record}
        onBackToList={handleBackToList}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecordGeneralInfo record={record} />
          <RecordDataDisplay record={record} />
        </div>

        <div className="space-y-6">
          <RecordMetadata record={record} />
          <VersionHistory
            history={history}
            showHistory={showHistory}
            isLoadingHistory={isLoadingHistory}
            onToggleHistory={handleShowHistory}
          />
        </div>
      </div>
    </div>
  );
}
