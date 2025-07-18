'use client';

import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '@/store/notification-store';
import { useAuthStore } from '@/store/auth-store';

/**
 * Hook personalizado para gestionar notificaciones
 * Responsabilidad: Inicializar y gestionar el estado de notificaciones
 */
export function useNotifications() {
  const { user, token, isAuthenticated } = useAuthStore();
  const {
    notifications,
    stats,
    isLoading,
    isConnected,
    error,
    initializeNotifications,
    disconnect,
    clearError,
  } = useNotificationStore();

  // Inicializar notificaciones cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user && token) {
      initializeNotifications(user.id, token);
    } else {
      disconnect();
    }

    // Cleanup al desmontar
    return () => {
      if (!isAuthenticated) {
        disconnect();
      }
    };
  }, [isAuthenticated, user, token, initializeNotifications, disconnect]);

  // Función para limpiar errores
  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    notifications,
    stats,
    isLoading,
    isConnected,
    error,
    clearError: handleClearError,
    hasUnreadNotifications: stats.unread > 0,
    unreadCount: stats.unread,
  };
}
