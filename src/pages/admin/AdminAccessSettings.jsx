import React, { useState } from 'react';
import { useStaffStore, ROLES } from '../../store/staffStore';

const AdminAccessSettings = () => {
  const { accessSettings, updateAccessSettings, staff, partners } = useStaffStore();
  const [settings, setSettings] = useState(accessSettings);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [customPermissions, setCustomPermissions] = useState({});

  const allPermissions = [
    { id: 'view_dashboard', name: 'View Dashboard', category: 'General' },
    { id: 'view_products', name: 'View Products', category: 'Products' },
    { id: 'manage_products', name: 'Manage Products', category: 'Products' },
    { id: 'view_orders', name: 'View Orders', category: 'Orders' },
    { id: 'create_orders', name: 'Create Orders', category: 'Orders' },
    { id: 'update_orders', name: 'Update Orders', category: 'Orders' },
    { id: 'cancel_orders', name: 'Cancel Orders', category: 'Orders' },
    { id: 'view_customers', name: 'View Customers', category: 'Customers' },
    { id: 'manage_customers', name: 'Manage Customers', category: 'Customers' },
    { id: 'create_leads', name: 'Create Leads', category: 'Sales' },
    { id: 'manage_inventory', name: 'Manage Inventory', category: 'Inventory' },
    { id: 'view_reports', name: 'View Reports', category: 'Reports' },
    { id: 'generate_reports', name: 'Generate Reports', category: 'Reports' },
    { id: 'handle_escalations', name: 'Handle Escalations', category: 'Support' },
    { id: 'communications', name: 'Send Communications', category: 'Support' },
    { id: 'view_history', name: 'View History', category: 'General' },
    { id: 'view_analytics', name: 'View Analytics', category: 'Admin' },
    { id: 'manage_staff', name: 'Manage Staff', category: 'Admin' },
    { id: 'manage_partners', name: 'Manage Partners', category: 'Admin' },
    { id: 'manage_settings', name: 'Manage Settings', category: 'Admin' }
  ];

  const permissionCategories = [...new Set(allPermissions.map(p => p.category))];

  const handleSaveSettings = () => {
    updateAccessSettings(settings);
    alert('Settings saved successfully!');
  };

  const handleRolePermissions = (role) => {
    setSelectedRole(role);
    setCustomPermissions({
      ...ROLES[role]?.permissions.reduce((acc, p) => ({ ...acc, [p]: true }), {})
    });
    setShowPermissionsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Access Settings</h1>
        <p className="text-gray-600">Configure user access and security settings</p>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Security Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              min="6"
              max="20"
              value={settings.passwordMinLength}
              onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum characters required for passwords (6-20)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="1440"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Auto logout after inactivity (15-1440 minutes)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.maxLoginAttempts}
              onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Account lockout after failed attempts (3-10)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.lockoutDuration}
              onChange={(e) => setSettings({ ...settings, lockoutDuration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">How long account stays locked (5-60 minutes)</p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requirePasswordChange}
                onChange={(e) => setSettings({ ...settings, requirePasswordChange: e.target.checked })}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <span className="font-medium text-gray-900">Require Password Change on First Login</span>
                <p className="text-sm text-gray-500">New users must change their password when they first log in</p>
              </div>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowSelfRegistration}
                onChange={(e) => setSettings({ ...settings, allowSelfRegistration: e.target.checked })}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <span className="font-medium text-gray-900">Allow Self Registration</span>
                <p className="text-sm text-gray-500">Allow staff to register themselves (requires admin approval)</p>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Role Permissions
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(ROLES).map(([roleId, role]) => {
                const userCount = roleId === 'distributor' || roleId === 'wholesaler'
                  ? partners.filter(p => p.type === roleId).length
                  : staff.filter(s => s.role === roleId).length;
                
                return (
                  <tr key={roleId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          roleId === 'admin' ? 'bg-purple-100' :
                          roleId === 'marketer' ? 'bg-blue-100' :
                          roleId === 'sales' ? 'bg-green-100' :
                          roleId === 'cco' ? 'bg-yellow-100' :
                          roleId === 'distributor' ? 'bg-orange-100' : 'bg-pink-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            roleId === 'admin' ? 'text-purple-600' :
                            roleId === 'marketer' ? 'text-blue-600' :
                            roleId === 'sales' ? 'text-green-600' :
                            roleId === 'cco' ? 'text-yellow-600' :
                            roleId === 'distributor' ? 'text-orange-600' : 'text-pink-600'
                          }`}>
                            {role.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{role.name}</div>
                          <div className="text-sm text-gray-500">{roleId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-sm bg-gray-100 rounded-full">{userCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.dashboard}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {role.permissions.slice(0, 3).map((perm, index) => (
                          <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 rounded">
                            {perm.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRolePermissions(roleId)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        View/Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              <p className="text-sm text-gray-500">Total Staff</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
              <p className="text-sm text-gray-500">Total Partners</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter(s => s.status === 'active').length}
              </p>
              <p className="text-sm text-gray-500">Active Staff</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter(s => s.mustChangePassword).length}
              </p>
              <p className="text-sm text-gray-500">Pending Password Change</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {ROLES[selectedRole]?.name} Permissions
              </h2>
              <button 
                onClick={() => setShowPermissionsModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {permissionCategories.map(category => (
                <div key={category}>
                  <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {allPermissions
                      .filter(p => p.category === category)
                      .map(permission => {
                        const hasPermission = 
                          ROLES[selectedRole]?.permissions.includes('all') ||
                          ROLES[selectedRole]?.permissions.includes(permission.id);
                        
                        return (
                          <label 
                            key={permission.id} 
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                              hasPermission ? 'bg-green-50' : 'bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={() => {}}
                              disabled={selectedRole === 'admin'}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className={`text-sm ${hasPermission ? 'text-green-800' : 'text-gray-600'}`}>
                              {permission.name}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-4">
                * Role permissions are predefined. Contact the system administrator for custom permission configurations.
              </p>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccessSettings;
