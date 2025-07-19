import { Input } from '@/components/ui/input';
import { ReportParameter } from '@/types';

interface ReportParametersProps {
  parameters: ReportParameter[];
  values: Record<string, any>;
  validationErrors: Record<string, string>;
  onParameterChange: (paramName: string, value: any) => void;
}

export function ReportParameters({
  parameters,
  values,
  validationErrors,
  onParameterChange,
}: ReportParametersProps) {
  if (parameters.length === 0) {
    return null;
  }

  const renderParameterInput = (param: ReportParameter) => {
    const value = values[param.name] || '';
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
              onChange={e => onParameterChange(param.name, e.target.value)}
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
                onParameterChange(param.name, Number(e.target.value))
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
              onChange={e => onParameterChange(param.name, e.target.value)}
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
                  onParameterChange(param.name, e.target.checked)
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
              onChange={e => onParameterChange(param.name, e.target.value)}
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
              onChange={e => onParameterChange(param.name, e.target.value)}
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
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Report Parameters
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parameters.map(param => (
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
  );
}
