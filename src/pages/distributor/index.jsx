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
  Box, DollarSign, AlertCircle
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
