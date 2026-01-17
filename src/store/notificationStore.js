import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useSyncStore } from './syncStore';
import { v4 as uuidv4 } from 'uuid';

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_NEW: 'order_new',
  ORDER_ACKNOWLEDGED: 'order_acknowledged',
  ORDER_ESCALATED: 'order_escalated',
  PAYMENT_RECEIVED: 'payment_received',
  ORDER_DISPATCHED: 'order_dispatched',
  ORDER_DELIVERED: 'order_delivered',
  SYSTEM: 'system',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

export const useNotificationStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        notifications: [],
        unreadCount: 0,
        
        // Add notification
        addNotification: (notification) => {
          const newNotification = {
            id: uuidv4(),
            ...notification,
            read: false,
            createdAt: new Date().toISOString()
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 100),
            unreadCount: state.unreadCount + 1
          }));
          
          useSyncStore.getState().notifyStateChange('notifications', { 
            action: 'add', 
            notification: newNotification 
          });
          
          return newNotification;
        },
        
        // Mark notification as read
        markAsRead: (notificationId) => {
          set((state) => ({
            notifications: state.notifications.map(n => 
              n.id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        },
        
        // Mark all as read
        markAllAsRead: () => {
          set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
          }));
        },
        
        // Remove notification
        removeNotification: (notificationId) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === notificationId);
            return {
              notifications: state.notifications.filter(n => n.id !== notificationId),
              unreadCount: notification && !notification.read 
                ? state.unreadCount - 1 
                : state.unreadCount
            };
          });
        },
        
        // Clear all notifications
        clearAll: () => {
          set({ notifications: [], unreadCount: 0 });
        },
        
        // Get notifications by type
        getByType: (type) => {
          return get().notifications.filter(n => n.type === type);
        },
        
        // Get unread notifications
        getUnread: () => {
          return get().notifications.filter(n => !n.read);
        },
        
        // Order-specific notifications
        notifyNewOrder: (order, recipientRole) => {
          return get().addNotification({
            type: NOTIFICATION_TYPES.ORDER_NEW,
            title: 'New Order Received',
            message: `Order #${order.orderNumber} has been placed`,
            data: { orderId: order.id, orderNumber: order.orderNumber },
            recipientRole
          });
        },
        
        notifyOrderEscalated: (order) => {
          return get().addNotification({
            type: NOTIFICATION_TYPES.ORDER_ESCALATED,
            title: '⚠️ Order Escalated',
            message: `Order #${order.orderNumber} has been escalated - no acknowledgment within 1 hour`,
            data: { orderId: order.id, orderNumber: order.orderNumber },
            recipientRole: 'cco',
            priority: 'high'
          });
        },
        
        notifyPaymentReceived: (order) => {
          return get().addNotification({
            type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
            title: 'Payment Proof Uploaded',
            message: `Payment proof uploaded for Order #${order.orderNumber}`,
            data: { orderId: order.id, orderNumber: order.orderNumber },
            recipientRole: 'distributor'
          });
        },
        
        notifyOrderDispatched: (order) => {
          return get().addNotification({
            type: NOTIFICATION_TYPES.ORDER_DISPATCHED,
            title: 'Order Dispatched',
            message: `Order #${order.orderNumber} has been dispatched`,
            data: { orderId: order.id, orderNumber: order.orderNumber },
            recipientRole: 'customer'
          });
        }
      }),
      {
        name: 'astrobsm-notifications'
      }
    )
  )
);
