import { ReportFormat } from '@/types';

interface ReportFormatSelectorProps {
  formats: ReportFormat[];
  selectedFormat: ReportFormat;
  onFormatChange: (format: ReportFormat) => void;
}

export function ReportFormatSelector({
  formats,
  selectedFormat,
  onFormatChange,
}: ReportFormatSelectorProps) {
  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'csv':
        return '📋';
      default:
        return '📄';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Output Format</h3>
      <div className="grid grid-cols-3 gap-4">
        {formats.map(fmt => (
          <label
            key={fmt}
            className={`
              flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors
              ${
                selectedFormat === fmt
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <input
              type="radio"
              name="format"
              value={fmt}
              checked={selectedFormat === fmt}
              onChange={e => onFormatChange(e.target.value as ReportFormat)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-2xl mb-2">{getFormatIcon(fmt)}</div>
              <span className="font-medium">{fmt.toUpperCase()}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
