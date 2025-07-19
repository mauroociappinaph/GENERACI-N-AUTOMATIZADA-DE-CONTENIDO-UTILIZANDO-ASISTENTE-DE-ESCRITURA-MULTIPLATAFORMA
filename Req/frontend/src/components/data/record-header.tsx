import { DataRecord } from '@/types';
import { Button } from '@/components/ui/button';

interface RecordHeaderProps {
  record: DataRecord | null;
  onShowHistory: () => void;
  isLoadingHistory: boolean;
}

export function RecordHeader({ record, onShowHistory, isLoadingHistory }: RecordHeaderProps) {
  return (
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
          onClick={onShowHistory}
          disabled={isLoadingHistory}
        >
          Ver Historial
        </Button>
      </div>
    </div>
  );
}
