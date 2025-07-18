import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRecord } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecordMetadataProps {
  record: DataRecord;
}

function formatDate(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return dateString;
  }
}

export function RecordMetadata({ record }: RecordMetadataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadatos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Creado
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {formatDate(record.createdAt)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Actualizado
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {formatDate(record.updatedAt)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Creado por
          </label>
          <p className="mt-1 text-sm text-gray-900">{record.createdBy}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Actualizado por
          </label>
          <p className="mt-1 text-sm text-gray-900">{record.updatedBy}</p>
        </div>
      </CardContent>
    </Card>
  );
}
