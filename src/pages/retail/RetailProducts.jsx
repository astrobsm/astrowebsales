import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Filter, ChevronDown, Plus, Minus, Check } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const RetailProducts = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { products, categories, getActiveProducts, getProductsByCategory, searchProducts } = useProductStore();
  const { addItem, updateItemQuantity, isInCart, getCartItem } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please enter your details to start shopping');
      navigate('/retail-access');
    }
  }, [isAuthenticated, navigate]);

  const getFilteredProducts = () => {
    let filtered = [];
    
    if (searchQuery) {
      filtered = searchProducts(searchQuery);
    } else if (selectedCategory === 'all') {
      filtered = getActiveProducts();
    } else {
      filtered = getProductsByCategory(selectedCategory);
    }

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.prices.retail - b.prices.retail);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.prices.retail - a.prices.retail);
    }

    return filtered;
  };

  const handleAddToCart = (product, quantity = 1) => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleUpdateQuantity = (product, change) => {
    const cartItem = getCartItem(product.id);
    if (cartItem) {
      const newQty = cartItem.quantity + change;
      const minQty = product.minOrderQty || 1;
      const maxQty = product.maxOrderQty || 999;
      if (newQty >= minQty && newQty <= maxQty) {
        updateItemQuantity(cartItem.id, newQty);
      }
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Info */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/" className="text-2xl font-display font-bold text-primary-700">
                Bonnesante Medicals
              </Link>
              <p className="text-sm text-gray-600">Shopping as: {user?.name}</p>
            </div>
            <Link to="/cart" className="btn-primary flex items-center">
              <ShoppingCart size={20} className="mr-2" />
              View Cart
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-primary-900">
            <strong>Welcome {user?.name}!</strong> You're connected to{' '}
            <strong>{user?.assignedDistributor?.name}</strong> in {user?.state}.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const cartItem = getCartItem(product.id);
            const inCart = isInCart(product.id);

            return (
              <div key={product.id} className="card overflow-hidden group">
                <div className="aspect-square bg-gray-100 flex items-center justify-center text-6xl relative">
                  {inCart && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <Check size={16} />
                    </div>
                  )}
                  {product.category === 'dressings' && '🩹'}
                  {product.category === 'bandages' && '🩺'}
                  {product.category === 'antiseptics' && '🧴'}
                  {product.category === 'tapes' && '📏'}
                  {product.category === 'kits' && '🧰'}
                  {product.category === 'instruments' && '✂️'}
                  {product.category === 'ppe' && '🧤'}
                </div>

                <div className="p-4">
                  <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded mb-2">
                    {categories.find(c => c.id === product.category)?.name}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                  <p className="text-xl font-bold text-primary-600 mb-3">
                    ₦{product.prices.retail.toLocaleString()}
                    <span className="text-sm text-gray-500 font-normal"> /{product.unit}</span>
                  </p>

                  {inCart ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <button
                          onClick={() => handleUpdateQuantity(product, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-300 hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-semibold">{cartItem.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(product, 1)}
                          disabled={cartItem.quantity >= product.maxOrderQty}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <Link to="/cart" className="w-full btn-secondary text-center block">
                        View in Cart
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={18} className="inline mr-2" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailProducts;
