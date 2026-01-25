import React, { useState, useEffect } from 'react';
import { 
  Users, Target, TrendingUp, Calendar, Phone, FileText, 
  Search, Plus, Edit2, Trash2, Filter, Mail, MapPin,
  DollarSign, BarChart2, PieChart, Download, RefreshCw,
  Star, MessageCircle, Send
} from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import toast from 'react-hot-toast';

export const MarketerDashboard = () => {
  const { orders, fetchOrders } = useOrderStore();
  
  // Fetch fresh data on mount and periodically
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchOrders]);
  
  // Calculate real stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  const stats = [
    { label: 'Total Leads (Orders)', value: totalOrders, change: 'All time', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Conversions', value: completedOrders, change: `${totalOrders > 0 ? Math.round((completedOrders/totalOrders)*100) : 0}%`, icon: Target, color: 'bg-green-100 text-green-600' },
    { label: 'Revenue Generated', value: `₦${(totalRevenue/1000000).toFixed(1)}M`, change: 'Total', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { label: 'Pending Orders', value: pendingOrders, change: 'Needs follow-up', icon: Calendar, color: 'bg-orange-100 text-orange-600' }
  ];

  // Use real order data for leads
  const recentLeads = orders.slice(0, 4).map((order, index) => ({
    id: index + 1,
    name: order.customerName || 'Customer',
    contact: order.phone || 'No phone',
    status: order.status === 'completed' || order.status === 'delivered' ? 'Hot' : 
            order.status === 'processing' ? 'Warm' : 'Cold',
    date: new Date(order.createdAt).toISOString().split('T')[0]
  }));

  const upcomingTasks = orders.filter(o => o.status === 'pending').slice(0, 3).map((order, index) => ({
    id: index + 1,
    task: `Follow up with ${order.customerName || 'Customer'} - Order #${order.orderNumber || order.id}`,
    due: 'Today',
    priority: index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hot': return 'bg-red-100 text-red-700';
      case 'Warm': return 'bg-yellow-100 text-yellow-700';
      case 'Cold': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketer Dashboard</h1>
        <p className="text-gray-600">Track your leads and marketing performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Leads</h2>
            <button className="text-sm text-green-600 hover:underline">View All</button>
          </div>
          <div className="divide-y">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-sm text-gray-500">{lead.contact}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{lead.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Upcoming Tasks</h2>
            <button className="text-sm text-green-600 hover:underline">Add Task</button>
          </div>
          <div className="divide-y">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50 flex items-center gap-4">
                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                <div className="flex-1">
                  <p className="text-gray-900">{task.task}</p>
                  <p className="text-sm text-gray-500">Due: {task.due}</p>
                </div>
                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Users className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-sm font-medium">Add Lead</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Phone className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm font-medium">Log Call</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Calendar className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-sm font-medium">Schedule Meeting</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <FileText className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-sm font-medium">Create Report</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MarketerLeads = () => {
  const { orders, fetchOrders } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('marketer_leads');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'referral',
    status: 'new',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    localStorage.setItem('marketer_leads', JSON.stringify(leads));
  }, [leads]);

  // Combine manual leads with order-based leads
  const allLeads = React.useMemo(() => {
    const orderLeads = orders.map(order => ({
      id: `order-${order.id}`,
      name: order.customerName || 'Unknown',
      phone: order.customerPhone || '',
      email: order.customerEmail || '',
      source: 'order',
      status: order.status === 'completed' || order.status === 'delivered' ? 'converted' :
              order.status === 'processing' ? 'qualified' :
              order.status === 'pending' ? 'contacted' : 'new',
      value: order.total || order.totalAmount || 0,
      createdAt: order.createdAt,
      notes: `Order #${order.orderNumber || order.id?.slice(-6)}`
    }));
    return [...leads, ...orderLeads].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [orders, leads]);

  const filteredLeads = allLeads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.name.trim()) {
      toast.error('Please enter lead name');
      return;
    }
    const lead = {
      ...newLead,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      value: 0
    };
    setLeads(prev => [lead, ...prev]);
    toast.success('Lead added successfully');
    setNewLead({ name: '', phone: '', email: '', source: 'referral', status: 'new', notes: '' });
    setShowAddModal(false);
  };

  const handleUpdateStatus = (leadId, newStatus) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    toast.success('Lead status updated');
  };

  const handleDeleteLead = (leadId) => {
    if (!leadId.startsWith('order-')) {
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      setSelectedLead(null);
      toast.success('Lead deleted');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'converted': return 'bg-green-100 text-green-700';
      case 'qualified': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'new': return 'bg-purple-100 text-purple-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = {
    total: allLeads.length,
    new: allLeads.filter(l => l.status === 'new').length,
    contacted: allLeads.filter(l => l.status === 'contacted').length,
    qualified: allLeads.filter(l => l.status === 'qualified').length,
    converted: allLeads.filter(l => l.status === 'converted').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600">Track and manage your marketing leads</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Leads</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.new}</p>
          <p className="text-sm text-gray-600">New</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
          <p className="text-sm text-gray-600">Contacted</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.qualified}</p>
          <p className="text-sm text-gray-600">Qualified</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
          <p className="text-sm text-gray-600">Converted</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Lead List */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold">Leads ({filteredLeads.length})</h2>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {filteredLeads.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No leads found</p>
            ) : (
              filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                    selectedLead?.id === lead.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600">{lead.phone || lead.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{lead.source}</span>
                    {lead.value > 0 && <span>₦{lead.value.toLocaleString()}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lead Detail */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {selectedLead ? (
            <div>
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold">Lead Details</h2>
                {!selectedLead.id.startsWith('order-') && (
                  <button 
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedLead.name}</h3>
                  {selectedLead.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={14} /> {selectedLead.phone}
                    </p>
                  )}
                  {selectedLead.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={14} /> {selectedLead.email}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                      disabled={selectedLead.id.startsWith('order-')}
                      className={`w-full px-3 py-2 border rounded-lg ${getStatusColor(selectedLead.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <p className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">{selectedLead.source}</p>
                  </div>
                </div>

                {selectedLead.value > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <p className="text-xl font-bold text-green-600">₦{selectedLead.value.toLocaleString()}</p>
                  </div>
                )}

                {selectedLead.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-700">{selectedLead.notes}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Created: {new Date(selectedLead.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <Users size={48} className="mb-4 opacity-50" />
              <p>Select a lead to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Add New Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Lead name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="social">Social Media</option>
                  <option value="event">Event</option>
                  <option value="cold-call">Cold Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const MarketerReports = () => {
  const { orders, fetchOrders } = useOrderStore();
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const now = new Date();
  const filterOrders = (days) => {
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  };

  const getFilteredOrders = () => {
    switch(dateRange) {
      case 'week': return filterOrders(7);
      case 'month': return filterOrders(30);
      case 'quarter': return filterOrders(90);
      case 'year': return filterOrders(365);
      default: return orders;
    }
  };

  const filteredOrders = getFilteredOrders();
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
  const completedOrders = filteredOrders.filter(o => o.status === 'completed' || o.status === 'delivered');
  const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
  const conversionRate = filteredOrders.length > 0 
    ? (completedOrders.length / filteredOrders.length * 100).toFixed(1) 
    : 0;

  // Orders by status
  const statusBreakdown = {
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    processing: filteredOrders.filter(o => o.status === 'processing').length,
    completed: completedOrders.length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
  };

  // Daily orders for chart
  const dailyData = React.useMemo(() => {
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : dateRange === 'quarter' ? 90 : 365;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = filteredOrders.filter(o => 
        new Date(o.createdAt).toISOString().split('T')[0] === dateStr
      );
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0)
      });
    }
    return data;
  }, [filteredOrders, dateRange]);

  // Take last 7 entries for display
  const chartData = dailyData.slice(-7);
  const maxOrders = Math.max(...chartData.map(d => d.orders), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Reports</h1>
          <p className="text-gray-600">Analyze your marketing performance</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 90 Days</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
            </div>
            <Target className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">₦{avgOrderValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="text-purple-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
            </div>
            <BarChart2 className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Orders Trend (Last 7 Days)</h2>
          <div className="h-48 flex items-end gap-2">
            {chartData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary-500 rounded-t transition-all"
                  style={{ height: `${(day.orders / maxOrders) * 150}px`, minHeight: day.orders > 0 ? '10px' : '2px' }}
                />
                <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                  {day.date}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Status Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${filteredOrders.length > 0 ? (statusBreakdown.pending / filteredOrders.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="font-medium w-8">{statusBreakdown.pending}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Processing</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${filteredOrders.length > 0 ? (statusBreakdown.processing / filteredOrders.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="font-medium w-8">{statusBreakdown.processing}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${filteredOrders.length > 0 ? (statusBreakdown.completed / filteredOrders.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="font-medium w-8">{statusBreakdown.completed}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cancelled</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${filteredOrders.length > 0 ? (statusBreakdown.cancelled / filteredOrders.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="font-medium w-8">{statusBreakdown.cancelled}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.slice(0, 10).map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium">{order.orderNumber || `ORD-${order.id?.slice(-6)}`}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{order.customerName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium">₦{(order.total || order.totalAmount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==================== MARKETER FEEDBACK ====================
export const MarketerFeedback = () => {
  const { user } = useAuthStore();
  const { addFeedback, getAllFeedbacks } = useFeedbackStore();
  const [formData, setFormData] = useState({
    type: 'general',
    message: '',
    rating: 0
  });

  const myFeedbacks = getAllFeedbacks().filter(f => f.staffId === user?.id || f.email === user?.email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    addFeedback({
      name: user?.name || 'Marketer',
      email: user?.email || '',
      phone: user?.phone || '',
      type: formData.type,
      message: formData.message,
      rating: formData.rating,
      source: 'marketer-dashboard',
      staffId: user?.id
    });

    toast.success('Feedback submitted successfully');
    setFormData({ type: 'general', message: '', rating: 0 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600">Submit feedback or view your submissions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="general">General</option>
                <option value="suggestion">Suggestion</option>
                <option value="complaint">Complaint</option>
                <option value="praise">Praise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (Optional)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1"
                  >
                    <Star
                      size={24}
                      className={star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Share your feedback..."
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Send size={18} />
              Submit Feedback
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">My Submissions ({myFeedbacks.length})</h2>
          {myFeedbacks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No feedback submitted yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {myFeedbacks.map(feedback => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      feedback.type === 'complaint' ? 'bg-red-100 text-red-700' :
                      feedback.type === 'praise' ? 'bg-green-100 text-green-700' :
                      feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {feedback.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      feedback.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      feedback.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {feedback.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{feedback.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};