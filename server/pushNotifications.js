// Web Push Notification Service
import webPush from 'web-push';

// VAPID keys for Web Push authentication
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BOHqKFwkdMCcoX-zrH3VZeslOMIAZev7hZlI7VhG5_hEyfxpc564ry9cXGA03z6akc6VQfBnS_EFaGtB7pcFj28';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '50fLBYtl0d3vKAd1qXVWCEAe0UK2owFO4fe9a3DIHB0';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@bonnesantemedicals.com';

// Configure web-push with VAPID details
webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// In-memory storage for push subscriptions (will use database in production)
let pushSubscriptions = new Map();

// Get public key for client
export const getVapidPublicKey = () => VAPID_PUBLIC_KEY;

// Save a push subscription
export const saveSubscription = (subscription, metadata = {}) => {
  const key = subscription.endpoint;
  pushSubscriptions.set(key, {
    subscription,
    metadata: {
      ...metadata,
      subscribedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
  });
  console.log(`📱 Push subscription saved. Total: ${pushSubscriptions.size}`);
  return true;
};

// Remove a push subscription
export const removeSubscription = (endpoint) => {
  const deleted = pushSubscriptions.delete(endpoint);
  console.log(`📱 Push subscription removed: ${deleted}. Total: ${pushSubscriptions.size}`);
  return deleted;
};

// Get all subscriptions
export const getAllSubscriptions = () => {
  return Array.from(pushSubscriptions.values());
};

// Get subscriptions by role
export const getSubscriptionsByRole = (role) => {
  return Array.from(pushSubscriptions.values()).filter(
    sub => sub.metadata.role === role || sub.metadata.role === 'admin'
  );
};

// Send push notification to a single subscription
export const sendPushNotification = async (subscription, payload) => {
  try {
    const result = await webPush.sendNotification(
      subscription,
      JSON.stringify(payload),
      {
        TTL: 86400, // 24 hours
        urgency: payload.urgency || 'high',
        topic: payload.topic || 'general'
      }
    );
    console.log(`✅ Push sent successfully: ${result.statusCode}`);
    return { success: true, statusCode: result.statusCode };
  } catch (error) {
    console.error(`❌ Push failed:`, error.message);
    
    // If subscription is expired/invalid, remove it
    if (error.statusCode === 404 || error.statusCode === 410) {
      removeSubscription(subscription.endpoint);
      return { success: false, removed: true, error: 'Subscription expired' };
    }
    
    return { success: false, error: error.message };
  }
};

// Send push notification to all subscribers
export const broadcastPushNotification = async (payload) => {
  const subscriptions = getAllSubscriptions();
  const results = { sent: 0, failed: 0, removed: 0 };
  
  console.log(`📢 Broadcasting push to ${subscriptions.length} subscribers`);
  
  for (const { subscription } of subscriptions) {
    try {
      const result = await sendPushNotification(subscription, payload);
      if (result.success) {
        results.sent++;
      } else if (result.removed) {
        results.removed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
    }
  }
  
  console.log(`📢 Broadcast complete: ${results.sent} sent, ${results.failed} failed, ${results.removed} removed`);
  return results;
};

// Send push notification to subscribers with specific role
export const sendPushToRole = async (role, payload) => {
  const subscriptions = getSubscriptionsByRole(role);
  const results = { sent: 0, failed: 0, removed: 0 };
  
  console.log(`📢 Sending push to ${subscriptions.length} ${role} subscribers`);
  
  for (const { subscription } of subscriptions) {
    try {
      const result = await sendPushNotification(subscription, payload);
      if (result.success) {
        results.sent++;
      } else if (result.removed) {
        results.removed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
    }
  }
  
  return results;
};

// Notification templates
export const notificationTemplates = {
  newOrder: (order) => ({
    title: '🛒 New Order Received!',
    body: `Order ${order.orderNumber} - ₦${(order.total || order.totalAmount || 0).toLocaleString()} from ${order.customerName}`,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `order-${order.orderNumber}`,
    url: '/admin/orders',
    data: { orderId: order.id, orderNumber: order.orderNumber, type: 'new_order' },
    urgency: 'high'
  }),
  
  orderStatusUpdate: (order, newStatus) => ({
    title: `📦 Order ${newStatus.toUpperCase()}`,
    body: `Order ${order.orderNumber} has been marked as ${newStatus}`,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `order-status-${order.orderNumber}`,
    url: '/admin/orders',
    data: { orderId: order.id, orderNumber: order.orderNumber, status: newStatus, type: 'status_update' },
    urgency: 'normal'
  }),
  
  escalatedOrder: (order) => ({
    title: '⚠️ Order Escalated!',
    body: `Order ${order.orderNumber} needs immediate attention - not acknowledged within 1 hour`,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `escalation-${order.orderNumber}`,
    url: '/admin/orders',
    data: { orderId: order.id, orderNumber: order.orderNumber, type: 'escalation' },
    urgency: 'high'
  }),
  
  lowStock: (product) => ({
    title: '📉 Low Stock Alert',
    body: `${product.name} is running low (${product.quantity} remaining)`,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `stock-${product.id}`,
    url: '/admin/inventory',
    data: { productId: product.id, type: 'low_stock' },
    urgency: 'normal'
  }),
  
  newFeedback: (feedback) => ({
    title: '💬 New Feedback Received',
    body: `${feedback.customerName}: "${feedback.message?.substring(0, 50)}..."`,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `feedback-${feedback.id}`,
    url: '/admin/feedback',
    data: { feedbackId: feedback.id, type: 'feedback' },
    urgency: 'normal'
  }),
  
  custom: (title, body, url = '/') => ({
    title,
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: `custom-${Date.now()}`,
    url,
    data: { type: 'custom' },
    urgency: 'normal'
  })
};

// Export for database persistence (implement when needed)
export const loadSubscriptionsFromDB = async (pool) => {
  try {
    const result = await pool.query('SELECT * FROM push_subscriptions WHERE active = true');
    result.rows.forEach(row => {
      const subscription = typeof row.subscription === 'string' 
        ? JSON.parse(row.subscription) 
        : row.subscription;
      pushSubscriptions.set(subscription.endpoint, {
        subscription,
        metadata: {
          id: row.id,
          userId: row.user_id,
          role: row.role,
          deviceInfo: row.device_info,
          subscribedAt: row.created_at,
          lastActive: row.last_active
        }
      });
    });
    console.log(`📱 Loaded ${pushSubscriptions.size} push subscriptions from database`);
  } catch (error) {
    console.log('Push subscriptions table not found, using in-memory storage');
  }
};

export const saveSubscriptionToDB = async (pool, subscription, metadata = {}) => {
  try {
    await pool.query(`
      INSERT INTO push_subscriptions (endpoint, subscription, user_id, role, device_info, active)
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (endpoint) DO UPDATE SET
        subscription = EXCLUDED.subscription,
        last_active = CURRENT_TIMESTAMP,
        active = true
    `, [
      subscription.endpoint,
      JSON.stringify(subscription),
      metadata.userId || null,
      metadata.role || 'guest',
      metadata.deviceInfo || null
    ]);
    return true;
  } catch (error) {
    console.error('Failed to save subscription to DB:', error.message);
    return false;
  }
};

export default {
  getVapidPublicKey,
  saveSubscription,
  removeSubscription,
  getAllSubscriptions,
  sendPushNotification,
  broadcastPushNotification,
  sendPushToRole,
  notificationTemplates,
  loadSubscriptionsFromDB,
  saveSubscriptionToDB
};
