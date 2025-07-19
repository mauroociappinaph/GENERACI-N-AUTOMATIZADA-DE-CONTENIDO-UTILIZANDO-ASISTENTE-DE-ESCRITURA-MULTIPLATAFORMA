import { ReportPreview } from '@/types';

interface ReportDataTableProps {
  preview: ReportPreview;
}

export function ReportDataTable({ preview }: ReportDataTableProps) {
  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (!preview || !preview.data.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-sm">
          No data matches the current parameters. Try adjusting your filters or parameters.
        </p>
      </div>
    );
  }

  const columns = Object.keys(preview.data[0]);
  const maxRows = 10;
  const displayData = preview.data.slice(0, maxRows);

  return (
    <div className="space-y-4">
      {/* Data Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Total Records:</span>
            <span className="ml-2 text-blue-700">
              {preview.totalRecords.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Columns:</span>
            <span className="ml-2 text-blue-700">{columns.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Preview Rows:</span>
            <span className="ml-2 text-blue-700">{displayData.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Generated:</span>
            <span className="ml-2 text-blue-700">
              {new Date(preview.generatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {columns.map(column => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatCellValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more indicator */}
      {preview.data.length > maxRows && (
        <div className="text-center py-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Showing first {maxRows} rows of {preview.data.length} preview records. Full
            report will contain all {preview.totalRecords.toLocaleString()} records.
          </p>
        </div>
      )}
    </div>
  );
}
