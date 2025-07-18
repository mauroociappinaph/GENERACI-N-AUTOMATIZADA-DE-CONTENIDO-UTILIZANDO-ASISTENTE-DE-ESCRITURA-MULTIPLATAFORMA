import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRecord } from '@/types';

interface RecordDataDisplayProps {
  record: DataRecord;
}

function renderValue(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function RecordDataDisplay({ record }: RecordDataDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Registro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(record.data).map(([key, value]) => (
            <div
              key={key}
              className="border-b border-gray-200 pb-4 last:border-b-0"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key}
              </label>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                  {renderValue(value)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
