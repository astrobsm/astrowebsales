import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Cross-device sync configuration
const SYNC_CHANNEL = 'astrobsm-sync';
const SYNC_STORAGE_KEY = 'astrobsm-sync-state';

// BroadcastChannel for cross-tab sync
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
        
        // Initialize sync
        initSync: () => {
          // Generate or retrieve device ID
          let deviceId = localStorage.getItem('astrobsm-device-id');
          if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem('astrobsm-device-id', deviceId);
          }
          
          set({ deviceId });
          
          // Setup BroadcastChannel for cross-tab sync
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
          
          console.log('Cross-device sync initialized for device:', deviceId);
        },
        
        // Cleanup sync listeners
        cleanup: () => {
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
          
          console.log('Received sync message:', data.type);
          
          switch (data.type) {
            case 'STATE_UPDATE':
              get().applySyncUpdate(data.payload);
              break;
            case 'REQUEST_SYNC':
              get().sendFullSync();
              break;
            case 'FULL_SYNC':
              get().applyFullSync(data.payload);
              break;
            default:
              console.log('Unknown sync message type:', data.type);
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
        
        // Broadcast sync message
        broadcastSync: (type, payload) => {
          const { deviceId } = get();
          const message = {
            type,
            payload,
            sourceDeviceId: deviceId,
            timestamp: Date.now()
          };
          
          // Broadcast via BroadcastChannel
          if (broadcastChannel) {
            broadcastChannel.postMessage(message);
          }
          
          // Also use localStorage for cross-browser sync
          localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(message));
          
          set({ lastSyncTime: Date.now() });
        },
        
        // Request sync from other devices/tabs
        requestSync: () => {
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
        },
        
        // Apply full sync
        applyFullSync: (payload) => {
          console.log('Applying full sync from another device');
          // This will merge state from other devices
        },
        
        // Collect all stores for full sync
        collectAllStores: () => {
          return {
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
