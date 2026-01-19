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
        const newProduct = {
          ...product,
          id: `prod-${Date.now()}`,
          prices: {
            distributor: product.distributorPrice,
            retail: calculateRetailPrice(product.distributorPrice)
          },
          createdAt: new Date().toISOString()
        };
        
        // Save to database
        try {
          await productsApi.create(newProduct);
          console.log('Product saved to database:', newProduct.id);
        } catch (error) {
          console.error('Failed to save product to database:', error);
        }
        
        set((state) => ({
          products: [...state.products, newProduct]
        }));
        return newProduct;
      },

      updateProduct: async (productId, updates) => {
        const updatedFields = { ...updates };
        
        // Recalculate retail price if distributor price changed
        if (updates.distributorPrice !== undefined) {
          updatedFields.prices = {
            distributor: updates.distributorPrice,
            retail: calculateRetailPrice(updates.distributorPrice)
          };
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

      deleteProduct: (productId) => {
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
      }
    }),
    {
      name: 'product-storage'
    }
  )
);
