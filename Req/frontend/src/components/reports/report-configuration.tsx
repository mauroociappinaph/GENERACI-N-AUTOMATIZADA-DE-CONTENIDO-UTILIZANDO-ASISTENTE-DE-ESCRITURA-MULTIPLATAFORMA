'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportTemplate } from '@/types';
import { useReportConfiguration } from './hooks/use-report-configuration';
import type { ReportConfigurationData } from './hooks/use-report-configuration';
import { ReportTemplateHeader } from './components/report-template-header';
import { ReportParameters } from './components/report-parameters';
import { ReportFormatSelector } from './components/report-format-selector';
import { ReportDeliveryMethod } from './components/report-delivery-method';

interface ReportConfigurationProps {
  template: ReportTemplate;
  onConfigurationChange: (config: ReportConfigurationData) => void;
  onPreview: () => void;
  onGenerate: () => void;
  loading?: boolean;
  error?: string | null;
}

// Re-export the type for external use
export type { ReportConfigurationData } from './hooks/use-report-configuration';

export function ReportConfiguration({
  template,
  onConfigurationChange,
  onPreview,
  onGenerate,
  loading = false,
  error = null,
}: ReportConfigurationProps) {
  const {
    config,
    validationErrors,
    handleParameterChange,
    handleFormatChange,
    handleDeliveryMethodChange,
    handleEmailChange,
    validateConfiguration,
  } = useReportConfiguration({
    template,
    onConfigurationChange,
  });

  const handlePreview = () => {
    if (validateConfiguration()) {
      onPreview();
    }
  };

  const handleGenerate = () => {
    if (validateConfiguration()) {
      onGenerate();
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <ReportTemplateHeader template={template} />

        <ReportParameters
          parameters={template.parameters}
          values={config.parameters}
          validationErrors={validationErrors}
          onParameterChange={handleParameterChange}
        />

        <ReportFormatSelector
          formats={template.formats}
          selectedFormat={config.format}
          onFormatChange={handleFormatChange}
        />

        <ReportDeliveryMethod
          deliveryMethod={config.deliveryMethod}
          email={config.email}
          emailError={validationErrors.email}
          onDeliveryMethodChange={handleDeliveryMethodChange}
          onEmailChange={handleEmailChange}
        />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button
            onClick={handlePreview}
            variant="outline"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <span>👁️</span>
            <span>{loading ? 'Loading...' : 'Preview Report'}</span>
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <span>🚀</span>
            <span>{loading ? 'Generating...' : 'Generate Report'}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
