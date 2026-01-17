import React from 'react';
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

export const SalesDashboard = () => {
  const stats = [
    { label: 'Orders Today', value: 8, change: '+3', icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
    { label: 'Revenue Today', value: '₦485,000', change: '+12%', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Products Sold', value: 45, change: '+8', icon: Package, color: 'bg-purple-100 text-purple-600' },
    { label: 'Customers Served', value: 12, change: '+5', icon: Users, color: 'bg-orange-100 text-orange-600' }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Lagos General Hospital', amount: '₦125,000', status: 'Completed', time: '10 mins ago' },
    { id: 'ORD-002', customer: 'Enugu Pharmacy Ltd', amount: '₦85,000', status: 'Processing', time: '25 mins ago' },
    { id: 'ORD-003', customer: 'Abuja Health Center', amount: '₦200,000', status: 'Pending', time: '1 hour ago' },
    { id: 'ORD-004', customer: 'Dr. Chinedu\'s Clinic', amount: '₦45,000', status: 'Completed', time: '2 hours ago' }
  ];

  const topProducts = [
    { name: 'Tegaderm Transparent Film', sold: 120, revenue: '₦420,000' },
    { name: 'Mepilex Border Foam', sold: 85, revenue: '₦340,000' },
    { name: 'Aquacel Ag+ Extra', sold: 65, revenue: '₦260,000' },
    { name: 'DuoDerm CGF', sold: 50, revenue: '₦175,000' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-600">Track your sales performance and orders</p>
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
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <button className="text-sm text-green-600 hover:underline">View All</button>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.amount}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock size={12} /> {order.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Top Selling Products</h2>
          </div>
          <div className="divide-y">
            {topProducts.map((product, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sold} units sold</p>
                    </div>
                  </div>
                  <p className="font-medium text-green-600">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-center transition">
            <ShoppingCart className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm font-medium">New Order</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-center transition">
            <Users className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-sm font-medium">New Customer</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 text-center transition">
            <Package className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-sm font-medium">Check Stock</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 text-center transition">
            <TrendingUp className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-sm font-medium">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export const SalesOrders = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Order management functionality coming soon...</p>
      </div>
    </div>
  );
};

export const SalesCustomers = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Customer management functionality coming soon...</p>
      </div>
    </div>
  );
};

export const SalesProducts = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Product catalog functionality coming soon...</p>
      </div>
    </div>
  );
};
