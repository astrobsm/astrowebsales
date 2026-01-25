// Wholesaler Dashboard Pages
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { 
  ShoppingCart, Package, Plus, Minus, Search, X, Trash2, 
  RefreshCw, CheckCircle, TrendingUp, DollarSign, Clock,
  CreditCard, MessageCircle
} from 'lucide-react';

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
  const partnerId = user?.id || user?.partnerId;
  const myOrders = orders.filter(o => 
    o.partnerId === partnerId || 
    o.customerId === partnerId ||
    o.wholesalerId === user?.id ||
    o.orderType === 'partner'
  );

  const totalValue = myOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = myOrders.filter(o => o.status === 'pending').length;
  const completedOrders = myOrders.filter(o => o.status === 'delivered').length;
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Wholesaler Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || user?.businessName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-gray-600 text-sm mb-1">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">₦{totalValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
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
              <p className="text-3xl font-bold text-gray-900">{completedOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
        {myOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Order #</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm">{order.items?.length || 0} items</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-right">₦{order.totalAmount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet. Go to "Order Products" to place your first order.</p>
        )}
      </div>
    </div>
  );
};

// Wholesaler Products Page - Order at wholesaler prices
export const WholesalerProducts = () => {
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { createOrder } = useOrderStore();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products
  const filteredProducts = products.filter(p => {
    if (!p.isActive) return false;
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(products.filter(p => p.isActive).map(p => p.category))];

  // Calculate wholesaler price (10% off retail)
  const getWholesalerPrice = (product) => {
    const retailPrice = product.prices?.retail || product.price_retail || 0;
    return Math.round(retailPrice * 0.9);
  };

  // Cart functions
  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id);
    const wholesalerPrice = getWholesalerPrice(product);
    
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        unitPrice: wholesalerPrice,
        image: product.image
      }]);
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Place order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const orderData = {
        customerId: user?.id || user?.partnerId,
        customerName: user?.name || user?.businessName || 'Wholesaler',
        customerEmail: user?.email,
        customerPhone: user?.phone,
        customerAddress: user?.address,
        customerState: user?.state,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity
        })),
        totalAmount: cartTotal,
        deliveryMode: 'pickup',
        urgencyLevel: 'routine',
        deliveryNotes: deliveryNotes,
        orderType: 'partner',
        partnerId: user?.id || user?.partnerId,
        partnerName: user?.name || user?.businessName,
        partnerType: 'wholesaler'
      };

      const order = await createOrder(orderData);
      setOrderPlaced(order);
      setCart([]);
      setShowCheckoutModal(false);
      setDeliveryNotes('');
    } catch (error) {
      alert('Failed to place order: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Order Products</h1>
        <p className="text-gray-600">Browse and order products at wholesaler prices (10% off retail)</p>
      </div>

      {/* Order Success Message */}
      {orderPlaced && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-green-900">Order Placed Successfully!</h3>
              <p className="text-sm text-green-800 mt-1">
                Order #{orderPlaced.orderNumber} has been placed. Total: ₦{orderPlaced.totalAmount?.toLocaleString()}
              </p>
              <button 
                onClick={() => setOrderPlaced(null)} 
                className="text-green-700 underline text-sm mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCheckoutModal(true)}
          className="fixed bottom-6 right-6 bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary-700 transition z-50"
        >
          <ShoppingCart size={20} />
          <span className="font-semibold">{cartItemCount} items</span>
          <span>•</span>
          <span>₦{cartTotal.toLocaleString()}</span>
        </button>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => {
          const wholesalerPrice = getWholesalerPrice(product);
          const retailPrice = product.prices?.retail || product.price_retail || 0;
          const cartItem = cart.find(item => item.productId === product.id);
          const savings = retailPrice - wholesalerPrice;
          
          return (
            <div key={product.id} className="card p-4 hover:shadow-lg transition">
              {product.image && (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
              
              <div className="mb-3">
                <p className="text-lg font-bold text-primary-600">₦{wholesalerPrice.toLocaleString()}</p>
                {savings > 0 && (
                  <p className="text-xs text-gray-500">
                    <span className="line-through">₦{retailPrice.toLocaleString()}</span>
                    <span className="text-green-600 ml-1">Save ₦{savings.toLocaleString()}</span>
                  </p>
                )}
              </div>

              {cartItem ? (
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                  <button
                    onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-semibold">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add to Order
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No products found</p>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Order</h2>
                <button onClick={() => setShowCheckoutModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.image && (
                      <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">₦{item.unitPrice.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-100"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-100"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes (Optional)</label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal ({cartItemCount} items)</span>
                  <span>₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">₦{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Partner Info */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
                <p className="font-medium text-blue-900">Ordering as: {user?.name || user?.businessName}</p>
                <p className="text-blue-800">{user?.email}</p>
                {user?.phone && <p className="text-blue-800">{user?.phone}</p>}
              </div>

              {/* Payment Details */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 mb-2">Payment Details</h4>
                    <p className="text-sm text-yellow-800 font-medium mb-2">Account Name: Bonnesante Medicals</p>
                    <div className="space-y-2 text-sm">
                      <div className="bg-white rounded p-2">
                        <p className="text-yellow-800">Bank: <span className="font-medium">Access Bank</span></p>
                        <p className="text-yellow-900 font-bold">Account: 1379643548</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-yellow-800">Bank: <span className="font-medium">Moniepoint</span></p>
                        <p className="text-yellow-900 font-bold">Account: 8259518195</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Payment Proof */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Send Payment Proof</h4>
                    <p className="text-sm text-green-800 mb-2">
                      After making payment, send your receipt to WhatsApp: <span className="font-bold">0707 679 3866</span>
                    </p>
                    <a 
                      href={`https://wa.me/2347076793866?text=Hi, I am ${user?.name || user?.businessName}. I just made payment for my order. Amount: ₦${cartTotal.toLocaleString()}. Here is my payment proof.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      <MessageCircle size={14} />
                      Open WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WholesalerOrders = () => {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const partnerId = user?.id || user?.partnerId;
  const myOrders = orders.filter(o => 
    o.partnerId === partnerId || 
    o.customerId === partnerId ||
    o.wholesalerId === user?.id ||
    o.orderType === 'partner'
  );

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">My Orders</h1>
      
      {myOrders.length > 0 ? (
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Order #</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm">{order.items?.length || 0} items</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-right">₦{order.totalAmount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No orders yet. Go to "Order Products" to place your first order.</p>
        </div>
      )}
    </div>
  );
};

// Wholesaler Performance Page
export const WholesalerPerformance = () => {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const partnerId = user?.id || user?.partnerId;
  const partnerOrders = orders.filter(o => 
    o.partnerId === partnerId || 
    o.customerId === partnerId ||
    o.wholesalerId === user?.id ||
    o.orderType === 'partner'
  );

  // Filter by time range
  const filteredOrders = partnerOrders.filter(order => {
    if (timeRange === 'all') return true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    if (timeRange === 'week') return orderDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (timeRange === 'month') return orderDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (timeRange === 'quarter') return orderDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    return true;
  });

  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Performance</h1>
        <p className="text-gray-600">Track your ordering activity and performance</p>
      </div>

      <div className="mb-6">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Time</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">₦{totalValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Avg. Order</p>
              <p className="text-3xl font-bold text-gray-900">₦{Math.round(avgOrderValue).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedOrders}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Order #</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 text-sm font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm">{order.items?.length || 0} items</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-right">₦{order.totalAmount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet. Start ordering to see your performance data.</p>
        )}
      </div>
    </div>
  );
};