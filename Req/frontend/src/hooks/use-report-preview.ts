import { useState, useEffect, useCallback } from 'react';
import { ReportTemplate, ReportPreview as ReportPreviewType } from '@/types';
import { reportService } from '@/lib/report-service';

export function useReportPreview(template: ReportTemplate, parameters: Record<string, unknown>) {
  const [preview, setPreview] = useState<ReportPreviewType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.previewReport(template.id, parameters);
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  }, [template.id, parameters]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  return {
    preview,
    loading,
    error,
    loadPreview,
  };
}
