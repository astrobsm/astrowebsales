import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useSyncStore } from './syncStore';
import { useProductStore } from './productStore';

export const useCartStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        items: [],
        userType: 'retail', // 'retail', 'wholesaler', 'distributor'
        
        // Set user type for pricing
        setUserType: (type) => {
          set({ userType: type });
        },
        
        // Add item to cart
        addItem: (product, quantity = 1) => {
          const { items, userType } = get();
          const price = useProductStore.getState().getPriceForUserType(product.id, userType);
          const maxQty = product.maxOrderQty || 999;
          
          const existingItemIndex = items.findIndex(item => item.productId === product.id);
          
          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...items];
            const newQty = Math.min(
              updatedItems[existingItemIndex].quantity + quantity,
              maxQty
            );
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: newQty,
              subtotal: newQty * price
            };
            set({ items: updatedItems });
          } else {
            // Add new item
            const newItem = {
              id: `cart-${Date.now()}`,
              productId: product.id,
              name: product.name,
              sku: product.sku,
              unit: product.unit,
              price,
              quantity: Math.min(quantity, maxQty),
              subtotal: Math.min(quantity, maxQty) * price,
              image: product.images?.[0]
            };
            set({ items: [...items, newItem] });
          }
          
          useSyncStore.getState().notifyStateChange('cart', { action: 'addItem' });
        },
        
        // Update item quantity
        updateItemQuantity: (itemId, quantity) => {
          const { items, userType } = get();
          
          set({
            items: items.map(item => {
              if (item.id !== itemId) return item;
              
              const product = useProductStore.getState().getProductById(item.productId);
              const validQty = Math.max(
                product?.minOrderQty || 1,
                Math.min(quantity, product?.maxOrderQty || 999)
              );
              
              return {
                ...item,
                quantity: validQty,
                subtotal: validQty * item.price
              };
            })
          });
          
          useSyncStore.getState().notifyStateChange('cart', { action: 'updateQuantity' });
        },
        
        // Remove item from cart
        removeItem: (itemId) => {
          set((state) => ({
            items: state.items.filter(item => item.id !== itemId)
          }));
          
          useSyncStore.getState().notifyStateChange('cart', { action: 'removeItem' });
        },
        
        // Clear cart
        clearCart: () => {
          set({ items: [] });
          useSyncStore.getState().notifyStateChange('cart', { action: 'clear' });
        },
        
        // Get cart total
        getCartTotal: () => {
          return get().items.reduce((total, item) => total + item.subtotal, 0);
        },
        
        // Get cart item count
        getItemCount: () => {
          return get().items.reduce((count, item) => count + item.quantity, 0);
        },
        
        // Check if product is in cart
        isInCart: (productId) => {
          return get().items.some(item => item.productId === productId);
        },
        
        // Get item by product ID
        getCartItem: (productId) => {
          return get().items.find(item => item.productId === productId);
        },
        
        // Validate cart (check stock availability)
        validateCart: () => {
          const { items } = get();
          const productStore = useProductStore.getState();
          
          const validationResults = items.map(item => {
            const product = productStore.getProductById(item.productId);
            const isAvailable = product && product.isActive && product.stock >= item.quantity;
            
            return {
              itemId: item.id,
              productId: item.productId,
              isValid: isAvailable,
              availableStock: product?.stock || 0,
              requestedQty: item.quantity
            };
          });
          
          return {
            isValid: validationResults.every(r => r.isValid),
            results: validationResults
          };
        }
      }),
      {
        name: 'astrobsm-cart'
      }
    )
  )
);
