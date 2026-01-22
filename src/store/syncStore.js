import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import syncService from '../services/syncService';
import { statusApi } from '../services/api';

// Cross-device sync configuration
const SYNC_CHANNEL = 'astrobsm-sync';
const SYNC_STORAGE_KEY = 'astrobsm-sync-state';

// BroadcastChannel for cross-tab sync (fallback)
let broadcastChannel = null;

export const useSyncStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Sync state
        deviceId: null,
        lastSyncTime: null,
        syncEnabled: true,
        pendingSyncEvents: [],
        isConnected: false,
        connectionError: null,
        connectedDevices: 0,
        serverStatus: null,
        databaseStatus: null,
        
        // Initialize sync
        initSync: async () => {
          // Generate or retrieve device ID
          let deviceId = localStorage.getItem('astrobsm-device-id');
          if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('astrobsm-device-id', deviceId);
          }
          
          set({ deviceId });
          
          // Try to connect to WebSocket server for real cross-device sync
          try {
            await syncService.connect(deviceId);
            set({ isConnected: true, connectionError: null });
            
            // Setup WebSocket event listeners
            syncService.on('connected', (data) => {
              set({ 
                isConnected: true, 
                connectedDevices: data.connectedDevices,
                lastSyncTime: data.timestamp 
              });
            });
            
            syncService.on('disconnected', () => {
              set({ isConnected: false });
            });
            
            syncService.on('state-update', (data) => {
              get().handleSyncMessage(data);
            });
            
            syncService.on('device-joined', (data) => {
              set(state => ({ connectedDevices: state.connectedDevices + 1 }));
            });
            
            syncService.on('device-left', (data) => {
              set(state => ({ connectedDevices: Math.max(0, state.connectedDevices - 1) }));
            });
            
            syncService.on('provide-full-sync', (data) => {
              const stores = get().collectAllStores();
              syncService.sendFullSync(data.requestingDeviceId, stores);
            });
            
            syncService.on('receive-full-sync', (state) => {
              get().applyFullSync(state);
            });
            
            syncService.on('order-notification', (orderData) => {
              // Trigger any order notification handlers
              console.log('New order received:', orderData.orderNumber);
            });
            
          } catch (error) {
            console.warn('WebSocket connection failed, using local sync only:', error.message);
            set({ connectionError: error.message });
          }
          
          // Setup BroadcastChannel for cross-tab sync (always works locally)
          if (typeof BroadcastChannel !== 'undefined') {
            broadcastChannel = new BroadcastChannel(SYNC_CHANNEL);
            broadcastChannel.onmessage = (event) => {
              get().handleSyncMessage(event.data);
            };
          }
          
          // Setup storage event listener for cross-browser sync
          window.addEventListener('storage', get().handleStorageEvent);
          
          // Setup visibility change for sync on tab focus
          document.addEventListener('visibilitychange', get().handleVisibilityChange);
          
          // Check server status
          get().checkServerStatus();
          
          console.log('Cross-device sync initialized for device:', deviceId);
        },
        
        // Check server and database status
        checkServerStatus: async () => {
          try {
            const status = await statusApi.getStatus();
            set({ 
              serverStatus: status.server,
              databaseStatus: status.database,
              connectedDevices: status.connectedClients || 0
            });
            return status;
          } catch (error) {
            set({ 
              serverStatus: 'offline',
              databaseStatus: 'disconnected'
            });
            return null;
          }
        },
        
        // Cleanup sync listeners
        cleanup: () => {
          syncService.disconnect();
          if (broadcastChannel) {
            broadcastChannel.close();
          }
          window.removeEventListener('storage', get().handleStorageEvent);
          document.removeEventListener('visibilitychange', get().handleVisibilityChange);
        },
        
        // Handle incoming sync messages
        handleSyncMessage: (data) => {
          const { deviceId } = get();
          
          // Ignore messages from self
          if (data.sourceDeviceId === deviceId) return;
          
          const messageType = data.type || data.action;
          console.log('Received sync message:', messageType);
          
          switch (messageType) {
            case 'STATE_UPDATE':
              get().applySyncUpdate(data.payload || data);
              break;
            case 'REQUEST_SYNC':
              get().sendFullSync();
              break;
            case 'FULL_SYNC':
              get().applyFullSync(data.payload || data);
              break;
            default:
              // Handle WebSocket format
              if (data.store && data.action) {
                get().applySyncUpdate(data);
              } else {
                console.log('Unknown sync message type:', messageType);
              }
          }
        },
        
        // Handle storage events for cross-browser sync
        handleStorageEvent: (event) => {
          if (event.key === SYNC_STORAGE_KEY) {
            try {
              const data = JSON.parse(event.newValue);
              get().handleSyncMessage(data);
            } catch (e) {
              console.error('Error parsing sync data:', e);
            }
          }
        },
        
        // Handle visibility change for sync on tab focus
        handleVisibilityChange: () => {
          if (document.visibilityState === 'visible') {
            get().requestSync();
          }
        },
        
        // Broadcast sync message (local + WebSocket)
        broadcastSync: (type, payload) => {
          const { deviceId, isConnected } = get();
          const message = {
            type,
            payload,
            sourceDeviceId: deviceId,
            timestamp: Date.now()
          };
          
          // Broadcast via WebSocket for real cross-device sync
          if (isConnected && type === 'STATE_UPDATE') {
            syncService.syncState(payload.store, payload.changes?.action || 'update', payload);
          }
          
          // Broadcast via BroadcastChannel for cross-tab sync
          if (broadcastChannel) {
            broadcastChannel.postMessage(message);
          }
          
          // Also use localStorage for cross-browser sync
          localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(message));
          
          set({ lastSyncTime: Date.now() });
        },
        
        // Request sync from other devices/tabs
        requestSync: () => {
          const { isConnected } = get();
          
          // Request via WebSocket if connected
          if (isConnected) {
            syncService.requestFullSync();
          }
          
          // Also request via local channels
          get().broadcastSync('REQUEST_SYNC', {});
        },
        
        // Send full state to other devices
        sendFullSync: () => {
          const stores = get().collectAllStores();
          get().broadcastSync('FULL_SYNC', stores);
        },
        
        // Apply sync update
        applySyncUpdate: (payload) => {
          // This will be called by individual stores
          console.log('Applying sync update:', payload);
          // Emit event for stores to listen
          window.dispatchEvent(new CustomEvent('sync-update', { detail: payload }));
        },
        
        // Apply full sync
        applyFullSync: (payload) => {
          console.log('Applying full sync from another device');
          window.dispatchEvent(new CustomEvent('full-sync', { detail: payload }));
        },
        
        // Collect all stores for full sync
        collectAllStores: () => {
          // Collect relevant localStorage data
          const stores = {};
          const storeKeys = [
            'astrobsm-cart',
            'astrobsm-orders',
            'astrobsm-products',
            'astrobsm-auth',
            'content-storage'
          ];
          
          storeKeys.forEach(key => {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                stores[key] = JSON.parse(data);
              }
            } catch (e) {
              console.error(`Error collecting store ${key}:`, e);
            }
          });
          
          return {
            stores,
            timestamp: Date.now()
          };
        },
        
        // Notify other devices of state change
        notifyStateChange: (storeName, changes) => {
          get().broadcastSync('STATE_UPDATE', {
            store: storeName,
            changes,
            timestamp: Date.now()
          });
        },
        
        // Notify about new order (real-time)
        notifyNewOrder: (orderData) => {
          const { isConnected } = get();
          if (isConnected) {
            syncService.notifyNewOrder(orderData);
          }
        },
        
        // Get sync status for UI
        getSyncStatus: () => {
          const { isConnected, serverStatus, databaseStatus, connectedDevices, lastSyncTime } = get();
          return {
            isConnected,
            serverStatus,
            databaseStatus,
            connectedDevices,
            lastSyncTime
          };
        }
      }),
      {
        name: 'astrobsm-sync',
        partialize: (state) => ({
          deviceId: state.deviceId,
          lastSyncTime: state.lastSyncTime
        })
      }
    )
  )
);
