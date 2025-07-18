'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportTemplate, ReportParameter, ReportFormat } from '@/types';

interface ReportConfigurationProps {
  template: ReportTemplate;
  onConfigurationChange: (config: ReportConfiguration) => void;
  onPreview: () => void;
  onGenerate: () => void;
  loading?: boolean;
  error?: string | null;
}

export interface ReportConfiguration {
  templateId: string;
  parameters: Record<string, any>;
  format: ReportFormat;
  deliveryMethod: 'download' | 'email';
  email?: string;
  name?: string;
  description?: string;
}

export function ReportConfiguration({
  template,
  onConfigurationChange,
  onPreview,
  onGenerate,
  loading = false,
  error = null,
}: ReportConfigurationProps) {
  const [config, setConfig] = useState<ReportConfiguration>({
    templateId: template.id,
    parameters: {},
    format: template.formats[0] || 'pdf',
    deliveryMethod: 'download',
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    // Initialize parameters with default values
    const initialParams: Record<string, any> = {};
    template.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        initialParams[param.name] = param.defaultValue;
      }
    });

    const newConfig = {
      ...config,
      templateId: template.id,
      parameters: initialParams,
      format: template.formats[0] || 'pdf',
    };

    setConfig(newConfig);
    onConfigurationChange(newConfig);
  }, [template.id]);

  const handleParameterChange = (paramName: string, value: any) => {
    const newConfig = {
      ...config,
      parameters: {
        ...config.parameters,
        [paramName]: value,
      },
    };
    setConfig(newConfig);
    onConfigurationChange(newConfig);

    // Clear validation error for this parameter
    if (validationErrors[paramName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[paramName];
        return newErrors;
      });
    }
  };

  const handleFormatChange = (format: ReportFormat) => {
    const newConfig = { ...config, format };
    setConfig(newConfig);
    onConfigurationChange(newConfig);
  };

  const handleDeliveryMethodChange = (deliveryMethod: 'download' | 'email') => {
    const newConfig = { ...config, deliveryMethod };
    setConfig(newConfig);
    onConfigurationChange(newConfig);
  };

  const handleEmailChange = (email: string) => {
    const newConfig = { ...config, email };
    setConfig(newConfig);
    onConfigurationChange(newConfig);
  };

  const validateConfiguration = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate required parameters
    template.parameters.forEach(param => {
      if (param.required && !config.parameters[param.name]) {
        errors[param.name] = `${param.label} is required`;
      }
    });

    // Validate email if delivery method is email
    if (config.deliveryMethod === 'email' && !config.email) {
      errors.email = 'Email address is required for email delivery';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const renderParameterInput = (param: ReportParameter) => {
    const value = config.parameters[param.name] || '';
    const hasError = validationErrors[param.name];

    const inputClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-red-300 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

    switch (param.type) {
      case 'string':
        return (
          <div>
            <Input
              type="text"
              value={value}
              onChange={e => handleParameterChange(param.name, e.target.value)}
              placeholder={`Enter ${param.label.toLowerCase()}`}
              className={hasError ? 'border-red-300 focus:ring-red-500' : ''}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div>
            <Input
              type="number"
              value={value}
              onChange={e =>
                handleParameterChange(param.name, Number(e.target.value))
              }
              placeholder={`Enter ${param.label.toLowerCase()}`}
              className={hasError ? 'border-red-300 focus:ring-red-500' : ''}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div>
            <Input
              type="date"
              value={value}
              onChange={e => handleParameterChange(param.name, e.target.value)}
              className={hasError ? 'border-red-300 focus:ring-red-500' : ''}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div>
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
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div>
            <select
              value={value}
              onChange={e => handleParameterChange(param.name, e.target.value)}
              className={inputClassName}
            >
              <option value="">Select {param.label.toLowerCase()}</option>
              {param.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      default:
        return (
          <div>
            <Input
              type="text"
              value={value}
              onChange={e => handleParameterChange(param.name, e.target.value)}
              placeholder={`Enter ${param.label.toLowerCase()}`}
              className={hasError ? 'border-red-300 focus:ring-red-500' : ''}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Template Info */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {template.name}
          </h2>
          {template.description && (
            <p className="text-gray-600 mt-1">{template.description}</p>
          )}
        </div>

        {/* Parameters Configuration */}
        {template.parameters.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Report Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {template.parameters.map(param => (
                <div key={param.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Output Format */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Output Format
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {template.formats.map(fmt => (
              <label
                key={fmt}
                className={`
                  flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors
                  ${
                    config.format === fmt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="radio"
                  name="format"
                  value={fmt}
                  checked={config.format === fmt}
                  onChange={e =>
                    handleFormatChange(e.target.value as ReportFormat)
                  }
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {fmt === 'pdf' && '📄'}
                    {fmt === 'excel' && '📊'}
                    {fmt === 'csv' && '📋'}
                  </div>
                  <span className="font-medium">{fmt.toUpperCase()}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Method */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Delivery Method
          </h3>
          <div className="space-y-4">
            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="delivery"
                value="download"
                checked={config.deliveryMethod === 'download'}
                onChange={e =>
                  handleDeliveryMethodChange(
                    e.target.value as 'download' | 'email'
                  )
                }
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">
                  Download immediately
                </span>
                <p className="text-sm text-gray-600">
                  The report will be generated and downloaded to your device
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3">
              <input
                type="radio"
                name="delivery"
                value="email"
                checked={config.deliveryMethod === 'email'}
                onChange={e =>
                  handleDeliveryMethodChange(
                    e.target.value as 'download' | 'email'
                  )
                }
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">Send by email</span>
                <p className="text-sm text-gray-600 mb-2">
                  The report will be sent to the specified email address
                </p>
                {config.deliveryMethod === 'email' && (
                  <div>
                    <Input
                      type="email"
                      value={config.email || ''}
                      onChange={e => handleEmailChange(e.target.value)}
                      placeholder="Enter email address"
                      className={
                        validationErrors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : ''
                      }
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
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
