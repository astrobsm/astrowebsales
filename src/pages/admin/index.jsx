// Admin Pages
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, Download, Upload, X, Eye, FileText, Share2, Phone, Search, Filter, Settings, Save, RefreshCw, Image, Palette, Mail, Bell, Globe, Clock, Edit2, Trash2, Plus, UserPlus, Key, Shield, Building, MapPin, CheckCircle, AlertCircle, Video, GraduationCap, Play, Smartphone, ExternalLink, Star, Cloud, CloudOff } from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { useDistributorStore } from '../../store/distributorStore';
import { useStaffStore } from '../../store/staffStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useContentStore } from '../../store/contentStore';
import { downloadTemplate, parseCSV, validateData } from '../../components/shared/BulkUpload';
import DatabaseStatusIndicator from '../../components/shared/DatabaseStatusIndicator';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Main Admin Dashboard
const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { orders, getOrderStats, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();

  // Fetch fresh data from database on mount and set up refresh interval
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    
    // Refresh data every 30 seconds for real-time sync
    const interval = setInterval(() => {
      fetchOrders();
      fetchProducts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchOrders, fetchProducts]);

  const stats = getOrderStats();
  const recentOrders = orders.slice(0, 5);

  const dashboardStats = [
    { title: 'Total Orders', value: stats.total, icon: ShoppingCart, color: 'bg-blue-500', link: '/admin/orders' },
    { title: 'Products', value: products.length, icon: Package, color: 'bg-green-500', link: '/admin/products' },
    { title: 'Pending Orders', value: stats.pending, icon: AlertTriangle, color: 'bg-yellow-500', link: '/admin/orders' },
    { title: 'Escalations', value: stats.escalated, icon: TrendingUp, color: 'bg-red-500', link: '/admin/orders' }
  ];

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <DatabaseStatusIndicator />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* System Status Card */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Order #</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                      <td className="py-3 text-sm">{order.customerName}</td>
                      <td className="py-3">
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-medium">₦{(order.total || order.totalAmount || 0).toLocaleString()}</td>
                      <td className="py-3 text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* System Status Panel */}
        <div className="lg:col-span-1">
          <DatabaseStatusIndicator expanded={true} />
        </div>
      </div>
    </div>
  );
};

