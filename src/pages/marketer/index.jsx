import React, { useEffect } from 'react';
import { Users, Target, TrendingUp, Calendar, Phone, FileText } from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';

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
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Lead management functionality coming soon...</p>
      </div>
    </div>
  );
};

export const MarketerReports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Marketing Reports</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Reports functionality coming soon...</p>
      </div>
    </div>
  );
};
