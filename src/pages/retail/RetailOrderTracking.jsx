import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, Phone } from 'lucide-react';
import { useOrderStore, ORDER_STATUS } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';

const RetailOrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { getOrderById } = useOrderStore();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/retail-access');
    }
  }, [isAuthenticated, navigate]);

  const order = getOrderById(orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ORDER_STATUS.ACKNOWLEDGED]: 'bg-blue-100 text-blue-800',
      [ORDER_STATUS.PAYMENT_CONFIRMED]: 'bg-purple-100 text-purple-800',
      [ORDER_STATUS.PROCESSING]: 'bg-indigo-100 text-indigo-800',
      [ORDER_STATUS.DISPATCHED]: 'bg-orange-100 text-orange-800',
      [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
      [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
      [ORDER_STATUS.ESCALATED]: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-2xl font-display font-bold text-primary-700">
            Bonnesante Medicals
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Track Your Order</h1>

        {/* Order Header */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-1">Order #{order.orderNumber}</h2>
              <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-6">Order Timeline</h3>
          <div className="space-y-6">
            {order.timeline.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={20} className="text-primary-600" />
                  </div>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-medium text-gray-900">{event.status.toUpperCase().replace('_', ' ')}</p>
                  <p className="text-sm text-gray-600">{event.note}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distributor Contact */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Distributor Contact</h3>
          <div className="flex items-start">
            <Package className="text-primary-600 mr-3 mt-1" size={20} />
            <div>
              <p className="font-medium text-gray-900">{order.distributorName}</p>
              <p className="text-sm text-gray-600 mt-2">Need help with your order? Contact your distributor directly.</p>
            </div>
          </div>
        </div>

        <Link to="/shop" className="btn-secondary w-full text-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default RetailOrderTracking;
