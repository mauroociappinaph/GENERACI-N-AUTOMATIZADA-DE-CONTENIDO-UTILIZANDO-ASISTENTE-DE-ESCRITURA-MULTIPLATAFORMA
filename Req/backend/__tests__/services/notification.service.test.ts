import { NotificationService } from '@/services/notification.service';
import { NotificationType } from '@/types/notification';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const userId = 'test-user-id';
      const payload = {
        type: NotificationType.INFO,
        title: 'Test Notification',
        message: 'This is a test notification',
        data: { testKey: 'testValue' }
      };

      const notification = await notificationService.createNotification(userId, payload);

      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe(payload.type);
      expect(notification.title).toBe(payload.title);
      expect(notification.message).toBe(payload.message);
      expect(notification.data).toEqual(payload.data);
      expect(notification.read).toBe(false);
      expect(notification.createdAt).toBeInstanceOf(Date);
    });

    it('should create a notification with expiration date', async () => {
      const userId = 'test-user-id';
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const payload = {
        type: NotificationType.WARNING,
        title: 'Expiring Notification',
        message: 'This notification will expire',
        expiresAt
      };

      const notification = await notificationService.createNotification(userId, payload);

      expect(notification.expiresAt).toEqual(expiresAt);
    });
  });

  describe('getNotifications', () => {
    beforeEach(async () => {
      // Create test notifications
      await notificationService.createNotification('user1', {
        type: NotificationType.INFO,
        title: 'Info 1',
        message: 'Info message 1'
      });

      await notificationService.createNotification('user1', {
        type: NotificationType.SUCCESS,
        title: 'Success 1',
        message: 'Success message 1'
      });

      await notificationService.createNotification('user2', {
        type: NotificationType.ERROR,
        title: 'Error 1',
        message: 'Error message 1'
      });
    });

    it('should get notifications for a specific user', async () => {
      const notifications = await notificationService.getNotifications({
        userId: 'user1'
      });

      expect(notifications).toHaveLength(2);
      expect(notifications.every(n => n.userId === 'user1')).toBe(true);
    });

    it('should filter notifications by type', async () => {
      const notifications = await notificationService.getNotifications({
        userId: 'user1',
        type: NotificationType.INFO
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.INFO);
    });

    it('should filter notifications by read status', async () => {
      const notifications = await notificationService.getNotifications({
        userId: 'user1',
        read: false
      });

      expect(notifications).toHaveLength(2);
      expect(notifications.every(n => !n.read)).toBe(true);
    });

    it('should apply pagination', async () => {
      const notifications = await notificationService.getNotifications({
        userId: 'user1',
        limit: 1,
        offset: 0
      });

      expect(notifications).toHaveLength(1);
    });

    it('should exclude expired notifications', async () => {
      // Create an expired notification
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago
      await notificationService.createNotification('user1', {
        type: NotificationType.WARNING,
        title: 'Expired',
        message: 'This is expired',
        expiresAt: expiredDate
      });

      const notifications = await notificationService.getNotifications({
        userId: 'user1'
      });

      // Should not include the expired notification
      expect(notifications.every(n => n.title !== 'Expired')).toBe(true);
    });
  });

  describe('markAsRead', () => {
    let notificationId: string;
    const userId = 'test-user';

    beforeEach(async () => {
      const notification = await notificationService.createNotification(userId, {
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message'
      });
      notificationId = notification.id;
    });

    it('should mark notification as read', async () => {
      const success = await notificationService.markAsRead(notificationId, userId);

      expect(success).toBe(true);

      const notifications = await notificationService.getNotifications({
        userId
      });
      expect(notifications[0].read).toBe(true);
    });

    it('should return false for non-existent notification', async () => {
      const success = await notificationService.markAsRead('non-existent-id', userId);

      expect(success).toBe(false);
    });

    it('should throw error for unauthorized user', async () => {
      await expect(
        notificationService.markAsRead(notificationId, 'different-user')
      ).rejects.toThrow('Unauthorized to mark this notification as read');
    });
  });

  describe('markAllAsRead', () => {
    const userId = 'test-user';

    beforeEach(async () => {
      // Create multiple unread notifications
      await notificationService.createNotification(userId, {
        type: NotificationType.INFO,
        title: 'Test 1',
        message: 'Test message 1'
      });

      await notificationService.createNotification(userId, {
        type: NotificationType.SUCCESS,
        title: 'Test 2',
        message: 'Test message 2'
      });

      await notificationService.createNotification('other-user', {
        type: NotificationType.WARNING,
        title: 'Other user notification',
        message: 'Should not be affected'
      });
    });

    it('should mark all user notifications as read', async () => {
      const count = await notificationService.markAllAsRead(userId);

      expect(count).toBe(2);

      const notifications = await notificationService.getNotifications({
        userId
      });
      expect(notifications.every(n => n.read)).toBe(true);
    });

    it('should not affect other users notifications', async () => {
      await notificationService.markAllAsRead(userId);

      const otherUserNotifications = await notificationService.getNotifications({
        userId: 'other-user'
      });
      expect(otherUserNotifications.every(n => !n.read)).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    let notificationId: string;
    const userId = 'test-user';

    beforeEach(async () => {
      const notification = await notificationService.createNotification(userId, {
        type: NotificationType.INFO,
        title: 'Test',
        message: 'Test message'
      });
      notificationId = notification.id;
    });

    it('should delete notification successfully', async () => {
      const success = await notificationService.deleteNotification(notificationId, userId);

      expect(success).toBe(true);

      const notifications = await notificationService.getNotifications({
        userId
      });
      expect(notifications).toHaveLength(0);
    });

    it('should return false for non-existent notification', async () => {
      const success = await notificationService.deleteNotification('non-existent-id', userId);

      expect(success).toBe(false);
    });

    it('should throw error for unauthorized user', async () => {
      await expect(
        notificationService.deleteNotification(notificationId, 'different-user')
      ).rejects.toThrow('Unauthorized to delete this notification');
    });
  });

  describe('getNotificationStats', () => {
    const userId = 'test-user';

    beforeEach(async () => {
      // Create notifications of different types
      await notificationService.createNotification(userId, {
        type: NotificationType.INFO,
        title: 'Info 1',
        message: 'Info message'
      });

      await notificationService.createNotification(userId, {
        type: NotificationType.SUCCESS,
        title: 'Success 1',
        message: 'Success message'
      });

      const errorNotification = await notificationService.createNotification(userId, {
        type: NotificationType.ERROR,
        title: 'Error 1',
        message: 'Error message'
      });

      // Mark one as read
      await notificationService.markAsRead(errorNotification.id, userId);
    });

    it('should return correct notification stats', async () => {
      const stats = await notificationService.getNotificationStats(userId);

      expect(stats.total).toBe(3);
      expect(stats.unread).toBe(2);
      expect(stats.byType[NotificationType.INFO]).toBe(1);
      expect(stats.byType[NotificationType.SUCCESS]).toBe(1);
      expect(stats.byType[NotificationType.ERROR]).toBe(1);
      expect(stats.byType[NotificationType.WARNING]).toBe(0);
    });
  });

  describe('cleanupExpiredNotifications', () => {
    beforeEach(async () => {
      // Create expired notification
      await notificationService.createNotification('user1', {
        type: NotificationType.WARNING,
        title: 'Expired',
        message: 'This is expired',
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      });

      // Create non-expired notification
      await notificationService.createNotification('user1', {
        type: NotificationType.INFO,
        title: 'Active',
        message: 'This is active'
      });
    });

    it('should clean up expired notifications', async () => {
      const cleanedCount = await notificationService.cleanupExpiredNotifications();

      expect(cleanedCount).toBe(1);

      const notifications = await notificationService.getNotifications({
        userId: 'user1'
      });
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Active');
    });
  });

  describe('createSystemNotification', () => {
    it('should create system notifications for specified users', async () => {
      const userIds = ['user1', 'user2', 'user3'];
      const payload = {
        title: 'System Maintenance',
        message: 'System will be down for maintenance'
      };

      const notifications = await notificationService.createSystemNotification(payload, userIds);

      expect(notifications).toHaveLength(3);
      expect(notifications.every(n => n.type === NotificationType.SYSTEM)).toBe(true);
      expect(notifications.every(n => n.title === payload.title)).toBe(true);
      expect(notifications.every(n => n.message === payload.message)).toBe(true);

      // Verify each user received the notification
      for (const userId of userIds) {
        const userNotifications = await notificationService.getNotifications({ userId });
        expect(userNotifications).toHaveLength(1);
        expect(userNotifications[0].type).toBe(NotificationType.SYSTEM);
      }
    });
  });
});
