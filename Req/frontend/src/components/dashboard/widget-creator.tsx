import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardWidget, WidgetType } from '@/types';
import { dashboardService } from '@/lib/dashboard-service';

interface WidgetCreatorProps {
  onWidgetCreated: (widget: DashboardWidget) => void;
  onCancel?: () => void;
  className?: string;
  defaultOpen?: boolean;
}

export function WidgetCreator({
  onWidgetCreated,
  onCancel,
  className = '',
  defaultOpen = false,
}: WidgetCreatorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [widgetType, setWidgetType] = useState<WidgetType>(WidgetType.METRICS);
  const [title, setTitle] = useState('');
  const [dataSource, setDataSource] = useState('users');
  const [chartType, setChartType] = useState<
    'line' | 'bar' | 'pie' | 'doughnut'
  >('bar');
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute default
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>(
    'medium'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWidget = async () => {
    try {
      setIsLoading(true);

      // Determine widget dimensions based on size
      const getDimensions = (size: 'small' | 'medium' | 'large') => {
        switch (size) {
          case 'small':
            return { w: 1, h: 1 };
          case 'medium':
            return { w: 2, h: 1 };
          case 'large':
            return { w: 2, h: 2 };
          default:
            return { w: 1, h: 1 };
        }
      };

      const dimensions = getDimensions(widgetSize);

      // Create widget configuration
      const newWidget = await dashboardService.addWidget({
        type: widgetType,
        title: title || getDefaultTitle(widgetType),
        config: {
          dataSource,
          refreshInterval,
          ...(widgetType === WidgetType.CHART ? { chartType } : {}),
        },
        position: { x: 0, y: 0, ...dimensions }, // Position will be determined by layout manager
      });

      // Notify parent component
      onWidgetCreated(newWidget);

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error creating widget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsOpen(false);
    }
    setWidgetType(WidgetType.METRICS);
    setTitle('');
    setDataSource('users');
    setChartType('bar');
    setRefreshInterval(60000);
    setWidgetSize('medium');
    setIsLoading(false);
  };

  const getDefaultTitle = (type: WidgetType) => {
    switch (type) {
      case WidgetType.METRICS:
        return 'Métricas';
      case WidgetType.CHART:
        return 'Gráfico';
      case WidgetType.TABLE:
        return 'Tabla';
      case WidgetType.ACTIVITY:
        return 'Actividad';
      default:
        return 'Nuevo Widget';
    }
  };

  return (
    <Card className={`${className} hover:shadow-md transition-shadow`}>
      {!isOpen ? (
        <div
          className="h-full flex flex-col items-center justify-center p-6 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">Agregar Widget</p>
        </div>
      ) : (
        <>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Crear Nuevo Widget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                handleCreateWidget();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Widget
                </label>
                <select
                  value={widgetType}
                  onChange={e => setWidgetType(e.target.value as WidgetType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={WidgetType.METRICS}>Métricas</option>
                  <option value={WidgetType.CHART}>Gráfico</option>
                  <option value={WidgetType.TABLE}>Tabla</option>
                  <option value={WidgetType.ACTIVITY}>Actividad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={getDefaultTitle(widgetType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuente de Datos
                </label>
                <select
                  value={dataSource}
                  onChange={e => setDataSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="users">Usuarios</option>
                  <option value="records">Registros</option>
                  <option value="reports">Reportes</option>
                  <option value="activity">Actividad</option>
                </select>
              </div>

              {widgetType === WidgetType.CHART && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Gráfico
                  </label>
                  <select
                    value={chartType}
                    onChange={e =>
                      setChartType(
                        e.target.value as 'line' | 'bar' | 'pie' | 'doughnut'
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bar">Barras</option>
                    <option value="line">Línea</option>
                    <option value="pie">Circular</option>
                    <option value="doughnut">Dona</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño del Widget
                </label>
                <select
                  value={widgetSize}
                  onChange={e =>
                    setWidgetSize(
                      e.target.value as 'small' | 'medium' | 'large'
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="small">Pequeño (1x1)</option>
                  <option value="medium">Mediano (2x1)</option>
                  <option value="large">Grande (2x2)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo de Actualización
                </label>
                <select
                  value={refreshInterval}
                  onChange={e => setRefreshInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="30000">30 segundos</option>
                  <option value="60000">1 minuto</option>
                  <option value="300000">5 minutos</option>
                  <option value="600000">10 minutos</option>
                  <option value="1800000">30 minutos</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creando...' : 'Crear Widget'}
                </button>
              </div>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  );
}
