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

// Initial Products from Bonnesante Medicals Price List
const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Coban Bandage 4 inch',
    description: 'High-quality self-adherent cohesive bandage for wound care and compression therapy. Provides excellent support without clips or fasteners. Ideal for securing dressings, compression bandaging, and sports medicine applications.',
    category: 'bandages',
    sku: 'BSM-CB4-001',
    unit: 'Carton',
    unitsPerCarton: 12,
    prices: {
      distributor: 37500,
      retail: calculateRetailPrice(37500)
    },
    stock: 100,
    minOrderQty: 1,
    images: ['/images/products/coban-4inch.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-002',
    name: 'Coban Bandage 4 inch',
    description: 'High-quality self-adherent cohesive bandage for wound care and compression therapy. Single piece for individual use.',
    category: 'bandages',
    sku: 'BSM-CB4-002',
    unit: 'Piece',
    unitsPerCarton: 1,
    prices: {
      distributor: 3500,
      retail: calculateRetailPrice(3500)
    },
    stock: 500,
    minOrderQty: 1,
    images: ['/images/products/coban-4inch.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-003',
    name: 'Coban Bandage 6 inch',
    description: 'Premium 6-inch self-adherent cohesive bandage for larger wound areas. Excellent for compression therapy and securing dressings on larger limbs.',
    category: 'bandages',
    sku: 'BSM-CB6-003',
    unit: 'Carton',
    unitsPerCarton: 12,
    prices: {
      distributor: 48500,
      retail: calculateRetailPrice(48500)
    },
    stock: 80,
    minOrderQty: 1,
    images: ['/images/products/coban-6inch.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-004',
    name: 'Coban Bandage 6 inch',
    description: 'Premium 6-inch self-adherent cohesive bandage. Single piece for individual use.',
    category: 'bandages',
    sku: 'BSM-CB6-004',
    unit: 'Piece',
    unitsPerCarton: 1,
    prices: {
      distributor: 4500,
      retail: calculateRetailPrice(4500)
    },
    stock: 400,
    minOrderQty: 1,
    images: ['/images/products/coban-6inch.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-005',
    name: 'Hera Wound-Gel 100g',
    description: 'Advanced wound healing gel formulated with bioactive compounds to promote rapid tissue regeneration. Creates optimal moist wound environment, reduces pain, and accelerates healing for acute and chronic wounds. Suitable for burns, ulcers, surgical wounds, and traumatic injuries.',
    category: 'gels',
    sku: 'BSM-HWG100-005',
    unit: 'Carton',
    unitsPerCarton: 20,
    prices: {
      distributor: 65000,
      retail: calculateRetailPrice(65000)
    },
    stock: 50,
    minOrderQty: 1,
    images: ['/images/products/hera-gel-100g.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-006',
    name: 'Hera Wound-Gel 100g',
    description: 'Advanced wound healing gel - 100g tube. Single tube for individual patient use.',
    category: 'gels',
    sku: 'BSM-HWG100-006',
    unit: 'Tube',
    unitsPerCarton: 1,
    prices: {
      distributor: 3250,
      retail: calculateRetailPrice(3250)
    },
    stock: 300,
    minOrderQty: 1,
    images: ['/images/products/hera-gel-100g.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-007',
    name: 'Hera Wound-Gel 40g',
    description: 'Compact 40g wound healing gel for smaller wounds and convenient application. Same advanced formula as our 100g variant.',
    category: 'gels',
    sku: 'BSM-HWG40-007',
    unit: 'Carton',
    unitsPerCarton: 24,
    prices: {
      distributor: 48000,
      retail: calculateRetailPrice(48000)
    },
    stock: 60,
    minOrderQty: 1,
    images: ['/images/products/hera-gel-40g.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-008',
    name: 'Hera Wound-Gel 40g',
    description: 'Compact 40g wound healing gel - single tube for individual use.',
    category: 'gels',
    sku: 'BSM-HWG40-008',
    unit: 'Tube',
    unitsPerCarton: 1,
    prices: {
      distributor: 2000,
      retail: calculateRetailPrice(2000)
    },
    stock: 400,
    minOrderQty: 1,
    images: ['/images/products/hera-gel-40g.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-009',
    name: 'NPWT (VAC) Foam',
    description: 'Negative Pressure Wound Therapy foam dressing for advanced wound care. Used with vacuum-assisted closure systems to promote wound healing through controlled negative pressure. Ideal for complex wounds, surgical wounds, and chronic ulcers.',
    category: 'accessories',
    sku: 'BSM-NPWT-009',
    unit: 'Piece',
    unitsPerCarton: 1,
    prices: {
      distributor: 2000,
      retail: calculateRetailPrice(2000)
    },
    stock: 200,
    minOrderQty: 1,
    images: ['/images/products/npwt-foam.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-010',
    name: 'Stopain 120ml',
    description: 'Fast-acting topical pain relief solution for muscle and joint pain. Provides cooling relief and reduces inflammation around wound sites. Non-staining and quick-drying formula.',
    category: 'solutions',
    sku: 'BSM-STP-010',
    unit: 'Bottle',
    unitsPerCarton: 1,
    prices: {
      distributor: 4250,
      retail: calculateRetailPrice(4250)
    },
    stock: 150,
    minOrderQty: 1,
    images: ['/images/products/stopain.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-011',
    name: 'Wound-Care Honey Gauze (Big)',
    description: 'Premium medical-grade honey-impregnated gauze dressing with natural antibacterial properties. Manuka honey provides superior wound healing benefits including antimicrobial action, autolytic debridement, and pH optimization. Large size for extensive wounds.',
    category: 'gauze',
    sku: 'BSM-WCHGB-011',
    unit: 'Carton',
    unitsPerCarton: 12,
    prices: {
      distributor: 65000,
      retail: calculateRetailPrice(65000)
    },
    stock: 40,
    minOrderQty: 1,
    images: ['/images/products/honey-gauze-big.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-012',
    name: 'Wound-Care Honey Gauze (Big)',
    description: 'Premium medical-grade honey-impregnated gauze dressing - single packet.',
    category: 'gauze',
    sku: 'BSM-WCHGB-012',
    unit: 'Packet',
    unitsPerCarton: 1,
    prices: {
      distributor: 6000,
      retail: calculateRetailPrice(6000)
    },
    stock: 200,
    minOrderQty: 1,
    images: ['/images/products/honey-gauze-big.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-013',
    name: 'Wound-Care Honey Gauze (Small)',
    description: 'Medical-grade honey-impregnated gauze dressing with natural antibacterial properties. Compact size for smaller wounds and targeted application.',
    category: 'gauze',
    sku: 'BSM-WCHGS-013',
    unit: 'Carton',
    unitsPerCarton: 18,
    prices: {
      distributor: 61250,
      retail: calculateRetailPrice(61250)
    },
    stock: 45,
    minOrderQty: 1,
    images: ['/images/products/honey-gauze-small.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-014',
    name: 'Wound-Care Honey Gauze (Small)',
    description: 'Medical-grade honey-impregnated gauze dressing - single packet for individual use.',
    category: 'gauze',
    sku: 'BSM-WCHGS-014',
    unit: 'Packet',
    unitsPerCarton: 1,
    prices: {
      distributor: 3500,
      retail: calculateRetailPrice(3500)
    },
    stock: 300,
    minOrderQty: 1,
    images: ['/images/products/honey-gauze-small.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-015',
    name: 'Wound-Clex Solution 500ml',
    description: 'Advanced wound cleansing solution with antimicrobial properties. Gently removes debris, bacteria, and exudate from wounds while maintaining optimal healing environment. Safe for all wound types including burns, ulcers, and surgical wounds.',
    category: 'solutions',
    sku: 'BSM-WCS-015',
    unit: 'Bottle',
    unitsPerCarton: 1,
    prices: {
      distributor: 2300,
      retail: calculateRetailPrice(2300)
    },
    stock: 250,
    minOrderQty: 1,
    images: ['/images/products/wound-clex.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-016',
    name: 'Wound-Clex Solution 500ml',
    description: 'Advanced wound cleansing solution - carton pack for healthcare facilities.',
    category: 'solutions',
    sku: 'BSM-WCS-016',
    unit: 'Carton',
    unitsPerCarton: 6,
    prices: {
      distributor: 12500,
      retail: calculateRetailPrice(12500)
    },
    stock: 80,
    minOrderQty: 1,
    images: ['/images/products/wound-clex.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-017',
    name: 'Opsite Transparent Film',
    description: 'Transparent semi-permeable film dressing for wound protection. Allows wound visualization while providing waterproof barrier against bacteria and contaminants. Ideal for superficial wounds, IV sites, and secondary dressing.',
    category: 'gauze',
    sku: 'BSM-OPS-017',
    unit: 'Piece',
    unitsPerCarton: 1,
    prices: {
      distributor: 6000,
      retail: calculateRetailPrice(6000)
    },
    stock: 180,
    minOrderQty: 1,
    images: ['/images/products/opsite.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-018',
    name: 'Silicone Foot Pad',
    description: 'Medical-grade silicone foot pad for pressure relief and wound prevention. Provides cushioning and protection for diabetic feet, plantar ulcers, and high-pressure areas. Washable and reusable.',
    category: 'silicone',
    sku: 'BSM-SFP-018',
    unit: 'Pair',
    unitsPerCarton: 1,
    prices: {
      distributor: 2000,
      retail: calculateRetailPrice(2000)
    },
    stock: 120,
    minOrderQty: 1,
    images: ['/images/products/silicone-foot-pad.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-019',
    name: 'Silicone Scar Sheet',
    description: 'Premium medical silicone sheeting for scar management and prevention. Clinically proven to reduce hypertrophic scars and keloids. Self-adhesive, washable, and reusable for up to 2 weeks.',
    category: 'silicone',
    sku: 'BSM-SSS-019',
    unit: 'Block',
    unitsPerCarton: 1,
    prices: {
      distributor: 90000,
      retail: calculateRetailPrice(90000)
    },
    stock: 25,
    minOrderQty: 1,
    images: ['/images/products/scar-sheet-block.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-020',
    name: 'Silicone Scar Sheet',
    description: 'Premium medical silicone sheeting for scar management - single packet.',
    category: 'silicone',
    sku: 'BSM-SSS-020',
    unit: 'Packet',
    unitsPerCarton: 1,
    prices: {
      distributor: 10000,
      retail: calculateRetailPrice(10000)
    },
    stock: 100,
    minOrderQty: 1,
    images: ['/images/products/scar-sheet-packet.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-021',
    name: 'Skin Staples',
    description: 'Sterile surgical skin staples for wound closure. Provides fast, secure wound approximation with minimal tissue reaction. Includes staple remover in pack.',
    category: 'instruments',
    sku: 'BSM-SKS-021',
    unit: 'Piece',
    unitsPerCarton: 1,
    prices: {
      distributor: 4000,
      retail: calculateRetailPrice(4000)
    },
    stock: 150,
    minOrderQty: 1,
    images: ['/images/products/skin-staples.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-022',
    name: 'Sterile Dressing Pack',
    description: 'Complete sterile dressing pack containing all essentials for wound care: gauze, cotton wool, forceps, and drapes. Pre-assembled for convenience and sterility assurance.',
    category: 'gauze',
    sku: 'BSM-SDP-022',
    unit: 'Bag',
    unitsPerCarton: 18,
    prices: {
      distributor: 10000,
      retail: calculateRetailPrice(10000)
    },
    stock: 60,
    minOrderQty: 1,
    images: ['/images/products/dressing-pack.jpg'],
    isActive: true,
    isFeatured: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-023',
    name: 'Sterile Dressing Pack',
    description: 'Complete sterile dressing pack - single piece for individual use.',
    category: 'gauze',
    sku: 'BSM-SDP-023',
    unit: 'Piece',
    unitsPerCarton: 1,
    prices: {
      distributor: 600,
      retail: calculateRetailPrice(600)
    },
    stock: 500,
    minOrderQty: 1,
    images: ['/images/products/dressing-pack.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-024',
    name: 'Sterile Gauze-Only Pack',
    description: 'Pure sterile gauze pack for wound dressing and cleaning. High-quality cotton gauze with excellent absorbency.',
    category: 'gauze',
    sku: 'BSM-SGP-024',
    unit: 'Bag',
    unitsPerCarton: 18,
    prices: {
      distributor: 10000,
      retail: calculateRetailPrice(10000)
    },
    stock: 70,
    minOrderQty: 1,
    images: ['/images/products/gauze-pack.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  },
  {
    id: 'prod-025',
    name: 'Sterile Gauze-Only Pack',
    description: 'Pure sterile gauze pack - single piece for individual use.',
    category: 'gauze',
    sku: 'BSM-SGP-025',
    unit: 'Piece',
    unitsPerCarton: 1,
    prices: {
      distributor: 600,
      retail: calculateRetailPrice(600)
    },
    stock: 600,
    minOrderQty: 1,
    images: ['/images/products/gauze-pack.jpg'],
    isActive: true,
    isFeatured: false,
    createdAt: '2024-01-01'
  }
];

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
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
          if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
            // Use database products, merge with local
            const localProducts = get().products;
            const mergedProducts = [...dbProducts];
            
            // Add any local products not in database
            localProducts.forEach(localProduct => {
              if (!mergedProducts.find(p => p.id === localProduct.id)) {
                mergedProducts.push(localProduct);
              }
            });
            
            set({ products: mergedProducts });
            return mergedProducts;
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
