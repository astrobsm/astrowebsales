import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Cloud, CloudOff, Loader2, Check, RefreshCw, AlertTriangle, Users, Package, Settings, FileText } from 'lucide-react';
import { useContentStore } from '../../store/contentStore';
import { useProductStore } from '../../store/productStore';
import { useStaffStore } from '../../store/staffStore';
import { useSyncStore } from '../../store/syncStore';
import { useDistributorStore } from '../../store/distributorStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useOrderStore } from '../../store/orderStore';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// Sync interval in milliseconds (2 minutes for more responsive sync)
const SYNC_INTERVAL = 2 * 60 * 1000;

// Debounce delay for auto-push (1.5 seconds after last change)
const PUSH_DEBOUNCE = 1500;

// WebSocket connection
let socket = null;

// Get API base URL
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // In production, use the same host
    if (window.location.hostname !== 'localhost') {
      return `${window.location.protocol}//${window.location.host}`;
    }
  }
  return 'http://localhost:5000';
};

// Initialize WebSocket connection
const initWebSocket = (onStateUpdate) => {
  if (socket?.connected) return socket;
  
  const wsUrl = getApiUrl().replace('http', 'ws');
  socket = io(wsUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  });
  
  socket.on('connect', () => {
    console.log('🔌 WebSocket connected for real-time sync');
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 WebSocket disconnected');
  });
  
  socket.on('state-update', (data) => {
    console.log('📡 Received real-time update:', data);
    if (onStateUpdate) {
      onStateUpdate(data);
    }
  });
  
  return socket;
};

