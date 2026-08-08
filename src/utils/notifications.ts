// Browser System & Push Notification Helper

export const LAST_ADMIN_NOTIFICATION_KEY = 'roxyefollow_last_admin_notification';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  bannerUrl?: string;
}

/**
 * Check if the browser supports standard Web Notifications
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Get current browser notification permission
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Notification permission error:', err);
    return Notification.permission;
  }
};

/**
 * Send a device system notification if permission is granted
 */
export const sendDeviceNotification = (title: string, options?: { body?: string; icon?: string; tag?: string }) => {
  if (!isNotificationSupported()) return;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: options?.body || 'New update from Roxyefollow',
        icon: options?.icon || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=128&auto=format&fit=crop&q=80',
        tag: options?.tag || 'roxyefollow-notice-' + Date.now(),
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.warn('Failed to dispatch device notification:', err);
    }
  }
};

/**
 * Broadcast an admin notification across all active tabs and trigger system notification
 */
export const broadcastAdminNotification = (title: string, message: string, bannerUrl?: string) => {
  const payload: NotificationPayload = {
    id: 'notif_' + Date.now(),
    title,
    message,
    timestamp: Date.now(),
    bannerUrl
  };

  try {
    localStorage.setItem(LAST_ADMIN_NOTIFICATION_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save last admin notification:', err);
  }

  // Trigger system notification locally if granted
  sendDeviceNotification(title, { body: message });

  // Broadcast to other tabs
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('roxyefollow_push_notification', { detail: payload }));
  }
};
