// Distributor Dashboard Pages
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { 
  Package, ShoppingCart, CheckCircle, Clock, AlertTriangle, 
  Plus, Minus, RefreshCw, Search, Filter, TrendingDown, 
  TrendingUp, History, Edit2, Trash2, Save, X, ArrowUpDown,
  Box, DollarSign, AlertCircle, CreditCard, MessageCircle
} from 'lucide-react';

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

export const DistributorInventory = () => {
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { 
    inventory, 
    transactions,
    summary, 
    loading, 
    fetchInventory, 
    fetchSummary,
    fetchTransactions,
    addInventoryItem, 
    restockItem, 
    adjustStock,
    deleteInventoryItem
  } = useInventoryStore();

  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [addForm, setAddForm] = useState({ productId: '', quantity: 0, reorderLevel: 10 });
  const [restockForm, setRestockForm] = useState({ quantity: 0, notes: '' });
  const [adjustForm, setAdjustForm] = useState({ adjustment: 0, notes: '' });

  const distributorId = user?.id || user?.partnerId;

  useEffect(() => {
    if (distributorId) {
      fetchInventory(distributorId);
      fetchSummary(distributorId);
      fetchTransactions(distributorId);
      fetchProducts();
    }
  }, [distributorId, fetchInventory, fetchSummary, fetchTransactions, fetchProducts]);

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.productSku?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'low') return matchesSearch && item.isLowStock && item.quantity > 0;
      if (filterStatus === 'out') return matchesSearch && item.quantity === 0;
      if (filterStatus === 'ok') return matchesSearch && !item.isLowStock && item.quantity > 0;
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = (a.productName || '').localeCompare(b.productName || '');
      if (sortBy === 'quantity') comparison = a.quantity - b.quantity;
      if (sortBy === 'value') comparison = (a.quantity * a.costPrice) - (b.quantity * b.costPrice);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get products not yet in inventory
  const availableProducts = products.filter(
    p => p.isActive && !inventory.find(i => i.productId === p.id)
  );

  const handleAddProduct = async () => {
    if (!addForm.productId || addForm.quantity < 0) return;
    
    try {
      await addInventoryItem(distributorId, {
        productId: addForm.productId,
        quantity: parseInt(addForm.quantity),
        reorderLevel: parseInt(addForm.reorderLevel) || 10,
        createdBy: user?.name || user?.email
      });
      setShowAddModal(false);
      setAddForm({ productId: '', quantity: 0, reorderLevel: 10 });
    } catch (error) {
      alert('Failed to add product: ' + error.message);
    }
  };

  const handleRestock = async () => {
    if (!selectedItem || restockForm.quantity <= 0) return;
    
    try {
      await restockItem(
        distributorId, 
        selectedItem.productId, 
        parseInt(restockForm.quantity),
        restockForm.notes,
        user?.name || user?.email
      );
      setShowRestockModal(false);
      setSelectedItem(null);
      setRestockForm({ quantity: 0, notes: '' });
    } catch (error) {
      alert('Failed to restock: ' + error.message);
    }
  };

  const handleAdjust = async () => {
    if (!selectedItem || adjustForm.adjustment === 0) return;
    
    try {
      await adjustStock(
        distributorId,
        selectedItem.productId,
        parseInt(adjustForm.adjustment),
        adjustForm.notes,
        user?.name || user?.email
      );
      setShowAdjustModal(false);
      setSelectedItem(null);
      setAdjustForm({ adjustment: 0, notes: '' });
    } catch (error) {
      alert('Failed to adjust stock: ' + error.message);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Remove ${item.productName} from inventory?`)) return;
    
    try {
      await deleteInventoryItem(distributorId, item.productId);
    } catch (error) {
      alert('Failed to delete: ' + error.message);
    }
  };

  const getStockStatusBadge = (item) => {
    if (item.quantity === 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Out of Stock</span>;
    }
    if (item.isLowStock) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Low Stock</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">In Stock</span>;
  };

  const formatCurrency = (amount) => `₦${(amount || 0).toLocaleString()}`;
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'Never';

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage your product stock levels</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchInventory(distributorId);
              fetchSummary(distributorId);
            }}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalProducts || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Box className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalUnits || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalValue)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600">{summary?.lowStockCount || 0}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'inventory' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package size={18} className="inline mr-2" />
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'history' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={18} className="inline mr-2" />
          Transaction History
        </button>
      </div>

      {activeTab === 'inventory' && (
        <>
          {/* Filters */}
          <div className="card p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="ok">In Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="quantity">Sort by Quantity</option>
                  <option value="value">Sort by Value</option>
                </select>
                <button
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <ArrowUpDown size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="card overflow-hidden">
            {loading && inventory.length === 0 ? (
              <div className="p-8 text-center">
                <RefreshCw size={32} className="mx-auto text-gray-400 animate-spin mb-4" />
                <p className="text-gray-600">Loading inventory...</p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="p-8 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {inventory.length === 0 
                    ? 'No products in inventory yet. Add products to get started!'
                    : 'No products match your search criteria.'}
                </p>
                {inventory.length === 0 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 btn-primary"
                  >
                    Add Your First Product
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Reorder Level</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Value</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Restocked</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredInventory.map((item) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.productImage ? (
                              <img 
                                src={item.productImage} 
                                alt={item.productName}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                <Package size={16} className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-xs text-gray-500">{item.productCategory}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.productSku || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${item.quantity === 0 ? 'text-red-600' : item.isLowStock ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">{item.reorderLevel}</td>
                        <td className="py-3 px-4">{getStockStatusBadge(item)}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.quantity * item.costPrice)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(item.lastRestocked)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowRestockModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Restock"
                            >
                              <TrendingUp size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowAdjustModal(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Adjust"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <History size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No transaction history yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Change</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">New Qty</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Notes</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{tx.productName}</p>
                        <p className="text-xs text-gray-500">{tx.productSku}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tx.transactionType === 'restock' ? 'bg-green-100 text-green-800' :
                          tx.transactionType === 'sale' ? 'bg-blue-100 text-blue-800' :
                          tx.transactionType === 'adjustment' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{tx.newQuantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{tx.notes || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{tx.createdBy || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Product to Inventory</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={addForm.productId}
                  onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a product...</option>
                  {availableProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={addForm.quantity}
                  onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                <input
                  type="number"
                  min="0"
                  value={addForm.reorderLevel}
                  onChange={(e) => setAddForm({ ...addForm, reorderLevel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={!addForm.productId || loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Restock Product</h2>
              <button onClick={() => { setShowRestockModal(false); setSelectedItem(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-gray-900">{selectedItem.productName}</p>
              <p className="text-sm text-gray-600">Current Stock: <span className="font-bold">{selectedItem.quantity}</span></p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  value={restockForm.quantity}
                  onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={restockForm.notes}
                  onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                  placeholder="e.g., Received from supplier"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowRestockModal(false); setSelectedItem(null); }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                disabled={restockForm.quantity <= 0 || loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Restocking...' : 'Restock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
              <button onClick={() => { setShowAdjustModal(false); setSelectedItem(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-gray-900">{selectedItem.productName}</p>
              <p className="text-sm text-gray-600">Current Stock: <span className="font-bold">{selectedItem.quantity}</span></p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment (+/-)</label>
                <input
                  type="number"
                  value={adjustForm.adjustment}
                  onChange={(e) => setAdjustForm({ ...adjustForm, adjustment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use positive number to add, negative to subtract. 
                  New total: {selectedItem.quantity + parseInt(adjustForm.adjustment || 0)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  placeholder="e.g., Inventory count correction"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAdjustModal(false); setSelectedItem(null); }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={adjustForm.adjustment === 0 || (selectedItem.quantity + parseInt(adjustForm.adjustment || 0)) < 0 || loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Adjusting...' : 'Save Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DistributorHistory = () => (
  <div>
    <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Order History</h1>
    <div className="card p-6">
      <p className="text-gray-600">View completed and historical orders</p>
    </div>
  </div>
);

// Partner Order Products - Place orders at distributor prices
export const DistributorProducts = () => {
  const { user } = useAuthStore();
  const { products, fetchProducts, getPriceForUserType } = useProductStore();
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

  // Cart functions
  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id);
    const distributorPrice = product.prices?.distributor || product.price_distributor || 0;
    
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
        unitPrice: distributorPrice,
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
        customerName: user?.name || user?.businessName || 'Partner',
        customerEmail: user?.email,
        customerPhone: user?.phone,
        customerAddress: user?.address,
        customerState: user?.state,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.productName || item.name || 'Product',
          productName: item.productName || item.name || 'Product',
          sku: item.productSku || item.sku || '',
          quantity: item.quantity,
          price: item.unitPrice,
          unitPrice: item.unitPrice,
          unit: item.unit || 'Pcs',
          subtotal: item.unitPrice * item.quantity
        })),
        totalAmount: cartTotal,
        subtotal: cartTotal,
        deliveryMode: 'pickup',
        urgencyLevel: 'routine',
        deliveryNotes: deliveryNotes,
        orderType: 'partner', // Mark as partner order for tracking
        partnerId: user?.id || user?.partnerId,
        partnerName: user?.name || user?.businessName,
        partnerType: user?.role || 'distributor'
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
        <p className="text-gray-600">Browse and order products at distributor prices</p>
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
          const distributorPrice = product.prices?.distributor || product.price_distributor || 0;
          const retailPrice = product.prices?.retail || product.price_retail || 0;
          const cartItem = cart.find(item => item.productId === product.id);
          const savings = retailPrice - distributorPrice;
          
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
                <p className="text-lg font-bold text-primary-600">₦{distributorPrice.toLocaleString()}</p>
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

// Partner Performance Dashboard
export const DistributorPerformance = () => {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Get partner orders
  const partnerId = user?.id || user?.partnerId;
  const partnerOrders = orders.filter(o => 
    o.partnerId === partnerId || 
    o.customerId === partnerId ||
    o.orderType === 'partner'
  );

  // Filter by time range
  const filteredOrders = partnerOrders.filter(order => {
    if (timeRange === 'all') return true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekAgo;
    }
    if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orderDate >= monthAgo;
    }
    if (timeRange === 'quarter') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return orderDate >= quarterAgo;
    }
    return true;
  });

  // Calculate performance metrics
  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;
  const pendingOrders = filteredOrders.filter(o => ['pending', 'acknowledged', 'processing'].includes(o.status)).length;
  const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

  // Monthly breakdown
  const monthlyData = filteredOrders.reduce((acc, order) => {
    const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) acc[month] = { count: 0, value: 0 };
    acc[month].count++;
    acc[month].value += order.totalAmount || 0;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Performance</h1>
        <p className="text-gray-600">Track your ordering activity and performance</p>
      </div>

      {/* Time Range Filter */}
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

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <p className="text-gray-600 text-sm mb-1">Avg. Order Value</p>
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
              <p className="text-xs text-gray-500">{pendingOrders} pending</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Breakdown</h2>
        {Object.keys(monthlyData).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Orders</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Total Value</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Avg. Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(monthlyData).sort((a, b) => 
                  new Date(b[0]) - new Date(a[0])
                ).map(([month, data]) => (
                  <tr key={month} className="border-b">
                    <td className="py-3 text-sm font-medium">{month}</td>
                    <td className="py-3 text-sm text-right">{data.count}</td>
                    <td className="py-3 text-sm text-right font-medium">₦{data.value.toLocaleString()}</td>
                    <td className="py-3 text-sm text-right">₦{Math.round(data.value / data.count).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No order data available</p>
        )}
      </div>

      {/* Recent Orders */}
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
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet. Start ordering to see your performance data.</p>
        )}
      </div>
    </div>
  );
};
