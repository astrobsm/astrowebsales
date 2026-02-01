// WebSocket Sync Service for real-time cross-device synchronization
import { io } from 'socket.io-client';

// WebSocket URL configuration
// Frontend is served from the same backend server, so use same-origin (empty string)
// This allows WebSocket to connect to the same server that serves the frontend
const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD === true;
const SOCKET_URL = isProduction ? '' : 'http://localhost:5000';

class SyncService {
  constructor() {
    this.socket = null;
    this.deviceId = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  connect(deviceId) {
    if (this.socket?.connected) {
      return Promise.resolve(true);
    }

    this.deviceId = deviceId;

    return new Promise((resolve, reject) => {
      // Set a timeout to prevent hanging
      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.warn('⏱️ WebSocket connection timeout - continuing without real-time sync');
          reject(new Error('WebSocket connection timeout'));
        }
      }, 15000);

      console.log(`🔄 Connecting to WebSocket server: ${SOCKET_URL || 'same-origin'}`);
      
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('🔌 WebSocket connected to:', SOCKET_URL || 'same-origin');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Register device with server
        this.socket.emit('register-device', deviceId);
        resolve(true);
      });

      this.socket.on('sync-connected', (data) => {
        console.log('✅ Sync connection established:', data);
        this.emit('connected', data);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('📴 WebSocket disconnected:', reason);
        this.isConnected = false;
        this.emit('disconnected', { reason });
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error.message);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to sync server'));
        }
      });

      // Handle incoming state updates from other devices
      this.socket.on('state-update', (data) => {
        console.log('📥 Received state update:', data.store, data.action);
        this.emit('state-update', data);
      });

      // Handle device join/leave notifications
      this.socket.on('device-joined', (data) => {
        console.log('📱 Device joined:', data.deviceId);
        this.emit('device-joined', data);
      });

      this.socket.on('device-left', (data) => {
        console.log('📴 Device left:', data.deviceId);
        this.emit('device-left', data);
      });

      // Handle full sync requests
      this.socket.on('provide-full-sync', (data) => {
        console.log('📤 Full sync requested by:', data.requestingDeviceId);
        this.emit('provide-full-sync', data);
      });

      this.socket.on('receive-full-sync', (state) => {
        console.log('📥 Received full sync');
        this.emit('receive-full-sync', state);
      });

      // Handle order notifications
      this.socket.on('order-notification', (orderData) => {
        console.log('📦 Order notification received:', orderData.orderNumber);
        this.emit('order-notification', orderData);
      });
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send state sync to other devices
  syncState(store, action, payload) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot sync: not connected');
      return false;
    }

    this.socket.emit('sync-state', {
      store,
      action,
      payload,
      deviceId: this.deviceId,
      timestamp: Date.now()
    });

    return true;
  }

  // Request full state sync from other devices
  requestFullSync() {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot request sync: not connected');
      return false;
    }

    this.socket.emit('request-full-sync', this.deviceId);
    return true;
  }

  // Send full state to requesting device
  sendFullSync(targetDeviceId, state) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot send sync: not connected');
      return false;
    }

    this.socket.emit('full-sync-response', {
      targetDeviceId,
      state
    });
    return true;
  }

  // Notify about new order
  notifyNewOrder(orderData) {
    if (!this.socket?.connected) {
      return false;
    }

    this.socket.emit('new-order', orderData);
    return true;
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      deviceId: this.deviceId,
      socketId: this.socket?.id || null
    };
  }
}

// Singleton instance
const syncService = new SyncService();

export default syncService;
