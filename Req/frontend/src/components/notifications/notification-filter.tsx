'use client';

import { NotificationFilter as FilterType, NotificationType } from '@/types';

interface NotificationFilterProps {
  filter: FilterType;
  onChange: (filter: Partial<FilterType>) => void;
}

export function NotificationFilter({ filter, onChange }: NotificationFilterProps) {
  const notificationTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: NotificationType.INFO, label: 'Información' },
    { value: NotificationType.SUCCESS, label: 'Éxito' },
    { value: NotificationType.WARNING, label: 'Advertencia' },
    { value: NotificationType.ERROR, label: 'Error' },
    { value: NotificationType.SYSTEM, label: 'Sistema' },
    { value: NotificationType.USER_ACTION, label: 'Acción de usuario' },
    { value: NotificationType.DATA_UPDATE, label: 'Actualización de datos' },
    { value: NotificationType.REPORT_READY, label: 'Reporte listo' },
  ];

  const handleTypeChange = (type: string) => {
    onChange({
      type: type === '' ? undefined : (type as NotificationType),
    });
  };

  const handleLimitChange = (limit: number) => {
    onChange({ limit });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Type Filter */}
      <div className="flex items-center space-x-2">
        <label htmlFor="notification-type" className="text-sm font-medium text-gray-700">
          Tipo:
        </label>
        <select
          id="notification-type"
          value={filter.type || ''}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {notificationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Limit Filter */}
      <div className="flex items-center space-x-2">
        <label htmlFor="notification-limit" className="text-sm font-medium text-gray-700">
          Mostrar:
        </label>
        <select
          id="notification-limit"
          value={filter.limit || 20}
          onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Clear Filters */}
      {(filter.type || (filter.limit && filter.limit !== 20)) && (
        <button
          onClick={() => onChange({ type: undefined, limit: 20 })}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
