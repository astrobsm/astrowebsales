import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Bell, LogOut, User, Settings, ChevronDown,
  LayoutDashboard, Package, ShoppingCart, Users, FileText, 
  TrendingUp, Truck, AlertTriangle, MessageSquare, History,
  BarChart3, UserPlus, Building2, Shield, MessageCircle, BookOpen,
  Volume2, VolumeX, Play, Square, Gauge
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useFeedbackStore } from '../store/feedbackStore';
import { usePWAStore } from '../store/pwaStore';

const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();
  const { 
    voiceEnabled, 
    voiceVolume, 
    voiceRate, 
    setVoiceEnabled, 
    setVoiceVolume, 
    setVoiceRate,
    announce,
    stopAnnouncement 
  } = usePWAStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items per role
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/admin/analytics', icon: TrendingUp, label: 'Analytics' },
          { path: '/admin/staff', icon: UserPlus, label: 'Staff Management' },
          { path: '/admin/partners', icon: Building2, label: 'Partners' },
          { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
          { path: '/admin/products', icon: Package, label: 'Products' },
          { path: '/admin/distributors', icon: Truck, label: 'Distributors' },
          { path: '/admin/users', icon: Users, label: 'Users' },
          { path: '/admin/feedback', icon: MessageCircle, label: 'Feedback' },
          { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
          { path: '/admin/content', icon: BookOpen, label: 'Content Management' },
          { path: '/admin/access-settings', icon: Shield, label: 'Access Settings' },
          { path: '/admin/settings', icon: Settings, label: 'Settings' }
        ];
      case 'distributor':
        return [
          { path: '/distributor', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/distributor/orders', icon: ShoppingCart, label: 'Orders' },
          { path: '/distributor/inventory', icon: Package, label: 'Inventory' },
          { path: '/distributor/feedback', icon: MessageCircle, label: 'Feedback' },
          { path: '/distributor/history', icon: History, label: 'History' }
        ];
      case 'wholesaler':
        return [
          { path: '/wholesaler', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/wholesaler/orders', icon: ShoppingCart, label: 'Orders' },
          { path: '/wholesaler/feedback', icon: MessageCircle, label: 'Feedback' }
        ];
      case 'cco':
        return [
          { path: '/cco', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/cco/feedback', icon: MessageCircle, label: 'Feedback' },
          { path: '/cco/escalations', icon: AlertTriangle, label: 'Escalations' },
          { path: '/cco/communications', icon: MessageSquare, label: 'Communications' }
        ];
      case 'marketer':
        return [
          { path: '/marketer', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/marketer/leads', icon: Users, label: 'Leads' },
          { path: '/marketer/feedback', icon: MessageCircle, label: 'Feedback' },
          { path: '/marketer/reports', icon: BarChart3, label: 'Reports' }
        ];
      case 'sales':
        return [
          { path: '/sales', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/sales/orders', icon: ShoppingCart, label: 'Orders' },
          { path: '/sales/customers', icon: Users, label: 'Customers' },
          { path: '/sales/products', icon: Package, label: 'Products' },
          { path: '/sales/feedback', icon: MessageCircle, label: 'Feedback' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'distributor': return 'Distributor';
      case 'wholesaler': return 'Wholesaler';
      case 'cco': return 'Customer Care';
      case 'marketer': return 'Marketer';
      case 'sales': return 'Sales Staff';
      default: return 'User';
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'distributor': return 'bg-blue-100 text-blue-800';
      case 'wholesaler': return 'bg-green-100 text-green-800';
      case 'cco': return 'bg-orange-100 text-orange-800';
      case 'marketer': return 'bg-cyan-100 text-cyan-800';
      case 'sales': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b flex-shrink-0">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Bonnesante Medicals" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="font-display font-bold text-lg text-primary-800">
                ASTROBSM
              </h1>
              <p className="text-xs text-gray-500">Sales Platform</p>
            </div>
          </Link>
          <button 
            className="lg:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
            {getRoleLabel()}
          </span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Bar */}
        <header className="h-20 bg-white shadow-sm sticky top-0 z-40">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden text-gray-600"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Voice Announcements Toggle */}
              <div className="relative">
                <button
                  className={`relative p-2 rounded-lg transition-colors ${
                    voiceEnabled 
                      ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setVoiceSettingsOpen(!voiceSettingsOpen)}
                  title={voiceEnabled ? 'Voice Announcements ON' : 'Voice Announcements OFF'}
                >
                  {voiceEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
                  {voiceEnabled && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* Voice Settings Dropdown */}
                {voiceSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border py-4 z-50">
                    <div className="flex items-center justify-between px-4 pb-3 border-b">
                      <h3 className="font-semibold text-gray-800">Voice Announcements</h3>
                      <button
                        onClick={() => setVoiceSettingsOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {/* Enable/Disable Toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Enable Announcements</span>
                        <button
                          onClick={() => setVoiceEnabled(!voiceEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            voiceEnabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                              voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Volume Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Volume</span>
                          <span className="text-xs text-gray-500">{Math.round(voiceVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={voiceVolume}
                          onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                      </div>

                      {/* Speed Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Speed</span>
                          <span className="text-xs text-gray-500">{voiceRate.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={voiceRate}
                          onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                        />
                      </div>

                      {/* Test Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => announce('This is a test announcement from Bonnesante Medicals. Voice announcements are working correctly.')}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                          <Play size={16} />
                          Test Voice
                        </button>
                        <button
                          onClick={() => stopAnnouncement()}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                          <Square size={16} />
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 pt-2 border-t">
                        Voice announcements notify staff when new orders are placed.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                      <button 
                        className="text-sm text-primary-600 hover:text-primary-700"
                        onClick={markAllAsRead}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 border-b last:border-0 ${!notification.read ? 'bg-primary-50' : ''}`}
                        >
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="px-4 py-6 text-center text-gray-500">
                          No notifications
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <Link
                      to="#"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="#"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
