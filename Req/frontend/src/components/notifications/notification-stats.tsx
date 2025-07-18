'use client';

import { NotificationStats as StatsType, NotificationType } from '@/types';

interface NotificationStatsProps {
  stats: StatsType;
}

export function NotificationStats({ stats }: NotificationStatsProps) {
  const getTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.INFO:
        return 'Info';
      case NotificationType.SUCCESS:
        return 'Éxito';
      case NotificationType.WARNING:
        return 'Advertencia';
      case NotificationType.ERROR:
        return 'Error';
      case NotificationType.SYSTEM:
        return 'Sistema';
      case NotificationType.USER_ACTION:
        return 'Usuario';
      case NotificationType.DATA_UPDATE:
        return 'Datos';
      case NotificationType.REPORT_READY:
        return 'Reportes';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.INFO:
        return 'ℹ️';
      case NotificationType.SUCCESS:
        return '✅';
      case NotificationType.WARNING:
        return '⚠️';
      case NotificationType.ERROR:
        return '❌';
      case NotificationType.SYSTEM:
        return '🔧';
      case NotificationType.USER_ACTION:
        return '👤';
      case NotificationType.DATA_UPDATE:
        return '📝';
      case NotificationType.REPORT_READY:
        return '📊';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'text-green-600 bg-green-100';
      case NotificationType.ERROR:
        return 'text-red-600 bg-red-100';
      case NotificationType.WARNING:
        return 'text-yellow-600 bg-yellow-100';
      case NotificationType.INFO:
        return 'text-blue-600 bg-blue-100';
      case NotificationType.SYSTEM:
        return 'text-purple-600 bg-purple-100';
      case NotificationType.USER_ACTION:
        return 'text-indigo-600 bg-indigo-100';
      case NotificationType.DATA_UPDATE:
        return 'text-teal-600 bg-teal-100';
      case NotificationType.REPORT_READY:
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Filter out types with 0 count for cleaner display
  const activeTypes = Object.entries(stats.byType).filter(([_, count]) => count > 0);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{stats.total}</span> total
          </div>
          {stats.unread > 0 && (
            <div className="text-sm text-red-600">
              <span className="font-medium">{stats.unread}</span> sin leer
            </div>
          )}
        </div>

        {stats.total > 0 && (
          <div className="text-xs text-gray-500">
            {Math.round((stats.unread / stats.total) * 100)}% sin leer
          </div>
        )}
      </div>

      {/* Type breakdown */}
      {activeTypes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {activeTypes.map(([type, count]) => (
            <div
              key={type}
              className={`flex items-center space-x-2 px-2 py-1 rounded-md text-xs ${getTypeColor(
                type as NotificationType
              )}`}
            >
              <span>{getTypeIcon(type as NotificationType)}</span>
              <span className="font-medium">{count}</span>
              <span className="truncate">{getTypeLabel(type as NotificationType)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar for unread notifications */}
      {stats.total > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(5, ((stats.total - stats.unread) / stats.total) * 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
