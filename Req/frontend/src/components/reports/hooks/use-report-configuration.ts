import { useState, useEffect } from 'react';
import { ReportTemplate, ReportFormat } from '@/types';

export interface ReportConfigurationData {
  templateId: string;
  parameters: Record<string, any>;
  format: ReportFormat;
  deliveryMethod: 'download' | 'email';
  email?: string;
  name?: string;
  description?: string;
}

interface UseReportConfigurationProps {
  template: ReportTemplate;
  onConfigurationChange: (config: ReportConfigurationData) => void;
}

export function useReportConfiguration({
  template,
  onConfigurationChange,
}: UseReportConfigurationProps) {
  const [config, setConfig] = useState<ReportConfigurationData>({
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

  const handleParameterChange = (paramName: string, value: unknown) => {
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

  return {
    config,
    validationErrors,
    handleParameterChange,
    handleFormatChange,
    handleDeliveryMethodChange,
    handleEmailChange,
    validateConfiguration,
  };
}
