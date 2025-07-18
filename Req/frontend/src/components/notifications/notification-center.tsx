'use client';

import { useState, useEffect } from 'react';
import { useNotificationStore } from '@/store/notification-store';
import { NotificationItem } from './notification-item';
import { NotificationFilter } from './notification-filter';
import { NotificationStats } from './notification-stats';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { NotificationFilter as FilterType } from '@/types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    stats,
    isLoading,
    error,
    loadNotifications,
    markAllAsRead,
    clearError,
  } = useNotificationStore();

  const [filter, setFilter] = useState<FilterType>({
    limit: 20,
    offset: 0,
  });

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      const currentFilter = {
        ...filter,
        read: activeTab === 'unread' ? false : undefined,
      };
      loadNotifications(currentFilter);
    }
  }, [isOpen, activeTab, filter, loadNotifications]);

  const handleTabChange = (tab: 'all' | 'unread') => {
    setActiveTab(tab);
    setFilter(prev => ({ ...prev, offset: 0 }));
  };

  const handleFilterChange = (newFilter: Partial<FilterType>) => {
    setFilter(prev => ({ ...prev, ...newFilter, offset: 0 }));
  };

  const handleLoadMore = () => {
    setFilter(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 20),
    }));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Reload notifications to reflect changes
    loadNotifications({
      ...filter,
      read: activeTab === 'unread' ? false : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Centro de Notificaciones
            </h2>
            {stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {stats.unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
              >
                Marcar todas como leídas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b bg-gray-50">
          <NotificationStats stats={stats} />
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('all')}
          >
            Todas ({stats.total})
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'unread'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('unread')}
          >
            No leídas ({stats.unread})
          </button>
        </div>

        {/* Filter */}
        <div className="p-4 border-b">
          <NotificationFilter
            filter={filter}
            onChange={handleFilterChange}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="mt-2 text-red-600 hover:text-red-800"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loading />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <div className="text-4xl mb-4">🔔</div>
              <p className="text-lg font-medium">No hay notificaciones</p>
              <p className="text-sm">
                {activeTab === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : 'No tienes notificaciones'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {notifications.length > 0 && notifications.length >= (filter.limit || 20) && (
            <div className="p-4 text-center border-t">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : 'Cargar más'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
