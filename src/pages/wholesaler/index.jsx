// Wholesaler Dashboard Pages
import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { ShoppingCart } from 'lucide-react';

export const WholesalerDashboard = () => {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  
  // Fetch fresh data from database on mount and refresh periodically
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);
  
  // Filter orders for this wholesaler
  const myOrders = orders.filter(o => o.wholesalerId === user?.id);
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Wholesaler Dashboard</h1>
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
      </div>

      <div className="card p-8 text-center">
        <p className="text-gray-600 mb-4">{myOrders.length === 0 ? 'No orders yet' : `You have ${myOrders.length} orders`}</p>
        <button className="btn-primary">Place New Order</button>
      </div>
    </div>
  );
};

export const WholesalerOrders = () => (
  <div>
    <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">My Orders</h1>
    <div className="card p-8 text-center">
      <p className="text-gray-600">Order history will appear here</p>
    </div>
  </div>
);
