import React from 'react';
import { DashboardWidget } from '@/types';

interface ChartWidgetProps {
  widget: DashboardWidget;
  data: any;
}

// Simple Bar Chart Component
export function BarChart({ data, title }: { data: number[]; title?: string }) {
  if (!data || data.length === 0) return <div>No data available</div>;

  const maxValue = Math.max(...data);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return (
    <div className="h-48 p-4">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>}
      <div className="flex items-end space-x-1 h-32 justify-between">
        {data.slice(0, 12).map((value, i) => {
          const heightPercentage = (value / maxValue) * 100;
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 rounded-t transition-all hover:bg-blue-600 min-w-[20px] cursor-pointer"
                style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                title={`${months[i]}: ${value.toLocaleString()}`}
              />
              <div className="text-xs mt-1 text-gray-500">{months[i]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple Line Chart Component
export function LineChart({ data, title }: { data: number[]; title?: string }) {
  if (!data || data.length === 0) return <div>No data available</div>;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return (
    <div className="h-48 p-4">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>}
      <div className="h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="50" fill="url(#grid)" />

          {/* Line */}
          <polyline
            points={data.slice(0, 12).map((value, i) => {
              const x = (i / (Math.min(data.length, 12) - 1)) * 100;
              const y = range > 0 ? 50 - (((value - minValue) / range) * 40) : 25;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Area fill */}
          <path
            d={`
              M0,50
              ${data.slice(0, 12).map((value, i) => {
                const x = (i / (Math.min(data.length, 12) - 1)) * 100;
                const y = range > 0 ? 50 - (((value - minValue) / range) * 40) : 25;
                return `L${x},${y}`;
              }).join(' ')}
              L100,50
              Z
            `}
            fill="rgba(59, 130, 246, 0.1)"
          />

          {/* Data points */}
          {data.slice(0, 12).map((value, i) => {
            const x = (i / (Math.min(data.length, 12) - 1)) * 100;
            const y = range > 0 ? 50 - (((value - minValue) / range) * 40) : 25;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#3b82f6"
                className="hover:r-2"
              >
                <title>{`${months[i]}: ${value.toLocaleString()}`}</title>
              </circle>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {months.slice(0, Math.min(data.length, 12)).filter((_, i) => i % 3 === 0).map((month, i) => (
            <span key={i}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Pie Chart Component
export function PieChart({ data, labels, title }: { data: number[]; labels?: string[]; title?: string }) {
  if (!data || data.length === 0) return <div>No data available</div>;

  const total = data.reduce((sum, value) => sum + value, 0);
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  let cumulativePercentage = 0;
  const segments = data.map((value, index) => {
    const percentage = (value / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;

    cumulativePercentage += percentage;

    const largeArcFlag = percentage > 50 ? 1 : 0;
    const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return {
      pathData,
      color: colors[index % colors.length],
      percentage: percentage.toFixed(1),
      value,
      label: labels?.[index] || `Segmento ${index + 1}`
    };
  });

  return (
    <div className="h-48 p-4">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>}
      <div className="flex items-center space-x-4">
        {/* Pie chart */}
        <div className="flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 100 100">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                className="hover:opacity-80 cursor-pointer"
              >
                <title>{`${segment.label}: ${segment.value.toLocaleString()} (${segment.percentage}%)`}</title>
              </path>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-700 truncate">
                {segment.label}: {segment.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Enhanced Chart Widget Component
export function EnhancedChartWidget({ widget, data }: ChartWidgetProps) {
  if (!data) return <div className="p-4 text-gray-500">No data available</div>;

  const chartType = widget.config.chartType || 'bar';

  switch (chartType) {
    case 'bar':
      return <BarChart data={data.monthly || data.data || []} title={widget.title} />;

    case 'line':
      return <LineChart data={data.monthly || data.data || []} title={widget.title} />;

    case 'pie':
      // For pie charts, we'll use the monthly data and create segments
      const pieData = data.monthly || data.data || [];
      const pieLabels = ['Q1', 'Q2', 'Q3', 'Q4'].slice(0, pieData.length);
      return <PieChart data={pieData.slice(0, 4)} labels={pieLabels} title={widget.title} />;

    case 'doughnut':
      // Similar to pie but with a hole in the middle (simplified version)
      const doughnutData = data.monthly || data.data || [];
      const doughnutLabels = ['Usuarios', 'Registros', 'Reportes', 'Otros'].slice(0, doughnutData.length);
      return (
        <div className="h-48 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">{widget.title}</h3>
          <div className="flex items-center justify-center h-32">
            <div className="relative">
              <PieChart data={doughnutData.slice(0, 4)} labels={doughnutLabels} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full border-4 border-gray-100" />
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return <div className="p-4 text-gray-500">Chart type not supported: {chartType}</div>;
  }
}
