import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardWidget, WidgetType } from '@/types';
import { useEffect, useState } from 'react';
import { dashboardService } from '@/lib/dashboard-service';
import { Loading } from '@/components/ui/loading';
import { EnhancedChartWidget } from './chart-widgets';

interface WidgetProps {
  widget: DashboardWidget;
  onMove?: (id: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  onResize?: (id: string, size: 'small' | 'medium' | 'large') => void;
  onRemove?: (id: string) => void;
  className?: string;
  isDragging?: boolean;
}

export function Widget({
  widget,
  onMove,
  onResize,
  onRemove,
  className = '',
  isDragging = false,
}: WidgetProps) {
  const [showControls, setShowControls] = useState(false);
  const [widgetData, setWidgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!widget.config.dataSource) return;

      try {
        setLoading(true);
        const data = await dashboardService.getWidgetData(
          widget.id,
          widget.config.dataSource
        );
        setWidgetData(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching data for widget ${widget.id}:`, err);
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up refresh interval if configured
    if (widget.config.refreshInterval) {
      const intervalId = setInterval(fetchData, widget.config.refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [widget.id, widget.config.dataSource, widget.config.refreshInterval]);

  // Render different widget content based on type
  const renderWidgetContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-4">
          <Loading size="sm" />
        </div>
      );
    }

    if (error) {
      return <div className="text-red-500 text-sm">{error}</div>;
    }

    switch (widget.type) {
      case WidgetType.METRICS:
        return <MetricsWidget widget={widget} data={widgetData} />;
      case WidgetType.CHART:
        return <EnhancedChartWidget widget={widget} data={widgetData} />;
      case WidgetType.TABLE:
        return <TableWidget widget={widget} data={widgetData} />;
      case WidgetType.ACTIVITY:
        return <ActivityWidget widget={widget} data={widgetData} />;
      default:
        return <div>Widget type not supported</div>;
    }
  };

  return (
    <Card
      className={`relative ${className} transition-shadow hover:shadow-md`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {showControls && (
        <div className="absolute top-2 right-2 flex space-x-1 z-10">
          <button
            onClick={() => onRemove?.(widget.id)}
            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
            title="Eliminar widget"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => onMove?.(widget.id, 'up')}
              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              title="Mover arriba"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button
              onClick={() => onMove?.(widget.id, 'down')}
              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              title="Mover abajo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => onResize?.(widget.id, 'small')}
              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              title="Tamaño pequeño"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
              </svg>
            </button>
            <button
              onClick={() => onResize?.(widget.id, 'large')}
              className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              title="Tamaño grande"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {widget.title}
        </CardTitle>
      </CardHeader>
      <CardContent>{renderWidgetContent()}</CardContent>
    </Card>
  );
}

// Widget type implementations
function MetricsWidget({
  widget,
  data,
}: {
  widget: DashboardWidget;
  data: any;
}) {
  if (!data) return <div>No data available</div>;

  // Determine trend color
  const trendColor = data.trend?.startsWith('+')
    ? 'text-green-500'
    : data.trend?.startsWith('-')
      ? 'text-red-500'
      : 'text-gray-500';

  return (
    <div>
      <div className="text-2xl font-bold">{data.count}</div>
      <p className={`text-xs flex items-center ${trendColor}`}>
        {data.trend?.startsWith('+') && (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        )}
        {data.trend?.startsWith('-') && (
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
        {data.trend} desde el mes pasado
      </p>
    </div>
  );
}

function TableWidget({ widget, data }: { widget: DashboardWidget; data: any }) {
  if (!data || !data.monthly) return <div>No data available</div>;

  // Create some sample data based on the monthly data
  const tableData = data.monthly
    .slice(0, 5)
    .map((value: number, i: number) => ({
      id: `rec-${i + 1}`,
      name: `Registro ${i + 1}`,
      value,
      status: value > 1300 ? 'Alto' : value > 1200 ? 'Medio' : 'Bajo',
      date: new Date(Date.now() - i * 86400000).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }),
    }));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                #{item.id}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                {item.name}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                {item.date}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'Alto'
                      ? 'bg-red-100 text-red-800'
                      : item.status === 'Medio'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityWidget({
  widget,
  data,
}: {
  widget: DashboardWidget;
  data: any;
}) {
  if (!data || !data.items) return <div>No data available</div>;

  return (
    <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
      {data.items.map((item: any) => {
        // Calculate time ago
        const timestamp = new Date(item.timestamp);
        const now = new Date();
        const diffMinutes = Math.floor(
          (now.getTime() - timestamp.getTime()) / (1000 * 60)
        );
        const timeAgo =
          diffMinutes < 60
            ? `Hace ${diffMinutes} minutos`
            : `Hace ${Math.floor(diffMinutes / 60)} horas`;

        // Get initials for avatar
        const initials = item.userName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);

        // Determine color based on action
        const getActionColor = (action: string) => {
          switch (action.toLowerCase()) {
            case 'creó':
              return 'bg-green-100 text-green-600';
            case 'actualizó':
            case 'modificó':
              return 'bg-blue-100 text-blue-600';
            case 'eliminó':
              return 'bg-red-100 text-red-600';
            case 'generó':
              return 'bg-purple-100 text-purple-600';
            default:
              return 'bg-gray-100 text-gray-600';
          }
        };

        return (
          <div key={item.id} className="flex items-start space-x-4">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${getActionColor(item.action)}`}
            >
              <span className="text-xs font-medium">{initials}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {item.userName} {item.action}{' '}
                {item.resourceType === 'record' ? 'un registro' : 'un reporte'}
              </p>
              <p className="text-xs text-gray-500">{timeAgo}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
