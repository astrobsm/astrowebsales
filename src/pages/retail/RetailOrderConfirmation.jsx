import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Phone, Mail, MapPin, Calendar, ArrowRight, MessageCircle, CreditCard } from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';

const RetailOrderConfirmation = () => {
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
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-2xl font-display font-bold text-primary-700">
            Bonnesante Medicals
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for your order. We've sent the details to your distributor.
          </p>
        </div>

        {/* Order Details */}
        <div className="card p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Order #{order.orderNumber}
              </h2>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              {order.status.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          {/* Items */}
          <div className="border-t border-b py-4 mb-6">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₦{item.subtotal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600">
              ₦{order.totalAmount.toLocaleString()}
            </span>
          </div>

          {/* Distributor Info */}
          <div className="bg-primary-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-primary-900 mb-3">Your Distributor</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-primary-800">
                <Package size={16} className="mr-2" />
                <span className="font-medium">{order.distributorName}</span>
              </div>
              {order.distributorPhone && (
                <div className="flex items-center text-primary-800">
                  <Phone size={16} className="mr-2" />
                  <span>{order.distributorPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <CreditCard className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-2">Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-yellow-800">Bank:</span> <span className="font-medium">{order.distributorBankName || 'N/A'}</span></p>
                  <p><span className="text-yellow-800">Account Number:</span> <span className="font-bold text-yellow-900">{order.distributorAccountNumber || 'N/A'}</span></p>
                  <p><span className="text-yellow-800">Account Name:</span> <span className="font-medium">{order.distributorAccountName || 'N/A'}</span></p>
                </div>
                <p className="text-yellow-800 font-medium mt-2">
                  Amount to Pay: ₦{order.totalAmount?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Payment Proof */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Send Payment Proof</h4>
                <p className="text-sm text-green-800 mb-3">
                  After making payment, send your receipt/proof to our distributor on WhatsApp for order confirmation:
                </p>
                <a 
                  href={`https://wa.me/${order.distributorPhone?.replace(/[^0-9]/g, '')}?text=Hi, I just made payment for Order ${order.orderNumber}. Amount: ₦${order.totalAmount?.toLocaleString()}. Here is my payment proof.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  <MessageCircle size={16} />
                  Send Payment Proof on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">What Happens Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-yellow-700 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Make Payment</p>
                <p className="text-sm text-gray-600">Transfer ₦{order.totalAmount?.toLocaleString()} to the bank account shown above</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-green-700 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Send Payment Proof via WhatsApp</p>
                <p className="text-sm text-gray-600">Send your payment receipt/screenshot to the distributor on WhatsApp using the button above</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-primary-700 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Order Confirmation</p>
                <p className="text-sm text-gray-600">Your distributor will confirm your payment and prepare your order for delivery</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-blue-700 font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Delivery</p>
                <p className="text-sm text-gray-600">Your order will be delivered based on your selected delivery mode</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={`/track-order/${order.id}`}
            className="flex-1 btn-primary flex items-center justify-center"
          >
            Track Order
            <ArrowRight size={18} className="ml-2" />
          </Link>
          <Link
            to="/shop"
            className="flex-1 btn-secondary text-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Save Order Number */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Save your order number: <span className="font-mono font-semibold text-gray-900">{order.orderNumber}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RetailOrderConfirmation;
