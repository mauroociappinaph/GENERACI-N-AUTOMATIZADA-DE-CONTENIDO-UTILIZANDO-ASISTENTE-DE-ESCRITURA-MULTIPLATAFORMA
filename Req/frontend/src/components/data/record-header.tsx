import { Button } from '@/components/ui/button';
import { DataRecord } from '@/types';

interface RecordHeaderProps {
  record: DataRecord;
  onBackToList: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecordHeader({
  record,
  onBackToList,
  onEdit,
  onDelete,
}: RecordHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Detalle del Registro
        </h1>
        <p className="text-gray-600 mt-1">
          Información completa del registro de datos
        </p>
        <p className="text-sm text-gray-500 mt-1">ID: {record.id}</p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onBackToList}>
          Volver al Listado
        </Button>
        <Button variant="outline" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Eliminar
        </Button>
      </div>
    </div>
  );
}
