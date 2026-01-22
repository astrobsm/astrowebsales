import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Cloud, CloudOff, Loader2, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { useContentStore } from '../../store/contentStore';
import { useProductStore } from '../../store/productStore';
import { useSyncStore } from '../../store/syncStore';
import toast from 'react-hot-toast';

// Sync interval in milliseconds (5 minutes)
const SYNC_INTERVAL = 5 * 60 * 1000;

// Debounce delay for auto-push (2 seconds after last change)
const PUSH_DEBOUNCE = 2000;

// Global sync status indicator that shows in the corner of the screen
const SyncStatusIndicator = () => {
  const { isSyncing, isServerSynced, lastSyncTime } = useContentStore();
  const { isConnected } = useSyncStore();
  const [showDetails, setShowDetails] = useState(false);
  
  const getStatusColor = () => {
    if (isSyncing) return 'bg-blue-500';
    if (!isConnected) return 'bg-yellow-500';
    if (isServerSynced) return 'bg-green-500';
    return 'bg-gray-500';
  };
  
  const getStatusIcon = () => {
    if (isSyncing) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (!isConnected) return <CloudOff className="w-4 h-4" />;
    if (isServerSynced) return <Check className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };
  
  const getStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (!isConnected) return 'Offline';
    if (isServerSynced) return 'Synced';
    return 'Not synced';
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-medium shadow-lg cursor-pointer transition-all ${getStatusColor()}`}>
        {getStatusIcon()}
        {showDetails && (
          <span className="animate-fadeIn">
            {getStatusText()}
            {lastSyncTime && isServerSynced && (
              <span className="ml-1 opacity-75">
                ({new Date(lastSyncTime).toLocaleTimeString()})
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

// Auto-sync manager hook - handles automatic pulling and pushing
export const useAutoSync = () => {
  const { 
    fetchContentFromServer, 
    uploadContentToServer, 
    clinicalApps, 
    training, 
    offices, 
    downloads,
    isSyncing 
  } = useContentStore();
  
  const { 
    products, 
    fetchProducts, 
    uploadAllProducts 
  } = useProductStore();
  
  const { isConnected, checkServerStatus } = useSyncStore();
  
  // Track previous values to detect changes
  const prevContentRef = useRef({ clinicalApps, training, offices, downloads });
  const prevProductsRef = useRef(products);
  const syncTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const isInitialLoad = useRef(true);
  const isSyncingRef = useRef(false);

  // Pull data from server
  const pullFromServer = useCallback(async (showToast = false) => {
    if (isSyncingRef.current) return;
    
    console.log('🔄 Auto-sync: Pulling data from server...');
    
    try {
      // Check server status first
      await checkServerStatus();
      
      // Fetch content
      const contentSuccess = await fetchContentFromServer();
      
      // Fetch products
      const serverProducts = await fetchProducts();
      
      if (contentSuccess) {
        console.log('✅ Auto-sync: Content loaded from server');
      }
      
      if (serverProducts && serverProducts.length > 0) {
        console.log(`✅ Auto-sync: ${serverProducts.length} products loaded from server`);
      }
      
      // Update refs to prevent immediate push-back
      prevContentRef.current = { 
        clinicalApps: useContentStore.getState().clinicalApps, 
        training: useContentStore.getState().training, 
        offices: useContentStore.getState().offices, 
        downloads: useContentStore.getState().downloads 
      };
      prevProductsRef.current = useProductStore.getState().products;
      
      if (showToast) {
        toast.success('Data synced from server', { duration: 2000 });
      }
      
    } catch (error) {
      console.error('❌ Auto-sync: Failed to pull data:', error);
    }
  }, [checkServerStatus, fetchContentFromServer, fetchProducts]);

  // Push data to server
  const pushToServer = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    try {
      console.log('📤 Auto-sync: Pushing content to server...');
      await uploadContentToServer();
      console.log('✅ Auto-sync: Content pushed to server');
      
      // Update ref after successful push
      prevContentRef.current = { 
        clinicalApps: useContentStore.getState().clinicalApps, 
        training: useContentStore.getState().training, 
        offices: useContentStore.getState().offices, 
        downloads: useContentStore.getState().downloads 
      };
    } catch (error) {
      console.error('❌ Auto-sync: Failed to push content:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [uploadContentToServer]);

  // Auto-pull on app load
  useEffect(() => {
    const init = async () => {
      await pullFromServer();
      isInitialLoad.current = false;
    };
    
    init();
  }, [pullFromServer]);

  // Periodic sync every 5 minutes
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isInitialLoad.current) {
        console.log('⏰ Auto-sync: Periodic sync triggered');
        pullFromServer();
      }
    }, SYNC_INTERVAL);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pullFromServer]);

  // Sync when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isInitialLoad.current) {
        console.log('👁️ Auto-sync: Tab became visible, syncing...');
        pullFromServer();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pullFromServer]);

  // Auto-push when content changes
  useEffect(() => {
    // Skip if initial load or already syncing
    if (isInitialLoad.current || isSyncingRef.current) return;
    
    const prev = prevContentRef.current;
    const hasChanges = 
      JSON.stringify(prev.clinicalApps) !== JSON.stringify(clinicalApps) ||
      JSON.stringify(prev.training) !== JSON.stringify(training) ||
      JSON.stringify(prev.offices) !== JSON.stringify(offices) ||
      JSON.stringify(prev.downloads) !== JSON.stringify(downloads);
    
    if (hasChanges) {
      console.log('📤 Auto-sync: Content changed, scheduling push...');
      
      // Debounce the push to avoid too many requests
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      syncTimeoutRef.current = setTimeout(() => {
        pushToServer();
      }, PUSH_DEBOUNCE);
    }
  }, [clinicalApps, training, offices, downloads, pushToServer]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    isSyncing,
    pullFromServer,
    pushToServer
  };
};

// Wrapper component that provides auto-sync functionality
export const AutoSyncProvider = ({ children }) => {
  useAutoSync();
  
  return (
    <>
      {children}
      <SyncStatusIndicator />
    </>
  );
};

export default SyncStatusIndicator;
