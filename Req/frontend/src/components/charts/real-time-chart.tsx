'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RealTimeDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

interface RealTimeChartProps {
  title: string;
  dataSource: string;
  updateInterval?: number; // in milliseconds
  maxDataPoints?: number;
  chartType?: 'line' | 'area';
  color?: string;
  height?: number;
  showControls?: boolean;
  onDataUpdate?: (data: RealTimeDataPoint[]) => void;
}

export function RealTimeChart({
  title,
  dataSource,
  updateInterval = 5000, // 5 seconds default
  maxDataPoints = 50,
  chartType = 'line',
  color = '#3b82f6',
  height = 300,
  showControls = true,
  onDataUpdate,
}: RealTimeChartProps) {
  const [data, setData] = useState<RealTimeDataPoint[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate real-time data fetching
  const fetchData = async () => {
    try {
      // In a real implementation, this would fetch from your API
      // For now, we'll simulate data based on the dataSource
      const newValue = generateSimulatedData(dataSource);
      const timestamp = new Date().toLocaleTimeString();

      const newDataPoint: RealTimeDataPoint = {
        timestamp,
        value: newValue,
        label: timestamp,
      };

      setData(prevData => {
        const updatedData = [...prevData, newDataPoint];
        // Keep only the last maxDataPoints
        if (updatedData.length > maxDataPoints) {
          updatedData.shift();
        }

        // Call the callback if provided
        if (onDataUpdate) {
          onDataUpdate(updatedData);
        }

        return updatedData;
      });

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    }
  };

  // Generate simulated data based on data source
  const generateSimulatedData = (source: string): number => {
    const baseValue = 1000;
    const variation = 200;
    const trend = Math.sin(Date.now() / 10000) * 100; // Slow sine wave trend
    const noise = (Math.random() - 0.5) * variation; // Random noise

    switch (source) {
      case 'users':
        return Math.max(0, Math.round(baseValue + trend + noise));
      case 'records':
        return Math.max(0, Math.round(baseValue * 1.5 + trend * 1.2 + noise));
      case 'reports':
        return Math.max(0, Math.round(baseValue * 0.3 + trend * 0.5 + noise * 0.5));
      case 'system_load':
        return Math.max(0, Math.min(100, Math.round(50 + trend * 0.3 + noise * 0.2)));
      default:
        return Math.max(0, Math.round(baseValue + trend + noise));
    }
  };

  // Start/stop the real-time updates
  useEffect(() => {
    if (isRunning) {
      // Fetch initial data
      fetchData();

      // Set up interval for updates
      intervalRef.current = setInterval(fetchData, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, updateInterval, dataSource]);

  const toggleUpdates = () => {
    setIsRunning(!isRunning);
  };

  const clearData = () => {
    setData([]);
    setError(null);
  };

  const exportData = () => {
    const csvContent = [
      'Timestamp,Value',
      ...data.map(point => `${point.timestamp},${point.value}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
          <p style={{ color: payload[0].color }} className="text-sm">
            {`Value: ${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id={`colorGradient-${dataSource}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 10 }}
            stroke="#6b7280"
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fillOpacity={1}
            fill={`url(#colorGradient-${dataSource})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false} // Disable animation for real-time
          />
        </AreaChart>
      );
    }

    return (
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="timestamp"
          tick={{ fontSize: 10 }}
          stroke="#6b7280"
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false} // Disable animation for real-time
        />
      </LineChart>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className={`flex items-center ${isRunning ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isRunning ? 'Live' : 'Paused'}
            </span>
            {lastUpdate && (
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            )}
            <span>Points: {data.length}</span>
          </div>
        </div>

        {showControls && (
          <div className="flex space-x-2">
            <Button
              onClick={toggleUpdates}
              variant={isRunning ? "outline" : "primary"}
              size="sm"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button
              onClick={clearData}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              disabled={data.length === 0}
            >
              Export
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {data.length === 0 && !error && (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Waiting for data...</p>
          </div>
        </div>
      )}
    </Card>
  );
}

// Multi-series real-time chart
interface MultiSeriesRealTimeChartProps {
  title: string;
  series: Array<{
    name: string;
    dataSource: string;
    color: string;
  }>;
  updateInterval?: number;
  maxDataPoints?: number;
  height?: number;
}

export function MultiSeriesRealTimeChart({
  title,
  series,
  updateInterval = 5000,
  maxDataPoints = 50,
  height = 300,
}: MultiSeriesRealTimeChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateSimulatedData = (source: string): number => {
    const baseValue = 1000;
    const variation = 200;
    const trend = Math.sin(Date.now() / 10000) * 100;
    const noise = (Math.random() - 0.5) * variation;

    switch (source) {
      case 'users':
        return Math.max(0, Math.round(baseValue + trend + noise));
      case 'records':
        return Math.max(0, Math.round(baseValue * 1.5 + trend * 1.2 + noise));
      case 'reports':
        return Math.max(0, Math.round(baseValue * 0.3 + trend * 0.5 + noise * 0.5));
      default:
        return Math.max(0, Math.round(baseValue + trend + noise));
    }
  };

  const fetchData = () => {
    const timestamp = new Date().toLocaleTimeString();
    const newDataPoint: any = { timestamp };

    series.forEach(serie => {
      newDataPoint[serie.name] = generateSimulatedData(serie.dataSource);
    });

    setData(prevData => {
      const updatedData = [...prevData, newDataPoint];
      if (updatedData.length > maxDataPoints) {
        updatedData.shift();
      }
      return updatedData;
    });
  };

  useEffect(() => {
    if (isRunning) {
      fetchData();
      intervalRef.current = setInterval(fetchData, updateInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, updateInterval]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button
          onClick={() => setIsRunning(!isRunning)}
          variant={isRunning ? "outline" : "primary"}
          size="sm"
        >
          {isRunning ? 'Pause' : 'Resume'}
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 10 }}
            stroke="#6b7280"
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip />
          {series.map((serie, index) => (
            <Line
              key={serie.name}
              type="monotone"
              dataKey={serie.name}
              stroke={serie.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
