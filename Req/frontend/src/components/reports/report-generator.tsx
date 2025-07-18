'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportPreview } from './report-preview';
import {
  ReportTemplate,
  ReportRequest,
  ReportFormat,
  ReportResult,
} from '@/types';
import { reportService } from '@/lib/report-service';

interface ReportGeneratorProps {
  templates: ReportTemplate[];
  onRefresh: () => void;
}

export function ReportGenerator({
  templates,
  onRefresh,
}: ReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [deliveryMethod, setDeliveryMethod] = useState<'download' | 'email'>(
    'download'
  );
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setFormat(template.formats[0] || 'pdf');

    // Initialize parameters with default values
    const initialParams: Record<string, any> = {};
    template.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        initialParams[param.name] = param.defaultValue;
      }
    });
    setParameters(initialParams);
    setError(null);
    setSuccess(null);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const validateParameters = (): boolean => {
    if (!selectedTemplate) return false;

    for (const param of selectedTemplate.parameters) {
      if (param.required && !parameters[param.name]) {
        setError(`Parameter "${param.label}" is required`);
        return false;
      }
    }

    if (deliveryMethod === 'email' && !email) {
      setError('Email address is required for email delivery');
      return false;
    }

    return true;
  };

  const handlePreview = async () => {
    if (!selectedTemplate || !validateParameters()) return;

    try {
      setLoading(true);
      setError(null);

      // Actually generate preview data
      await reportService.previewReport(selectedTemplate.id, parameters);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !validateParameters()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const request: ReportRequest = {
        templateId: selectedTemplate.id,
        parameters,
        format,
        deliveryMethod,
        email: deliveryMethod === 'email' ? email : undefined,
      };

      const result: ReportResult = await reportService.generateReport(request);

      if (deliveryMethod === 'download') {
        // Automatically download the report
        await reportService.downloadReport(result.reportId);
        setSuccess('Report generated and downloaded successfully!');
      } else {
        setSuccess(`Report generated and sent to ${email}!`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate report'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderParameterInput = (param: any) => {
    const value = parameters[param.name] || '';

    switch (param.type) {
      case 'string':
        return (
          <Input
            type="text"
            value={value}
            onChange={e => handleParameterChange(param.name, e.target.value)}
            placeholder={`Enter ${param.label.toLowerCase()}`}
            required={param.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={e =>
              handleParameterChange(param.name, Number(e.target.value))
            }
            placeholder={`Enter ${param.label.toLowerCase()}`}
            required={param.required}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={e => handleParameterChange(param.name, e.target.value)}
            required={param.required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={e =>
                handleParameterChange(param.name, e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={e => handleParameterChange(param.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={param.required}
          >
            <option value="">Select {param.label.toLowerCase()}</option>
            {param.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={e => handleParameterChange(param.name, e.target.value)}
            placeholder={`Enter ${param.label.toLowerCase()}`}
            required={param.required}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Select Report Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-colors
                ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <h3 className="font-medium text-gray-900 mb-2">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>
              )}
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
            </div>
          ))}
        </div>
      </Card>

      {/* Report Configuration */}
      {selectedTemplate && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Configure Report</h2>

          {/* Parameters */}
          {selectedTemplate.parameters.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.parameters.map(param => (
                  <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {param.label}
                      {param.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderParameterInput(param)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Output Format</h3>
            <div className="flex space-x-4">
              {selectedTemplate.formats.map(fmt => (
                <label key={fmt} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={e => setFormat(e.target.value as ReportFormat)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {fmt.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Method */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Delivery Method</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="delivery"
                  value="download"
                  checked={deliveryMethod === 'download'}
                  onChange={e =>
                    setDeliveryMethod(e.target.value as 'download' | 'email')
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Download immediately
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="delivery"
                  value="email"
                  checked={deliveryMethod === 'email'}
                  onChange={e =>
                    setDeliveryMethod(e.target.value as 'download' | 'email')
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Send by email</span>
              </label>
              {deliveryMethod === 'email' && (
                <div className="ml-6">
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="max-w-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handlePreview}
              variant="outline"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Preview'}
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}
        </Card>
      )}

      {/* Report Preview */}
      {showPreview && selectedTemplate && (
        <ReportPreview
          template={selectedTemplate}
          parameters={parameters}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
