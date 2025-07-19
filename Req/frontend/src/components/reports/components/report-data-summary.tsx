import { Card } from '@/components/ui/card';
import { ReportPreview } from '@/types';

interface ReportDataSummaryProps {
  preview: ReportPreview;
}

export function ReportDataSummary({ preview }: ReportDataSummaryProps) {
  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-blue-800">Total Records:</span>
          <span className="ml-2 text-blue-700">
            {preview.totalRecords.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="font-medium text-blue-800">Preview Records:</span>
          <span className="ml-2 text-blue-700">
            {preview.previewRecords.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="font-medium text-blue-800">Generated:</span>
          <span className="ml-2 text-blue-700">
            {new Date(preview.generatedAt).toLocaleString()}
          </span>
        </div>
      </div>
      {preview.previewRecords < preview.totalRecords && (
        <div className="mt-2 text-sm text-blue-700">
          <span className="font-medium">Note:</span> This preview shows the first{' '}
          {preview.previewRecords} records. The full report will contain all{' '}
          {preview.totalRecords.toLocaleString()} records.
        </div>
      )}
    </Card>
  );
}
