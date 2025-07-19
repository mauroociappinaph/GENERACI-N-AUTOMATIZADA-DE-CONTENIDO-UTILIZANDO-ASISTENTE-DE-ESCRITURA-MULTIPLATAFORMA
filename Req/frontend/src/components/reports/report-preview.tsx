'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportTemplate } from '@/types';
import { useReportPreview } from '@/hooks/use-report-preview';
import { ReportPreviewHeader } from './components/report-preview-header';
import { ReportPreviewLoading } from './components/report-preview-loading';
import { ReportPreviewError } from './components/report-preview-error';
import { ReportDataSummary } from './components/report-data-summary';
import { ReportDataVisualization } from './components/report-data-visualization';
import { ReportDataTable } from './components/report-data-table';

interface ReportPreviewProps {
  template: ReportTemplate;
  parameters: Record<string, unknown>;
  onClose: () => void;
}

export function ReportPreview({
  template,
  parameters,
  onClose,
}: ReportPreviewProps) {
  const { preview, loading, error, loadPreview } = useReportPreview(
    template,
    parameters
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <ReportPreviewHeader template={template} onClose={onClose} />

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && <ReportPreviewLoading />}

          {error && <ReportPreviewError error={error} onRetry={loadPreview} />}

          {preview && !loading && !error && (
            <div className="space-y-4">
              <ReportDataSummary preview={preview} />
              <ReportDataVisualization preview={preview} />
              <Card className="overflow-hidden">
                <ReportDataTable preview={preview} />
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          {preview && (
            <Button
              onClick={() => {
                // This would trigger the actual report generation
                onClose();
              }}
            >
              Generate Full Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
