import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Upload, CreditCard, Truck, MapPin } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore, DELIVERY_MODES, URGENCY_LEVELS } from '../../store/orderStore';
import { useNotificationStore } from '../../store/notificationStore';
import toast from 'react-hot-toast';

const RetailCheckout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getCartTotal, clearCart, recalculateCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { notifyNewOrder } = useNotificationStore();

  const [deliveryMode, setDeliveryMode] = useState('pickup');
  const [urgency, setUrgency] = useState('routine');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);

  React.useEffect(() => {
    if (!isAuthenticated || items.length === 0) {
      navigate('/shop');
    }
  }, [isAuthenticated, items, navigate]);

  // Recalculate cart on mount to ensure correct pricing
  React.useEffect(() => {
    if (items.length > 0) {
      recalculateCart();
    }
  }, []);

  const subtotal = getCartTotal();
  const urgencyCharge = urgency === 'urgent' ? 500 : 0;
  const total = subtotal + urgencyCharge;

  const handleSubmit = (e) => {
    e.preventDefault();

    const order = createOrder({
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
      customerAddress: user.address,
      customerState: user.state,
      distributorId: user.assignedDistributor.id,
      distributorName: user.assignedDistributor.name,
      items: items,
      subtotal,
      deliveryMode,
      urgency,
      urgencyCharge,
      totalAmount: total,
      paymentMethod,
      notes
    });

    // Notify distributor
    notifyNewOrder(order, 'distributor');

    clearCart();
    toast.success('Order placed successfully!');
    navigate(`/order-confirmation/${order.id}`);
  };

  const selectedDelivery = DELIVERY_MODES.find(m => m.id === deliveryMode);
  const selectedUrgency = URGENCY_LEVELS.find(u => u.id === urgency);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="text-2xl font-display font-bold text-primary-700">
            Bonnesante Medicals
          </Link>
          <p className="text-sm text-gray-600">Checkout</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-primary-600" />
                Delivery Information
              </h3>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-600">Name:</span> <span className="font-medium">{user?.name}</span></div>
                <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{user?.phone}</span></div>
                <div><span className="text-gray-600">Address:</span> <span className="font-medium">{user?.address}</span></div>
                <div><span className="text-gray-600">State:</span> <span className="font-medium">{user?.state}</span></div>
              </div>
            </div>

            {/* Delivery Mode */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck size={20} className="mr-2 text-primary-600" />
                Delivery Method
              </h3>
              <div className="space-y-3">
                {DELIVERY_MODES.map((mode) => (
                  <label key={mode.id} className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    deliveryMode === mode.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryMode"
                      value={mode.id}
                      checked={deliveryMode === mode.id}
                      onChange={(e) => setDeliveryMode(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{mode.name}</p>
                      <p className="text-sm text-gray-600">{mode.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Delivery Urgency</h3>
              <div className="space-y-3">
                {URGENCY_LEVELS.map((level) => (
                  <label key={level.id} className={`flex items-start justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    urgency === level.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="urgency"
                        value={level.id}
                        checked={urgency === level.id}
                        onChange={(e) => setUrgency(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{level.name}</p>
                        <p className="text-sm text-gray-600">{level.description}</p>
                      </div>
                    </div>
                    {level.surcharge && (
                      <span className="font-semibold text-primary-600">+₦{level.surcharge}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard size={20} className="mr-2 text-primary-600" />
                Payment Information
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  Please transfer to: {user?.assignedDistributor?.bankName} - 
                  {user?.assignedDistributor?.accountNumber} ({user?.assignedDistributor?.accountName})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Any special instructions or requests..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({items.length})</span>
                  <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                {urgencyCharge > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Urgent Delivery</span>
                    <span className="font-medium">+₦{urgencyCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary flex items-center justify-center mb-4">
                Place Order
                <ArrowRight size={18} className="ml-2" />
              </button>

              <Link to="/cart" className="block text-center text-gray-600 hover:text-gray-900 text-sm">
                ← Back to Cart
              </Link>

              <div className="mt-6 pt-6 border-t text-xs text-gray-500">
                <p>By placing this order, you agree to our terms and conditions.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetailCheckout;
