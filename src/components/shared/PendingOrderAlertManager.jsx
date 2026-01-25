import React, { useEffect, useRef, useCallback } from 'react';
import { useOrderStore, ORDER_STATUS } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { usePWAStore } from '../../store/pwaStore';

// Alert interval in milliseconds (15 minutes)
const ALERT_INTERVAL = 15 * 60 * 1000;

// Minimum time between alerts to prevent spam (5 minutes)
const MIN_ALERT_GAP = 5 * 60 * 1000;

const PendingOrderAlertManager = () => {
  const { orders, fetchOrders, getOrdersByDistributor, getPendingOrdersForDistributor } = useOrderStore();
  const { user } = useAuthStore();
  const { voiceEnabled, announce, showNotification, notificationsEnabled } = usePWAStore();
  
  const alertIntervalRef = useRef(null);
  const lastAlertTimeRef = useRef(0);
  const announcedOrdersRef = useRef(new Set());

  // Get pending orders based on user role
  const getPendingOrders = useCallback(() => {
    if (!user) return [];
    
    const role = user.role;
    
    if (role === 'admin') {
      // Admin sees all pending orders
      return orders.filter(o => o.status === ORDER_STATUS.PENDING);
    } else if (role === 'distributor') {
      // Distributor sees only their pending orders
      return getPendingOrdersForDistributor(user.id) || [];
    } else if (role === 'sales') {
      // Sales staff sees pending orders they can process
      return orders.filter(o => o.status === ORDER_STATUS.PENDING);
    } else if (role === 'cco') {
      // CCO sees all pending and escalated orders
      return orders.filter(o => 
        o.status === ORDER_STATUS.PENDING || 
        o.status === ORDER_STATUS.ESCALATED
      );
    }
    
    return [];
  }, [orders, user, getPendingOrdersForDistributor]);

  // Generate voice alert message
  const generateAlertMessage = useCallback((pendingOrders) => {
    const count = pendingOrders.length;
    
    if (count === 0) return null;
    
    if (count === 1) {
      const order = pendingOrders[0];
      const customerName = order.customerName || 'A customer';
      const orderNumber = order.orderNumber || order.id;
      const timeSinceCreation = getTimeSinceCreation(order.createdAt);
      
      return `Attention! You have 1 pending order requiring your attention. Order ${orderNumber} from ${customerName}, placed ${timeSinceCreation}. Please process this order immediately.`;
    } else {
      // Multiple pending orders
      const oldestOrder = pendingOrders.reduce((oldest, order) => {
        return new Date(order.createdAt) < new Date(oldest.createdAt) ? order : oldest;
      }, pendingOrders[0]);
      
      const oldestTimeSince = getTimeSinceCreation(oldestOrder.createdAt);
      
      return `Attention! You have ${count} pending orders requiring your attention. The oldest order was placed ${oldestTimeSince}. Please attend to these orders immediately to avoid escalation.`;
    }
  }, []);

  // Helper to get human-readable time since creation
  const getTimeSinceCreation = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  // Announce pending orders
  const announcePendingOrders = useCallback(() => {
    const now = Date.now();
    
    // Prevent too frequent alerts
    if (now - lastAlertTimeRef.current < MIN_ALERT_GAP) {
      console.log('⏰ Skipping alert - too soon since last alert');
      return;
    }
    
    const pendingOrders = getPendingOrders();
    
    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders to alert about');
      return;
    }
    
    const message = generateAlertMessage(pendingOrders);
    
    if (message) {
      console.log(`🔊 Voice Alert: ${pendingOrders.length} pending orders`);
      
      // Voice announcement
      if (voiceEnabled) {
        announce(message, 'high');
      }
      
      // Push notification
      if (notificationsEnabled) {
        showNotification('Pending Orders Alert', {
          body: `You have ${pendingOrders.length} pending order${pendingOrders.length > 1 ? 's' : ''} requiring attention.`,
          tag: 'pending-orders',
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200]
        });
      }
      
      lastAlertTimeRef.current = now;
    }
  }, [getPendingOrders, generateAlertMessage, voiceEnabled, announce, notificationsEnabled, showNotification]);

  // Check for new orders and announce immediately
  const checkForNewOrders = useCallback(() => {
    const pendingOrders = getPendingOrders();
    
    pendingOrders.forEach(order => {
      // Check if this is a new order we haven't announced yet
      if (!announcedOrdersRef.current.has(order.id)) {
        const customerName = order.customerName || 'A customer';
        const orderNumber = order.orderNumber || order.id;
        const itemCount = order.items?.length || 0;
        const total = order.totalAmount || order.total || 0;
        
        const message = `New order alert! ${customerName} has placed order ${orderNumber} with ${itemCount} item${itemCount !== 1 ? 's' : ''}, totaling ${total.toLocaleString()} Naira. Please process this order promptly.`;
        
        console.log(`🆕 New order detected: ${orderNumber}`);
        
        if (voiceEnabled) {
          announce(message, 'high');
        }
        
        if (notificationsEnabled) {
          showNotification('New Order Received!', {
            body: `${customerName} - ${itemCount} items - ₦${total.toLocaleString()}`,
            tag: `order-${order.id}`,
            requireInteraction: true,
            vibrate: [200, 100, 200]
          });
        }
        
        // Mark as announced
        announcedOrdersRef.current.add(order.id);
      }
    });
  }, [getPendingOrders, voiceEnabled, announce, notificationsEnabled, showNotification]);

  // Initialize alert system
  useEffect(() => {
    if (!user) return;
    
    console.log('🔔 Pending Order Alert Manager initialized');
    
    // Fetch orders initially
    fetchOrders();
    
    // Check for new orders periodically (every 30 seconds)
    const newOrderCheckInterval = setInterval(() => {
      fetchOrders().then(() => {
        checkForNewOrders();
      });
    }, 30 * 1000);
    
    // Set up the 15-minute recurring alert
    alertIntervalRef.current = setInterval(() => {
      console.log('⏰ 15-minute alert check triggered');
      announcePendingOrders();
    }, ALERT_INTERVAL);
    
    // Also do an initial alert check after 2 seconds (to let data load)
    const initialCheck = setTimeout(() => {
      announcePendingOrders();
    }, 2000);
    
    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
      }
      clearInterval(newOrderCheckInterval);
      clearTimeout(initialCheck);
      console.log('🔔 Pending Order Alert Manager cleaned up');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only re-run when user changes, not on every function recreation

  // Reset announced orders when orders change significantly
  useEffect(() => {
    // Remove orders that are no longer pending from the announced set
    const pendingOrderIds = new Set(
      orders
        .filter(o => o.status === ORDER_STATUS.PENDING)
        .map(o => o.id)
    );
    
    announcedOrdersRef.current.forEach(id => {
      if (!pendingOrderIds.has(id)) {
        announcedOrdersRef.current.delete(id);
      }
    });
  }, [orders]);

  // This component doesn't render anything visible
  return null;
};

export default PendingOrderAlertManager;
