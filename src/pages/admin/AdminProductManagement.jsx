import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { Plus, Edit, Trash2, Search, Upload, X, Save, Image, Star, StarOff, Download, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';

// Product Management Component with Image Upload
const AdminProductManagement = () => {
  // Use shallow selectors to prevent re-renders during form input
  const products = useProductStore(state => state.products);
  const categories = useProductStore(state => state.categories);
  const addProduct = useProductStore(state => state.addProduct);
  const updateProduct = useProductStore(state => state.updateProduct);
  const deleteProduct = useProductStore(state => state.deleteProduct);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadResults, setBulkUploadResults] = useState(null);
  const bulkFileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    indications: '',
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
    unitsPerCarton: 1,
    specifications: {
      size: '',
      material: '',
      sterile: false,
      packSize: ''
    },
    image: null,
    images: [],
    isFeatured: false,
    isActive: true,
    unit: 'Piece'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      indications: '',
      sku: '',
      category: '',
      subcategory: '',
      prices: { retail: '', distributor: '', wholesaler: '' },
      stock: '',
      minOrder: 1,
      unitsPerCarton: 1,
      specifications: { size: '', material: '', sterile: false, packSize: '' },
      image: null,
      images: [],
      isFeatured: false,
      isActive: true,
      unit: 'Piece'
    });
    setImagePreview(null);
    setAdditionalImages([]);
    setEditingProduct(null);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        indications: product.indications || '',
        sku: product.sku,
        category: product.category,
        subcategory: product.subcategory || '',
        prices: { ...product.prices },
        stock: product.stock,
        minOrder: product.minOrder || 1,
        unitsPerCarton: product.unitsPerCarton || 1,
        specifications: { ...(product.specifications || {}) },
        image: null,
        images: product.images || [],
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        unit: product.unit || 'Piece'
      });
      setImagePreview(product.image || null);
      setAdditionalImages(product.images || []);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Memoized change handler to prevent focus loss
  const handleChange = useCallback((e) => {
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
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  }, []);

  // Download CSV template for bulk product upload
  const downloadProductTemplate = useCallback(() => {
    const headers = ['name', 'sku', 'category', 'description', 'indications', 'unit', 'unitsPerCarton', 'priceRetail', 'priceDistributor', 'priceWholesaler', 'stock', 'minOrder', 'isFeatured', 'isActive'];
    const sampleData = [
      ['Coban Bandage 4 inch', 'BSM-CB4-001', 'Bandages', 'High-quality self-adherent bandage', 'For wound care and compression therapy', 'Carton', '12', '46875', '37500', '35000', '100', '1', 'true', 'true'],
      ['Hera Wound-Gel 100g', 'BSM-HWG-002', 'Wound Gels', 'Advanced wound healing gel', 'For burns, ulcers, and surgical wounds', 'Tube', '1', '4063', '3250', '3000', '300', '1', 'false', 'true'],
      ['Sterile Dressing Pack', 'BSM-SDP-003', 'Gauze & Dressings', 'Complete sterile dressing pack', 'For wound dressing changes', 'Piece', '1', '750', '600', '550', '500', '1', 'false', 'true']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'products_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Template downloaded! Fill it out and use Bulk Upload to import products.');
  }, []);

  // Parse CSV content
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
    return rows;
  };

  // Handle bulk CSV upload
  const handleBulkUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text);
        
        if (rows.length === 0) {
          toast.error('No valid data found in CSV');
          return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (const row of rows) {
          try {
            // Validate required fields
            if (!row.name || !row.sku) {
              errors.push(`Row missing name or SKU: ${row.name || 'unnamed'}`);
              errorCount++;
              continue;
            }
            
            // Check for duplicate SKU
            const existingProduct = products.find(p => p.sku === row.sku);
            if (existingProduct) {
              errors.push(`SKU already exists: ${row.sku}`);
              errorCount++;
              continue;
            }
            
            const productData = {
              name: row.name,
              sku: row.sku,
              category: row.category || 'Accessories',
              description: row.description || '',
              indications: row.indications || '',
              unit: row.unit || 'Piece',
              unitsPerCarton: parseInt(row.unitsPerCarton) || 1,
              prices: {
                retail: parseFloat(row.priceRetail) || 0,
                distributor: parseFloat(row.priceDistributor) || 0,
                wholesaler: parseFloat(row.priceWholesaler) || 0
              },
              stock: parseInt(row.stock) || 0,
              minOrder: parseInt(row.minOrder) || 1,
              isFeatured: row.isFeatured === 'true' || row.isFeatured === '1',
              isActive: row.isActive !== 'false' && row.isActive !== '0',
              image: null,
              images: []
            };
            
            await addProduct(productData);
            successCount++;
          } catch (err) {
            errors.push(`Error adding ${row.name}: ${err.message}`);
            errorCount++;
          }
        }
        
        setBulkUploadResults({ successCount, errorCount, errors, total: rows.length });
        setShowBulkUploadModal(true);
        
        if (successCount > 0) {
          toast.success(`Successfully added ${successCount} product(s)!`);
        }
        if (errorCount > 0) {
          toast.error(`${errorCount} product(s) failed to import`);
        }
      } catch (error) {
        toast.error('Failed to parse CSV file');
        console.error('CSV parse error:', error);
      }
    };
    
    reader.readAsText(file);
    // Reset file input
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = '';
    }
  }, [addProduct, products]);

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

  // Handle additional product images upload
  const handleAdditionalImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit to 5 additional images
    if (additionalImages.length + files.length > 5) {
      toast.error('Maximum 5 additional images allowed');
      return;
    }
    
    setIsUploading(true);
    const newImages = [];
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }
      
      try {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload
        });
        
        if (response.ok) {
          const data = await response.json();
          newImages.push(data.url);
        } else {
          // Fallback to base64
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
          newImages.push(base64);
        }
      } catch (error) {
        // Fallback to base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        newImages.push(base64);
      }
    }
    
    setAdditionalImages(prev => [...prev, ...newImages]);
    setIsUploading(false);
    if (newImages.length > 0) {
      toast.success(`${newImages.length} image(s) uploaded!`);
    }
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
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
      minOrder: parseInt(formData.minOrder) || 1,
      unitsPerCarton: parseInt(formData.unitsPerCarton) || 1,
      image: formData.image || imagePreview,
      images: additionalImages,
      indications: formData.indications,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
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
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={downloadProductTemplate} 
            className="btn-secondary flex items-center text-sm"
            title="Download CSV template for bulk product upload"
          >
            <Download size={18} className="mr-1" />
            Template
          </button>
          <label className="btn-secondary flex items-center text-sm cursor-pointer" title="Upload CSV file to add multiple products">
            <Upload size={18} className="mr-1" />
            Bulk Upload
            <input
              ref={bulkFileInputRef}
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-display font-semibold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
              {/* Image Upload Section - FIRST */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Image size={20} className="mr-2 text-primary-600" />
                  Product Images
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center overflow-hidden relative border-2 border-dashed border-gray-300">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Image size={32} className="text-gray-300 mx-auto" />
                        <span className="text-xs text-gray-400 mt-1">No image</span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-block">
                      <span className="bg-primary-600 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-primary-700 transition-colors">
                        <Upload size={18} className="mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload Main Image'}
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
                    <p className="text-xs text-blue-600 mt-1 italic">💡 Image is optional - you can add it later by editing the product.</p>
                    
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
                        Featured
                      </label>
                    </div>
                    
                    {/* Active Toggle */}
                    <div className="flex items-center mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        id="isActive"
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm font-medium text-green-800">
                        Active
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Additional Images */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (up to 5)</label>
                  <div className="flex flex-wrap gap-2">
                    {additionalImages.map((img, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img src={img} alt={`Additional ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {additionalImages.length < 5 && (
                      <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalImagesChange}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <Plus size={24} className="text-gray-400" />
                      </label>
                    )}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indications for Use
                    <span className="text-gray-400 font-normal ml-2">(Shown to customers)</span>
                  </label>
                  <textarea
                    name="indications"
                    value={formData.indications}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="e.g., For treatment of minor cuts, wounds, burns. Apply directly to affected area. Consult a doctor if symptoms persist..."
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
              <div>
                <h3 className="text-lg font-semibold mb-4">Inventory & Units</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Type *</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="Piece">Piece</option>
                      <option value="Bottle">Bottle</option>
                      <option value="Box">Box</option>
                      <option value="Pack">Pack</option>
                      <option value="Roll">Roll</option>
                      <option value="Tube">Tube</option>
                      <option value="Sachet">Sachet</option>
                      <option value="Kit">Kit</option>
                      <option value="Set">Set</option>
                      <option value="Carton">Carton</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Units per Carton</label>
                    <input
                      type="number"
                      name="unitsPerCarton"
                      value={formData.unitsPerCarton}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Qty</label>
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

      {/* Bulk Upload Results Modal */}
      {showBulkUploadModal && bulkUploadResults && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBulkUploadModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-display font-semibold">Bulk Upload Results</h2>
              <button onClick={() => setShowBulkUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{bulkUploadResults.successCount}</p>
                  <p className="text-sm text-green-700">Successfully Added</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-red-600">{bulkUploadResults.errorCount}</p>
                  <p className="text-sm text-red-700">Failed</p>
                </div>
              </div>
              
              {bulkUploadResults.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Errors:</h3>
                  <ul className="bg-red-50 p-3 rounded-lg text-sm text-red-700 max-h-40 overflow-y-auto">
                    {bulkUploadResults.errors.map((error, index) => (
                      <li key={index} className="mb-1">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowBulkUploadModal(false)} 
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
