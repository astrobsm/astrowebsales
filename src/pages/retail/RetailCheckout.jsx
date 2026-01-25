import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Upload, CreditCard, Truck, MapPin, MessageCircle, User, Phone, Building, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore, DELIVERY_MODES, URGENCY_LEVELS } from '../../store/orderStore';
import { useStaffStore } from '../../store/staffStore';
import { NIGERIAN_STATES } from '../../store/distributorStore';
import { useNotificationStore } from '../../store/notificationStore';
import toast from 'react-hot-toast';

const RetailCheckout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getCartTotal, clearCart, recalculateCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { partners } = useStaffStore();
  const { notifyNewOrder } = useNotificationStore();

  const [deliveryMode, setDeliveryMode] = useState('pickup');
  const [urgency, setUrgency] = useState('routine');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [selectedState, setSelectedState] = useState(user?.state || '');

  // Find distributor for the selected state
  const stateDistributor = useMemo(() => {
    if (!selectedState) return null;
    
    // Find active distributor in the same state
    const distributor = partners.find(
      p => p.type === 'distributor' && 
           p.status === 'active' && 
           p.state?.toLowerCase() === selectedState.toLowerCase()
    );
    
    if (distributor) return distributor;
    
    // If no state-specific distributor, find by zone
    const stateInfo = NIGERIAN_STATES.find(s => s.name.toLowerCase() === selectedState.toLowerCase());
    if (stateInfo) {
      const zoneDistributor = partners.find(
        p => p.type === 'distributor' && 
             p.status === 'active' && 
             NIGERIAN_STATES.find(s => s.name === p.state)?.zone === stateInfo.zone
      );
      if (zoneDistributor) return zoneDistributor;
    }
    
    // Fallback to any active distributor
    return partners.find(p => p.type === 'distributor' && p.status === 'active') || null;
  }, [selectedState, partners]);

  useEffect(() => {
    if (user?.state) {
      setSelectedState(user.state);
    }
  }, [user?.state]);

  useEffect(() => {
    if (!isAuthenticated || items.length === 0) {
      navigate('/shop');
    }
  }, [isAuthenticated, items, navigate]);

  // Recalculate cart on mount to ensure correct pricing
  useEffect(() => {
    if (items.length > 0) {
      recalculateCart();
    }
  }, []);

  const subtotal = getCartTotal();
  const urgencyCharge = urgency === 'urgent' ? 500 : 0;
  const total = subtotal + urgencyCharge;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!stateDistributor) {
      toast.error('No distributor available for your state. Please contact support.');
      return;
    }

    // Normalize items to ensure both name and productName exist
    const normalizedItems = items.map(item => ({
      ...item,
      name: item.name || item.productName || 'Product',
      productName: item.productName || item.name || 'Product',
      price: item.price || item.unitPrice || 0,
      unitPrice: item.unitPrice || item.price || 0,
      unit: item.unit || 'Pcs'
    }));

    const order = createOrder({
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
      customerAddress: user.address,
      customerState: selectedState,
      distributorId: stateDistributor.id,
      distributorName: stateDistributor.companyName || stateDistributor.name,
      distributorPhone: stateDistributor.phone,
      distributorEmail: stateDistributor.email,
      distributorBankName: stateDistributor.bankName,
      distributorAccountNumber: stateDistributor.accountNumber,
      distributorAccountName: stateDistributor.accountName,
      distributorState: stateDistributor.state,
      items: normalizedItems,
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
                <div>
                  <label className="block text-gray-600 mb-1">State:</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select your state</option>
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state.name} value={state.name}>{state.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assigned Distributor Info */}
            {stateDistributor ? (
              <div className="card p-6 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-900">
                  <Building size={20} className="mr-2 text-blue-600" />
                  Your Assigned Distributor
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <User size={16} className="mr-2 text-blue-600" />
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold ml-2 text-blue-900">{stateDistributor.companyName || stateDistributor.contactName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone size={16} className="mr-2 text-blue-600" />
                    <span className="text-gray-600">Phone:</span>
                    <a href={`tel:${stateDistributor.phone}`} className="font-semibold ml-2 text-blue-700 hover:underline">
                      {stateDistributor.phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2 text-blue-600" />
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium ml-2 text-blue-800">
                      {stateDistributor.address && `${stateDistributor.address}, `}{stateDistributor.state}
                    </span>
                  </div>
                  {stateDistributor.email && (
                    <div className="flex items-center">
                      <span className="text-gray-600 ml-6">Email:</span>
                      <a href={`mailto:${stateDistributor.email}`} className="font-medium ml-2 text-blue-700 hover:underline">
                        {stateDistributor.email}
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <a 
                    href={`https://wa.me/${stateDistributor.phone?.replace(/[^0-9]/g, '')}?text=Hello, I'm ${user?.name} from ${selectedState}. I'd like to inquire about my order.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    <MessageCircle size={16} />
                    Contact Distributor on WhatsApp
                  </a>
                </div>
              </div>
            ) : selectedState ? (
              <div className="card p-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-yellow-900">No Distributor Available</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      There's currently no distributor assigned to {selectedState}. Please contact our main office for assistance.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

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
              
              {/* Distributor Bank Details */}
              {stateDistributor ? (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-primary-900 mb-2">
                    Bank Transfer Details - {stateDistributor.companyName || stateDistributor.contactName}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Bank:</span> <span className="font-bold text-primary-800">{stateDistributor.bankName || 'Not provided'}</span></p>
                    <p>
                      <span className="text-gray-600">Account Number:</span> 
                      <span className="font-bold text-primary-900 text-lg ml-2">{stateDistributor.accountNumber || 'Not provided'}</span>
                    </p>
                    <p><span className="text-gray-600">Account Name:</span> <span className="font-bold text-primary-800">{stateDistributor.accountName || 'Not provided'}</span></p>
                  </div>
                  <p className="text-xs text-primary-700 mt-3">
                    * Pay to your assigned distributor in {stateDistributor.state}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                  <p className="text-gray-600 text-sm">Please select your state to see payment details.</p>
                </div>
              )}

              {/* WhatsApp Instruction */}
              {stateDistributor && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Payment Confirmation</h4>
                      <p className="text-sm text-green-800">
                        After making payment, please send your payment proof/receipt to your distributor ({stateDistributor.companyName || stateDistributor.contactName}) on WhatsApp:
                      </p>
                      <a 
                        href={`https://wa.me/${stateDistributor.phone?.replace(/[^0-9]/g, '')}?text=Hi, I'm ${user?.name} from ${selectedState}. I just made a payment for my order. Here is my payment proof.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        <MessageCircle size={16} />
                        {stateDistributor.phone || 'Contact Distributor'}
                      </a>
                    </div>
                  </div>
                </div>
              )}

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

              <button 
                type="submit" 
                disabled={!stateDistributor || !selectedState}
                className={`w-full flex items-center justify-center mb-4 ${
                  !stateDistributor || !selectedState 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed py-3 px-6 rounded-lg font-semibold' 
                    : 'btn-primary'
                }`}
              >
                Place Order
                <ArrowRight size={18} className="ml-2" />
              </button>
              
              {(!stateDistributor || !selectedState) && (
                <p className="text-center text-sm text-orange-600 mb-4">
                  {!selectedState ? 'Please select your state to continue' : 'No distributor available for your state'}
                </p>
              )}

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
