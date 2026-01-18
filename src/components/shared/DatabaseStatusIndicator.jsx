import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, RefreshCw, Server, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSyncStore } from '../../store/syncStore';

const DatabaseStatusIndicator = ({ expanded = false }) => {
  const { checkServerStatus, getSyncStatus, isConnected, serverStatus, databaseStatus, connectedDevices, lastSyncTime } = useSyncStore();
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const refreshStatus = async () => {
    setIsChecking(true);
    await checkServerStatus();
    setLastChecked(Date.now());
    setIsChecking(false);
  };

  useEffect(() => {
    refreshStatus();
    // Check status every 30 seconds
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'text-green-500';
      case 'offline':
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'offline':
      case 'disconnected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  // Compact view for header
  if (!expanded) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          databaseStatus === 'connected' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          <Database size={12} />
          <span>{databaseStatus === 'connected' ? 'DB Connected' : 'DB Offline'}</span>
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isConnected 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isConnected ? `${connectedDevices} Online` : 'Offline'}</span>
        </div>
      </div>
    );
  }

  // Expanded view for dashboard
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Server size={20} className="text-primary-600" />
          System Status
        </h3>
        <button
          onClick={refreshStatus}
          disabled={isChecking}
          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
          title="Refresh Status"
        >
          <RefreshCw size={18} className={isChecking ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Server Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Server size={20} className="text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">API Server</p>
              <p className="text-xs text-gray-500">Backend services</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(serverStatus)}
            <span className={`text-sm font-medium ${getStatusColor(serverStatus)}`}>
              {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Checking...'}
            </span>
          </div>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">PostgreSQL Database</p>
              <p className="text-xs text-gray-500">DigitalOcean Managed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(databaseStatus)}
            <span className={`text-sm font-medium ${getStatusColor(databaseStatus)}`}>
              {databaseStatus === 'connected' ? 'Connected' : databaseStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>
        </div>

        {/* Real-time Sync Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isConnected ? <Wifi size={20} className="text-blue-600" /> : <WifiOff size={20} className="text-gray-400" />}
            <div>
              <p className="font-medium text-gray-900">Real-time Sync</p>
              <p className="text-xs text-gray-500">Cross-device synchronization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <XCircle size={16} className="text-red-500" />
            )}
            <span className={`text-sm font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Connected Devices */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Connected Devices</p>
              <p className="text-xs text-gray-500">Active sync sessions</p>
            </div>
          </div>
          <span className="text-lg font-bold text-primary-600">{connectedDevices}</span>
        </div>

        {/* Last Sync Time */}
        {lastSyncTime && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Last Sync</p>
                <p className="text-xs text-gray-500">Most recent synchronization</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">
              {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Status Footer */}
      {lastChecked && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          Last checked: {new Date(lastChecked).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default DatabaseStatusIndicator;
