import { Card, CardContent } from '@/components/ui/card';

interface RecordErrorProps {
  error: string;
}

export function RecordError({ error }: RecordErrorProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Error</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
