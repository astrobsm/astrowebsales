import React, { useState, useRef } from 'react';
import { useStaffStore, ROLES } from '../../store/staffStore';
import { downloadTemplate, parseCSV, validateData } from '../../components/shared/BulkUpload';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminStaffManagement = () => {
  const { 
    staff, 
    addStaff, 
    bulkAddStaff, 
    updateStaff, 
    deleteStaff, 
    resetPassword 
  } = useStaffStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state for single add
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'sales'
  });

  // Bulk input state
  const [bulkInput, setBulkInput] = useState('');
  const [bulkRole, setBulkRole] = useState('sales');
  const [bulkMode, setBulkMode] = useState('text'); // 'text' or 'csv'
  const fileInputRef = useRef(null);

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    marketer: 'bg-blue-100 text-blue-800',
    sales: 'bg-green-100 text-green-800',
    cco: 'bg-yellow-100 text-yellow-800'
  };

  // Filter staff
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle single staff add
  const handleAddStaff = (e) => {
    e.preventDefault();
    const result = addStaff(formData);
    if (result.success) {
      setBulkResults([{
        success: true,
        name: formData.name,
        username: result.staff.username,
        password: result.generatedPassword,
        role: formData.role
      }]);
      setShowAddModal(false);
      setShowResultsModal(true);
      setFormData({ name: '', email: '', phone: '', role: 'sales' });
    }
  };

  // Handle CSV file upload
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const text = await file.text();
      const { headers, data } = parseCSV(text);
      const validation = validateData('staff', data);

      if (validation.validRows.length === 0) {
        toast.error('No valid records found in CSV');
        return;
      }

      // Process valid rows
      const staffList = validation.validRows.map(row => ({
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role?.toLowerCase() || 'sales',
        zone: row.zone,
        state: row.state
      }));

      const results = bulkAddStaff(staffList);
      setBulkResults(results);
      setShowBulkModal(false);
      setShowResultsModal(true);
      toast.success(`Processed ${results.length} staff members from CSV`);
    } catch (error) {
      toast.error('Failed to process CSV file');
      console.error(error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle bulk add
  const handleBulkAdd = () => {
    const lines = bulkInput.trim().split('\n').filter(line => line.trim());
    const staffList = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        name: parts[0] || '',
        email: parts[1] || `${parts[0]?.toLowerCase().replace(/\s+/g, '.')}@bonnesante.com`,
        phone: parts[2] || '',
        role: bulkRole
      };
    }).filter(s => s.name);

    if (staffList.length === 0) {
      toast.error('Please enter at least one staff member');
      return;
    }

    const results = bulkAddStaff(staffList);
    setBulkResults(results);
    setShowBulkModal(false);
    setShowResultsModal(true);
    setBulkInput('');
  };

  // Handle password reset
  const handleResetPassword = (staffId, staffName) => {
    if (confirm(`Reset password for ${staffName}? They will need to change it on next login.`)) {
      const result = resetPassword(staffId);
      if (result.success) {
        setBulkResults([{
          success: true,
          name: staffName,
          newPassword: result.newPassword,
          action: 'Password Reset'
        }]);
        setShowResultsModal(true);
      }
    }
  };

  // Handle status toggle
  const handleToggleStatus = (staffMember) => {
    updateStaff(staffMember.id, { 
      status: staffMember.status === 'active' ? 'suspended' : 'active' 
    });
  };

  // Handle delete
  const handleDelete = (staffId, staffName) => {
    if (confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      deleteStaff(staffId);
    }
  };

  // Copy credentials to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Export results as CSV
  const exportResults = () => {
    const csv = [
      'Name,Username,Password,Role,Status',
      ...bulkResults.map(r => `${r.name},${r.username || ''},${r.password || r.newPassword || ''},${r.role || ''},${r.success ? 'Success' : 'Failed'}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_credentials_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage staff accounts and access</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Register
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Staff
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Roles</option>
          {Object.entries(ROLES).filter(([key]) => key !== 'distributor' && key !== 'wholesaler').map(([key, role]) => (
            <option key={key} value={key}>{role.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((staffMember) => (
                <tr key={staffMember.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {staffMember.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                        <div className="text-sm text-gray-500">{staffMember.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      @{staffMember.username}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${roleColors[staffMember.role] || 'bg-gray-100'}`}>
                      {ROLES[staffMember.role]?.name || staffMember.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(staffMember)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        staffMember.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {staffMember.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {staffMember.mustChangePassword ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                        Must Change
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {staffMember.lastLogin 
                      ? new Date(staffMember.lastLogin).toLocaleDateString('en-NG')
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetPassword(staffMember.id, staffMember.name)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Reset Password"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      {staffMember.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(staffMember.id, staffMember.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No staff members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Staff Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="marketer">Marketer</option>
                  <option value="sales">Sales Staff</option>
                  <option value="cco">Customer Care Officer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                * Username and password will be auto-generated. The user must change their password on first login.
              </p>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bulk Staff Registration</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setBulkMode('text')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  bulkMode === 'text' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setBulkMode('csv')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  bulkMode === 'csv' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                CSV Upload
              </button>
            </div>

            {bulkMode === 'csv' ? (
              <div className="space-y-4">
                {/* CSV Upload Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Template Instructions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Columns: name, email, phone, role, zone, state, password</li>
                    <li>• Role must be: cco, marketer, or sales</li>
                    <li>• Phone should include country code (+234)</li>
                    <li>• Zone: South West, South East, South South, North Central, etc.</li>
                  </ul>
                </div>

                <button
                  onClick={() => downloadTemplate('staff')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition"
                >
                  <Download size={20} />
                  Download Staff CSV Template
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  <Upload size={24} />
                  <div className="text-left">
                    <p className="font-medium">Click to upload CSV file</p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                  </div>
                </button>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role for all staff</label>
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="marketer">Marketer</option>
                  <option value="sales">Sales Staff</option>
                  <option value="cco">Customer Care Officer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter staff details (one per line)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Format: Name, Email (optional), Phone (optional)
                </p>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  placeholder={`John Doe, john@email.com, +234 801 234 5678
Jane Smith, jane@email.com
Mike Johnson
Sarah Williams, sarah@email.com, +234 802 345 6789`}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Important</p>
                    <p className="text-sm text-yellow-700">
                      Usernames and passwords will be auto-generated. Make sure to save the credentials after registration. 
                      All users must change their password on first login.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAdd}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Register All Staff
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Registration Results</h2>
              <button onClick={() => setShowResultsModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>⚠️ Important:</strong> Save these credentials now! Passwords cannot be viewed again. 
                Users must change their password on first login.
              </p>
            </div>

            <div className="overflow-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bulkResults.map((result, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        {result.success ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">{result.name || result.companyName}</td>
                      <td className="px-4 py-2 text-sm font-mono">{result.username || '-'}</td>
                      <td className="px-4 py-2 text-sm font-mono">{result.password || result.newPassword || '-'}</td>
                      <td className="px-4 py-2 text-sm">{result.role || result.action || '-'}</td>
                      <td className="px-4 py-2">
                        {result.success && result.username && (
                          <button
                            onClick={() => copyToClipboard(`Username: ${result.username}\nPassword: ${result.password || result.newPassword}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Copy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 pt-4 border-t mt-4">
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => setShowResultsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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

export default AdminStaffManagement;
