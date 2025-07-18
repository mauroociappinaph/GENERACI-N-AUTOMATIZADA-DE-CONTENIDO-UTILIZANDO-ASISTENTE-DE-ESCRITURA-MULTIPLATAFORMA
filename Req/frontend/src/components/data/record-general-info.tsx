import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRecord } from '@/types';

interface RecordGeneralInfoProps {
  record: DataRecord;
}

function getPriorityColor(priority?: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function RecordGeneralInfo({ record }: RecordGeneralInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <p className="mt-1 text-sm text-gray-900">{record.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {record.metadata?.category || 'Sin categoría'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prioridad
            </label>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                record.metadata?.priority
              )}`}
            >
              {record.metadata?.priority || 'normal'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Versión
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {record.metadata?.version || 1}
            </p>
          </div>
        </div>

        {record.metadata?.tags && record.metadata.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2">
              {record.metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
