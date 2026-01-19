import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Upload, X, Save, Image, Star, StarOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';
import { apiService } from '../../services/api';

const AdminProductManagement = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    subcategory: '',
    prices: {
      retail: '',
      distributor: '',
      wholesaler: ''
    },
    stock: '',
    minOrder: 1,
    specifications: {
      size: '',
      material: '',
      sterile: false,
      packSize: ''
    },
    image: null,
    isFeatured: false,
    unit: 'Piece'
  });
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: '',
      subcategory: '',
      prices: { retail: '', distributor: '', wholesaler: '' },
      stock: '',
      minOrder: 1,
      specifications: { size: '', material: '', sterile: false, packSize: '' },
      image: null,
      isFeatured: false,
      unit: 'Piece'
    });
    setImagePreview(null);
    setEditingProduct(null);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        category: product.category,
        subcategory: product.subcategory || '',
        prices: { ...product.prices },
        stock: product.stock,
        minOrder: product.minOrder || 1,
        specifications: { ...product.specifications },
        image: null,
        isFeatured: product.isFeatured || false,
        unit: product.unit || 'Piece'
      });
      setImagePreview(product.image || null);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('prices.')) {
      const priceKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        prices: { ...prev.prices, [priceKey]: value }
      }));
    } else if (name.startsWith('specifications.')) {
      const specKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: { 
          ...prev.specifications, 
          [specKey]: type === 'checkbox' ? checked : value 
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload to server
      setIsUploading(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, image: data.url }));
          toast.success('Image uploaded successfully!');
        } else {
          // Fallback to base64 if server upload fails
          setFormData(prev => ({ ...prev, image: reader.result }));
          console.log('Server upload failed, using base64');
        }
      } catch (error) {
        // Fallback to base64
        const base64Reader = new FileReader();
        base64Reader.onloadend = () => {
          setFormData(prev => ({ ...prev, image: base64Reader.result }));
        };
        base64Reader.readAsDataURL(file);
        console.log('Using base64 fallback:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      prices: {
        retail: parseFloat(formData.prices.retail) || 0,
        distributor: parseFloat(formData.prices.distributor) || 0,
        wholesaler: parseFloat(formData.prices.wholesaler) || 0
      },
      stock: parseInt(formData.stock) || 0,
      image: formData.image || imagePreview,
      isFeatured: formData.isFeatured,
      unit: formData.unit
    };

    try {
      if (editingProduct) {
        updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        addProduct(productData);
        toast.success('Product added successfully!');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const toggleFeatured = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProduct(productId, { isFeatured: !product.isFeatured });
      toast.success(product.isFeatured ? 'Removed from slideshow' : 'Added to slideshow!');
    }
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      toast.success('Product deleted successfully!');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Products Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card p-4 hover:shadow-lg transition-shadow relative">
            {product.isFeatured && (
              <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                <Star size={12} className="mr-1 fill-current" />
                Featured
              </div>
            )}
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Image size={48} className="text-gray-300" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
            <p className="text-lg font-bold text-primary-600 mb-2">
              ₦{product.prices.retail.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Stock: {product.stock}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                product.stock > 50 ? 'bg-green-100 text-green-800' :
                product.stock > 10 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {product.stock > 50 ? 'In Stock' : product.stock > 10 ? 'Low Stock' : 'Critical'}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => toggleFeatured(product.id)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  product.isFeatured 
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={product.isFeatured ? 'Remove from slideshow' : 'Add to slideshow'}
              >
                {product.isFeatured ? <Star size={16} className="fill-current" /> : <StarOff size={16} />}
              </button>
              <button 
                onClick={() => handleOpenModal(product)}
                className="flex-1 btn-secondary text-sm flex items-center justify-center"
              >
                <Edit size={16} className="mr-1" />
                Edit
              </button>
              <button 
                onClick={() => handleDelete(product.id)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Image size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-display font-semibold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image size={32} className="text-gray-300" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <span className="btn-secondary inline-flex items-center">
                        <Upload size={18} className="mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    
                    {/* Featured in Slideshow */}
                    <div className="flex items-center mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        id="isFeatured"
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-yellow-800 flex items-center">
                        <Star size={16} className="mr-1 text-yellow-600" />
                        Feature in Homepage Slideshow
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., BSM-WD-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Product description..."
                  />
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing (₦)</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retail Price *</label>
                    <input
                      type="number"
                      name="prices.retail"
                      value={formData.prices.retail}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distributor Price *</label>
                    <input
                      type="number"
                      name="prices.distributor"
                      value={formData.prices.distributor}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wholesaler Price *</label>
                    <input
                      type="number"
                      name="prices.wholesaler"
                      value={formData.prices.wholesaler}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Quantity</label>
                  <input
                    type="number"
                    name="minOrder"
                    value={formData.minOrder}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <input
                      type="text"
                      name="specifications.size"
                      value={formData.specifications.size}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 10cm x 10cm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                    <input
                      type="text"
                      name="specifications.material"
                      value={formData.specifications.material}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Cotton, Polyester"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pack Size</label>
                    <input
                      type="text"
                      name="specifications.packSize"
                      value={formData.specifications.packSize}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 50 pieces/box"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="specifications.sterile"
                      checked={formData.specifications.sterile}
                      onChange={handleChange}
                      id="sterile"
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="sterile" className="ml-2 text-sm font-medium text-gray-700">
                      Sterile Product
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center">
                  <Save size={18} className="mr-2" />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
