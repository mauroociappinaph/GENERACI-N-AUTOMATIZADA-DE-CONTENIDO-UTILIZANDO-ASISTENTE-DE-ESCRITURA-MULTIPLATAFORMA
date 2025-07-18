'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
} from 'recharts';

// Color palette for charts
const COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
];

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface AdvancedChartProps {
  data: ChartData[];
  type: 'line' | 'area' | 'bar' | 'pie' | 'composed' | 'scatter' | 'radial';
  title?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  colors?: string[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Advanced Line Chart
export function AdvancedLineChart({
  data,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  animate = true,
  colors = COLORS,
}: AdvancedChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors[0]}
            strokeWidth={2}
            dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            animationDuration={animate ? 1000 : 0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Advanced Area Chart
export function AdvancedAreaChart({
  data,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  animate = true,
  colors = COLORS,
}: AdvancedChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors[0]}
            fillOpacity={1}
            fill="url(#colorValue)"
            strokeWidth={2}
            animationDuration={animate ? 1000 : 0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Advanced Bar Chart
export function AdvancedBarChart({
  data,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  animate = true,
  colors = COLORS,
}: AdvancedChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar
            dataKey="value"
            fill={colors[0]}
            radius={[4, 4, 0, 0]}
            animationDuration={animate ? 1000 : 0}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Advanced Pie Chart
export function AdvancedPieChart({
  data,
  title,
  height = 300,
  showLegend = true,
  animate = true,
  colors = COLORS,
}: AdvancedChartProps) {
  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationDuration={animate ? 1000 : 0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Composed Chart (Line + Bar)
export function ComposedChartComponent({
  data,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  animate = true,
  colors = COLORS,
}: AdvancedChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar
            dataKey="value"
            fill={colors[0]}
            radius={[4, 4, 0, 0]}
            animationDuration={animate ? 1000 : 0}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke={colors[1]}
            strokeWidth={2}
            dot={{ fill: colors[1], strokeWidth: 2, r: 4 }}
            animationDuration={animate ? 1000 : 0}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Scatter Chart
export function AdvancedScatterChart({
  data,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  animate = true,
  colors = COLORS,
}: AdvancedChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            type="number"
            dataKey="x"
            name="X"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Y"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Scatter
            name="Data Points"
            data={data}
            fill={colors[0]}
            animationDuration={animate ? 1000 : 0}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// Radial Bar Chart
export function AdvancedRadialBarChart({
  data,
  title,
  height = 300,
  showLegend = true,
  animate = true,
  colors = COLORS,
}: AdvancedChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={data}>
          <RadialBar
            dataKey="value"
            fill="#3b82f6"
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend iconType="square" layout="vertical" verticalAlign="middle" />}
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Main Chart Component that renders based on type
export function AdvancedChart(props: AdvancedChartProps) {
  switch (props.type) {
    case 'line':
      return <AdvancedLineChart {...props} />;
    case 'area':
      return <AdvancedAreaChart {...props} />;
    case 'bar':
      return <AdvancedBarChart {...props} />;
    case 'pie':
      return <AdvancedPieChart {...props} />;
    case 'composed':
      return <ComposedChartComponent {...props} />;
    case 'scatter':
      return <AdvancedScatterChart {...props} />;
    case 'radial':
      return <AdvancedRadialBarChart {...props} />;
    default:
      return <div>Unsupported chart type: {props.type}</div>;
  }
}
