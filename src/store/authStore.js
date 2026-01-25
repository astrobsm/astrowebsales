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
          console.log('🔐 Login attempt:', { email, passwordLength: password?.length });
          
          try {
            // Import staffStore to check registered users
            const { useStaffStore } = await import('./staffStore');
            const staffStore = useStaffStore.getState();
            console.log('📦 StaffStore loaded, partners count:', staffStore.partners?.length);
            
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
          
          // Check staff credentials from local staffStore first
          const staffMember = staffStore.staff?.find(s => s.email === email);
          console.log('🔍 Staff lookup:', { email, found: !!staffMember });
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
          
          // Try server-side staff login as fallback
          try {
            const staffResponse = await fetch('/api/staff/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            const staffData = await staffResponse.json();
            
            if (staffData.success && staffData.user) {
              const sessionId = `${(staffData.user.role || 'STAFF').toUpperCase()}-${Date.now()}`;
              set({
                user: staffData.user,
                isAuthenticated: true,
                sessionId,
                role: staffData.user.role
              });
              
              useSyncStore.getState().notifyStateChange('auth', { action: 'login', user: staffData.user });
              return { success: true, user: staffData.user };
            }
          } catch (staffApiError) {
            console.error('Staff API login error:', staffApiError);
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
          
          // Check partner credentials from local staffStore (partners table)
          const partner = staffStore.partners?.find(p => p.email === email);
          console.log('🔍 Partner lookup:', { email, found: !!partner, partnerData: partner });
          
          if (partner && partner.password === password && 
              (partner.active === true || partner.active === undefined) && 
              partner.status === 'active') {
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
            
            console.log('✅ Partner login successful via local store');
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
          
          // Try server-side partner login as fallback
          console.log('🔄 Trying server-side partner login...');
          try {
            const response = await fetch('/api/partners/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            console.log('📡 Partner login API response:', data);
            
            if (data.success && data.user) {
              console.log('✅ Partner login successful via API');
              const sessionId = `${(data.user.role || 'PARTNER').toUpperCase()}-${Date.now()}`;
              set({
                user: data.user,
                isAuthenticated: true,
                sessionId,
                role: data.user.role || 'distributor'
              });
              
              useSyncStore.getState().notifyStateChange('auth', { action: 'login', user: data.user });
              return { success: true, user: data.user };
            }
          } catch (apiError) {
            console.error('Partner API login error:', apiError);
          }
          
          console.log('❌ Login failed - no matching credentials found');
          return { success: false, error: 'Invalid credentials' };
          
          } catch (loginError) {
            console.error('❌ Login function error:', loginError);
            return { success: false, error: 'Login error: ' + loginError.message };
          }
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
