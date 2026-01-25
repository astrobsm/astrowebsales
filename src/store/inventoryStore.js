import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useInventoryStore = create(
  persist(
    (set, get) => ({
      inventory: [],
      transactions: [],
      summary: null,
      loading: false,
      error: null,
      lastFetched: null,

      // Fetch inventory for a distributor
      fetchInventory: async (distributorId) => {
        if (!distributorId) return;
        
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/api/distributor-inventory/${distributorId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch inventory');
          }
          
          const data = await response.json();
          set({ 
            inventory: data, 
            loading: false,
            lastFetched: new Date().toISOString()
          });
          
          return data;
        } catch (error) {
          console.error('Fetch inventory error:', error);
          set({ loading: false, error: error.message });
          return [];
        }
      },

      // Fetch inventory summary
      fetchSummary: async (distributorId) => {
        if (!distributorId) return;
        
        try {
          const response = await fetch(`${API_BASE}/api/distributor-inventory/${distributorId}/summary`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch summary');
          }
          
          const data = await response.json();
          set({ summary: data });
          
          return data;
        } catch (error) {
          console.error('Fetch summary error:', error);
          return null;
        }
      },

      // Fetch transactions
      fetchTransactions: async (distributorId, limit = 50) => {
        if (!distributorId) return;
        
        try {
          const response = await fetch(
            `${API_BASE}/api/distributor-inventory/${distributorId}/transactions?limit=${limit}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch transactions');
          }
          
          const data = await response.json();
          set({ transactions: data });
          
          return data;
        } catch (error) {
          console.error('Fetch transactions error:', error);
          return [];
        }
      },

      // Add or update inventory item
      addInventoryItem: async (distributorId, item) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/api/distributor-inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              distributorId,
              productId: item.productId,
              quantity: item.quantity,
              reorderLevel: item.reorderLevel || 10,
              costPrice: item.costPrice,
              notes: item.notes,
              createdBy: item.createdBy
            })
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add inventory');
          }
          
          const result = await response.json();
          
          // Refresh inventory
          await get().fetchInventory(distributorId);
          await get().fetchSummary(distributorId);
          
          set({ loading: false });
          return result;
        } catch (error) {
          console.error('Add inventory error:', error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // Update inventory quantity
      updateQuantity: async (distributorId, productId, data) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(
            `${API_BASE}/api/distributor-inventory/${distributorId}/${productId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            }
          );
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update inventory');
          }
          
          const result = await response.json();
          
          // Update local state
          set(state => ({
            inventory: state.inventory.map(item =>
              item.productId === productId
                ? { 
                    ...item, 
                    quantity: result.newQuantity,
                    isLowStock: result.newQuantity <= item.reorderLevel
                  }
                : item
            ),
            loading: false
          }));
          
          // Refresh summary
          await get().fetchSummary(distributorId);
          
          return result;
        } catch (error) {
          console.error('Update quantity error:', error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // Restock item
      restockItem: async (distributorId, productId, quantity, notes, createdBy) => {
        return get().updateQuantity(distributorId, productId, {
          adjustment: quantity,
          transactionType: 'restock',
          notes: notes || `Restocked ${quantity} units`,
          createdBy
        });
      },

      // Record sale (decrease stock)
      recordSale: async (distributorId, productId, quantity, orderId, createdBy) => {
        return get().updateQuantity(distributorId, productId, {
          adjustment: -quantity,
          transactionType: 'sale',
          referenceId: orderId,
          notes: `Sold ${quantity} units`,
          createdBy
        });
      },

      // Adjust stock
      adjustStock: async (distributorId, productId, adjustment, notes, createdBy) => {
        return get().updateQuantity(distributorId, productId, {
          adjustment,
          transactionType: 'adjustment',
          notes,
          createdBy
        });
      },

      // Delete inventory item
      deleteInventoryItem: async (distributorId, productId) => {
        try {
          const response = await fetch(
            `${API_BASE}/api/distributor-inventory/${distributorId}/${productId}`,
            { method: 'DELETE' }
          );
          
          if (!response.ok) {
            throw new Error('Failed to delete inventory item');
          }
          
          // Update local state
          set(state => ({
            inventory: state.inventory.filter(item => item.productId !== productId)
          }));
          
          // Refresh summary
          await get().fetchSummary(distributorId);
          
          return true;
        } catch (error) {
          console.error('Delete inventory error:', error);
          throw error;
        }
      },

      // Bulk add products
      bulkAddProducts: async (distributorId, items, createdBy) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(
            `${API_BASE}/api/distributor-inventory/${distributorId}/bulk`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items, createdBy })
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to bulk add products');
          }
          
          const result = await response.json();
          
          // Refresh inventory
          await get().fetchInventory(distributorId);
          await get().fetchSummary(distributorId);
          
          set({ loading: false });
          return result;
        } catch (error) {
          console.error('Bulk add error:', error);
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // Get low stock items
      getLowStockItems: () => {
        return get().inventory.filter(item => item.isLowStock);
      },

      // Get out of stock items
      getOutOfStockItems: () => {
        return get().inventory.filter(item => item.quantity === 0);
      },

      // Get inventory item by product ID
      getInventoryItem: (productId) => {
        return get().inventory.find(item => item.productId === productId);
      },

      // Clear store
      clearInventory: () => {
        set({ 
          inventory: [], 
          transactions: [], 
          summary: null,
          loading: false,
          error: null 
        });
      }
    }),
    {
      name: 'inventory-storage'
    }
  )
);
