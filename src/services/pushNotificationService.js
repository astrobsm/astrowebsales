// Web Push Notification Service
// Handles push notification subscription and management

// VAPID Public Key - used for push subscription
const VAPID_PUBLIC_KEY = 'BCeKP36vepti2QWWnJLEurwXZRwmRRmyeEm0FnC7FyerhDqvVlTGySDbBBkfiAmL0I3lNdlHF2UOGaHtz1BzoDs';

class PushNotificationService {
  constructor() {
    this.swRegistration = null;
    this.subscription = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Convert VAPID key from base64 to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Initialize push notifications
  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    try {
      // Wait for service worker to be ready
      this.swRegistration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready for push notifications');

      // Check existing subscription
      this.subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('📱 Existing push subscription found');
        await this.sendSubscriptionToServer(this.subscription);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Request permission and subscribe to push
  async subscribe(userRole = 'user', userId = null) {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      console.log('✅ Notification permission granted');

      // Subscribe to push manager
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      this.subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('✅ Push subscription created:', this.subscription.endpoint);

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription, userRole, userId);

      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.subscription) {
      return true;
    }

    try {
      // Remove from server first
      await this.removeSubscriptionFromServer(this.subscription);

      // Unsubscribe locally
      await this.subscription.unsubscribe();
      this.subscription = null;

      console.log('✅ Unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }

  // Send subscription to server for storage
  async sendSubscriptionToServer(subscription, userRole = 'user', userId = null) {
    try {
      const deviceId = localStorage.getItem('astrobsm-device-id') || 'unknown';
      
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          deviceId,
          userRole,
          userId,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      console.log('✅ Subscription saved on server');
      return true;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      // Don't throw - subscription still works locally
      return false;
    }
  }

  // Remove subscription from server
  async removeSubscriptionFromServer(subscription) {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        }),
      });
      return true;
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      return false;
    }
  }

  // Check if currently subscribed
  async isSubscribed() {
    if (!this.swRegistration) {
      await this.init();
    }
    
    this.subscription = await this.swRegistration?.pushManager?.getSubscription();
    return !!this.subscription;
  }

  // Get current permission status
  getPermissionStatus() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission; // 'granted', 'denied', 'default'
  }

  // Send a test notification (via server)
  async sendTestNotification() {
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: localStorage.getItem('astrobsm-device-id')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
const pushNotificationService = new PushNotificationService();
export default pushNotificationService;

// Also export class for testing
export { PushNotificationService, VAPID_PUBLIC_KEY };