// Global sync status indicator that shows in the corner of the screen
const SyncStatusIndicator = ({ syncDetails }) => {
  const { isSyncing } = useContentStore();
  const { isConnected } = useSyncStore();
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Update last sync time when sync completes
  useEffect(() => {
    if (syncDetails?.lastSync) {
      setLastSyncTime(syncDetails.lastSync);
    }
  }, [syncDetails]);
  
  const getStatusColor = () => {
    if (isSyncing || syncDetails?.isSyncing) return 'bg-blue-500';
    if (!isConnected) return 'bg-yellow-500';
    if (syncDetails?.isFullySynced) return 'bg-green-500';
    return 'bg-gray-500';
  };
  
  const getStatusIcon = () => {
    if (isSyncing || syncDetails?.isSyncing) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (!isConnected) return <CloudOff className="w-4 h-4" />;
    if (syncDetails?.isFullySynced) return <Check className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };
  
  const getStatusText = () => {
    if (isSyncing || syncDetails?.isSyncing) return 'Syncing all data...';
    if (!isConnected) return 'Offline';
    if (syncDetails?.isFullySynced) return 'All synced';
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
          <div className="animate-fadeIn flex flex-col">
            <span>{getStatusText()}</span>
            {lastSyncTime && (
              <span className="text-xs opacity-75">
                Last: {new Date(lastSyncTime).toLocaleTimeString()}
              </span>
            )}
            {syncDetails && (
              <div className="text-xs mt-1 space-y-0.5">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> 
                  <span>{syncDetails.staffCount || 0} staff, {syncDetails.partnersCount || 0} partners</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>{syncDetails.productsCount || 0} products</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Auto-sync manager hook - handles automatic pulling and pushing for ALL stores
export const useAutoSync = () => {
  // Content Store
  const { 
    fetchContentFromServer, 
    uploadContentToServer, 
    clinicalApps, 
    training, 
    offices, 
    downloads,
    setClinicalApps,
    setTraining,
    setOffices,
    setDownloads,
    isSyncing: contentSyncing 
  } = useContentStore();
  
  // Product Store
  const { 
    products, 
    fetchProducts,
    setProducts
  } = useProductStore();

  // Staff Store
  const {
    staff,
    partners,
    setStaff,
    setPartners
  } = useStaffStore();

  // Distributor Store
  const {
    distributors,
    setDistributors
  } = useDistributorStore();

  // Feedback Store
  const {
    feedbacks,
    setFeedbacks
  } = useFeedbackStore();

  // Settings Store
  const settingsStore = useSettingsStore();
  
  // Sync Store
  const { isConnected, checkServerStatus } = useSyncStore();
  
  // Sync state
  const [syncDetails, setSyncDetails] = useState({
    isSyncing: false,
    isFullySynced: false,
    lastSync: null,
    staffCount: 0,
    partnersCount: 0,
    productsCount: 0
  });
  
  // Track previous values to detect changes
  const prevDataRef = useRef({
    clinicalApps, training, offices, downloads,
    products, staff, partners, distributors, feedbacks
  });
  const syncTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const isInitialLoad = useRef(true);
  const isSyncingRef = useRef(false);

  // Handle real-time state updates from WebSocket
  const handleStateUpdate = useCallback((data) => {
    console.log('📡 Processing real-time update:', data.store);
    
    // Trigger a full sync when we receive updates from other devices
    if (data.action === 'full-sync-completed' || data.store === 'sync') {
      console.log('🔄 Full sync triggered by another device');
      pullFromServer(false);
    }
    
    // Individual store updates
    switch (data.store) {
      case 'staff':
        console.log('👥 Staff update received');
        pullFromServer(false);
        break;
      case 'partners':
        console.log('🤝 Partners update received');
        pullFromServer(false);
        break;
      case 'distributors':
        console.log('🏢 Distributors update received');
        pullFromServer(false);
        break;
      case 'products':
        console.log('📦 Products update received');
        pullFromServer(false);
        break;
      case 'feedback':
        console.log('💬 Feedback update received');
        pullFromServer(false);
        break;
      case 'settings':
        console.log('⚙️ Settings update received');
        pullFromServer(false);
        break;
      case 'content':
        console.log('📄 Content update received');
        pullFromServer(false);
        break;
      default:
        break;
    }
  }, []);

  // Pull ALL data from server using full sync API
  const pullFromServer = useCallback(async (showToast = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    setSyncDetails(prev => ({ ...prev, isSyncing: true }));
    console.log('🔄 Auto-sync: Pulling ALL data from server...');
    
    try {
      // Check server status first
      await checkServerStatus();
      
      // Fetch all data via full sync endpoint
      const response = await fetch(`${getApiUrl()}/api/sync/full`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📥 Full sync data received:', {
        staff: data.staff?.length || 0,
        partners: data.partners?.length || 0,
        distributors: data.distributors?.length || 0,
        products: data.products?.length || 0,
        feedback: data.feedback?.length || 0
      });
      
      // Update Staff Store
      if (data.staff && data.staff.length > 0) {
        const staffStore = useStaffStore.getState();
        staffStore.setStaff(data.staff);
        console.log(`✅ Synced ${data.staff.length} staff members`);
      }
      
      // Update Partners (stored in staffStore)
      if (data.partners && data.partners.length > 0) {
        const staffStore = useStaffStore.getState();
        staffStore.setPartners(data.partners);
        console.log(`✅ Synced ${data.partners.length} partners`);
      }
      
      // Update Distributors Store
      if (data.distributors && data.distributors.length > 0) {
        const distStore = useDistributorStore.getState();
        if (distStore.setDistributors) {
          distStore.setDistributors(data.distributors);
        }
        console.log(`✅ Synced ${data.distributors.length} distributors`);
      }
      
      // Update Products Store
      if (data.products && data.products.length > 0) {
        const prodStore = useProductStore.getState();
        prodStore.setProducts(data.products);
        console.log(`✅ Synced ${data.products.length} products`);
      }
      
      // Update Feedback Store
      if (data.feedback && data.feedback.length > 0) {
        const fbStore = useFeedbackStore.getState();
        if (fbStore.setFeedbacks) {
          fbStore.setFeedbacks(data.feedback);
        }
        console.log(`✅ Synced ${data.feedback.length} feedback items`);
      }
      
      // Update Settings Store
      if (data.settings) {
        const setStore = useSettingsStore.getState();
        if (data.settings.companyInfo && setStore.setCompanyInfo) {
          setStore.setCompanyInfo(data.settings.companyInfo);
        }
        if (data.settings.appearance && setStore.setAppearance) {
          setStore.setAppearance(data.settings.appearance);
        }
        if (data.settings.slideshow && setStore.updateSlideshow) {
          setStore.updateSlideshow(data.settings.slideshow);
        }
        console.log('✅ Synced settings');
      }
      
      // Update Content Store
      if (data.content) {
        const contStore = useContentStore.getState();
        if (data.content.clinicalApps && contStore.setClinicalApps) {
          contStore.setClinicalApps(data.content.clinicalApps);
        }
        if (data.content.training && contStore.setTraining) {
          contStore.setTraining(data.content.training);
        }
        if (data.content.offices && contStore.setOffices) {
          contStore.setOffices(data.content.offices);
        }
        if (data.content.downloads && contStore.setDownloads) {
          contStore.setDownloads(data.content.downloads);
        }
        console.log('✅ Synced content');
      }
      
      // Update sync status
      const newSyncDetails = {
        isSyncing: false,
        isFullySynced: true,
        lastSync: data.lastSync || new Date().toISOString(),
        staffCount: data.staff?.length || 0,
        partnersCount: data.partners?.length || 0,
        productsCount: data.products?.length || 0
      };
      setSyncDetails(newSyncDetails);
      
      // Update prev refs to prevent immediate push-back
      prevDataRef.current = {
        clinicalApps: data.content?.clinicalApps || [],
        training: data.content?.training || [],
        offices: data.content?.offices || [],
        downloads: data.content?.downloads || [],
        products: data.products || [],
        staff: data.staff || [],
        partners: data.partners || [],
        distributors: data.distributors || [],
        feedbacks: data.feedback || []
      };
      
      if (showToast) {
        toast.success('All data synced from server', { duration: 2000 });
      }
      
      console.log('✅ Full sync completed successfully');
      
    } catch (error) {
      console.error('❌ Auto-sync: Failed to pull data:', error);
      setSyncDetails(prev => ({ ...prev, isSyncing: false, isFullySynced: false }));
      
      if (showToast) {
        toast.error('Sync failed: ' + error.message, { duration: 3000 });
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [checkServerStatus]);

  // Push ALL data to server using full sync API
  const pushToServer = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    setSyncDetails(prev => ({ ...prev, isSyncing: true }));
    
    try {
      console.log('📤 Auto-sync: Pushing ALL data to server...');
      
      // Gather all data from stores
      const contentStore = useContentStore.getState();
      const staffStore = useStaffStore.getState();
      const distStore = useDistributorStore.getState();
      const fbStore = useFeedbackStore.getState();
      const setStore = useSettingsStore.getState();
      
      const payload = {
        staff: staffStore.staff || [],
        partners: staffStore.partners || [],
        distributors: distStore.distributors || [],
        feedback: fbStore.feedbacks || [],
        settings: {
          companyInfo: setStore.companyInfo || {},
          appearance: setStore.appearance || {},
          slideshow: setStore.slideshow || {},
          emailSettings: setStore.emailSettings || {},
          orderSettings: setStore.orderSettings || {}
        },
        content: {
          clinicalApps: contentStore.clinicalApps || [],
          training: contentStore.training || [],
          offices: contentStore.offices || [],
          downloads: contentStore.downloads || []
        }
      };
      
      console.log('📤 Pushing data:', {
        staff: payload.staff.length,
        partners: payload.partners.length,
        distributors: payload.distributors.length,
        feedback: payload.feedback.length
      });
      
      const response = await fetch(`${getApiUrl()}/api/sync/full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Auto-sync: All data pushed to server', result);
      
      // Update sync status
      setSyncDetails(prev => ({
        ...prev,
        isSyncing: false,
        isFullySynced: true,
        lastSync: result.timestamp || new Date().toISOString()
      }));
      
      // Update prev refs
      prevDataRef.current = {
        clinicalApps: contentStore.clinicalApps,
        training: contentStore.training,
        offices: contentStore.offices,
        downloads: contentStore.downloads,
        products: useProductStore.getState().products,
        staff: staffStore.staff,
        partners: staffStore.partners,
        distributors: distStore.distributors,
        feedbacks: fbStore.feedbacks
      };
      
    } catch (error) {
      console.error('❌ Auto-sync: Failed to push data:', error);
      setSyncDetails(prev => ({ ...prev, isSyncing: false }));
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Initialize WebSocket on mount
  useEffect(() => {
    initWebSocket(handleStateUpdate);
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [handleStateUpdate]);

  // Auto-pull on app load
  useEffect(() => {
    const init = async () => {
      await pullFromServer(true);
      isInitialLoad.current = false;
    };
    
    init();
  }, [pullFromServer]);

  // Periodic sync every 2 minutes
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

  // Auto-push when ANY data changes
  useEffect(() => {
    // Skip if initial load or already syncing
    if (isInitialLoad.current || isSyncingRef.current) return;
    
    const prev = prevDataRef.current;
    
    // Check for changes in any store
    const contentChanged = 
      JSON.stringify(prev.clinicalApps) !== JSON.stringify(clinicalApps) ||
      JSON.stringify(prev.training) !== JSON.stringify(training) ||
      JSON.stringify(prev.offices) !== JSON.stringify(offices) ||
      JSON.stringify(prev.downloads) !== JSON.stringify(downloads);
    
    const staffChanged = JSON.stringify(prev.staff) !== JSON.stringify(staff);
    const partnersChanged = JSON.stringify(prev.partners) !== JSON.stringify(partners);
    const distributorsChanged = JSON.stringify(prev.distributors) !== JSON.stringify(distributors);
    const feedbackChanged = JSON.stringify(prev.feedbacks) !== JSON.stringify(feedbacks);
    
    const hasChanges = contentChanged || staffChanged || partnersChanged || distributorsChanged || feedbackChanged;
    
    if (hasChanges) {
      console.log('📤 Auto-sync: Data changed, scheduling push...', {
        content: contentChanged,
        staff: staffChanged,
        partners: partnersChanged,
        distributors: distributorsChanged,
        feedback: feedbackChanged
      });
      
      // Debounce the push to avoid too many requests
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      
      syncTimeoutRef.current = setTimeout(() => {
        pushToServer();
      }, PUSH_DEBOUNCE);
    }
  }, [clinicalApps, training, offices, downloads, staff, partners, distributors, feedbacks, pushToServer]);

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
    isSyncing: syncDetails.isSyncing,
    syncDetails,
    pullFromServer,
    pushToServer
  };
};

// Wrapper component that provides auto-sync functionality
export const AutoSyncProvider = ({ children }) => {
  const { syncDetails } = useAutoSync();
  
  return (
    <>
      {children}
      <SyncStatusIndicator syncDetails={syncDetails} />
    </>
  );
};

export default SyncStatusIndicator;
