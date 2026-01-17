import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { orders, getOrderStats } = useOrderStore();
  const { products } = useProductStore();

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
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
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
                  <td className="py-3 text-sm font-medium">₦{order.totalAmount.toLocaleString()}</td>
                  <td className="py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
