import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ADMIN_PASSWORD = 'blackvelvet';

// Role definitions
export const ROLES = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    permissions: ['all'],
    dashboard: '/admin'
  },
  marketer: {
    id: 'marketer',
    name: 'Marketer',
    permissions: ['view_products', 'view_customers', 'create_leads', 'view_reports'],
    dashboard: '/marketer'
  },
  sales: {
    id: 'sales',
    name: 'Sales Staff',
    permissions: ['view_products', 'view_orders', 'create_orders', 'view_customers'],
    dashboard: '/sales'
  },
  cco: {
    id: 'cco',
    name: 'Customer Care Officer',
    permissions: ['view_orders', 'update_orders', 'view_customers', 'handle_escalations', 'communications'],
    dashboard: '/cco'
  },
  distributor: {
    id: 'distributor',
    name: 'Distributor',
    permissions: ['view_orders', 'manage_inventory', 'view_history'],
    dashboard: '/distributor'
  },
  wholesaler: {
    id: 'wholesaler',
    name: 'Wholesaler',
    permissions: ['view_orders', 'place_orders'],
    dashboard: '/wholesaler'
  }
};

// Generate a random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate username from name
const generateUsername = (name, existingUsernames) => {
  let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
  let username = baseUsername;
  let counter = 1;
  
  while (existingUsernames.includes(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
};

// System administrator account (required for admin access)
const INITIAL_STAFF = [
  {
    id: 'staff-admin-001',
    username: 'admin',
    password: ADMIN_PASSWORD,
    name: 'System Administrator',
    email: 'admin@bonnesante.com',
    phone: '+234 902 872 4839',
    role: 'admin',
    status: 'active',
    mustChangePassword: false,
    permissions: ROLES.admin.permissions,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: null,
    activityLog: []
  }
];

// Initial partners
const INITIAL_PARTNERS = [];

export const useStaffStore = create(
  persist(
    (set, get) => ({
      staff: INITIAL_STAFF,
      partners: INITIAL_PARTNERS,
      activityLogs: [],
      accessSettings: {
        allowSelfRegistration: false,
        passwordMinLength: 8,
        requirePasswordChange: true,
        sessionTimeout: 480, // minutes
        maxLoginAttempts: 5,
        lockoutDuration: 30 // minutes
      },

      // Admin authentication
      isAdminAuthenticated: false,
      authenticateAdmin: (password) => {
        if (password === ADMIN_PASSWORD) {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ isAdminAuthenticated: false }),

      // Staff login
      staffLogin: async (username, password) => {
        const staff = get().staff.find(
          s => s.username.toLowerCase() === username.toLowerCase() && s.status === 'active'
        );

        if (!staff) {
          return { success: false, error: 'Invalid username or password' };
        }

        if (staff.password !== password) {
          // Log failed attempt
          get().logActivity(staff.id, 'login_failed', 'Failed login attempt');
          return { success: false, error: 'Invalid username or password' };
        }

        // Update last login
        set(state => ({
          staff: state.staff.map(s =>
            s.id === staff.id
              ? { ...s, lastLogin: new Date().toISOString() }
              : s
          )
        }));

        // Log successful login
        get().logActivity(staff.id, 'login', 'Successful login');

        return {
          success: true,
          user: {
            id: staff.id,
            username: staff.username,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            permissions: staff.permissions,
            mustChangePassword: staff.mustChangePassword
          },
          mustChangePassword: staff.mustChangePassword,
          dashboard: ROLES[staff.role]?.dashboard || '/dashboard'
        };
      },

      // Change password
      changePassword: (userId, oldPassword, newPassword) => {
        const staff = get().staff.find(s => s.id === userId);
        
        if (!staff) {
          return { success: false, error: 'User not found' };
        }

        if (staff.password !== oldPassword) {
          return { success: false, error: 'Current password is incorrect' };
        }

        if (newPassword.length < get().accessSettings.passwordMinLength) {
          return { success: false, error: `Password must be at least ${get().accessSettings.passwordMinLength} characters` };
        }

        set(state => ({
          staff: state.staff.map(s =>
            s.id === userId
              ? { ...s, password: newPassword, mustChangePassword: false }
              : s
          )
        }));

        get().logActivity(userId, 'password_changed', 'Password changed successfully');

        return { success: true };
      },

      // Set all staff (for sync from server)
      setStaff: (staffArray) => {
        if (!Array.isArray(staffArray)) return;
        
        // Merge with existing admin to avoid lockout
        const hasAdmin = staffArray.some(s => s.username === 'admin');
        const adminStaff = get().staff.find(s => s.username === 'admin');
        
        set({ 
          staff: hasAdmin ? staffArray : (adminStaff ? [adminStaff, ...staffArray.filter(s => s.username !== 'admin')] : staffArray)
        });
        
        console.log(`📥 Staff store updated with ${staffArray.length} staff members`);
      },

      // Set all partners (for sync from server)
      setPartners: (partnersArray) => {
        if (!Array.isArray(partnersArray)) return;
        set({ partners: partnersArray });
        console.log(`📥 Partners store updated with ${partnersArray.length} partners`);
      },

      // Add single staff member
      addStaff: (staffData) => {
        const existingUsernames = get().staff.map(s => s.username);
        const username = staffData.username || generateUsername(staffData.name, existingUsernames);
        const password = staffData.password || generatePassword();

        const newStaff = {
          id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          username,
          password,
          name: staffData.name,
          email: staffData.email,
          phone: staffData.phone || '',
          role: staffData.role,
          status: 'active',
          mustChangePassword: staffData.role !== 'admin',
          permissions: ROLES[staffData.role]?.permissions || [],
          createdAt: new Date().toISOString(),
          lastLogin: null,
          activityLog: []
        };

        set(state => ({ staff: [...state.staff, newStaff] }));

        return { success: true, staff: newStaff, generatedPassword: password };
      },

      // Bulk add staff
      bulkAddStaff: (staffList) => {
        const existingUsernames = get().staff.map(s => s.username);
        const results = [];
        const newStaff = [];

        staffList.forEach((staffData, index) => {
          try {
            const username = staffData.username || generateUsername(staffData.name, [...existingUsernames, ...newStaff.map(s => s.username)]);
            const password = generatePassword();

            const staff = {
              id: `staff-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
              username,
              password,
              name: staffData.name,
              email: staffData.email,
              phone: staffData.phone || '',
              role: staffData.role,
              status: 'active',
              mustChangePassword: true,
              permissions: ROLES[staffData.role]?.permissions || [],
              createdAt: new Date().toISOString(),
              lastLogin: null,
              activityLog: []
            };

            newStaff.push(staff);
            results.push({
              success: true,
              name: staffData.name,
              username,
              password,
              role: staffData.role
            });
          } catch (error) {
            results.push({
              success: false,
              name: staffData.name,
              error: error.message
            });
          }
        });

        set(state => ({ staff: [...state.staff, ...newStaff] }));

        return results;
      },

      // Update staff
      updateStaff: (id, updates) => {
        set(state => ({
          staff: state.staff.map(s =>
            s.id === id ? { ...s, ...updates } : s
          )
        }));
      },

      // Delete staff
      deleteStaff: (id) => {
        set(state => ({
          staff: state.staff.filter(s => s.id !== id)
        }));
      },

      // Reset password
      resetPassword: (userId) => {
        const newPassword = generatePassword();
        
        set(state => ({
          staff: state.staff.map(s =>
            s.id === userId
              ? { ...s, password: newPassword, mustChangePassword: true }
              : s
          )
        }));

        return { success: true, newPassword };
      },

      // Add partner (distributor/wholesaler)
      addPartner: async (partnerData) => {
        const existingUsernames = [...get().staff.map(s => s.username), ...get().partners.map(p => p.username)];
        const username = partnerData.username || generateUsername(partnerData.companyName || partnerData.name, existingUsernames);
        const password = generatePassword();

        const newPartner = {
          id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          username,
          password,
          companyName: partnerData.companyName,
          contactName: partnerData.contactName,
          email: partnerData.email,
          phone: partnerData.phone,
          address: partnerData.address,
          state: partnerData.state,
          city: partnerData.city,
          type: partnerData.type, // 'distributor' or 'wholesaler'
          status: 'active',
          mustChangePassword: true,
          territory: partnerData.territory || [],
          bankName: partnerData.bankName || '',
          accountNumber: partnerData.accountNumber || '',
          accountName: partnerData.accountName || '',
          createdAt: new Date().toISOString(),
          lastLogin: null
        };

        set(state => ({ partners: [...state.partners, newPartner] }));

        // Sync to server
        try {
          await get().syncPartnerToServer(newPartner);
        } catch (error) {
          console.error('Failed to sync new partner to server:', error);
        }

        return { success: true, partner: newPartner, generatedPassword: password };
      },

      // Bulk add partners
      bulkAddPartners: (partnersList) => {
        const existingUsernames = [...get().staff.map(s => s.username), ...get().partners.map(p => p.username)];
        const results = [];
        const newPartners = [];

        partnersList.forEach((partnerData, index) => {
          try {
            const username = partnerData.username || generateUsername(
              partnerData.companyName || partnerData.name,
              [...existingUsernames, ...newPartners.map(p => p.username)]
            );
            const password = generatePassword();

            const partner = {
              id: `partner-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
              username,
              password,
              companyName: partnerData.companyName,
              contactName: partnerData.contactName,
              email: partnerData.email,
              phone: partnerData.phone || '',
              address: partnerData.address || '',
              state: partnerData.state || '',
              city: partnerData.city || '',
              type: partnerData.type,
              status: 'active',
              mustChangePassword: true,
              territory: partnerData.territory || [],
              bankName: partnerData.bankName || '',
              accountNumber: partnerData.accountNumber || '',
              accountName: partnerData.accountName || '',
              createdAt: new Date().toISOString(),
              lastLogin: null
            };

            newPartners.push(partner);
            results.push({
              success: true,
              companyName: partnerData.companyName,
              username,
              password,
              type: partnerData.type
            });
          } catch (error) {
            results.push({
              success: false,
              companyName: partnerData.companyName,
              error: error.message
            });
          }
        });

        set(state => ({ partners: [...state.partners, ...newPartners] }));

        return results;
      },

      // Update partner
      updatePartner: async (id, updates) => {
        set(state => ({
          partners: state.partners.map(p =>
            p.id === id ? { ...p, ...updates } : p
          )
        }));

        // Sync updated partner to server
        try {
          const updatedPartner = get().partners.find(p => p.id === id);
          if (updatedPartner) {
            await get().syncPartnerToServer(updatedPartner);
          }
        } catch (error) {
          console.error('Failed to sync updated partner to server:', error);
        }
      },

      // Delete partner
      deletePartner: async (id) => {
        set(state => ({
          partners: state.partners.filter(p => p.id !== id)
        }));

        // Delete from server
        try {
          await get().deletePartnerFromServer(id);
        } catch (error) {
          console.error('Failed to delete partner from server:', error);
        }
      },

      // Log activity
      logActivity: (userId, action, details, metadata = {}) => {
        const log = {
          id: `log-${Date.now()}`,
          userId,
          action,
          details,
          metadata,
          timestamp: new Date().toISOString(),
          ip: 'N/A' // Would be captured from request in production
        };

        set(state => ({
          activityLogs: [log, ...state.activityLogs].slice(0, 10000) // Keep last 10000 logs
        }));

        // Also update user's activity log
        set(state => ({
          staff: state.staff.map(s =>
            s.id === userId
              ? { ...s, activityLog: [log, ...(s.activityLog || [])].slice(0, 100) }
              : s
          )
        }));
      },

      // Get activity logs with filters
      getActivityLogs: (filters = {}) => {
        let logs = get().activityLogs;

        if (filters.userId) {
          logs = logs.filter(l => l.userId === filters.userId);
        }

        if (filters.action) {
          logs = logs.filter(l => l.action === filters.action);
        }

        if (filters.startDate) {
          logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
          logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate));
        }

        return logs;
      },

      // Get analytics data
      getAnalytics: () => {
        const state = get();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Staff by role
        const staffByRole = state.staff.reduce((acc, s) => {
          acc[s.role] = (acc[s.role] || 0) + 1;
          return acc;
        }, {});

        // Partners by type
        const partnersByType = state.partners.reduce((acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + 1;
          return acc;
        }, {});

        // Active users today
        const activeToday = state.staff.filter(s => 
          s.lastLogin && new Date(s.lastLogin) >= today
        ).length;

        // Logins this week
        const loginsThisWeek = state.activityLogs.filter(l => 
          l.action === 'login' && new Date(l.timestamp) >= thisWeek
        ).length;

        // Activity breakdown
        const activityBreakdown = state.activityLogs.reduce((acc, l) => {
          acc[l.action] = (acc[l.action] || 0) + 1;
          return acc;
        }, {});

        // Daily activity for chart
        const dailyActivity = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
          const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
          const count = state.activityLogs.filter(l => {
            const logDate = new Date(l.timestamp);
            return logDate >= date && logDate < nextDate;
          }).length;
          dailyActivity.push({
            date: date.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' }),
            count
          });
        }

        // Top active staff
        const staffActivity = state.staff.map(s => ({
          ...s,
          activityCount: state.activityLogs.filter(l => l.userId === s.id).length
        })).sort((a, b) => b.activityCount - a.activityCount).slice(0, 10);

        return {
          totalStaff: state.staff.length,
          totalPartners: state.partners.length,
          staffByRole,
          partnersByType,
          activeToday,
          loginsThisWeek,
          activityBreakdown,
          dailyActivity,
          topActiveStaff: staffActivity,
          totalLogs: state.activityLogs.length
        };
      },

      // Update access settings
      updateAccessSettings: (settings) => {
        set(state => ({
          accessSettings: { ...state.accessSettings, ...settings }
        }));
      },

      // Get staff by role
      getStaffByRole: (role) => {
        return get().staff.filter(s => s.role === role);
      },

      // Get partners by type
      getPartnersByType: (type) => {
        return get().partners.filter(p => p.type === type);
      },

      // ============ SERVER SYNC FUNCTIONS ============
      
      // Fetch partners from server
      fetchPartnersFromServer: async () => {
        try {
          console.log('🔄 Fetching partners from server...');
          const response = await fetch('/api/partners');
          if (!response.ok) {
            throw new Error('Failed to fetch partners');
          }
          const serverPartners = await response.json();
          
          if (serverPartners && serverPartners.length > 0) {
            console.log(`✅ ${serverPartners.length} partners loaded from server`);
            set({ partners: serverPartners });
            return serverPartners;
          }
          
          console.log('ℹ️ No partners on server, keeping local data');
          return get().partners;
        } catch (error) {
          console.error('❌ Failed to fetch partners from server:', error);
          return get().partners;
        }
      },

      // Upload all partners to server
      uploadPartnersToServer: async () => {
        try {
          const partners = get().partners;
          console.log(`📤 Uploading ${partners.length} partners to server...`);
          
          const response = await fetch('/api/partners/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partners })
          });
          
          if (!response.ok) {
            throw new Error('Failed to sync partners');
          }
          
          const result = await response.json();
          console.log('✅ Partners synced to server:', result);
          return true;
        } catch (error) {
          console.error('❌ Failed to upload partners to server:', error);
          return false;
        }
      },

      // Sync single partner to server
      syncPartnerToServer: async (partner) => {
        try {
          console.log(`📤 Syncing partner ${partner.id} to server...`);
          const response = await fetch('/api/partners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partner)
          });
          
          if (!response.ok) {
            throw new Error('Failed to sync partner');
          }
          
          console.log('✅ Partner synced to server');
          return true;
        } catch (error) {
          console.error('❌ Failed to sync partner to server:', error);
          return false;
        }
      },

      // Delete partner from server
      deletePartnerFromServer: async (partnerId) => {
        try {
          console.log(`🗑️ Deleting partner ${partnerId} from server...`);
          const response = await fetch(`/api/partners/${partnerId}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete partner from server');
          }
          
          console.log('✅ Partner deleted from server');
          return true;
        } catch (error) {
          console.error('❌ Failed to delete partner from server:', error);
          return false;
        }
      }
    }),
    { name: 'staff-storage' }
  )
);
