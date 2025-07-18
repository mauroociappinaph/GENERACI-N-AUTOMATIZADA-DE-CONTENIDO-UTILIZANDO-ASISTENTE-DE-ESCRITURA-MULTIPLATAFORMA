'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportTemplate, ReportPreview as ReportPreviewType } from '@/types';
import { reportService } from '@/lib/report-service';
import { AdvancedChart } from '@/components/charts/advanced-charts';

interface ReportPreviewProps {
  template: ReportTemplate;
  parameters: Record<string, unknown>;
  onClose: () => void;
}

export function ReportPreview({
  template,
  parameters,
  onClose,
}: ReportPreviewProps) {
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

  const renderTableData = () => {
    if (!preview || !preview.data.length) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-sm">
            No data matches the current parameters. Try adjusting your filters
            or parameters.
          </p>
        </div>
      );
    }

    const columns = Object.keys(preview.data[0]);
    const maxRows = 10; // Limit preview to first 10 rows
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
              Showing first {maxRows} rows of {preview.data.length} preview
              records. Full report will contain all{' '}
              {preview.totalRecords.toLocaleString()} records.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDataVisualization = () => {
    if (!preview || !preview.data.length) {
      return null;
    }

    // Analyze data to determine best visualization
    const columns = Object.keys(preview.data[0]);
    const numericColumns = columns.filter(col => {
      return preview.data.some(row => typeof row[col] === 'number');
    });

    if (numericColumns.length === 0) {
      return null; // No numeric data to visualize
    }

    // Create chart data from the first numeric column
    const chartColumn = numericColumns[0];
    const chartData = preview.data.slice(0, 10).map((row, index) => ({
      name: row.name || row.id || `Item ${index + 1}`,
      value: row[chartColumn] || 0,
    }));

    // If we have date/time data, create a trend chart
    const dateColumns = columns.filter(col =>
      col.toLowerCase().includes('date') ||
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('created')
    );

    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const trendData = preview.data.slice(0, 20).map((row, index) => ({
        name: new Date(row[dateColumns[0]]).toLocaleDateString() || `Point ${index + 1}`,
        value: row[numericColumns[0]] || 0,
      }));

      return (
        <Card className="p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Data Visualization</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <AdvancedChart
                data={trendData}
                type="line"
                title={`${chartColumn} Trend`}
                height={250}
                showGrid={true}
                showLegend={false}
                animate={true}
              />
            </div>
            <div>
              <AdvancedChart
                data={chartData}
                type="bar"
                title={`${chartColumn} Distribution`}
                height={250}
                showGrid={true}
                showLegend={false}
                animate={true}
              />
            </div>
          </div>
        </Card>
      );
    }

    // Default visualization for numeric data
    return (
      <Card className="p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Data Visualization</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <AdvancedChart
              data={chartData}
              type="bar"
              title={`${chartColumn} Values`}
              height={250}
              showGrid={true}
              showLegend={false}
              animate={true}
            />
          </div>
          <div>
            <AdvancedChart
              data={chartData}
              type="pie"
              title={`${chartColumn} Distribution`}
              height={250}
              showLegend={true}
              animate={true}
            />
          </div>
        </div>
      </Card>
    );
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Report Preview
            </h2>
            <p className="text-sm text-gray-600 mt-1">{template.name}</p>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading preview...</span>
            </div>
          )}

          {error && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">⚠️</span>
                <div>
                  <p className="text-red-800 font-medium">Preview Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <Button
                    onClick={loadPreview}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {preview && !loading && !error && (
            <div className="space-y-4">
              {/* Preview Info */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">
                      Total Records:
                    </span>
                    <span className="ml-2 text-blue-700">
                      {preview.totalRecords.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">
                      Preview Records:
                    </span>
                    <span className="ml-2 text-blue-700">
                      {preview.previewRecords.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">
                      Generated:
                    </span>
                    <span className="ml-2 text-blue-700">
                      {new Date(preview.generatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {preview.previewRecords < preview.totalRecords && (
                  <div className="mt-2 text-sm text-blue-700">
                    <span className="font-medium">Note:</span> This preview
                    shows the first {preview.previewRecords} records. The full
                    report will contain all{' '}
                    {preview.totalRecords.toLocaleString()} records.
                  </div>
                )}
              </Card>

              {/* Data Visualization */}
              {renderDataVisualization()}

              {/* Data Table */}
              <Card className="overflow-hidden">{renderTableData()}</Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          {preview && (
            <Button
              onClick={() => {
                // This would trigger the actual report generation
                onClose();
              }}
            >
              Generate Full Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
