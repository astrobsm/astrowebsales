import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useSyncStore } from './syncStore';

export const useAuthStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // User state
        user: null,
        isAuthenticated: false,
        sessionId: null,
        role: null, // 'admin', 'distributor', 'wholesaler', 'cco', 'retail', 'marketer', 'sales'
        
        // Retail customer (password-less) login
        retailLogin: (customerData) => {
          const sessionId = `RETAIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const user = {
            id: sessionId,
            type: 'retail',
            name: customerData.name,
            phone: customerData.phone,
            address: customerData.address,
            state: customerData.state,
            assignedDistributor: customerData.assignedDistributor,
            createdAt: new Date().toISOString()
          };
          
          set({
            user,
            isAuthenticated: true,
            sessionId,
            role: 'retail'
          });
          
          // Notify sync
          useSyncStore.getState().notifyStateChange('auth', { action: 'login', user });
          
          return user;
        },
        
        // Secure login for staff
        login: async (email, password) => {
          // Import staffStore to check registered users
          const { useStaffStore } = await import('./staffStore');
          const staffStore = useStaffStore.getState();
          
          // Admin account - password should be changed in production
          const adminAccount = {
            id: 'admin-1',
            name: 'System Administrator',
            role: 'admin',
            email: 'admin@bonnesante.com',
            phone: '+234 902 872 4839'
          };
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if admin login
          if (email === 'admin@bonnesante.com' && password === 'blackvelvet') {
            const sessionId = `ADMIN-${Date.now()}`;
            set({
              user: adminAccount,
              isAuthenticated: true,
              sessionId,
              role: 'admin'
            });
            useSyncStore.getState().notifyStateChange('auth', { action: 'login', user: adminAccount });
            return { success: true, user: adminAccount };
          }
          
          // Check staff credentials from staffStore
          const staffMember = staffStore.getStaffByEmail(email);
          if (staffMember && staffMember.password === password && staffMember.status === 'active') {
            const user = {
              id: staffMember.id,
              name: staffMember.name,
              role: staffMember.role,
              email: staffMember.email,
              phone: staffMember.phone,
              zone: staffMember.zone,
              state: staffMember.state,
              requirePasswordChange: staffMember.requirePasswordChange
            };
            
            const sessionId = `${user.role.toUpperCase()}-${Date.now()}`;
            set({
              user,
              isAuthenticated: true,
              sessionId,
              role: user.role
            });
            
            useSyncStore.getState().notifyStateChange('auth', { action: 'login', user });
            return { success: true, user };
          }
          
          // Check distributor credentials from distributorStore
          const { useDistributorStore } = await import('./distributorStore');
          const distributorStore = useDistributorStore.getState();
          const distributor = distributorStore.distributors?.find(d => d.email === email);
          if (distributor && distributor.password === password && distributor.status === 'active') {
            const user = {
              id: distributor.id,
              name: distributor.name,
              role: 'distributor',
              email: distributor.email,
              phone: distributor.phone,
              state: distributor.state,
              zone: distributor.zone
            };
            
            const sessionId = `DISTRIBUTOR-${Date.now()}`;
            set({
              user,
              isAuthenticated: true,
              sessionId,
              role: 'distributor'
            });
            
            useSyncStore.getState().notifyStateChange('auth', { action: 'login', user });
            return { success: true, user };
          }
          
          // Check partner credentials from staffStore (partners table)
          const partner = staffStore.partners?.find(p => p.email === email);
          if (partner && partner.password === password && partner.active !== false && partner.status === 'active') {
            const user = {
              id: partner.id,
              name: partner.contactName || partner.contact_name || partner.companyName || partner.company_name,
              role: partner.type || 'distributor',
              email: partner.email,
              phone: partner.phone,
              state: partner.state,
              territory: partner.territory,
              companyName: partner.companyName || partner.company_name,
              bankName: partner.bankName || partner.bank_name,
              accountNumber: partner.accountNumber || partner.account_number,
              accountName: partner.accountName || partner.account_name
            };
            
            const sessionId = `${(partner.type || 'PARTNER').toUpperCase()}-${Date.now()}`;
            set({
              user,
              isAuthenticated: true,
              sessionId,
              role: partner.type || 'distributor'
            });
            
            useSyncStore.getState().notifyStateChange('auth', { action: 'login', user });
            return { success: true, user };
          }
          
          return { success: false, error: 'Invalid credentials' };
        },
        
        // Logout
        logout: () => {
          useSyncStore.getState().notifyStateChange('auth', { action: 'logout' });
          
          set({
            user: null,
            isAuthenticated: false,
            sessionId: null,
            role: null
          });
        },
        
        // Update user profile
        updateProfile: (updates) => {
          set((state) => ({
            user: { ...state.user, ...updates }
          }));
          
          useSyncStore.getState().notifyStateChange('auth', { action: 'update', updates });
        },
        
        // Check if user has permission
        hasPermission: (requiredRole) => {
          const { role } = get();
          const roleHierarchy = {
            admin: 4,
            cco: 3,
            distributor: 2,
            wholesaler: 2,
            retail: 1
          };
          
          return roleHierarchy[role] >= roleHierarchy[requiredRole];
        }
      }),
      {
        name: 'astrobsm-auth',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          sessionId: state.sessionId,
          role: state.role
        })
      }
    )
  )
);

// Subscribe to sync updates
useSyncStore.subscribe(
  (state) => state.lastSyncTime,
  () => {
    // Handle sync updates for auth store
  }
);
