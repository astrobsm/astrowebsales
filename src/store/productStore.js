import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productsApi } from '../services/api';

// Product Categories
export const PRODUCT_CATEGORIES = [
  { id: 'bandages', name: 'Bandages', icon: '🩹' },
  { id: 'gels', name: 'Wound Gels', icon: '🧴' },
  { id: 'gauze', name: 'Gauze & Dressings', icon: '🩺' },
  { id: 'solutions', name: 'Solutions', icon: '💧' },
  { id: 'accessories', name: 'Accessories', icon: '🧰' },
  { id: 'silicone', name: 'Silicone Products', icon: '✨' },
  { id: 'instruments', name: 'Instruments & Tools', icon: '✂️' }
];

// Calculate retail price with 25% markup
const calculateRetailPrice = (distributorPrice) => Math.round(distributorPrice * 1.25);

// No hardcoded products - all products come from database
const INITIAL_PRODUCTS = [];

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [], // Start empty - products loaded from database
      categories: PRODUCT_CATEGORIES,

      // Set all products (for sync from server)
      setProducts: (productsArray) => {
        if (!Array.isArray(productsArray)) return;
        set({ products: productsArray });
        console.log(`📥 Products store updated with ${productsArray.length} products`);
      },

      // Get all active products
      getActiveProducts: () => {
        return get().products.filter((p) => p.isActive);
      },

      // Get featured products
      getFeaturedProducts: () => {
        return get().products.filter((p) => p.isActive && p.isFeatured);
      },

      // Get products by category
      getProductsByCategory: (categoryId) => {
        return get().products.filter((p) => p.isActive && p.category === categoryId);
      },

      // Get single product
      getProductById: (productId) => {
        return get().products.find((p) => p.id === productId);
      },

      // Get price based on user type (retail, wholesaler, distributor)
      getPriceForUserType: (productId, userType = 'retail') => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return 0;
        
        switch (userType) {
          case 'distributor':
            return product.prices.distributor;
          case 'wholesaler':
            // Wholesalers get 10% off retail price
            return Math.round(product.prices.retail * 0.9);
          case 'retail':
          default:
            return product.prices.retail;
        }
      },

      // Search products
      searchProducts: (query) => {
        const searchTerm = query.toLowerCase();
        return get().products.filter(
          (p) =>
            p.isActive &&
            (p.name.toLowerCase().includes(searchTerm) ||
              p.description?.toLowerCase().includes(searchTerm) ||
              p.sku?.toLowerCase().includes(searchTerm))
        );
      },

      // Fetch products from database
      fetchProducts: async () => {
        try {
          const dbProducts = await productsApi.getAll();
          if (dbProducts && Array.isArray(dbProducts)) {
            // Use only database products - no local merging
            set({ products: dbProducts });
            return dbProducts;
          }
        } catch (error) {
          console.log('Failed to fetch products from database:', error);
        }
        return get().products;
      },

      // Admin functions
      addProduct: async (product) => {
        const distributorPrice = product.prices?.distributor || product.distributorPrice || 0;
        const retailPrice = product.prices?.retail || calculateRetailPrice(distributorPrice);
        const wholesalerPrice = product.prices?.wholesaler || Math.round(distributorPrice * 1.1);
        
        const newProduct = {
          ...product,
          id: product.id || `prod-${Date.now()}`,
          prices: {
            distributor: parseFloat(distributorPrice) || 0,
            retail: parseFloat(retailPrice) || 0,
            wholesaler: parseFloat(wholesalerPrice) || 0
          },
          createdAt: new Date().toISOString()
        };
        
        // Prepare data for API - convert prices to expected format
        const apiData = {
          ...newProduct,
          distributorPrice: newProduct.prices.distributor,
          price_distributor: newProduct.prices.distributor,
          price_retail: newProduct.prices.retail,
          price_wholesaler: newProduct.prices.wholesaler
        };
        
        // Save to database
        try {
          const savedProduct = await productsApi.create(apiData);
          console.log('Product saved to database:', savedProduct);
          
          // Use the saved product from database
          if (savedProduct && savedProduct.id) {
            set((state) => ({
              products: [...state.products, savedProduct]
            }));
            return savedProduct;
          }
        } catch (error) {
          console.error('Failed to save product to database:', error);
        }
        
        // Fallback to local state only if database save failed
        set((state) => ({
          products: [...state.products, newProduct]
        }));
        return newProduct;
      },

      updateProduct: async (productId, updates) => {
        const updatedFields = { ...updates };
        
        // Handle prices - support both formats and ensure all price fields are set
        if (updates.prices) {
          const distributorPrice = parseFloat(updates.prices.distributor) || 0;
          const retailPrice = parseFloat(updates.prices.retail) || calculateRetailPrice(distributorPrice);
          const wholesalerPrice = parseFloat(updates.prices.wholesaler) || Math.round(distributorPrice * 1.1);
          
          updatedFields.prices = {
            distributor: distributorPrice,
            retail: retailPrice,
            wholesaler: wholesalerPrice
          };
          updatedFields.distributorPrice = distributorPrice;
          updatedFields.price_distributor = distributorPrice;
          updatedFields.price_retail = retailPrice;
          updatedFields.price_wholesaler = wholesalerPrice;
        } else if (updates.distributorPrice !== undefined) {
          const distributorPrice = parseFloat(updates.distributorPrice) || 0;
          updatedFields.prices = {
            distributor: distributorPrice,
            retail: calculateRetailPrice(distributorPrice),
            wholesaler: Math.round(distributorPrice * 1.1)
          };
          updatedFields.price_distributor = distributorPrice;
          updatedFields.price_retail = updatedFields.prices.retail;
          updatedFields.price_wholesaler = updatedFields.prices.wholesaler;
        }
        
        // Save to database
        try {
          await productsApi.update(productId, updatedFields);
          console.log('Product updated in database:', productId);
        } catch (error) {
          console.error('Failed to update product in database:', error);
        }
        
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId) {
              return { ...p, ...updatedFields };
            }
            return p;
          })
        }));
      },

      deleteProduct: async (productId) => {
        // Delete from database
        try {
          await productsApi.delete(productId);
          console.log('Product deleted from database:', productId);
        } catch (error) {
          console.error('Failed to delete product from database:', error);
        }
        
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, isActive: false } : p
          )
        }));
      },

      updateStock: (productId, quantity) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: p.stock + quantity } : p
          )
        }));
      },

      // Update retail markup percentage
      updateRetailMarkup: (productId, markupPercentage) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === productId) {
              return {
                ...p,
                prices: {
                  ...p.prices,
                  retail: Math.round(p.prices.distributor * (1 + markupPercentage / 100))
                }
              };
            }
            return p;
          })
        }));
      },

      // Bulk update retail markup
      updateAllRetailMarkup: (markupPercentage) => {
        set((state) => ({
          products: state.products.map((p) => ({
            ...p,
            prices: {
              ...p.prices,
              retail: Math.round(p.prices.distributor * (1 + markupPercentage / 100))
            }
          }))
        }));
      },

      // Upload all local products to server (for initial migration)
      uploadAllProducts: async () => {
        const products = get().products;
        const results = { success: 0, failed: 0, errors: [] };
        
        for (const product of products) {
          try {
            const apiData = {
              ...product,
              distributorPrice: product.prices?.distributor || 0,
              price_distributor: product.prices?.distributor || 0,
              price_retail: product.prices?.retail || 0,
              price_wholesaler: product.prices?.wholesaler || 0
            };
            
            await productsApi.create(apiData);
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push({ product: product.name, error: error.message });
          }
        }
        
        console.log(`Product upload complete: ${results.success} success, ${results.failed} failed`);
        return results;
      },

      // Clear local products and refresh from server
      refreshFromServer: async () => {
        try {
          const serverProducts = await productsApi.getAll();
          if (serverProducts && Array.isArray(serverProducts)) {
            set({ products: serverProducts });
            return { success: true, count: serverProducts.length };
          }
          return { success: false, error: 'No products returned from server' };
        } catch (error) {
          console.error('Failed to refresh products from server:', error);
          return { success: false, error: error.message };
        }
      }
    }),
    {
      name: 'product-storage'
    }
  )
);
