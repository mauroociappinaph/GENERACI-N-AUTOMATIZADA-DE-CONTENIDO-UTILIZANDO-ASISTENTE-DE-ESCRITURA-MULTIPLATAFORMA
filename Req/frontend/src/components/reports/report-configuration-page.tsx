'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ReportConfiguration,
  ReportConfiguration as ReportConfigType,
} from './report-configuration';
import { ReportPreview } from './report-preview';
import { ReportTemplate, ReportRequest, ReportResult } from '@/types';
import { reportService } from '@/lib/report-service';

interface ReportConfigurationPageProps {
  templates: ReportTemplate[];
}

export function ReportConfigurationPage({
  templates,
}: ReportConfigurationPageProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [configuration, setConfiguration] = useState<ReportConfigType | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(false);
    setError(null);
    setSuccess(null);
  };

  const handleConfigurationChange = (config: ReportConfigType) => {
    setConfiguration(config);
  };

  const handlePreview = async () => {
    if (!selectedTemplate || !configuration) return;

    try {
      setLoading(true);
      setError(null);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !configuration) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const request: ReportRequest = {
        templateId: configuration.templateId,
        parameters: configuration.parameters,
        format: configuration.format,
        deliveryMethod: configuration.deliveryMethod,
        email: configuration.email,
      };

      const result: ReportResult = await reportService.generateReport(request);

      if (configuration.deliveryMethod === 'download') {
        await reportService.downloadReport(result.reportId);
        setSuccess('Report generated and downloaded successfully!');
      } else {
        setSuccess(`Report generated and sent to ${configuration.email}!`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate report'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Report Configuration
          </h2>
          <p className="text-gray-600">
            Configure and customize your reports with advanced options, preview
            before generating, and set up automated delivery.
          </p>
        </div>
      </Card>

      {/* Template Selection */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          1. Select Report Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`
                p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                {selectedTemplate?.id === template.id && (
                  <span className="text-blue-500 text-xl">✓</span>
                )}
              </div>

              {template.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {template.formats.map(fmt => (
                    <span
                      key={fmt}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {fmt.toUpperCase()}
                    </span>
                  ))}
                </div>

                {template.parameters.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {template.parameters.length} parameter
                    {template.parameters.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">
              No Report Templates Available
            </h3>
            <p className="text-sm">
              Contact your administrator to set up report templates.
            </p>
          </div>
        )}
      </Card>

      {/* Configuration Panel */}
      {selectedTemplate && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              2. Configure Report Settings
            </h3>
            <ReportConfiguration
              template={selectedTemplate}
              onConfigurationChange={handleConfigurationChange}
              onPreview={handlePreview}
              onGenerate={handleGenerate}
              loading={loading}
              error={error}
            />
          </Card>

          {/* Success Message */}
          {success && (
            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            </Card>
          )}

          {/* Preview Section */}
          {showPreview && configuration && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">3. Report Preview</h3>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  size="sm"
                >
                  Close Preview
                </Button>
              </div>
              <ReportPreview
                template={selectedTemplate}
                parameters={configuration.parameters}
                onClose={() => setShowPreview(false)}
              />
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handlePreview}
                variant="outline"
                disabled={loading || !configuration}
                className="flex items-center justify-center space-x-2 p-4 h-auto"
              >
                <span className="text-2xl">👁️</span>
                <div className="text-left">
                  <div className="font-medium">Preview Report</div>
                  <div className="text-sm text-gray-600">
                    See data before generating
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={loading || !configuration}
                className="flex items-center justify-center space-x-2 p-4 h-auto"
              >
                <span className="text-2xl">🚀</span>
                <div className="text-left">
                  <div className="font-medium">Generate Now</div>
                  <div className="text-sm text-blue-100">
                    Create and download report
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => {
                  // This would open the scheduled reports wizard with current configuration
                  console.log('Schedule report with config:', configuration);
                }}
                variant="outline"
                disabled={loading || !configuration}
                className="flex items-center justify-center space-x-2 p-4 h-auto"
              >
                <span className="text-2xl">⏰</span>
                <div className="text-left">
                  <div className="font-medium">Schedule Report</div>
                  <div className="text-sm text-gray-600">
                    Set up automatic generation
                  </div>
                </div>
              </Button>
            </div>
          </Card>

          {/* Configuration Summary */}
          {configuration && (
            <Card className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                Configuration Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Template:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedTemplate.name}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Format:</span>
                  <span className="ml-2 text-gray-900">
                    {configuration.format.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Delivery:</span>
                  <span className="ml-2 text-gray-900">
                    {configuration.deliveryMethod === 'download'
                      ? 'Download'
                      : `Email to ${configuration.email}`}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Parameters:</span>
                  <span className="ml-2 text-gray-900">
                    {Object.keys(configuration.parameters).length} configured
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
