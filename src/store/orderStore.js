import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useSyncStore } from './syncStore';
import { usePWAStore } from './pwaStore';
import { v4 as uuidv4 } from 'uuid';

// Order Statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACKNOWLEDGED: 'acknowledged',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  PROCESSING: 'processing',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  ESCALATED: 'escalated'
};

// Delivery Modes
export const DELIVERY_MODES = [
  { id: 'pickup', name: 'Pickup', description: 'Collect from distributor location' },
  { id: 'dispatch', name: 'Dispatch Rider', description: 'Delivery via dispatch rider' },
  { id: 'courier', name: 'Courier Service', description: 'Delivery via courier' }
];

// Urgency Levels
export const URGENCY_LEVELS = [
  { id: 'routine', name: 'Routine', description: '3-5 business days', color: 'green' },
  { id: 'urgent', name: 'Urgent', description: '1-2 business days', color: 'orange', surcharge: 500 }
];

export const useOrderStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        orders: [],
        escalatedOrders: [],
        
        // Generate order number
        generateOrderNumber: () => {
          const date = new Date();
          const year = date.getFullYear().toString().slice(-2);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const random = Math.random().toString(36).substr(2, 5).toUpperCase();
          return `BSM-${year}${month}${day}-${random}`;
        },
        
        // Create new order
        createOrder: (orderData) => {
          const orderNumber = get().generateOrderNumber();
          const now = new Date();
          const escalationTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
          
          const newOrder = {
            id: uuidv4(),
            orderNumber,
            ...orderData,
            status: ORDER_STATUS.PENDING,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            escalationTime: escalationTime.toISOString(),
            isEscalated: false,
            acknowledgedAt: null,
            paymentConfirmedAt: null,
            dispatchedAt: null,
            deliveredAt: null,
            timeline: [
              {
                status: ORDER_STATUS.PENDING,
                timestamp: now.toISOString(),
                note: 'Order placed successfully'
              }
            ],
            communications: []
          };
          
          set((state) => ({
            orders: [newOrder, ...state.orders]
          }));
          
          // Schedule escalation check
          get().scheduleEscalationCheck(newOrder.id, escalationTime);
          
          useSyncStore.getState().notifyStateChange('orders', { 
            action: 'create', 
            order: newOrder 
          });
          
          // Trigger voice announcement and notification for staff
          try {
            const pwaStore = usePWAStore.getState();
            pwaStore.announceOrder(newOrder);
            pwaStore.showNotification('New Order Received!', {
              body: `Order ${orderNumber} from ${orderData.customerName || 'Customer'} - ₦${orderData.total?.toLocaleString() || '0'}`,
              tag: `order-${newOrder.id}`,
              requireInteraction: true,
              data: { orderId: newOrder.id, type: 'new_order' }
            });
          } catch (e) {
            console.log('Voice/notification error:', e);
          }
          
          return newOrder;
        },
        
        // Get order by ID
        getOrderById: (orderId) => {
          return get().orders.find(o => o.id === orderId);
        },
        
        // Get order by order number
        getOrderByNumber: (orderNumber) => {
          return get().orders.find(o => o.orderNumber === orderNumber);
        },
        
        // Get orders by customer
        getOrdersByCustomer: (customerId) => {
          return get().orders.filter(o => o.customerId === customerId);
        },
        
        // Get orders by distributor
        getOrdersByDistributor: (distributorId) => {
          return get().orders.filter(o => o.distributorId === distributorId);
        },
        
        // Get pending orders for distributor
        getPendingOrdersForDistributor: (distributorId) => {
          return get().orders.filter(o => 
            o.distributorId === distributorId && 
            o.status === ORDER_STATUS.PENDING
          );
        },
        
        // Update order status
        updateOrderStatus: (orderId, status, note = '') => {
          const now = new Date().toISOString();
          
          set((state) => ({
            orders: state.orders.map(order => {
              if (order.id !== orderId) return order;
              
              const updates = {
                status,
                updatedAt: now,
                timeline: [
                  ...order.timeline,
                  { status, timestamp: now, note }
                ]
              };
              
              // Set specific timestamps
              if (status === ORDER_STATUS.ACKNOWLEDGED) {
                updates.acknowledgedAt = now;
                updates.isEscalated = false;
              } else if (status === ORDER_STATUS.PAYMENT_CONFIRMED) {
                updates.paymentConfirmedAt = now;
              } else if (status === ORDER_STATUS.DISPATCHED) {
                updates.dispatchedAt = now;
              } else if (status === ORDER_STATUS.DELIVERED) {
                updates.deliveredAt = now;
              }
              
              return { ...order, ...updates };
            })
          }));
          
          useSyncStore.getState().notifyStateChange('orders', { 
            action: 'statusUpdate', 
            orderId, 
            status 
          });
        },
        
        // Acknowledge order (distributor)
        acknowledgeOrder: (orderId, note = 'Order acknowledged by distributor') => {
          get().updateOrderStatus(orderId, ORDER_STATUS.ACKNOWLEDGED, note);
        },
        
        // Confirm payment
        confirmPayment: (orderId, note = 'Payment confirmed') => {
          get().updateOrderStatus(orderId, ORDER_STATUS.PAYMENT_CONFIRMED, note);
        },
        
        // Schedule escalation check
        scheduleEscalationCheck: (orderId, escalationTime) => {
          const now = new Date();
          const delay = escalationTime.getTime() - now.getTime();
          
          if (delay > 0) {
            setTimeout(() => {
              get().checkEscalation(orderId);
            }, delay);
          }
        },
        
        // Check if order should be escalated
        checkEscalation: (orderId) => {
          const order = get().getOrderById(orderId);
          
          if (order && order.status === ORDER_STATUS.PENDING && !order.isEscalated) {
            get().escalateOrder(orderId, 'Order not acknowledged within 1 hour');
          }
        },
        
        // Escalate order
        escalateOrder: (orderId, reason) => {
          const now = new Date().toISOString();
          
          set((state) => ({
            orders: state.orders.map(order => {
              if (order.id !== orderId) return order;
              
              return {
                ...order,
                status: ORDER_STATUS.ESCALATED,
                isEscalated: true,
                escalatedAt: now,
                escalationReason: reason,
                updatedAt: now,
                timeline: [
                  ...order.timeline,
                  { 
                    status: ORDER_STATUS.ESCALATED, 
                    timestamp: now, 
                    note: `ESCALATED: ${reason}` 
                  }
                ]
              };
            }),
            escalatedOrders: [
              ...state.escalatedOrders.filter(id => id !== orderId),
              orderId
            ]
          }));
          
          // Notify CCO
          useSyncStore.getState().notifyStateChange('orders', { 
            action: 'escalated', 
            orderId, 
            reason 
          });
          
          console.log(`⚠️ Order ${orderId} ESCALATED: ${reason}`);
        },
        
        // Reassign order to different distributor
        reassignOrder: (orderId, newDistributorId, note = '') => {
          set((state) => ({
            orders: state.orders.map(order => {
              if (order.id !== orderId) return order;
              
              const now = new Date().toISOString();
              return {
                ...order,
                distributorId: newDistributorId,
                status: ORDER_STATUS.PENDING,
                isEscalated: false,
                escalationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                updatedAt: now,
                timeline: [
                  ...order.timeline,
                  { 
                    status: 'reassigned', 
                    timestamp: now, 
                    note: `Reassigned to new distributor. ${note}` 
                  }
                ]
              };
            })
          }));
          
          useSyncStore.getState().notifyStateChange('orders', { 
            action: 'reassigned', 
            orderId 
          });
        },
        
        // Add communication log
        addCommunication: (orderId, communication) => {
          set((state) => ({
            orders: state.orders.map(order => {
              if (order.id !== orderId) return order;
              
              return {
                ...order,
                communications: [
                  ...order.communications,
                  {
                    id: uuidv4(),
                    ...communication,
                    timestamp: new Date().toISOString()
                  }
                ]
              };
            })
          }));
        },
        
        // Upload payment proof
        uploadPaymentProof: (orderId, proofData) => {
          set((state) => ({
            orders: state.orders.map(order => {
              if (order.id !== orderId) return order;
              
              return {
                ...order,
                paymentProof: proofData,
                updatedAt: new Date().toISOString()
              };
            })
          }));
          
          useSyncStore.getState().notifyStateChange('orders', { 
            action: 'paymentProof', 
            orderId 
          });
        },
        
        // Get escalated orders
        getEscalatedOrders: () => {
          return get().orders.filter(o => o.isEscalated);
        },
        
        // Get orders by status
        getOrdersByStatus: (status) => {
          return get().orders.filter(o => o.status === status);
        },
        
        // Get orders statistics
        getOrderStats: () => {
          const orders = get().orders;
          
          return {
            total: orders.length,
            pending: orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
            acknowledged: orders.filter(o => o.status === ORDER_STATUS.ACKNOWLEDGED).length,
            processing: orders.filter(o => o.status === ORDER_STATUS.PROCESSING).length,
            dispatched: orders.filter(o => o.status === ORDER_STATUS.DISPATCHED).length,
            delivered: orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length,
            escalated: orders.filter(o => o.isEscalated).length,
            cancelled: orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length
          };
        },
        
        // Get recent orders
        getRecentOrders: (limit = 10) => {
          return [...get().orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
        }
      }),
      {
        name: 'astrobsm-orders'
      }
    )
  )
);
