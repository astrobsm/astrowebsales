import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, ChevronDown } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const { products, categories, getActiveProducts, getProductsByCategory, searchProducts } = useProductStore();
  const { addItem, isInCart } = useCartStore();

  const getFilteredProducts = () => {
    let filtered = [];
    
    if (searchQuery) {
      filtered = searchProducts(searchQuery);
    } else if (selectedCategory === 'all') {
      filtered = getActiveProducts();
    } else {
      filtered = getProductsByCategory(selectedCategory);
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.prices.retail - b.prices.retail);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.prices.retail - a.prices.retail);
    }

    return filtered;
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.png" alt="Bonnesante Medicals" className="w-14 h-14 object-contain bg-white rounded-full p-2" />
            <div>
              <h1 className="text-4xl font-display font-bold">Our Products</h1>
              <p className="text-primary-100 mt-1">
                Browse our comprehensive range of premium wound care products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
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
          {filteredProducts.map((product) => (
            <div key={product.id} className="card overflow-hidden group">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-6xl">
                {product.category === 'dressings' && '🩹'}
                {product.category === 'bandages' && '🩺'}
                {product.category === 'antiseptics' && '🧴'}
                {product.category === 'tapes' && '📏'}
                {product.category === 'kits' && '🧰'}
                {product.category === 'instruments' && '✂️'}
                {product.category === 'ppe' && '🧤'}
              </div>

              <div className="p-4">
                {/* Category Badge */}
                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded mb-2">
                  {categories.find(c => c.id === product.category)?.name || product.category}
                </span>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>

                {/* SKU */}
                <p className="text-xs text-gray-500 mb-2">{product.sku}</p>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Price */}
                <p className="text-xl font-bold text-primary-600 mb-3">
                  ₦{product.prices.retail.toLocaleString()}
                  <span className="text-sm text-gray-500 font-normal"> /{product.unit}</span>
                </p>

                {/* Stock Info */}
                <div className="mb-3">
                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600 font-medium">✓ In Stock</span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">✗ Out of Stock</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                {isInCart(product.id) ? (
                  <Link
                    to="/cart"
                    className="w-full btn-secondary text-center flex items-center justify-center"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    View in Cart
                  </Link>
                ) : (
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
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

        {/* Info Box */}
        <div className="mt-12 bg-primary-50 rounded-lg p-6">
          <h3 className="font-semibold text-primary-900 mb-2">Need Help Choosing?</h3>
          <p className="text-primary-700 mb-4">
            Our team is here to help you select the right wound care products for your needs.
          </p>
          <Link to="/contact" className="text-primary-600 font-semibold hover:text-primary-700">
            Contact Us →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Products;
