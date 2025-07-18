import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Notification,
  NotificationFilter,
  NotificationStats,
  NotificationType,
} from '@/types';
import { notificationService } from '@/lib/notification-service';

interface NotificationState {
  // State
  notifications: Notification[];
  stats: NotificationStats;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;

  // Actions
  initializeNotifications: (userId: string, token: string) => Promise<void>;
  loadNotifications: (filter?: NotificationFilter) => Promise<void>;
  loadStats: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  updateNotification: (
    notificationId: string,
    updates: Partial<Notification>
  ) => void;
  clearError: () => void;
  disconnect: () => void;
}

const initialStats: NotificationStats = {
  total: 0,
  unread: 0,
  byType: {
    [NotificationType.INFO]: 0,
    [NotificationType.SUCCESS]: 0,
    [NotificationType.WARNING]: 0,
    [NotificationType.ERROR]: 0,
    [NotificationType.SYSTEM]: 0,
    [NotificationType.USER_ACTION]: 0,
    [NotificationType.DATA_UPDATE]: 0,
    [NotificationType.REPORT_READY]: 0,
  },
};

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      stats: initialStats,
      isLoading: false,
      isConnected: false,
      error: null,

      // Initialize notifications and WebSocket connection
      initializeNotifications: async (userId: string, token: string) => {
        set({ isLoading: true, error: null });

        try {
          // Connect to WebSocket
          await notificationService.connect(userId, token);
          set({ isConnected: true });

          // Load initial notifications and stats
          await Promise.all([get().loadNotifications(), get().loadStats()]);

          // Setup event listeners for real-time updates
          window.addEventListener('notification-received', (event: any) => {
            const notification = event.detail as Notification;
            get().addNotification(notification);
            get().loadStats(); // Refresh stats
          });
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to initialize notifications',
            isConnected: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Load notifications from server
      loadNotifications: async (filter: NotificationFilter = {}) => {
        set({ isLoading: true, error: null });

        try {
          const notifications =
            await notificationService.getNotifications(filter);
          set({ notifications });
        } catch (error) {
          console.error('Failed to load notifications:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load notifications',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Load notification statistics
      loadStats: async () => {
        try {
          const stats = await notificationService.getNotificationStats();
          set({ stats });
        } catch (error) {
          console.error('Failed to load notification stats:', error);
          // Don't set error for stats loading failure
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId: string) => {
        try {
          await notificationService.markAsRead(notificationId);

          // Update local state
          set(state => ({
            notifications: state.notifications.map(notification =>
              notification.id === notificationId
                ? { ...notification, read: true }
                : notification
            ),
          }));

          // Refresh stats
          await get().loadStats();
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to mark notification as read',
          });
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          const markedCount = await notificationService.markAllAsRead();

          if (markedCount > 0) {
            // Update local state
            set(state => ({
              notifications: state.notifications.map(notification => ({
                ...notification,
                read: true,
              })),
            }));

            // Refresh stats
            await get().loadStats();
          }
        } catch (error) {
          console.error('Failed to mark all notifications as read:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to mark all notifications as read',
          });
        }
      },

      // Delete notification
      deleteNotification: async (notificationId: string) => {
        try {
          await notificationService.deleteNotification(notificationId);

          // Update local state
          set(state => ({
            notifications: state.notifications.filter(
              notification => notification.id !== notificationId
            ),
          }));

          // Refresh stats
          await get().loadStats();
        } catch (error) {
          console.error('Failed to delete notification:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete notification',
          });
        }
      },

      // Add new notification to local state
      addNotification: (notification: Notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      // Update notification in local state
      updateNotification: (
        notificationId: string,
        updates: Partial<Notification>
      ) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, ...updates }
              : notification
          ),
        }));
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Disconnect from WebSocket
      disconnect: () => {
        notificationService.disconnect();
        set({
          isConnected: false,
          notifications: [],
          stats: initialStats,
        });
      },
    }),
    {
      name: 'notification-store',
    }
  )
);
