import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReportPreviewErrorProps {
  error: string;
  onRetry: () => void;
}

export function ReportPreviewError({ error, onRetry }: ReportPreviewErrorProps) {
  return (
    <Card className="p-4 border-red-200 bg-red-50">
      <div className="flex items-center space-x-2">
        <span className="text-red-500">⚠️</span>
        <div>
          <p className="text-red-800 font-medium">Preview Error</p>
          <p className="text-red-600 text-sm">{error}</p>
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      </div>
    </Card>
  );
}