// AdminUsers
export const AdminUsers = () => {
  const { 
    staff = [], 
    partners = [],
    addStaff, 
    updateStaff, 
    deleteStaff,
    addPartner,
    updatePartner,
    deletePartner
  } = useStaffStore();
  
  const [activeTab, setActiveTab] = useState('distributors');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Get user list based on active tab
  const getUserList = () => {
    let list = [];
    if (activeTab === 'distributors') {
      list = (partners || []).filter(d => d.type === 'distributor');
    } else if (activeTab === 'wholesalers') {
      list = (partners || []).filter(d => d.type === 'wholesaler');
    } else if (activeTab === 'staff') {
      list = staff || [];
    }
    
    // Apply search
    if (searchTerm) {
      list = list.filter(u => 
        (u.name || u.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone || '').includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      list = list.filter(u => u.status === statusFilter);
    }
    
    // Apply role filter (staff only)
    if (activeTab === 'staff' && roleFilter !== 'all') {
      list = list.filter(u => u.role === roleFilter);
    }
    
    return list;
  };

  const handleSaveUser = (formData) => {
    if (activeTab === 'staff') {
      if (selectedUser) {
        updateStaff(selectedUser.id, formData);
        toast.success('Staff member updated');
      } else {
        addStaff({
          ...formData,
          id: `STF${Date.now()}`,
          createdAt: new Date().toISOString()
        });
        toast.success('Staff member added');
      }
    } else {
      if (selectedUser) {
        updatePartner(selectedUser.id, formData);
        toast.success('Partner updated');
      } else {
        addPartner({
          ...formData,
          id: `${activeTab === 'distributors' ? 'DST' : 'WHL'}${Date.now()}`,
          type: activeTab === 'distributors' ? 'distributor' : 'wholesaler',
          createdAt: new Date().toISOString()
        });
        toast.success('Partner added');
      }
    }
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user) => {
    if (!confirm(`Delete ${user.name || user.businessName}?`)) return;
    
    if (activeTab === 'staff') {
      deleteStaff(user.id);
      toast.success('Staff member deleted');
    } else {
      deletePartner(user.id);
      toast.success('Partner deleted');
    }
  };

  const handleResetPassword = (user) => {
    // Simulate password reset
    toast.success(`Password reset link sent to ${user.email}`);
  };

  const userList = getUserList();

  const tabs = [
    { id: 'distributors', label: 'Distributors', count: (partners || []).filter(d => d.type === 'distributor').length },
    { id: 'wholesalers', label: 'Wholesalers', count: (partners || []).filter(d => d.type === 'wholesaler').length },
    { id: 'staff', label: 'Staff', count: (staff || []).length }
  ];

  const staffRoles = ['marketer', 'sales', 'cco', 'manager', 'admin'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-gray-900">Users Management</h1>
        <button
          onClick={() => { setSelectedUser(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <UserPlus size={20} />
          Add {activeTab === 'staff' ? 'Staff' : 'Partner'}
        </button>
      </div>

      {/* User Type Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setStatusFilter('all'); setRoleFilter('all'); }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
        {activeTab === 'staff' && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Roles</option>
            {staffRoles.map(role => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{userList.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{userList.filter(u => u.status === 'active').length}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{userList.filter(u => u.status === 'pending').length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{userList.filter(u => u.status === 'suspended' || u.status === 'inactive').length}</p>
              <p className="text-sm text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                {activeTab === 'staff' ? (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role / Zone</th>
                ) : (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                userList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {(user.name || user.businessName || 'U')[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || user.businessName}</p>
                          <p className="text-xs text-gray-500">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      {activeTab === 'staff' ? (
                        <div>
                          <p className="text-sm font-medium capitalize">{user.role}</p>
                          <p className="text-xs text-gray-500">{user.zone}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm">{user.city}</p>
                          <p className="text-xs text-gray-500">{user.state}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => { setSelectedUser(user); setShowModal(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                          title="Reset Password"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-semibold mb-6">
              {selectedUser ? 'Edit' : 'Add'} {activeTab === 'staff' ? 'Staff Member' : 'Partner'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formEl = e.target;
              
              if (activeTab === 'staff') {
                handleSaveUser({
                  name: formEl.name.value,
                  email: formEl.email.value,
                  phone: formEl.phone.value,
                  role: formEl.role.value,
                  zone: formEl.zone.value,
                  status: formEl.status.value,
                  permissions: {
                    canManageOrders: formEl.canManageOrders?.checked,
                    canManageProducts: formEl.canManageProducts?.checked,
                    canManagePartners: formEl.canManagePartners?.checked,
                    canViewReports: formEl.canViewReports?.checked
                  }
                });
              } else {
                handleSaveUser({
                  businessName: formEl.businessName.value,
                  contactPerson: formEl.contactPerson.value,
                  email: formEl.email.value,
                  phone: formEl.phone.value,
                  address: formEl.address.value,
                  city: formEl.city.value,
                  state: formEl.state.value,
                  status: formEl.status.value,
                  discountPercentage: parseInt(formEl.discountPercentage.value) || 0,
                  creditLimit: parseInt(formEl.creditLimit.value) || 0
                });
              }
            }} className="space-y-4">
              {activeTab === 'staff' ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        name="name"
                        defaultValue={selectedUser?.name || ''}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        name="email"
                        type="email"
                        defaultValue={selectedUser?.email || ''}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        name="phone"
                        defaultValue={selectedUser?.phone || ''}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                      <select
                        name="role"
                        defaultValue={selectedUser?.role || 'sales'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        {staffRoles.map(role => (
                          <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                      <input
                        name="zone"
                        defaultValue={selectedUser?.zone || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., South East, North Central"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        name="status"
                        defaultValue={selectedUser?.status || 'active'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { name: 'canManageOrders', label: 'Can Manage Orders' },
                        { name: 'canManageProducts', label: 'Can Manage Products' },
                        { name: 'canManagePartners', label: 'Can Manage Partners' },
                        { name: 'canViewReports', label: 'Can View Reports' }
                      ].map(perm => (
                        <div key={perm.name} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name={perm.name}
                            defaultChecked={selectedUser?.permissions?.[perm.name]}
                            className="w-4 h-4 text-green-600"
                          />
                          <label className="text-sm text-gray-700">{perm.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                      <input
                        name="businessName"
                        defaultValue={selectedUser?.businessName || ''}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                      <input
                        name="contactPerson"
                        defaultValue={selectedUser?.contactPerson || ''}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        name="email"
                        type="email"
                        defaultValue={selectedUser?.email || ''}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        name="phone"
                        defaultValue={selectedUser?.phone || ''}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        name="address"
                        defaultValue={selectedUser?.address || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        name="city"
                        defaultValue={selectedUser?.city || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <select
                        name="state"
                        defaultValue={selectedUser?.state || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select State</option>
                        {['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        name="status"
                        defaultValue={selectedUser?.status || 'active'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending Approval</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                      <input
                        name="discountPercentage"
                        type="number"
                        min="0"
                        max="50"
                        defaultValue={selectedUser?.discountPercentage || 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₦)</label>
                      <input
                        name="creditLimit"
                        type="number"
                        min="0"
                        defaultValue={selectedUser?.creditLimit || 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSelectedUser(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {selectedUser ? 'Update' : 'Create'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// AdminProducts
export const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct, fetchProducts } = useProductStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch products from database on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = [
    { id: 'bandages', name: 'Bandages' },
    { id: 'gels', name: 'Wound Gels' },
    { id: 'gauze', name: 'Gauze & Dressings' },
    { id: 'solutions', name: 'Solutions' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'silicone', name: 'Silicone Products' },
    { id: 'instruments', name: 'Instruments & Tools' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    indications: '',
    category: 'bandages',
    sku: '',
    unit: 'Piece',
    unitsPerCarton: 1,
    distributorPrice: '',
    stock: '',
    minOrderQty: 1,
    isActive: true,
    isFeatured: false,
    image: null
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      indications: '',
      category: 'bandages',
      sku: '',
      unit: 'Piece',
      unitsPerCarton: 1,
      distributorPrice: '',
      stock: '',
      minOrderQty: 1,
      isActive: true,
      isFeatured: false,
      image: null
    });
    setImagePreview(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });
      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory && p.isActive !== false;
  });

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'bandages',
      sku: product.sku || '',
      unit: product.unit || 'Piece',
      unitsPerCarton: product.unitsPerCarton || 1,
      distributorPrice: product.prices?.distributor || '',
      stock: product.stock || 0,
      minOrderQty: product.minOrderQty || 1,
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
      indications: product.indications || '',
      image: product.image || null
    });
    setImagePreview(product.image || null);
    setShowEditModal(true);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    addProduct({
      ...formData,
      distributorPrice: Number(formData.distributorPrice),
      stock: Number(formData.stock),
      unitsPerCarton: Number(formData.unitsPerCarton),
      minOrderQty: Number(formData.minOrderQty)
    });
    setShowAddModal(false);
    resetForm();
    toast.success('Product added successfully');
  };

  const handleEditProduct = (e) => {
    e.preventDefault();
    updateProduct(selectedProduct.id, {
      ...formData,
      distributorPrice: Number(formData.distributorPrice),
      stock: Number(formData.stock),
      unitsPerCarton: Number(formData.unitsPerCarton),
      minOrderQty: Number(formData.minOrderQty)
    });
    setShowEditModal(false);
    setSelectedProduct(null);
    resetForm();
    toast.success('Product updated successfully');
  };

  const handleDeleteProduct = (productId, productName) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProduct(productId);
      toast.success('Product deleted');
    }
  };

  const ProductForm = ({ onSubmit, isEdit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Image Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData(prev => ({ ...prev, image: null }));
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="product-image-upload"
            />
            <label
              htmlFor="product-image-upload"
              className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 ${isUploading ? 'opacity-50' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </label>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="e.g. Coban Bandage 4 inch"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="Product description..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
          <input
            type="text"
            required
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="BSM-XXX-001"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type *</label>
          <select
            required
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="Piece">Piece</option>
            <option value="Carton">Carton</option>
            <option value="Pack">Pack</option>
            <option value="Box">Box</option>
            <option value="Bottle">Bottle</option>
            <option value="Tube">Tube</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Units per Carton</label>
          <input
            type="number"
            min="1"
            value={formData.unitsPerCarton}
            onChange={(e) => setFormData({ ...formData, unitsPerCarton: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distributor Price (₦) *</label>
          <input
            type="number"
            required
            min="0"
            value={formData.distributorPrice}
            onChange={(e) => setFormData({ ...formData, distributorPrice: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="0"
          />
          {formData.distributorPrice && (
            <p className="text-xs text-gray-500 mt-1">
              Retail Price: ₦{Math.round(Number(formData.distributorPrice) * 1.25).toLocaleString()} (25% markup)
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
          <input
            type="number"
            required
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Qty</label>
          <input
            type="number"
            min="1"
            value={formData.minOrderQty}
            onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-end gap-4 pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>
      </div>
      
      {/* Indications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Indications / Usage</label>
        <textarea
          value={formData.indications}
          onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="What is this product used for? (e.g., For wound care, compression therapy, etc.)"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={() => { isEdit ? setShowEditModal(false) : setShowAddModal(false); resetForm(); }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          {isEdit ? 'Save Changes' : 'Add Product'}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Products Management</h1>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="btn-primary"
        >
          + Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{product.name}</h3>
              {product.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Featured</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{product.sku}</p>
            <p className="text-xs text-gray-500 mb-2">{product.unit} {product.unitsPerCarton > 1 ? `(${product.unitsPerCarton}/carton)` : ''}</p>
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-lg font-bold text-primary-600">₦{product.prices?.retail?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Dist: ₦{product.prices?.distributor?.toLocaleString()}</p>
              </div>
              <div className={`text-sm font-medium ${product.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                {product.stock < 20 ? '⚠️' : '✓'} {product.stock} in stock
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => openEditModal(product)}
                className="flex-1 btn-secondary text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteProduct(product.id, product.name)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No products found
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <ProductForm onSubmit={handleAddProduct} isEdit={false} />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedProduct(null); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <ProductForm onSubmit={handleEditProduct} isEdit={true} />
          </div>
        </div>
      )}
    </div>
  );
};

// AdminOrders
export const AdminOrders = () => {
  const { orders, updateOrderStatus, fetchOrders } = useOrderStore();
  const { distributors, getDistributorForState } = useDistributorStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Default Bonnesante Medicals bank details (fallback when no distributor)
  const DEFAULT_BANK_DETAILS = {
    bankName: 'Moniepoint',
    accountNumber: '8259518195',
    accountName: 'Bonnesante Medicals'
  };

  // Fetch orders from database on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Get payment details for an order based on customer state
  const getPaymentDetails = (order) => {
    // First check if order has a specific distributor assigned
    if (order.distributorId) {
      const assignedDistributor = distributors.find(d => d.id === order.distributorId);
      if (assignedDistributor && assignedDistributor.bankName && assignedDistributor.accountNumber) {
        return {
          bankName: assignedDistributor.bankName,
          accountNumber: assignedDistributor.accountNumber,
          accountName: assignedDistributor.accountName || assignedDistributor.name,
          distributorName: assignedDistributor.name
        };
      }
    }
    
    // Otherwise, find distributor for customer's state
    const customerState = order.customerState || order.state;
    if (customerState) {
      const stateDistributor = getDistributorForState(customerState);
      if (stateDistributor && stateDistributor.bankName && stateDistributor.accountNumber) {
        return {
          bankName: stateDistributor.bankName,
          accountNumber: stateDistributor.accountNumber,
          accountName: stateDistributor.accountName || stateDistributor.name,
          distributorName: stateDistributor.name
        };
      }
    }
    
    // Fallback to Bonnesante Medicals default account
    return {
      ...DEFAULT_BANK_DETAILS,
      distributorName: 'Bonnesante Medicals (Head Office)'
    };
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const orderNumber = order.orderNumber || '';
    const customerName = order.customerName || '';
    const matchesSearch = !searchTerm || 
                         orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const generateOrderPDF = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Add company logo - use window.Image to avoid conflict with Lucide's Image component
    const logoImg = new window.Image();
    logoImg.src = '/logo.png';
    
    // Create the PDF with logo
    const createPDF = () => {
      // Try to add logo
      try {
        doc.addImage('/logo.png', 'PNG', 15, 10, 35, 35);
      } catch (e) {
        // Continue without logo if it fails
        console.log('Logo could not be loaded');
      }

      // Header - positioned to the right of logo
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('BONNESANTE MEDICALS', 55, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Wound Care Partner', 55, 27);
      doc.text('+234 902 872 4839, +234 702 575 5406 | astrobsm@gmail.com', 55, 34);
      doc.text('17A Isuofia Street, Federal Housing Estate Trans Ekulu, Enugu', 55, 41);
      
      y = 55;

      // Invoice Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 125, 77);
      doc.text('ORDER INVOICE', pageWidth / 2, y, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      y += 15;

      // Order Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Number:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(order.orderNumber || 'N/A', 60, y);
      doc.setFont('helvetica', 'bold');
      doc.text('Date:', 120, y);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(order.createdAt).toLocaleDateString(), 140, y);
      y += 7;

      doc.setFont('helvetica', 'bold');
      doc.text('Status:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text((order.status || 'pending').toUpperCase(), 60, y);
      y += 12;

      // Customer Details Section
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER DETAILS', 20, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${order.customerName || 'N/A'}`, 20, y);
      y += 6;
      doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 20, y);
      y += 6;
      doc.text(`Email: ${order.customerEmail || 'N/A'}`, 20, y);
      y += 6;
      doc.text(`Address: ${order.deliveryAddress || 'N/A'}`, 20, y);
      y += 6;
      doc.text(`Distributor: ${order.distributorName || 'Direct Order'}`, 20, y);
      y += 12;

      // Order Items Section
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER ITEMS', 20, y);
      y += 10;

      // Table Header
      doc.setFillColor(40, 125, 77);
      doc.setTextColor(255, 255, 255);
      doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
      doc.text('Item', 20, y);
      doc.text('Unit', 90, y);
      doc.text('Qty', 115, y);
      doc.text('Price', 135, y);
      doc.text('Total', 165, y);
      y += 8;
      doc.setTextColor(0, 0, 0);

      // Table Rows
      doc.setFont('helvetica', 'normal');
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const itemTotal = (item.quantity * item.price) || 0;
          doc.text(item.name?.substring(0, 30) || 'Item', 20, y);
          doc.text(item.unit || 'Pcs', 90, y);
          doc.text(String(item.quantity || 0), 115, y);
          doc.text(`N${(item.price || 0).toLocaleString()}`, 135, y);
          doc.text(`N${itemTotal.toLocaleString()}`, 165, y);
          y += 7;
        });
      } else {
        doc.text('No items in this order', 20, y);
        y += 7;
      }

      y += 5;

      // Summary
      doc.setDrawColor(200, 200, 200);
      doc.line(15, y, pageWidth - 15, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', 130, y);
      doc.text(`N${(order.subtotal || order.totalAmount || 0).toLocaleString()}`, 165, y);
      y += 7;

      if (order.shippingCost) {
        doc.text('Shipping:', 130, y);
        doc.text(`N${order.shippingCost.toLocaleString()}`, 165, y);
        y += 7;
      }

      doc.setFontSize(12);
      doc.setTextColor(40, 125, 77);
      doc.text('TOTAL:', 130, y);
      doc.text(`N${(order.totalAmount || 0).toLocaleString()}`, 165, y);
      doc.setTextColor(0, 0, 0);
      y += 15;

      // Payment Details Section
      const paymentDetails = getPaymentDetails(order);
      
      doc.setFillColor(255, 248, 220); // Light yellow background
      doc.rect(15, y - 4, pageWidth - 30, 45, 'F');
      doc.setDrawColor(40, 125, 77);
      doc.rect(15, y - 4, pageWidth - 30, 45, 'S');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 125, 77);
      doc.text('PAYMENT DETAILS', 20, y + 2);
      y += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Bank Name:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(paymentDetails.bankName, 70, y);
      y += 7;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Account Number:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(paymentDetails.accountNumber, 70, y);
      y += 7;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Account Name:', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(paymentDetails.accountName, 70, y);
      y += 7;
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`(Payment to: ${paymentDetails.distributorName})`, 20, y);
      y += 15;

      // Footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });
      y += 6;
      doc.text('Bonnesante Medicals | +234 902 872 4839, +234 702 575 5406 | astrobsm@gmail.com', pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.text('17A Isuofia Street, Federal Housing Estate Trans Ekulu, Enugu', pageWidth / 2, y, { align: 'center' });

      // Save PDF
      const customerName = (order.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Invoice_${order.orderNumber}_${customerName}.pdf`);
      toast.success('Invoice PDF downloaded');
    };

    createPDF();
  };

  const shareViaWhatsApp = (order) => {
    const paymentDetails = getPaymentDetails(order);
    
    const message = `
*BONNESANTE MEDICALS - Order Invoice*
━━━━━━━━━━━━━━━━━━━━

📋 *Order #:* ${order.orderNumber}
📅 *Date:* ${new Date(order.createdAt).toLocaleDateString()}
🔖 *Status:* ${order.status?.toUpperCase()}

👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone || 'N/A'}
📍 *State:* ${order.customerState || order.state || 'N/A'}

📦 *Items:*
${order.items?.map(item => 
  `• ${item.name} x${item.quantity} - ₦${(item.quantity * item.price)?.toLocaleString()}`
).join('\n') || 'No items listed'}

💰 *Total:* ₦${order.totalAmount?.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━
💳 *PAYMENT DETAILS*
━━━━━━━━━━━━━━━━━━━━
🏦 *Bank:* ${paymentDetails.bankName}
🔢 *Account No:* ${paymentDetails.accountNumber}
👤 *Account Name:* ${paymentDetails.accountName}
📍 *Pay to:* ${paymentDetails.distributorName}

━━━━━━━━━━━━━━━━━━━━
_Bonnesante Medicals_
_Your Wound Care Partner_
_+234 902 872 4839_
    `.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Orders Management</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Distributor</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                  <td className="py-3 text-sm">{order.customerName}</td>
                  <td className="py-3 text-sm">{order.distributorName || 'Direct'}</td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-medium">₦{order.totalAmount?.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => generateOrderPDF(order)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Download PDF"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => shareViaWhatsApp(order)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Share via WhatsApp"
                      >
                        <Phone size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold text-primary-600">{selectedOrder.orderNumber}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status] || 'bg-gray-100'}`}>
                  {selectedOrder.status?.toUpperCase()}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrder.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Distributor</p>
                    <p className="font-medium">{selectedOrder.distributorName || 'Direct Order'}</p>
                  </div>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="mt-3">
                    <p className="text-gray-500 text-sm">Delivery Address</p>
                    <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Item</th>
                        <th className="text-center py-2 px-4 text-sm font-medium text-gray-700">Qty</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Price</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 px-4 text-sm">{item.name}</td>
                          <td className="py-2 px-4 text-sm text-center">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm text-right">₦{item.price?.toLocaleString()}</td>
                          <td className="py-2 px-4 text-sm text-right font-medium">₦{(item.quantity * item.price)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-primary-600">₦{selectedOrder.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, status);
                        setSelectedOrder({ ...selectedOrder, status });
                        toast.success(`Order status updated to ${status}`);
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        selectedOrder.status === status 
                          ? statusColors[status] + ' ring-2 ring-offset-1 ring-gray-400'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => generateOrderPDF(selectedOrder)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FileText size={18} />
                  Download Invoice
                </button>
                <button
                  onClick={() => shareViaWhatsApp(selectedOrder)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Phone size={18} />
                  Share via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// AdminDistributors
export const AdminDistributors = () => {
  const { distributors, addDistributor, updateDistributor } = useDistributorStore();
  const { partners } = useStaffStore();
  
  // Combine distributors from both stores - distributorStore AND partners with type='distributor'
  const partnerDistributors = partners.filter(p => p.type === 'distributor').map(p => ({
    id: p.id,
    name: p.companyName || p.contactName || p.username,
    email: p.email,
    phone: p.phone,
    zone: p.territory?.[0] || '',
    state: p.state || '',
    address: p.address || '',
    bankName: p.bankName || '',
    accountNumber: p.accountNumber || '',
    accountName: p.accountName || '',
    source: 'partner' // Track where this came from
  }));
  
  // Combine both sources, avoiding duplicates by email
  const allDistributors = [
    ...distributors.map(d => ({ ...d, source: 'distributor' })),
    ...partnerDistributors.filter(pd => !distributors.some(d => d.email === pd.email))
  ];
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', zone: '', state: '', address: '', bankName: '', accountNumber: '', accountName: ''
  });

  const handleAddDistributor = (e) => {
    e.preventDefault();
    addDistributor({
      ...formData,
      password: 'Welcome@123'
    });
    setShowAddModal(false);
    resetFormData();
    toast.success('Distributor added successfully');
  };

  const handleEditDistributor = (e) => {
    e.preventDefault();
    updateDistributor(selectedDistributor.id, formData);
    setShowEditModal(false);
    setSelectedDistributor(null);
    resetFormData();
    toast.success('Distributor updated successfully');
  };

  const openEditModal = (distributor) => {
    setSelectedDistributor(distributor);
    setFormData({
      name: distributor.name || '',
      email: distributor.email || '',
      phone: distributor.phone || '',
      zone: distributor.zone || '',
      state: distributor.state || '',
      address: distributor.address || '',
      bankName: distributor.bankName || '',
      accountNumber: distributor.accountNumber || '',
      accountName: distributor.accountName || ''
    });
    setShowEditModal(true);
  };

  const resetFormData = () => {
    setFormData({ name: '', email: '', phone: '', zone: '', state: '', address: '', bankName: '', accountNumber: '', accountName: '' });
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const text = await file.text();
      const { data } = parseCSV(text);
      const validation = validateData('distributors', data);

      if (validation.validRows.length === 0) {
        toast.error('No valid records found in CSV');
        return;
      }

      let successCount = 0;
      validation.validRows.forEach(row => {
        addDistributor({
          name: row.name,
          email: row.email,
          phone: row.phone,
          zone: row.zone,
          state: row.state,
          address: row.address,
          bankName: row.bankName || '',
          accountNumber: row.accountNumber || '',
          accountName: row.accountName || '',
          password: row.password || 'Welcome@123'
        });
        successCount++;
      });

      setShowBulkModal(false);
      toast.success(`Successfully added ${successCount} distributors`);
    } catch (error) {
      toast.error('Failed to process CSV file');
      console.error(error);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Distributors Management</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBulkModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload size={18} />
            Bulk Upload
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            + Add Distributor
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allDistributors.map((dist) => (
          <div key={dist.id} className="card p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{dist.name}</h3>
              {dist.source === 'partner' && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Partner</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{dist.state} - {dist.zone}</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📞 {dist.phone}</p>
              <p>✉️ {dist.email}</p>
              <p>🏦 {dist.bankName} - {dist.accountNumber}</p>
            </div>
            {dist.source !== 'partner' && (
              <button 
                onClick={() => openEditModal(dist)}
                className="mt-4 w-full btn-secondary text-sm"
              >
                Manage
              </button>
            )}
            {dist.source === 'partner' && (
              <p className="mt-4 text-xs text-gray-500 text-center">Manage in Partner Management</p>
            )}
          </div>
        ))}
      </div>

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bulk Upload Distributors</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Template Columns:</h4>
                <p className="text-sm text-blue-700">name, email, phone, zone, state, address, bankName, accountNumber, accountName, password</p>
              </div>

              <button
                onClick={() => downloadTemplate('distributors')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition"
              >
                <Download size={20} />
                Download Distributors CSV Template
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition"
              >
                <Upload size={24} />
                <span>Click to upload CSV file</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Distributor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Distributor</h2>
              <button onClick={() => { setShowAddModal(false); resetFormData(); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddDistributor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distributor/Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Lagos Prime Distributors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
                  <select
                    required
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Zone</option>
                    <option value="South West">South West</option>
                    <option value="South East">South East</option>
                    <option value="South South">South South</option>
                    <option value="North Central">North Central</option>
                    <option value="North East">North East</option>
                    <option value="North West">North West</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Bank Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. First Bank, GTBank"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                      <input
                        type="text"
                        value={formData.accountName}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetFormData(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Distributor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Distributor Modal */}
      {showEditModal && selectedDistributor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Distributor</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedDistributor(null); resetFormData(); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditDistributor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distributor/Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
                  <select
                    required
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Zone</option>
                    <option value="South West">South West</option>
                    <option value="South East">South East</option>
                    <option value="South South">South South</option>
                    <option value="North Central">North Central</option>
                    <option value="North East">North East</option>
                    <option value="North West">North West</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Bank Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                      <input
                        type="text"
                        value={formData.accountName}
                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedDistributor(null); resetFormData(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// AdminReports
export const AdminReports = () => {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { distributors } = useDistributorStore();
  const { staff, partners } = useStaffStore();
  const { getAllFeedbacks } = useFeedbackStore();
  
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Calculate sales data
  const calculateSalesData = () => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Monthly sales data for the last 6 months
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= month && orderDate <= monthEnd;
      });
      
      const revenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const orderCount = monthOrders.length;
      
      monthlySales.push({
        month: monthNames[month.getMonth()],
        revenue,
        orders: orderCount,
        avgOrder: orderCount > 0 ? Math.round(revenue / orderCount) : 0
      });
    }
    
    return monthlySales;
  };

  // Calculate product performance data
  const calculateProductData = () => {
    const productSales = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity || 0;
        productSales[item.name].revenue += (item.quantity * item.price) || 0;
      });
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  // Calculate category distribution
  const calculateCategoryData = () => {
    const categories = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      if (!categories[cat]) {
        categories[cat] = { name: cat, value: 0, products: 0 };
      }
      categories[cat].value += p.stock * p.retailPrice || 0;
      categories[cat].products += 1;
    });
    return Object.values(categories);
  };

  // Calculate order status distribution
  const calculateOrderStatusData = () => {
    const statuses = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      const status = o.status || 'pending';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  // Calculate distributor performance
  const calculateDistributorData = () => {
    const distData = {};
    orders.forEach(order => {
      const distName = order.distributorName || 'Direct Sales';
      if (!distData[distName]) {
        distData[distName] = { name: distName, orders: 0, revenue: 0 };
      }
      distData[distName].orders += 1;
      distData[distName].revenue += order.totalAmount || 0;
    });
    return Object.values(distData).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  };

  // Calculate summary metrics
  const calculateMetrics = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    const activeDistributors = distributors.filter(d => d.status === 'active').length;
    
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      activeDistributors
    };
  };

  const metrics = calculateMetrics();
  const salesData = calculateSalesData();
  const productData = calculateProductData();
  const categoryData = calculateCategoryData();
  const orderStatusData = calculateOrderStatusData();
  const distributorData = calculateDistributorData();

  // Colors for charts
  const COLORS = ['#287D4D', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#9C27B0'];

  // Generate and download report
  const generateReport = (type) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Try to add logo
    try {
      doc.addImage('/logo.png', 'PNG', 15, 10, 30, 30);
    } catch (e) {
      console.log('Logo could not be loaded');
    }

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BONNESANTE MEDICALS', 50, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('17A Isuofia Street, Federal Housing Estate Trans Ekulu, Enugu', 50, 27);
    doc.text('+234 902 872 4839, +234 702 575 5406 | astrobsm@gmail.com', 50, 34);

    y = 50;

    // Report Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 125, 77);
    const reportTitle = type === 'sales' ? 'SALES REPORT' : 'INVENTORY REPORT';
    doc.text(reportTitle, pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, y + 5, { align: 'center' });
    y += 20;

    if (type === 'sales') {
      // Summary Section
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 4, pageWidth - 30, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('SUMMARY', 20, y + 2);
      y += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Revenue: N${metrics.totalRevenue.toLocaleString()}`, 20, y);
      doc.text(`Total Orders: ${metrics.totalOrders}`, 110, y);
      y += 7;
      doc.text(`Average Order Value: N${Math.round(metrics.avgOrderValue).toLocaleString()}`, 20, y);
      doc.text(`Pending Orders: ${metrics.pendingOrders}`, 110, y);
      y += 15;

      // Monthly Sales Table
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 4, pageWidth - 30, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('MONTHLY SALES (Last 6 Months)', 20, y + 2);
      y += 15;

      // Table header
      doc.setFillColor(40, 125, 77);
      doc.setTextColor(255, 255, 255);
      doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
      doc.setFontSize(10);
      doc.text('Month', 20, y);
      doc.text('Orders', 60, y);
      doc.text('Revenue', 100, y);
      doc.text('Avg Order', 150, y);
      y += 8;
      doc.setTextColor(0, 0, 0);

      // Table rows
      doc.setFont('helvetica', 'normal');
      salesData.forEach((row, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, y - 4, pageWidth - 30, 7, 'F');
        }
        doc.text(row.month, 20, y);
        doc.text(String(row.orders), 60, y);
        doc.text(`N${row.revenue.toLocaleString()}`, 100, y);
        doc.text(`N${row.avgOrder.toLocaleString()}`, 150, y);
        y += 7;
      });

      y += 10;

      // Top Products
      if (y < 200) {
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 4, pageWidth - 30, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TOP SELLING PRODUCTS', 20, y + 2);
        y += 15;

        doc.setFillColor(40, 125, 77);
        doc.setTextColor(255, 255, 255);
        doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
        doc.setFontSize(10);
        doc.text('Product', 20, y);
        doc.text('Units Sold', 100, y);
        doc.text('Revenue', 150, y);
        y += 8;
        doc.setTextColor(0, 0, 0);

        doc.setFont('helvetica', 'normal');
        productData.slice(0, 5).forEach((row, i) => {
          if (i % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, y - 4, pageWidth - 30, 7, 'F');
          }
          doc.text(row.name.substring(0, 35), 20, y);
          doc.text(String(row.quantity), 100, y);
          doc.text(`N${row.revenue.toLocaleString()}`, 150, y);
          y += 7;
        });
      }

    } else {
      // Inventory Report
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 4, pageWidth - 30, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('INVENTORY SUMMARY', 20, y + 2);
      y += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Products: ${metrics.totalProducts}`, 20, y);
      doc.text(`Low Stock Items: ${metrics.lowStockProducts}`, 110, y);
      y += 15;

      // Products Table
      doc.setFillColor(40, 125, 77);
      doc.setTextColor(255, 255, 255);
      doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
      doc.setFontSize(10);
      doc.text('Product', 20, y);
      doc.text('SKU', 80, y);
      doc.text('Stock', 110, y);
      doc.text('Price', 140, y);
      doc.text('Value', 170, y);
      y += 8;
      doc.setTextColor(0, 0, 0);

      doc.setFont('helvetica', 'normal');
      products.slice(0, 15).forEach((p, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, y - 4, pageWidth - 30, 7, 'F');
        }
        doc.text((p.name || 'N/A').substring(0, 25), 20, y);
        doc.text(p.sku || 'N/A', 80, y);
        doc.text(String(p.stock || 0), 110, y);
        doc.text(`N${(p.retailPrice || 0).toLocaleString()}`, 140, y);
        doc.text(`N${((p.stock || 0) * (p.retailPrice || 0)).toLocaleString()}`, 170, y);
        y += 7;
        
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
      doc.text('Bonnesante Medicals - Confidential Report', pageWidth / 2, 285, { align: 'center' });
    }

    doc.save(`${reportTitle.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success(`${reportTitle} downloaded successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">₦{metrics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{metrics.totalOrders}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold">₦{Math.round(metrics.avgOrderValue).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold">{metrics.lowStockProducts}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {['sales', 'products', 'orders', 'distributors', 'partners', 'staff', 'customers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveReport(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeReport === tab
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sales Report */}
      {activeReport === 'sales' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sales Performance</h2>
            <button
              onClick={() => generateReport('sales')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Sales Report
            </button>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#287D4D" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#287D4D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#287D4D" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders vs Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Orders vs Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis yAxisId="left" stroke="#888" />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e0e0e0' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#4CAF50" name="Orders" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill="#287D4D" name="Revenue (₦)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Sales Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Monthly Sales Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{row.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">₦{row.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">₦{row.avgOrder.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Products Report */}
      {activeReport === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Product Performance</h2>
            <button
              onClick={() => generateReport('inventory')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Inventory Report
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Products Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#287D4D" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Inventory by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Product Sales Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">₦{row.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  {productData.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No product sales data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Report */}
      {activeReport === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Order Analytics</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Trends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Trends</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#287D4D" strokeWidth={2} dot={{ fill: '#287D4D' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Order Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {orderStatusData.map((status, i) => (
              <div key={status.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <p className="text-2xl font-bold text-gray-900">{status.value}</p>
                <p className="text-sm text-gray-500 capitalize">{status.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distributors Report */}
      {activeReport === 'distributors' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Distributor Performance</h2>

          {/* Distributor Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue by Distributor</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#888" tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#287D4D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distributor Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Distributor Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distributor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distributorData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">₦{row.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">₦{row.orders > 0 ? Math.round(row.revenue / row.orders).toLocaleString() : 0}</td>
                    </tr>
                  ))}
                  {distributorData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No distributor data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Partners Report */}
      {activeReport === 'partners' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Partner Performance Analysis</h2>

          {/* Partner Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-green-600">{partners.filter(p => p.type === 'distributor').length}</p>
              <p className="text-sm text-gray-500">Distributors</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-blue-600">{partners.filter(p => p.type === 'wholesaler').length}</p>
              <p className="text-sm text-gray-500">Wholesalers</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-purple-600">{partners.filter(p => p.status === 'active').length}</p>
              <p className="text-sm text-gray-500">Active Partners</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-orange-600">{partners.filter(p => p.status === 'suspended').length}</p>
              <p className="text-sm text-gray-500">Suspended</p>
            </div>
          </div>

          {/* Partner Distribution by State */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Partners by State</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const stateData = {};
                    partners.forEach(p => {
                      const state = p.state || 'Unknown';
                      stateData[state] = (stateData[state] || 0) + 1;
                    });
                    return Object.entries(stateData).map(([name, count]) => ({ name, count })).slice(0, 10);
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#287D4D" name="Partners" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Partner Type Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Distributors', value: partners.filter(p => p.type === 'distributor').length },
                        { name: 'Wholesalers', value: partners.filter(p => p.type === 'wholesaler').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#287D4D" />
                      <Cell fill="#4CAF50" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Partner Details Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Partner Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partners.slice(0, 10).map((partner, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{partner.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{partner.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{partner.state}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(partner.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {partners.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No partner data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Staff Report */}
      {activeReport === 'staff' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Staff Performance Analysis</h2>

          {/* Staff Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              <p className="text-sm text-gray-500">Total Staff</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-green-600">{staff.filter(s => s.status === 'active').length}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-blue-600">{staff.filter(s => s.role === 'marketer').length}</p>
              <p className="text-sm text-gray-500">Marketers</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-purple-600">{staff.filter(s => s.role === 'sales').length}</p>
              <p className="text-sm text-gray-500">Sales Staff</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-orange-600">{staff.filter(s => s.role === 'cco').length}</p>
              <p className="text-sm text-gray-500">CCOs</p>
            </div>
          </div>

          {/* Staff Distribution Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Staff by Role</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(() => {
                        const roleData = {};
                        staff.forEach(s => {
                          const role = s.role || 'other';
                          roleData[role] = (roleData[role] || 0) + 1;
                        });
                        return Object.entries(roleData).map(([name, value]) => ({ name, value }));
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Staff by Zone</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const zoneData = {};
                    staff.forEach(s => {
                      const zone = s.zone || 'Unassigned';
                      zoneData[zone] = (zoneData[zone] || 0) + 1;
                    });
                    return Object.entries(zoneData).map(([name, count]) => ({ name, count }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4CAF50" name="Staff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Staff Details Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Staff Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{member.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.zone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers Report */}
      {activeReport === 'customers' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Customer Analytics</h2>

          {/* Customer Feedback Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(() => {
              const feedbacks = getAllFeedbacks();
              return (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
                    <p className="text-sm text-gray-500">Total Feedback</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-2xl font-bold text-blue-600">{feedbacks.filter(f => f.status === 'new').length}</p>
                    <p className="text-sm text-gray-500">New</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-2xl font-bold text-green-600">{feedbacks.filter(f => f.status === 'resolved').length}</p>
                    <p className="text-sm text-gray-500">Resolved</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-2xl font-bold text-yellow-600">{feedbacks.filter(f => f.type === 'complaint').length}</p>
                    <p className="text-sm text-gray-500">Complaints</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <p className="text-2xl font-bold text-purple-600">{feedbacks.filter(f => f.type === 'praise').length}</p>
                    <p className="text-sm text-gray-500">Praise</p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Customer Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Feedback by Type</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(() => {
                        const feedbacks = getAllFeedbacks();
                        const typeData = { general: 0, complaint: 0, suggestion: 0, praise: 0 };
                        feedbacks.forEach(f => {
                          typeData[f.type] = (typeData[f.type] || 0) + 1;
                        });
                        return Object.entries(typeData).map(([name, value]) => ({ name, value }));
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#9CA3AF" />
                      <Cell fill="#EF4444" />
                      <Cell fill="#3B82F6" />
                      <Cell fill="#22C55E" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Feedback Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(() => {
                    const feedbacks = getAllFeedbacks();
                    const statusData = { 'new': 0, 'in-progress': 0, 'resolved': 0, 'closed': 0 };
                    feedbacks.forEach(f => {
                      statusData[f.status] = (statusData[f.status] || 0) + 1;
                    });
                    return Object.entries(statusData).map(([name, count]) => ({ name, count }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#287D4D" name="Feedback" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Customer Orders Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Customers by Order Value</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(() => {
                  const customerData = {};
                  orders.forEach(order => {
                    const customer = order.customerName || 'Unknown';
                    if (!customerData[customer]) {
                      customerData[customer] = { name: customer, orders: 0, revenue: 0 };
                    }
                    customerData[customer].orders += 1;
                    customerData[customer].revenue += order.totalAmount || 0;
                  });
                  return Object.values(customerData).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
                })()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#287D4D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Feedback Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recent Customer Feedback</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getAllFeedbacks().slice(0, 10).map((feedback, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{feedback.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          feedback.type === 'complaint' ? 'bg-red-100 text-red-700' :
                          feedback.type === 'praise' ? 'bg-green-100 text-green-700' :
                          feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {feedback.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{feedback.subject?.substring(0, 30)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {'★'.repeat(feedback.rating || 0)}{'☆'.repeat(5 - (feedback.rating || 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          feedback.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          feedback.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {feedback.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {getAllFeedbacks().length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No customer feedback available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// AdminSettings
export const AdminSettings = () => {
  const { 
    companyInfo, appearance, slideshow, orderSettings, notifications, seo, businessHours,
    updateCompanyInfo, updateAppearance, updateSlideshow, updateOrderSettings, 
    updateNotifications, updateSEO, updateBusinessHours, addSlide, updateSlide, deleteSlide, resetToDefaults
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('company');
  const [formData, setFormData] = useState({});
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);

  useEffect(() => {
    setFormData({
      company: { ...companyInfo },
      appearance: { ...appearance },
      slideshow: { ...slideshow },
      order: { ...orderSettings },
      notifications: { ...notifications },
      seo: { ...seo },
      hours: { ...businessHours }
    });
  }, [companyInfo, appearance, slideshow, orderSettings, notifications, seo, businessHours]);

  const handleSave = (section) => {
    switch(section) {
      case 'company':
        updateCompanyInfo(formData.company);
        toast.success('Company information updated');
        break;
      case 'appearance':
        updateAppearance(formData.appearance);
        toast.success('Appearance settings updated');
        break;
      case 'slideshow':
        updateSlideshow(formData.slideshow);
        toast.success('Slideshow settings updated');
        break;
      case 'order':
        updateOrderSettings(formData.order);
        toast.success('Order settings updated');
        break;
      case 'notifications':
        updateNotifications(formData.notifications);
        toast.success('Notification settings updated');
        break;
      case 'seo':
        updateSEO(formData.seo);
        toast.success('SEO settings updated');
        break;
      case 'hours':
        updateBusinessHours(formData.hours);
        toast.success('Business hours updated');
        break;
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'slideshow', label: 'Slideshow', icon: Image },
    { id: 'order', label: 'Order Settings', icon: ShoppingCart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'hours', label: 'Business Hours', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-gray-900">System Settings</h1>
        <button
          onClick={() => {
            if (confirm('Reset all settings to defaults?')) {
              resetToDefaults();
              toast.success('Settings reset to defaults');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          Reset to Defaults
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Company Info */}
      {activeTab === 'company' && formData.company && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Company Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.company.name || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, name: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
              <input
                type="text"
                value={formData.company.slogan || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, slogan: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={formData.company.logo || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, logo: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.company.email || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, email: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone 1</label>
              <input
                type="text"
                value={formData.company.phone || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, phone: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone 2</label>
              <input
                type="text"
                value={formData.company.phone2 || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, phone2: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.company.address || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, address: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.company.city || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, city: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.company.state || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, state: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.company.website || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, website: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.company.socialMedia?.whatsapp || ''}
                onChange={(e) => setFormData({...formData, company: {...formData.company, socialMedia: {...formData.company.socialMedia, whatsapp: e.target.value}}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave('company')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Appearance */}
      {activeTab === 'appearance' && formData.appearance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Appearance Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.appearance.primaryColor || '#287D4D'}
                  onChange={(e) => setFormData({...formData, appearance: {...formData.appearance, primaryColor: e.target.value}})}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.appearance.primaryColor || ''}
                  onChange={(e) => setFormData({...formData, appearance: {...formData.appearance, primaryColor: e.target.value}})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.appearance.secondaryColor || '#4CAF50'}
                  onChange={(e) => setFormData({...formData, appearance: {...formData.appearance, secondaryColor: e.target.value}})}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.appearance.secondaryColor || ''}
                  onChange={(e) => setFormData({...formData, appearance: {...formData.appearance, secondaryColor: e.target.value}})}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
              <select
                value={formData.appearance.fontFamily || ''}
                onChange={(e) => setFormData({...formData, appearance: {...formData.appearance, fontFamily: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Inter, system-ui, sans-serif">Inter (Default)</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Open Sans, sans-serif">Open Sans</option>
                <option value="Lato, sans-serif">Lato</option>
                <option value="Poppins, sans-serif">Poppins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
              <select
                value={formData.appearance.headingFont || ''}
                onChange={(e) => setFormData({...formData, appearance: {...formData.appearance, headingFont: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="Playfair Display, serif">Playfair Display (Default)</option>
                <option value="Merriweather, serif">Merriweather</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Montserrat, sans-serif">Montserrat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <select
                value={formData.appearance.fontSize || 'medium'}
                onChange={(e) => setFormData({...formData, appearance: {...formData.appearance, fontSize: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium (Default)</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
              <select
                value={formData.appearance.borderRadius || 'rounded'}
                onChange={(e) => setFormData({...formData, appearance: {...formData.appearance, borderRadius: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="none">None (Sharp Corners)</option>
                <option value="rounded">Rounded (Default)</option>
                <option value="pill">Pill (Full Round)</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave('appearance')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Slideshow */}
      {activeTab === 'slideshow' && formData.slideshow && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Slideshow Settings</h2>
            <button
              onClick={() => { setSelectedSlide(null); setShowSlideModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={18} />
              Add Slide
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.slideshow.enabled}
                onChange={(e) => setFormData({...formData, slideshow: {...formData.slideshow, enabled: e.target.checked}})}
                className="w-4 h-4 text-green-600"
              />
              <label className="text-sm font-medium text-gray-700">Enable Slideshow</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.slideshow.autoPlay}
                onChange={(e) => setFormData({...formData, slideshow: {...formData.slideshow, autoPlay: e.target.checked}})}
                className="w-4 h-4 text-green-600"
              />
              <label className="text-sm font-medium text-gray-700">Auto Play</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.slideshow.showDots}
                onChange={(e) => setFormData({...formData, slideshow: {...formData.slideshow, showDots: e.target.checked}})}
                className="w-4 h-4 text-green-600"
              />
              <label className="text-sm font-medium text-gray-700">Show Dots</label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interval (ms)</label>
              <input
                type="number"
                value={formData.slideshow.interval || 5000}
                onChange={(e) => setFormData({...formData, slideshow: {...formData.slideshow, interval: parseInt(e.target.value)}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transition</label>
              <select
                value={formData.slideshow.transition || 'fade'}
                onChange={(e) => setFormData({...formData, slideshow: {...formData.slideshow, transition: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>
          </div>

          {/* Slides List */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Slides</h3>
            {slideshow.slides?.map((slide, idx) => (
              <div key={slide.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-500 font-medium">{idx + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">{slide.title}</p>
                  <p className="text-sm text-gray-500">{slide.subtitle}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${slide.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {slide.active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => { setSelectedSlide(slide); setShowSlideModal(true); }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => { if(confirm('Delete this slide?')) deleteSlide(slide.id); }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave('slideshow')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Order Settings */}
      {activeTab === 'order' && formData.order && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Order Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Prefix</label>
              <input
                type="text"
                value={formData.order.orderPrefix || ''}
                onChange={(e) => setFormData({...formData, order: {...formData.order, orderPrefix: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (₦)</label>
              <input
                type="number"
                value={formData.order.minOrderAmount || 0}
                onChange={(e) => setFormData({...formData, order: {...formData.order, minOrderAmount: parseInt(e.target.value)}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Fee (₦)</label>
              <input
                type="number"
                value={formData.order.shippingFee || 0}
                onChange={(e) => setFormData({...formData, order: {...formData.order, shippingFee: parseInt(e.target.value)}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (₦)</label>
              <input
                type="number"
                value={formData.order.freeShippingThreshold || 0}
                onChange={(e) => setFormData({...formData, order: {...formData.order, freeShippingThreshold: parseInt(e.target.value)}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.order.enableCOD}
                onChange={(e) => setFormData({...formData, order: {...formData.order, enableCOD: e.target.checked}})}
                className="w-4 h-4 text-green-600"
              />
              <label className="text-sm font-medium text-gray-700">Enable Cash on Delivery</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.order.enableBankTransfer}
                onChange={(e) => setFormData({...formData, order: {...formData.order, enableBankTransfer: e.target.checked}})}
                className="w-4 h-4 text-green-600"
              />
              <label className="text-sm font-medium text-gray-700">Enable Bank Transfer</label>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave('order')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && formData.notifications && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
          <div className="space-y-4">
            {[
              { key: 'emailOnNewOrder', label: 'Email notification on new order' },
              { key: 'emailOnOrderStatus', label: 'Email notification on order status change' },
              { key: 'smsOnNewOrder', label: 'SMS notification on new order' },
              { key: 'smsOnDelivery', label: 'SMS notification on delivery' },
              { key: 'pushNotifications', label: 'Enable push notifications' }
            ].map(item => (
              <div key={item.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.notifications[item.key]}
                  onChange={(e) => setFormData({...formData, notifications: {...formData.notifications, [item.key]: e.target.checked}})}
                  className="w-4 h-4 text-green-600"
                />
                <label className="text-sm font-medium text-gray-700">{item.label}</label>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave('notifications')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* SEO */}
      {activeTab === 'seo' && formData.seo && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.seo.metaTitle || ''}
                onChange={(e) => setFormData({...formData, seo: {...formData.seo, metaTitle: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={formData.seo.metaDescription || ''}
                onChange={(e) => setFormData({...formData, seo: {...formData.seo, metaDescription: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
              <input
                type="text"
                value={formData.seo.keywords || ''}
                onChange={(e) => setFormData({...formData, seo: {...formData.seo, keywords: e.target.value}})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                <input
                  type="text"
                  value={formData.seo.googleAnalyticsId || ''}
                  onChange={(e) => setFormData({...formData, seo: {...formData.seo, googleAnalyticsId: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="UA-XXXXXXXXX-X"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Pixel ID</label>
                <input
                  type="text"
                  value={formData.seo.facebookPixelId || ''}
                  onChange={(e) => setFormData({...formData, seo: {...formData.seo, facebookPixelId: e.target.value}})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave('seo')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Business Hours */}
      {activeTab === 'hours' && formData.hours && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Business Hours</h2>
          <div className="space-y-3">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="w-24 font-medium capitalize">{day}</span>
                <input
                  type="checkbox"
                  checked={!formData.hours[day]?.closed}
                  onChange={(e) => setFormData({...formData, hours: {...formData.hours, [day]: {...formData.hours[day], closed: !e.target.checked}}})}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-600">Open</span>
                <input
                  type="time"
                  value={formData.hours[day]?.open || '08:00'}
                  onChange={(e) => setFormData({...formData, hours: {...formData.hours, [day]: {...formData.hours[day], open: e.target.value}}})}
                  disabled={formData.hours[day]?.closed}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={formData.hours[day]?.close || '18:00'}
                  onChange={(e) => setFormData({...formData, hours: {...formData.hours, [day]: {...formData.hours[day], close: e.target.value}}})}
                  disabled={formData.hours[day]?.closed}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave('hours')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Slide Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">{selectedSlide ? 'Edit Slide' : 'Add Slide'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formEl = e.target;
              const slideData = {
                title: formEl.title.value,
                subtitle: formEl.subtitle.value,
                image: formEl.image.value,
                buttonText: formEl.buttonText.value,
                buttonLink: formEl.buttonLink.value,
                active: formEl.active.checked
              };
              if (selectedSlide) {
                updateSlide(selectedSlide.id, slideData);
              } else {
                addSlide(slideData);
              }
              setShowSlideModal(false);
              toast.success('Slide saved');
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input name="title" defaultValue={selectedSlide?.title || ''} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input name="subtitle" defaultValue={selectedSlide?.subtitle || ''} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input name="image" defaultValue={selectedSlide?.image || ''} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input name="buttonText" defaultValue={selectedSlide?.buttonText || ''} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input name="buttonLink" defaultValue={selectedSlide?.buttonLink || ''} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="active" defaultChecked={selectedSlide?.active ?? true} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSlideModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// AdminContent - Content Management for Videos, Downloads, Training, Clinical Apps
export const AdminContent = () => {
  const { 
    videos, downloads, training, clinicalApps,
    addVideo, updateVideo, deleteVideo,
    addDownload, updateDownload, deleteDownload,
    addTraining, updateTraining, deleteTraining,
    addClinicalApp, updateClinicalApp, deleteClinicalApp,
    resetDownloadsToDefault, resetVideosToDefault, resetTrainingToDefault, resetClinicalAppsToDefault,
    // Sync functions
    fetchContentFromServer, uploadContentToServer,
    isSyncing, lastSyncTime, syncError, isServerSynced
  } = useContentStore();
  
  const [activeTab, setActiveTab] = useState('videos');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const tabs = [
    { id: 'videos', label: 'Tutorial Videos', icon: Video },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'training', label: 'Training Courses', icon: GraduationCap },
    { id: 'apps', label: 'Clinical Apps', icon: Smartphone }
  ];

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      // Default values for new items
      if (activeTab === 'videos') {
        setFormData({ title: '', description: '', url: '', thumbnail: '', duration: '', category: 'Tutorial' });
      } else if (activeTab === 'downloads') {
        setFormData({ title: '', description: '', fileType: 'PDF', fileSize: '', category: 'Guide', content: '' });
      } else if (activeTab === 'apps') {
        setFormData({ name: '', description: '', category: 'Assessment', platform: 'iOS & Android', price: 'Free', icon: '📱', url: '', iosUrl: '', featured: false, rating: 4.5 });
      } else {
        setFormData({ title: '', description: '', duration: '', level: 'Beginner', price: '', modules: 5, image: '', featured: false });
      }
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (activeTab === 'videos') {
      if (modalType === 'add') {
        addVideo(formData);
        toast.success('Video added successfully');
      } else {
        updateVideo(selectedItem.id, formData);
        toast.success('Video updated successfully');
      }
    } else if (activeTab === 'downloads') {
      if (modalType === 'add') {
        addDownload(formData);
        toast.success('Download added successfully');
      } else {
        updateDownload(selectedItem.id, formData);
        toast.success('Download updated successfully');
      }
    } else if (activeTab === 'apps') {
      if (modalType === 'add') {
        addClinicalApp(formData);
        toast.success('Clinical app added successfully');
      } else {
        updateClinicalApp(selectedItem.id, formData);
        toast.success('Clinical app updated successfully');
      }
    } else if (activeTab === 'training') {
      if (modalType === 'add') {
        addTraining(formData);
        toast.success('Training course added successfully');
      } else {
        updateTraining(selectedItem.id, formData);
        toast.success('Training course updated successfully');
      }
    }
    setShowModal(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'videos') {
        deleteVideo(id);
        toast.success('Video deleted');
      } else if (activeTab === 'downloads') {
        deleteDownload(id);
        toast.success('Download deleted');
      } else if (activeTab === 'apps') {
        deleteClinicalApp(id);
        toast.success('Clinical app deleted');
      } else {
        deleteTraining(id);
        toast.success('Training course deleted');
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('This will reset all content to default. Any custom additions will be lost. Continue?')) {
      if (activeTab === 'videos') {
        resetVideosToDefault();
        toast.success('Videos reset to default');
      } else if (activeTab === 'downloads') {
        resetDownloadsToDefault();
        toast.success('Downloads reset to default (with full content for PDF generation)');
      } else if (activeTab === 'apps') {
        resetClinicalAppsToDefault();
        toast.success('Clinical apps reset to default');
      } else {
        resetTrainingToDefault();
        toast.success('Training courses reset to default');
      }
    }
  };

  // Sync handlers
  const handleSyncFromServer = async () => {
    toast.loading('Syncing from server...', { id: 'sync' });
    const success = await fetchContentFromServer();
    if (success) {
      toast.success('Content synced from server!', { id: 'sync' });
    } else {
      toast.error('Failed to sync from server', { id: 'sync' });
    }
  };

  const handleUploadToServer = async () => {
    toast.loading('Uploading to server...', { id: 'upload' });
    const success = await uploadContentToServer();
    if (success) {
      toast.success('Content uploaded to server!', { id: 'upload' });
    } else {
      toast.error('Failed to upload to server', { id: 'upload' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage education content - videos, downloads, and training courses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={18} />
            Reset to Default
          </button>
          <button
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>
      </div>

      {/* Sync Status Bar */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isServerSynced ? (
                <Cloud className="text-green-600" size={20} />
              ) : (
                <CloudOff className="text-orange-500" size={20} />
              )}
              <span className="text-sm font-medium">
                {isServerSynced ? 'Synced with Server' : 'Local Only'}
              </span>
            </div>
            {lastSyncTime && (
              <span className="text-sm text-gray-500">
                Last sync: {new Date(lastSyncTime).toLocaleString()}
              </span>
            )}
            {syncError && (
              <span className="text-sm text-red-500">
                Error: {syncError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncFromServer}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              Pull from Server
            </button>
            <button
              onClick={handleUploadToServer}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Upload size={16} />
              Push to Server
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Changes to Clinical Apps, Training, Downloads are automatically synced across all devices.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Tip:</strong> For video URLs, use YouTube embed links (e.g., https://www.youtube.com/embed/VIDEO_ID). 
              These will display as embedded videos in the Education page.
            </p>
          </div>
          <div className="grid gap-4">
            {videos.map((video) => (
              <div key={video.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100">
                        <Play size={20} className="text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{video.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">{video.category}</span>
                      <span>{video.duration}</span>
                      <span>{video.views?.toLocaleString() || 0} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal('edit', video)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {videos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No videos found. Click "Add New" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Downloads Tab */}
      {activeTab === 'downloads' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Important:</strong> Downloads with a "Content" field will generate a PDF when users click download. 
              If you're seeing download issues, click "Reset to Default" to restore full content.
            </p>
          </div>
          <div className="grid gap-4">
            {downloads.map((download) => (
              <div key={download.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{download.title}</h3>
                      {download.content ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Has Content</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">No Content</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{download.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{download.category}</span>
                      <span>{download.fileType} • {download.fileSize}</span>
                      <span>{download.downloads?.toLocaleString() || 0} downloads</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal('edit', download)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(download.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {downloads.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No downloads found. Click "Add New" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {training.map((course) => (
              <div key={course.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-100">
                        <GraduationCap size={20} className="text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                      {course.featured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{course.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{course.level}</span>
                      <span>{course.duration}</span>
                      <span>{course.modules} modules</span>
                      <span>{course.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal('edit', course)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {training.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No training courses found. Click "Add New" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clinical Apps Tab */}
      {activeTab === 'apps' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm">
              <strong>Tip:</strong> Add useful clinical apps for wound care professionals. Include both the main app URL and iOS-specific URL if available.
              Common icons: 📏 📊 📚 🔬 📋 🩺 💊 🥗 📱 🩹
            </p>
          </div>
          <div className="grid gap-4">
            {clinicalApps.map((app) => (
              <div key={app.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{app.name}</h3>
                      {app.featured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{app.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{app.category}</span>
                      <span>{app.platform}</span>
                      <span className={app.price === 'Free' ? 'text-green-600' : ''}>{app.price}</span>
                      <span className="flex items-center">
                        <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                        {app.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-green-600 hover:bg-green-50 rounded"
                    title="Open App"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => handleOpenModal('edit', app)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {clinicalApps.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No clinical apps found. Click "Add New" to add one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {modalType === 'add' ? 'Add New' : 'Edit'} {activeTab === 'videos' ? 'Video' : activeTab === 'downloads' ? 'Download' : activeTab === 'apps' ? 'Clinical App' : 'Training Course'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Common fields - Title/Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeTab === 'apps' ? 'App Name *' : 'Title *'}
                </label>
                <input
                  type="text"
                  value={activeTab === 'apps' ? (formData.name || '') : (formData.title || '')}
                  onChange={(e) => setFormData({ ...formData, [activeTab === 'apps' ? 'name' : 'title']: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={activeTab === 'apps' ? 'Enter app name' : 'Enter title'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>

              {/* Clinical Apps-specific fields */}
              {activeTab === 'apps' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">App Icon (Emoji)</label>
                      <input
                        type="text"
                        value={formData.icon || '📱'}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-2xl text-center"
                        placeholder="📱"
                      />
                      <p className="text-xs text-gray-500 mt-1">Common: 📏 📊 📚 🔬 📋 🩺 💊 🥗</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category || 'Assessment'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Measurement">Measurement</option>
                        <option value="Assessment">Assessment</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Reference">Reference</option>
                        <option value="Education">Education</option>
                        <option value="Safety">Safety</option>
                        <option value="Nutrition">Nutrition</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                      <select
                        value={formData.platform || 'iOS & Android'}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="iOS & Android">iOS & Android</option>
                        <option value="iOS">iOS Only</option>
                        <option value="Android">Android Only</option>
                        <option value="Web">Web Only</option>
                        <option value="Web & Mobile">Web & Mobile</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="text"
                        value={formData.price || 'Free'}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Free or $9.99/mo"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">App URL (Main Link) *</label>
                    <input
                      type="url"
                      value={formData.url || ''}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="https://play.google.com/store/apps/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">iOS App Store URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.iosUrl || ''}
                      onChange={(e) => setFormData({ ...formData, iosUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="https://apps.apple.com/app/..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating || 4.5}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <input
                        type="checkbox"
                        id="appFeatured"
                        checked={formData.featured || false}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="appFeatured" className="ml-2 text-sm text-gray-700">
                        Featured on Home Page
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Video-specific fields */}
              {activeTab === 'videos' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube Embed) *</label>
                    <input
                      type="url"
                      value={formData.url || ''}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use YouTube embed format: https://www.youtube.com/embed/VIDEO_ID</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                      <input
                        type="text"
                        value={formData.thumbnail || ''}
                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="/images/videos/thumbnail.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 15 min"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category || 'Tutorial'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Tutorial">Tutorial</option>
                      <option value="Product Demo">Product Demo</option>
                      <option value="Clinical Skills">Clinical Skills</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Case Study">Case Study</option>
                    </select>
                  </div>
                </>
              )}

              {/* Download-specific fields */}
              {activeTab === 'downloads' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                      <select
                        value={formData.fileType || 'PDF'}
                        onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="PDF">PDF</option>
                        <option value="DOCX">DOCX</option>
                        <option value="XLSX">XLSX</option>
                        <option value="ZIP">ZIP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                      <input
                        type="text"
                        value={formData.fileSize || ''}
                        onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 2.5 MB"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category || 'Guide'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Guide">Guide</option>
                      <option value="Protocol">Protocol</option>
                      <option value="Research">Research</option>
                      <option value="Product Info">Product Info</option>
                      <option value="Patient Materials">Patient Materials</option>
                      <option value="Forms">Forms</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PDF Content (for auto-generated PDFs)</label>
                    <textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      rows={10}
                      placeholder="Enter the content that will be converted to PDF. Use **text** for bold headings, - for bullet points."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: Use **text** for section headers, - or • for bullet points, numbered lists (1. 2. 3.)
                    </p>
                  </div>
                </>
              )}

              {/* Training-specific fields */}
              {activeTab === 'training' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., 4 weeks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                      <select
                        value={formData.level || 'Beginner'}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="text"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., ₦50,000 or Free"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modules</label>
                      <input
                        type="number"
                        value={formData.modules || 5}
                        onChange={(e) => setFormData({ ...formData, modules: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        min={1}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="/images/training/course.jpg"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <label className="text-sm text-gray-700">Featured Course</label>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={activeTab === 'apps' 
                  ? (!formData.name || !formData.description || !formData.url)
                  : (!formData.title || !formData.description)}
              >
                {modalType === 'add' ? 'Add' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
