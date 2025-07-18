'use client';

import { useState } from 'react';
// Card import removed as it's not used
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportTemplate, ReportScheduleRequest, ReportFormat } from '@/types';
import { reportService } from '@/lib/report-service';

interface ScheduledReportWizardProps {
  templates: ReportTemplate[];
  onClose: () => void;
  onSave: () => void;
  editingReport?: any;
}

export function ScheduledReportWizard({
  templates,
  onClose,
  onSave,
  editingReport,
}: ScheduledReportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReportScheduleRequest>({
    templateId: editingReport?.templateId || '',
    parameters: editingReport?.parameters || {},
    format: editingReport?.format || 'pdf',
    schedule: editingReport?.schedule || '0 9 * * *',
    recipients: editingReport?.recipients || [],
  });
  const [newRecipient, setNewRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = templates.find(t => t.id === formData.templateId);
  const totalSteps = 4;

  const steps = [
    {
      id: 1,
      title: 'Select Template',
      description: 'Choose the report template',
    },
    {
      id: 2,
      title: 'Configure Parameters',
      description: 'Set report parameters',
    },
    {
      id: 3,
      title: 'Schedule Settings',
      description: 'Set frequency and format',
    },
    { id: 4, title: 'Recipients', description: 'Add email recipients' },
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    setError(null);

    switch (currentStep) {
      case 1:
        if (!formData.templateId) {
          setError('Please select a report template');
          return false;
        }
        break;
      case 2:
        if (selectedTemplate) {
          for (const param of selectedTemplate.parameters) {
            if (param.required && !formData.parameters[param.name]) {
              setError(`Parameter "${param.label}" is required`);
              return false;
            }
          }
        }
        break;
      case 3:
        if (!reportService.validateCronExpression(formData.schedule)) {
          setError('Invalid schedule format');
          return false;
        }
        break;
      case 4:
        if (formData.recipients.length === 0) {
          setError('Please add at least one recipient');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      setError(null);

      if (editingReport) {
        await reportService.updateScheduledReport(editingReport.id, formData);
      } else {
        await reportService.createScheduledReport(formData);
      }

      onSave();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save scheduled report'
      );
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = () => {
    if (newRecipient && !formData.recipients.includes(newRecipient)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient],
      }));
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email),
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Select Report Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() =>
                    setFormData(prev => ({ ...prev, templateId: template.id }))
                  }
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${
                      formData.templateId === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <h4 className="font-medium text-gray-900 mb-2">
                    {template.name}
                  </h4>
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Configure Parameters
            </h3>
            {selectedTemplate && selectedTemplate.parameters.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>This template doesn't require any parameters.</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Schedule Settings
            </h3>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Output Format
              </label>
              <div className="grid grid-cols-3 gap-4">
                {selectedTemplate?.formats.map(fmt => (
                  <label
                    key={fmt}
                    className={`
                      flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors
                      ${
                        formData.format === fmt
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={fmt}
                      checked={formData.format === fmt}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          format: e.target.value as ReportFormat,
                        }))
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

            {/* Schedule Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Schedule Frequency
              </label>
              <div className="space-y-3">
                {reportService.getSuggestedSchedules().map(schedule => (
                  <label
                    key={schedule.value}
                    className={`
                      flex items-start p-4 border rounded-lg cursor-pointer transition-colors
                      ${
                        formData.schedule === schedule.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="schedule"
                      value={schedule.value}
                      checked={formData.schedule === schedule.value}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          schedule: e.target.value,
                        }))
                      }
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        {schedule.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {schedule.description}
                      </div>
                    </div>
                  </label>
                ))}

                {/* Custom Schedule */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="schedule"
                      checked={
                        !reportService
                          .getSuggestedSchedules()
                          .some(s => s.value === formData.schedule)
                      }
                      onChange={() => {}}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 font-medium text-gray-900">
                      Custom Schedule
                    </span>
                  </label>
                  <Input
                    type="text"
                    value={formData.schedule}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        schedule: e.target.value,
                      }))
                    }
                    placeholder="Enter cron expression (e.g., 0 9 * * *)"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current:{' '}
                    {reportService.describeCronExpression(formData.schedule)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Email Recipients
            </h3>

            {/* Add Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Recipients
              </label>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  value={newRecipient}
                  onChange={e => setNewRecipient(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1"
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRecipient();
                    }
                  }}
                />
                <Button type="button" onClick={addRecipient} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            {/* Recipients List */}
            {formData.recipients.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients ({formData.recipients.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.recipients.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">📧</span>
                        <span className="text-sm text-gray-900">{email}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeRecipient(email)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.recipients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📧</div>
                <p>No recipients added yet.</p>
                <p className="text-sm">
                  Add at least one email address to receive the scheduled
                  reports.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderParameterInput = (param: any) => {
    const value = formData.parameters[param.name] || '';

    switch (param.type) {
      case 'string':
        return (
          <Input
            type="text"
            value={value}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                parameters: {
                  ...prev.parameters,
                  [param.name]: e.target.value,
                },
              }))
            }
            placeholder={`Enter ${param.label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                parameters: {
                  ...prev.parameters,
                  [param.name]: Number(e.target.value),
                },
              }))
            }
            placeholder={`Enter ${param.label.toLowerCase()}`}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                parameters: {
                  ...prev.parameters,
                  [param.name]: e.target.value,
                },
              }))
            }
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  parameters: {
                    ...prev.parameters,
                    [param.name]: e.target.checked,
                  },
                }))
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
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                parameters: {
                  ...prev.parameters,
                  [param.name]: e.target.value,
                },
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {param.label.toLowerCase()}</option>
            {param.options?.map((option: unknown) => (
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
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                parameters: {
                  ...prev.parameters,
                  [param.name]: e.target.value,
                },
              }))
            }
            placeholder={`Enter ${param.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingReport ? 'Edit' : 'Create'} Scheduled Report
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of {totalSteps}:{' '}
              {steps[currentStep - 1].description}
            </p>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStepContent()}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-3">
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : editingReport ? 'Update' : 'Create'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
