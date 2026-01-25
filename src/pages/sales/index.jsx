import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, DollarSign, Package, Users, TrendingUp, Clock, 
  CheckCircle, XCircle, Search, Filter, Eye, Phone, Mail, 
  MapPin, Plus, Edit2, Trash2, RefreshCw, FileText, Send,
  AlertCircle, Star, MessageCircle
} from 'lucide-react';
import { useOrderStore, ORDER_STATUS } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import toast from 'react-hot-toast';

// ==================== SALES DASHBOARD ====================
export const SalesDashboard = () => {
  const { orders, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchOrders();
    fetchProducts();
    const interval = setInterval(() => {
      fetchOrders();
      fetchProducts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchProducts]);
  
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const monthOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === ORDER_STATUS.PENDING);
  const completedOrders = orders.filter(o => o.status === ORDER_STATUS.COMPLETED || o.status === ORDER_STATUS.DELIVERED);
  
  const stats = [
    { label: 'Orders Today', value: todayOrders.length, sub: `₦${todayRevenue.toLocaleString()}`, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
    { label: 'Monthly Revenue', value: `₦${(monthRevenue/1000).toFixed(0)}K`, sub: `${monthOrders.length} orders`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Pending Orders', value: pendingOrders.length, sub: 'Needs attention', icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Completed', value: completedOrders.length, sub: `${orders.length > 0 ? Math.round((completedOrders.length/orders.length)*100) : 0}% rate`, icon: CheckCircle, color: 'bg-purple-100 text-purple-600' }
  ];

  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
      case ORDER_STATUS.DELIVERED: return 'bg-green-100 text-green-700';
      case ORDER_STATUS.PROCESSING: return 'bg-blue-100 text-blue-700';
      case ORDER_STATUS.PENDING: return 'bg-yellow-100 text-yellow-700';
      case ORDER_STATUS.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Bonnesante" className="w-12 h-12 object-contain" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Sales Staff'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.sub}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <a href="/sales/orders" className="text-sm text-primary-600 hover:underline">View All</a>
          </div>
          <div className="divide-y">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber || `ORD-${order.id?.slice(-6)}`}</p>
                      <p className="text-sm text-gray-500">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₦{(order.total || order.totalAmount || 0).toLocaleString()}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Top Products</h2>
            <a href="/sales/products" className="text-sm text-primary-600 hover:underline">View All</a>
          </div>
          <div className="divide-y">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <p className="font-medium text-green-600">₦{(product.prices?.retail || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/sales/orders" className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 text-center transition">
            <ShoppingCart className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm font-medium">View Orders</p>
          </a>
          <a href="/sales/customers" className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 text-center transition">
            <Users className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-sm font-medium">Customers</p>
          </a>
          <a href="/sales/products" className="p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 text-center transition">
            <Package className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-sm font-medium">Products</p>
          </a>
          <a href="/sales/feedback" className="p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 text-center transition">
            <MessageCircle className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-sm font-medium">Feedback</p>
          </a>
        </div>
      </div>
    </div>
  );
};

// ==================== SALES ORDERS ====================
export const SalesOrders = () => {
  const { orders, fetchOrders, updateOrderStatus } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
      case ORDER_STATUS.DELIVERED: return 'bg-green-100 text-green-700';
      case ORDER_STATUS.PROCESSING: return 'bg-blue-100 text-blue-700';
      case ORDER_STATUS.PENDING: return 'bg-yellow-100 text-yellow-700';
      case ORDER_STATUS.CANCELLED: return 'bg-red-100 text-red-700';
      case ORDER_STATUS.ESCALATED: return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>
        <button onClick={() => fetchOrders()} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value={ORDER_STATUS.PENDING}>Pending</option>
            <option value={ORDER_STATUS.PROCESSING}>Processing</option>
            <option value={ORDER_STATUS.COMPLETED}>Completed</option>
            <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
            <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold">Orders ({filteredOrders.length})</h2>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">No orders found</p>
            ) : (
              filteredOrders.map(order => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer transition hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber || `ORD-${order.id?.slice(-6)}`}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₦{(order.total || order.totalAmount || 0).toLocaleString()}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {selectedOrder ? (
            <div>
              <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold">Order Details</h2>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  disabled={loading}
                  className={`px-3 py-1 text-sm rounded-lg border ${getStatusColor(selectedOrder.status)}`}
                >
                  <option value={ORDER_STATUS.PENDING}>Pending</option>
                  <option value={ORDER_STATUS.PROCESSING}>Processing</option>
                  <option value={ORDER_STATUS.COMPLETED}>Completed</option>
                  <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                  <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
                </select>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={14} /> {selectedOrder.customerPhone || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={14} /> {selectedOrder.customerEmail || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin size={14} /> {selectedOrder.address || selectedOrder.customerAddress || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                  <div className="border rounded-lg divide-y">
                    {(selectedOrder.items || []).map((item, index) => (
                      <div key={index} className="p-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.name || item.productName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₦{((item.price || item.unitPrice || 0) * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">₦{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <Eye size={48} className="mb-4 opacity-50" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SALES CUSTOMERS ====================
export const SalesCustomers = () => {
  const { orders } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');

  const customers = React.useMemo(() => {
    const customerMap = new Map();
    orders.forEach(order => {
      const key = order.customerEmail || order.customerPhone || order.customerName;
      if (key && !customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          address: order.address || order.customerAddress,
          state: order.state || order.customerState,
          city: order.city || order.customerCity,
          orderCount: 0,
          totalSpent: 0,
          lastOrder: null
        });
      }
      if (customerMap.has(key)) {
        const customer = customerMap.get(key);
        customer.orderCount++;
        customer.totalSpent += (order.total || order.totalAmount || 0);
        if (!customer.lastOrder || new Date(order.createdAt) > new Date(customer.lastOrder)) {
          customer.lastOrder = order.createdAt;
        }
      }
    });
    return Array.from(customerMap.values());
  }, [orders]);

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600">View and manage your customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <ShoppingCart className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{orders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No customers found</td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{customer.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{customer.city}, {customer.state}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{customer.phone || '-'}</p>
                      <p className="text-xs text-gray-500">{customer.email || '-'}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      ₦{customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==================== SALES PRODUCTS ====================
export const SalesProducts = () => {
  const { products, fetchProducts } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return product.isActive !== false && matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
        <p className="text-gray-600">Browse available products for sales</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <Package size={48} className="text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <span className="text-xs text-primary-600 font-medium">{product.category}</span>
                <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
                {product.sku && <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Retail:</span>
                    <span className="font-bold text-green-600">₦{(product.prices?.retail || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Distributor:</span>
                    <span className="font-medium">₦{(product.prices?.distributor || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${(product.stock || 0) > 10 ? 'bg-green-100 text-green-700' : (product.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==================== SALES FEEDBACK ====================
export const SalesFeedback = () => {
  const { user } = useAuthStore();
  const { addFeedback, getAllFeedbacks } = useFeedbackStore();
  const [formData, setFormData] = useState({
    type: 'general',
    message: '',
    rating: 0
  });

  const myFeedbacks = getAllFeedbacks().filter(f => f.staffId === user?.id || f.email === user?.email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    addFeedback({
      name: user?.name || 'Sales Staff',
      email: user?.email || '',
      phone: user?.phone || '',
      type: formData.type,
      message: formData.message,
      rating: formData.rating,
      source: 'sales-dashboard',
      staffId: user?.id
    });

    toast.success('Feedback submitted successfully');
    setFormData({ type: 'general', message: '', rating: 0 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600">Submit feedback or view your submissions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="general">General</option>
                <option value="suggestion">Suggestion</option>
                <option value="complaint">Complaint</option>
                <option value="praise">Praise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (Optional)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1"
                  >
                    <Star
                      size={24}
                      className={star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Share your feedback..."
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Send size={18} />
              Submit Feedback
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">My Submissions ({myFeedbacks.length})</h2>
          {myFeedbacks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No feedback submitted yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {myFeedbacks.map(feedback => (
                <div key={feedback.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      feedback.type === 'complaint' ? 'bg-red-100 text-red-700' :
                      feedback.type === 'praise' ? 'bg-green-100 text-green-700' :
                      feedback.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {feedback.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      feedback.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      feedback.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {feedback.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{feedback.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
