'use client';

import { useState } from 'react';
import { useNotificationStore } from '@/store/notification-store';
import { Button } from '@/components/ui/button';
import { Notification, NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotificationStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMarkAsRead = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNotification(notification.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.SUCCESS:
        return '✅';
      case NotificationType.ERROR:
        return '❌';
      case NotificationType.WARNING:
        return '⚠️';
      case NotificationType.INFO:
        return 'ℹ️';
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

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'text-green-600 bg-green-50 border-green-200';
      case NotificationType.ERROR:
        return 'text-red-600 bg-red-50 border-red-200';
      case NotificationType.WARNING:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case NotificationType.INFO:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case NotificationType.SYSTEM:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case NotificationType.USER_ACTION:
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case NotificationType.DATA_UPDATE:
        return 'text-teal-600 bg-teal-50 border-teal-200';
      case NotificationType.REPORT_READY:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: Date): string => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: es,
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50 border-l-4 border-blue-400' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getNotificationColor(
            notification.type
          )}`}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4
                className={`text-sm font-medium ${
                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                }`}
              >
                {notification.title}
              </h4>
              <p
                className={`mt-1 text-sm ${
                  !notification.read ? 'text-gray-800' : 'text-gray-600'
                }`}
              >
                {notification.message}
              </p>

              {/* Additional data */}
              {notification.data &&
                Object.keys(notification.data).length > 0 && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <details>
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Ver detalles
                      </summary>
                      <pre className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(notification.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatDate(notification.createdAt)}</span>
                <span className="capitalize">{notification.type}</span>
                {notification.expiresAt && (
                  <span>Expira: {formatDate(notification.expiresAt)}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  title="Marcar como leída"
                >
                  <span className="sr-only">Marcar como leída</span>
                  👁️
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
                title="Eliminar notificación"
              >
                <span className="sr-only">Eliminar</span>
                {isDeleting ? '⏳' : '🗑️'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
