// Distributor Dashboard Pages
import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { Package, ShoppingCart, CheckCircle, Clock } from 'lucide-react';

export const DistributorDashboard = () => {
  const { user } = useAuthStore();
  const { orders, getOrdersByDistributor, getPendingOrdersForDistributor, fetchOrders } = useOrderStore();
  
  // Fetch fresh data from database on mount and refresh periodically
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const myOrders = getOrdersByDistributor(user?.id || 'dist-1');
  const pendingOrders = getPendingOrdersForDistributor(user?.id || 'dist-1');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Distributor Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{myOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{pendingOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                  <td className="py-3 text-sm">{order.customerName}</td>
                  <td className="py-3">
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-medium">₦{order.totalAmount.toLocaleString()}</td>
                  <td className="py-3">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View
                    </button>
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

export const DistributorOrders = () => {
  const { user } = useAuthStore();
  const { orders, getOrdersByDistributor, acknowledgeOrder } = useOrderStore();
  const myOrders = getOrdersByDistributor(user?.id || 'dist-1');

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                  <td className="py-3 text-sm">{order.customerName}</td>
                  <td className="py-3 text-sm">{order.customerPhone}</td>
                  <td className="py-3">
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-medium">₦{order.totalAmount.toLocaleString()}</td>
                  <td className="py-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => acknowledgeOrder(order.id)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Acknowledge
                      </button>
                    )}
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

export const DistributorInventory = () => (
  <div>
    <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Inventory Management</h1>
    <div className="card p-8 text-center">
      <Package size={48} className="mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600">Inventory management coming soon</p>
    </div>
  </div>
);

export const DistributorHistory = () => (
  <div>
    <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Order History</h1>
    <div className="card p-6">
      <p className="text-gray-600">View completed and historical orders</p>
    </div>
  </div>
);
