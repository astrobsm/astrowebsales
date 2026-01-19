import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, ChevronDown, X, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const getAllProductImages = (product) => {
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    }
    return images;
  };

  const nextImage = () => {
    const images = getAllProductImages(selectedProduct);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getAllProductImages(selectedProduct);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
              <div 
                className="aspect-square bg-gray-100 flex items-center justify-center relative cursor-pointer overflow-hidden"
                onClick={() => openProductDetails(product)}
              >
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-6xl">
                    {product.category === 'dressings' && '🩹'}
                    {product.category === 'bandages' && '🩺'}
                    {product.category === 'antiseptics' && '🧴'}
                    {product.category === 'tapes' && '📏'}
                    {product.category === 'kits' && '🧰'}
                    {product.category === 'instruments' && '✂️'}
                    {product.category === 'ppe' && '🧤'}
                    {!['dressings', 'bandages', 'antiseptics', 'tapes', 'kits', 'instruments', 'ppe'].includes(product.category) && '📦'}
                  </div>
                )}
                {/* View Details overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-primary-600 px-3 py-1 rounded-full text-sm">
                    <Info size={14} className="mr-1" /> View Details
                  </span>
                </div>
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeProductDetails}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
              <button onClick={closeProductDetails} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                    {getAllProductImages(selectedProduct).length > 0 ? (
                      <>
                        <img 
                          src={getAllProductImages(selectedProduct)[currentImageIndex]} 
                          alt={selectedProduct.name}
                          className="w-full h-full object-contain"
                        />
                        {getAllProductImages(selectedProduct).length > 1 && (
                          <>
                            <button 
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <button 
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                            >
                              <ChevronRight size={24} />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {getAllProductImages(selectedProduct).length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {getAllProductImages(selectedProduct).map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                            currentImageIndex === index ? 'border-primary-500' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div>
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">
                    {categories.find(c => c.id === selectedProduct.category)?.name || selectedProduct.category}
                  </span>
                  
                  <p className="text-sm text-gray-500 mb-2">SKU: {selectedProduct.sku}</p>
                  
                  <p className="text-3xl font-bold text-primary-600 mb-4">
                    ₦{selectedProduct.prices.retail.toLocaleString()}
                    <span className="text-lg text-gray-500 font-normal"> /{selectedProduct.unit}</span>
                  </p>
                  
                  {selectedProduct.description && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{selectedProduct.description}</p>
                    </div>
                  )}
                  
                  {selectedProduct.indications && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Info size={18} className="mr-2" />
                        Indications for Use
                      </h3>
                      <p className="text-blue-800 text-sm whitespace-pre-line">{selectedProduct.indications}</p>
                    </div>
                  )}
                  
                  {selectedProduct.specifications && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {selectedProduct.specifications.size && (
                          <div><span className="text-gray-500">Size:</span> {selectedProduct.specifications.size}</div>
                        )}
                        {selectedProduct.specifications.material && (
                          <div><span className="text-gray-500">Material:</span> {selectedProduct.specifications.material}</div>
                        )}
                        {selectedProduct.specifications.packSize && (
                          <div><span className="text-gray-500">Pack Size:</span> {selectedProduct.specifications.packSize}</div>
                        )}
                        {selectedProduct.specifications.sterile && (
                          <div><span className="text-green-600 font-medium">✓ Sterile</span></div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                    <span className={`px-3 py-1 rounded-full ${
                      selectedProduct.stock > 50 ? 'bg-green-100 text-green-700' :
                      selectedProduct.stock > 10 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  
                  <Link
                    to="/retail-access"
                    className="w-full btn-primary py-3 text-lg text-center block"
                  >
                    <ShoppingCart size={20} className="inline mr-2" />
                    Start Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
