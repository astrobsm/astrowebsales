import React, { useState, useEffect } from 'react';
import { useStaffStore, ROLES } from '../../store/staffStore';
import { useOrderStore } from '../../store/orderStore';

const AdminAnalytics = () => {
  const { 
    getAnalytics, 
    staff, 
    partners, 
    activityLogs,
    getActivityLogs 
  } = useStaffStore();
  
  const [analytics, setAnalytics] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [activityFilter, setActivityFilter] = useState('all');

  useEffect(() => {
    setAnalytics(getAnalytics());
  }, [staff, partners, activityLogs]);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    marketer: 'bg-blue-100 text-blue-800',
    sales: 'bg-green-100 text-green-800',
    cco: 'bg-yellow-100 text-yellow-800',
    distributor: 'bg-orange-100 text-orange-800',
    wholesaler: 'bg-pink-100 text-pink-800'
  };

  const activityIcons = {
    login: '🔐',
    login_failed: '❌',
    password_changed: '🔑',
    order_created: '📦',
    order_updated: '✏️',
    product_viewed: '👁️',
    customer_contacted: '📞',
    report_generated: '📊'
  };

  // Filter logs based on selected filters
  const getFilteredLogs = () => {
    let logs = activityLogs;
    
    if (selectedRole !== 'all') {
      const roleStaffIds = staff.filter(s => s.role === selectedRole).map(s => s.id);
      logs = logs.filter(l => roleStaffIds.includes(l.userId));
    }

    if (activityFilter !== 'all') {
      logs = logs.filter(l => l.action === activityFilter);
    }

    // Date range filter
    const now = new Date();
    let startDate;
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      logs = logs.filter(l => new Date(l.timestamp) >= startDate);
    }

    return logs.slice(0, 100);
  };

  const filteredLogs = getFilteredLogs();

  const getStaffName = (userId) => {
    const user = staff.find(s => s.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getStaffRole = (userId) => {
    const user = staff.find(s => s.id === userId);
    return user ? user.role : 'unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor staff, partners, and customer activity</p>
        </div>
        <button 
          onClick={() => setAnalytics(getAnalytics())}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalStaff}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {Object.entries(analytics.staffByRole).map(([role, count]) => (
              <span key={role} className={`text-xs px-2 py-1 rounded-full ${roleColors[role] || 'bg-gray-100'}`}>
                {role}: {count}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Partners</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalPartners}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
              Distributors: {analytics.partnersByType.distributor || 0}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-800">
              Wholesalers: {analytics.partnersByType.wholesaler || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Today</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.activeToday}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Staff who logged in today</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Logins This Week</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.loginsThisWeek}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Total login events</p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Daily Activity (Last 7 Days)</h2>
        <div className="flex items-end gap-2 h-40">
          {analytics.dailyActivity.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                style={{ 
                  height: `${Math.max(4, (day.count / Math.max(...analytics.dailyActivity.map(d => d.count), 1)) * 120)}px` 
                }}
                title={`${day.count} activities`}
              ></div>
              <span className="text-xs text-gray-500 mt-2 whitespace-nowrap">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role Filter</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Roles</option>
            {Object.keys(ROLES).map(role => (
              <option key={role} value={role}>{ROLES[role].name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Activities</option>
            <option value="login">Logins</option>
            <option value="login_failed">Failed Logins</option>
            <option value="password_changed">Password Changes</option>
            <option value="order_created">Orders Created</option>
            <option value="order_updated">Orders Updated</option>
          </select>
        </div>
      </div>

      {/* Staff Performance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Top Active Staff</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topActiveStaff.map((staffMember) => (
                <tr key={staffMember.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {staffMember.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                        <div className="text-sm text-gray-500">@{staffMember.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${roleColors[staffMember.role]}`}>
                      {ROLES[staffMember.role]?.name || staffMember.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      staffMember.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {staffMember.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {staffMember.activityCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staffMember.lastLogin 
                      ? new Date(staffMember.lastLogin).toLocaleString('en-NG')
                      : 'Never'
                    }
                  </td>
                </tr>
              ))}
              {analytics.topActiveStaff.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No staff activity recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Activity Log</h2>
          <span className="text-sm text-gray-500">
            Showing {filteredLogs.length} of {activityLogs.length} activities
          </span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <div key={log.id} className="px-6 py-3 hover:bg-gray-50 flex items-center gap-4">
                <div className="text-2xl">
                  {activityIcons[log.action] || '📝'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{getStaffName(log.userId)}</span>
                    {' '}
                    <span className={`text-xs px-1 rounded ${roleColors[getStaffRole(log.userId)]}`}>
                      {getStaffRole(log.userId)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">{log.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleDateString('en-NG')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleTimeString('en-NG')}
                  </p>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No activity logs match your filters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Activity Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.activityBreakdown).map(([action, count]) => (
            <div key={action} className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-2xl">{activityIcons[action] || '📝'}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500 capitalize">{action.replace(/_/g, ' ')}</p>
            </div>
          ))}
          {Object.keys(analytics.activityBreakdown).length === 0 && (
            <p className="col-span-4 text-center text-gray-500">No activity data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
