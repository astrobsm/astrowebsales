import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Cloud, CloudOff, Database, Smartphone, CheckCircle, 
  XCircle, AlertTriangle, Upload, Download, Trash2, Server, 
  Wifi, WifiOff, Clock, ArrowUpCircle, ArrowDownCircle, Loader2,
  Package, FileText, GraduationCap, Building2, FolderDown, Stethoscope
} from 'lucide-react';
import { useContentStore } from '../../store/contentStore';
import { useProductStore } from '../../store/productStore';
import { useSeminarStore } from '../../store/seminarStore';
import { statusApi, contentApi, productsApi } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDataSync = () => {
  const [serverStatus, setServerStatus] = useState({ server: 'checking', database: 'checking' });
  const [syncStatus, setSyncStatus] = useState({
    clinicalApps: { local: 0, server: null, synced: false, loading: false },
    training: { local: 0, server: null, synced: false, loading: false },
    offices: { local: 0, server: null, synced: false, loading: false },
    downloads: { local: 0, server: null, synced: false, loading: false },
    products: { local: 0, server: null, synced: false, loading: false },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  
  // Store hooks
  const { 
    clinicalApps, training, offices, downloads,
    fetchContentFromServer, uploadContentToServer,
    lastSyncTime, isServerSynced, isSyncing
  } = useContentStore();
  
  const { products, fetchProducts, uploadAllProducts, refreshFromServer } = useProductStore();

  // Check server status on mount
  useEffect(() => {
    checkServerStatus();
    updateLocalCounts();
    fetchServerCounts();
  }, []);

  // Update local counts when data changes
  useEffect(() => {
    updateLocalCounts();
  }, [clinicalApps, training, offices, downloads, products]);

  const updateLocalCounts = () => {
    setSyncStatus(prev => ({
      ...prev,
      clinicalApps: { ...prev.clinicalApps, local: clinicalApps?.length || 0 },
      training: { ...prev.training, local: training?.length || 0 },
      offices: { ...prev.offices, local: offices?.length || 0 },
      downloads: { ...prev.downloads, local: downloads?.length || 0 },
      products: { ...prev.products, local: products?.length || 0 },
    }));
  };

  const checkServerStatus = async () => {
    try {
      const status = await statusApi.getStatus();
      setServerStatus(status);
    } catch (error) {
      setServerStatus({ server: 'offline', database: 'disconnected' });
    }
  };

  const fetchServerCounts = async () => {
    try {
      // Fetch all content from server to compare counts
      const serverContent = await contentApi.syncAll();
      const serverProducts = await productsApi.getAll().catch(() => []);
      
      setSyncStatus(prev => ({
        clinicalApps: { 
          ...prev.clinicalApps, 
          server: serverContent?.clinicalApps?.length || 0,
          synced: prev.clinicalApps.local === (serverContent?.clinicalApps?.length || 0)
        },
        training: { 
          ...prev.training, 
          server: serverContent?.training?.length || 0,
          synced: prev.training.local === (serverContent?.training?.length || 0)
        },
        offices: { 
          ...prev.offices, 
          server: serverContent?.offices?.length || 0,
          synced: prev.offices.local === (serverContent?.offices?.length || 0)
        },
        downloads: { 
          ...prev.downloads, 
          server: serverContent?.downloads?.length || 0,
          synced: prev.downloads.local === (serverContent?.downloads?.length || 0)
        },
        products: { 
          ...prev.products, 
          server: serverProducts?.length || 0,
          synced: prev.products.local === (serverProducts?.length || 0)
        },
      }));
      
      setLastSync(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch server counts:', error);
      toast.error('Failed to check server data');
    }
  };

  // Pull data from server to local
  const pullFromServer = async () => {
    setIsLoading(true);
    try {
      const contentSuccess = await fetchContentFromServer();
      const productResult = await refreshFromServer();
      
      if (contentSuccess || productResult.success) {
        toast.success(`Data pulled successfully! ${productResult.count || 0} products loaded.`);
        await fetchServerCounts();
      } else {
        toast.error('Server has no data or sync failed');
      }
    } catch (error) {
      toast.error('Failed to pull data from server');
    } finally {
      setIsLoading(false);
    }
  };

  // Push local data to server
  const pushToServer = async () => {
    setIsLoading(true);
    try {
      // Push content
      const contentSuccess = await uploadContentToServer();
      
      // Push products
      const productResult = await uploadAllProducts();
      
      toast.success(`Data pushed! Content synced. Products: ${productResult.success} success, ${productResult.failed} failed.`);
      await fetchServerCounts();
    } catch (error) {
      toast.error('Failed to push data to server');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize database tables
  const initializeDatabase = async () => {
    setIsLoading(true);
    try {
      await statusApi.initDatabase();
      toast.success('Database tables initialized!');
      await checkServerStatus();
      await fetchServerCounts();
    } catch (error) {
      toast.error('Failed to initialize database');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear local storage
  const clearLocalStorage = () => {
    if (window.confirm('This will clear ALL local data. Are you sure?')) {
      localStorage.clear();
      toast.success('Local storage cleared. Page will reload.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Force full sync - push all local data to server
  const forceFullSync = async () => {
    if (!window.confirm('This will overwrite ALL server data with your local data. Continue?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Push all content
      await uploadContentToServer();
      
      // Push all products
      const productResult = await uploadAllProducts();
      
      toast.success(`Full sync completed! Products: ${productResult.success} synced.`);
      await fetchServerCounts();
    } catch (error) {
      toast.error('Failed to complete full sync');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getSyncIcon = (synced, local, server) => {
    if (server === null) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    if (local === server) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (local > server) return <ArrowUpCircle className="w-5 h-5 text-blue-500" />;
    return <ArrowDownCircle className="w-5 h-5 text-orange-500" />;
  };

  const dataTypes = [
    { key: 'clinicalApps', name: 'Clinical Apps', icon: Stethoscope, color: 'text-blue-600' },
    { key: 'training', name: 'Training Courses', icon: GraduationCap, color: 'text-purple-600' },
    { key: 'offices', name: 'Offices', icon: Building2, color: 'text-green-600' },
    { key: 'downloads', name: 'Downloads', icon: FolderDown, color: 'text-orange-600' },
    { key: 'products', name: 'Products', icon: Package, color: 'text-pink-600' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Synchronization</h1>
          <p className="text-gray-600">Manage data sync between devices and server database</p>
        </div>
        <button
          onClick={checkServerStatus}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Server Status Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          Server Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Server Connection */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            {serverStatus.server === 'online' ? (
              <Wifi className="w-8 h-8 text-green-500" />
            ) : (
              <WifiOff className="w-8 h-8 text-red-500" />
            )}
            <div>
              <p className="text-sm text-gray-500">Server</p>
              <p className="font-semibold capitalize">{serverStatus.server}</p>
            </div>
            {getStatusIcon(serverStatus.server)}
          </div>

          {/* Database Connection */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            {serverStatus.database === 'connected' ? (
              <Database className="w-8 h-8 text-green-500" />
            ) : (
              <CloudOff className="w-8 h-8 text-red-500" />
            )}
            <div>
              <p className="text-sm text-gray-500">Database</p>
              <p className="font-semibold capitalize">{serverStatus.database}</p>
            </div>
            {getStatusIcon(serverStatus.database)}
          </div>

          {/* Last Sync */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Last Sync Check</p>
              <p className="font-semibold">
                {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sync Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Data Sync Status
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Data Type</th>
                <th className="text-center py-3 px-4">Local (This Device)</th>
                <th className="text-center py-3 px-4">Server (Database)</th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {dataTypes.map(({ key, name, icon: Icon, color }) => (
                <tr key={key} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${color}`} />
                      <span className="font-medium">{name}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                      <Smartphone className="w-4 h-4" />
                      {syncStatus[key].local}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      <Database className="w-4 h-4" />
                      {syncStatus[key].server ?? '?'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {getSyncIcon(syncStatus[key].synced, syncStatus[key].local, syncStatus[key].server)}
                      <span className="text-sm">
                        {syncStatus[key].server === null && 'Unknown'}
                        {syncStatus[key].local === syncStatus[key].server && syncStatus[key].server !== null && 'Synced'}
                        {syncStatus[key].local > syncStatus[key].server && syncStatus[key].server !== null && 'Local has more'}
                        {syncStatus[key].local < syncStatus[key].server && syncStatus[key].server !== null && 'Server has more'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sync Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Status Legend:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" /> Synced
            </span>
            <span className="flex items-center gap-1">
              <ArrowUpCircle className="w-4 h-4 text-blue-500" /> Local has more (push to server)
            </span>
            <span className="flex items-center gap-1">
              <ArrowDownCircle className="w-4 h-4 text-orange-500" /> Server has more (pull to local)
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Unable to check
            </span>
          </div>
        </div>
      </div>

      {/* Sync Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Sync Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pull from Server */}
          <button
            onClick={pullFromServer}
            disabled={isLoading || serverStatus.database !== 'connected'}
            className="flex flex-col items-center gap-3 p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-10 h-10 text-blue-600" />
            <div className="text-center">
              <p className="font-semibold text-blue-800">Pull from Server</p>
              <p className="text-sm text-blue-600">Download server data to this device</p>
            </div>
          </button>

          {/* Push to Server */}
          <button
            onClick={pushToServer}
            disabled={isLoading || serverStatus.database !== 'connected'}
            className="flex flex-col items-center gap-3 p-6 bg-green-50 hover:bg-green-100 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-10 h-10 text-green-600" />
            <div className="text-center">
              <p className="font-semibold text-green-800">Push to Server</p>
              <p className="text-sm text-green-600">Upload local data to server</p>
            </div>
          </button>

          {/* Initialize Database */}
          <button
            onClick={initializeDatabase}
            disabled={isLoading}
            className="flex flex-col items-center gap-3 p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition disabled:opacity-50"
          >
            <Database className="w-10 h-10 text-purple-600" />
            <div className="text-center">
              <p className="font-semibold text-purple-800">Init Database</p>
              <p className="text-sm text-purple-600">Create database tables</p>
            </div>
          </button>

          {/* Force Full Sync */}
          <button
            onClick={forceFullSync}
            disabled={isLoading || serverStatus.database !== 'connected'}
            className="flex flex-col items-center gap-3 p-6 bg-orange-50 hover:bg-orange-100 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-10 h-10 text-orange-600" />
            <div className="text-center">
              <p className="font-semibold text-orange-800">Force Full Sync</p>
              <p className="text-sm text-orange-600">Overwrite server with local</p>
            </div>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={clearLocalStorage}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear Local Storage
          </button>
          <p className="text-sm text-red-600">
            This will remove all locally stored data on this device. Data will be re-fetched from server on reload.
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">📖 Sync Instructions</h2>
        
        <div className="space-y-4 text-sm text-blue-900">
          <div>
            <h3 className="font-semibold">First Time Setup (New Server):</h3>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Click "Init Database" to create tables</li>
              <li>On your PRIMARY device (with correct data), click "Push to Server"</li>
              <li>On all OTHER devices, clear local storage then reload</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-semibold">Sync Existing Data:</h3>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Check which device has the CORRECT data</li>
              <li>On that device, click "Push to Server" to upload</li>
              <li>On other devices, click "Pull from Server" to download</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-semibold">Device Shows Wrong Data:</h3>
            <ol className="list-decimal ml-5 mt-1 space-y-1">
              <li>Click "Clear Local Storage" (removes local data)</li>
              <li>Page will reload and fetch fresh data from server</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-lg font-semibold">Syncing data...</p>
            <p className="text-gray-500">Please wait</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataSync;
