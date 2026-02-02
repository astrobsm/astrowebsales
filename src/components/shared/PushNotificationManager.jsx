// Push Notification Manager Component
// Handles automatic subscription to push notifications

import { useEffect, useState } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';
import { useAuthStore } from '../../store/authStore';

const PushNotificationManager = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const { user, isAuthenticated, userRole } = useAuthStore();

  useEffect(() => {
    initializePush();
  }, [isAuthenticated]);

  const initializePush = async () => {
    // Check if push is supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (!supported) {
      console.log('Push notifications not supported');
      return;
    }

    // Initialize push service
    await pushNotificationService.init();
    
    // Check current permission and subscription status
    setPermission(Notification.permission);
    const subscribed = await pushNotificationService.isSubscribed();
    setIsSubscribed(subscribed);

    // Show banner if not subscribed and permission not denied
    if (!subscribed && Notification.permission !== 'denied' && isAuthenticated) {
      // Delay showing banner slightly
      setTimeout(() => setShowBanner(true), 3000);
    }

    // Auto-subscribe for admin/staff users if permission already granted
    if (Notification.permission === 'granted' && !subscribed && isAuthenticated) {
      const role = userRole || 'user';
      if (['admin', 'sales', 'cco', 'distributor', 'wholesaler'].includes(role)) {
        await handleSubscribe(false);
      }
    }
  };

  const handleSubscribe = async (showPrompt = true) => {
    setIsLoading(true);
    try {
      const userId = user?.id || user?.staffId || user?.partnerId;
      const role = userRole || 'user';
      
      await pushNotificationService.subscribe(role, userId);
      setIsSubscribed(true);
      setPermission('granted');
      setShowBanner(false);
      
      if (showPrompt) {
        // Show success message
        console.log('✅ Push notifications enabled!');
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      if (Notification.permission === 'denied') {
        setPermission('denied');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
      console.log('Push notifications disabled');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await pushNotificationService.sendTestNotification();
      console.log('Test notification sent!');
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  // Don't render if not supported
  if (!isSupported) return null;

  // Notification permission banner
  if (showBanner && !isSubscribed && permission !== 'denied') {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl z-50 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Enable Notifications</h3>
            <p className="text-sm text-white/80 mt-1">
              Get instant alerts for new orders, even when the app is closed!
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleSubscribe(true)}
                disabled={isLoading}
                className="flex items-center gap-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Enable
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="flex items-center gap-1 text-white/80 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Small status indicator (for settings pages)
  return null;
};

// Notification Settings Component for admin panel
export const NotificationSettings = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const { userRole, user } = useAuthStore();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      await pushNotificationService.init();
      setPermission(Notification.permission);
      const subscribed = await pushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await pushNotificationService.unsubscribe();
        setIsSubscribed(false);
      } else {
        const userId = user?.id || user?.staffId;
        await pushNotificationService.subscribe(userRole || 'user', userId);
        setIsSubscribed(true);
        setPermission('granted');
      }
    } catch (error) {
      console.error('Toggle failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      await pushNotificationService.sendTestNotification();
      alert('Test notification sent! Check your notifications.');
    } catch (error) {
      alert('Failed to send test notification');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-700">
          <BellOff className="w-5 h-5" />
          <span>Push notifications are not supported in this browser.</span>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <BellOff className="w-5 h-5" />
          <div>
            <p className="font-medium">Notifications Blocked</p>
            <p className="text-sm mt-1">
              Please enable notifications in your browser settings to receive order alerts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <div className="bg-green-100 p-2 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
          ) : (
            <div className="bg-gray-100 p-2 rounded-lg">
              <BellOff className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-500">
              {isSubscribed 
                ? 'You will receive notifications even when the app is closed'
                : 'Enable to receive instant order alerts'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSubscribed && (
            <button
              onClick={handleTest}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Test
            </button>
          )}
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isSubscribed ? 'bg-green-500' : 'bg-gray-300'
            } ${isLoading ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationManager;
