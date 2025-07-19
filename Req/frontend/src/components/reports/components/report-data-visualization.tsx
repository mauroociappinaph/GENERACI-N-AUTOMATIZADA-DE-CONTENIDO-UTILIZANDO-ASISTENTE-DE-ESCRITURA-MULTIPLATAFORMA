import { Card } from '@/components/ui/card';
import { ReportPreview } from '@/types';
import { AdvancedChart } from '@/components/charts/advanced-charts';

interface ReportDataVisualizationProps {
  preview: ReportPreview;
}

export function ReportDataVisualization({ preview }: ReportDataVisualizationProps) {
  if (!preview || !preview.data.length) {
    return null;
  }

  // Analyze data to determine best visualization
  const columns = Object.keys(preview.data[0]);
  const numericColumns = columns.filter(col => {
    return preview.data.some(row => typeof row[col] === 'number');
  });

  if (numericColumns.length === 0) {
    return null;
  }

  // Create chart data from the first numeric column
  const chartColumn = numericColumns[0];
  const chartData = preview.data.slice(0, 10).map((row, index) => ({
    name: row.name || row.id || `Item ${index + 1}`,
    value: row[chartColumn] || 0,
  }));

  // If we have date/time data, create a trend chart
  const dateColumns = columns.filter(
    col =>
      col.toLowerCase().includes('date') ||
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('created')
  );

  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const trendData = preview.data.slice(0, 20).map((row, index) => ({
      name:
        new Date(row[dateColumns[0]]).toLocaleDateString() ||
        `Point ${index + 1}`,
      value: row[numericColumns[0]] || 0,
    }));

    return (
      <Card className="p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Data Visualization
        </h4>
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
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Data Visualization
      </h4>
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
}
