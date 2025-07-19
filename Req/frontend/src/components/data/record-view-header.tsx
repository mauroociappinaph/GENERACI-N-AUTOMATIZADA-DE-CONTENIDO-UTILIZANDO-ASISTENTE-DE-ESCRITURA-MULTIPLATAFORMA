import { DataRecord } from '@/types';
import { Button } from '@/components/ui/button';

interface RecordViewHeaderProps {
  record: DataRecord;
  onBackToList: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export function RecordViewHeader({
  record,
  onBackToList,
  onEdit,
  onDelete
}: RecordViewHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ver Registro</h1>
        <p className="text-gray-600 mt-1">
          Información detallada del registro de datos
        </p>
        {record && (
          <p className="text-sm text-gray-500 mt-1">
            ID: {record.id} | Tipo: {record.type} | Versión:{' '}
            {record.metadata?.version || 1}
          </p>
        )}
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onBackToList}>
          Volver a Lista
        </Button>
        <Button variant="outline" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          Eliminar
        </Button>
      </div>
    </div>
  );
}
