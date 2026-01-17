import React, { useState, useRef } from 'react';
import { useStaffStore } from '../../store/staffStore';
import { downloadTemplate, parseCSV, validateData, TEMPLATES } from '../../components/shared/BulkUpload';

const AdminPartnerManagement = () => {
  const { 
    partners, 
    addPartner, 
    bulkAddPartners, 
    updatePartner, 
    deletePartner,
    resetPassword
  } = useStaffStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [activeTab, setActiveTab] = useState('distributors');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state for single add
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    city: '',
    type: 'distributor',
    territory: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  // Bulk input state
  const [bulkInput, setBulkInput] = useState('');
  const [bulkType, setBulkType] = useState('distributor');
  const [bulkMode, setBulkMode] = useState('text'); // 'text' or 'csv'
  const fileInputRef = useRef(null);

  // Nigerian states
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  // Filter partners by type and search
  const filteredPartners = partners.filter(p => {
    const matchesType = p.type === (activeTab === 'distributors' ? 'distributor' : 'wholesaler');
    const matchesSearch = p.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesType && matchesSearch && matchesStatus;
  });

  // Handle single partner add
  const handleAddPartner = (e) => {
    e.preventDefault();
    const result = addPartner({
      ...formData,
      territory: formData.territory.split(',').map(t => t.trim()).filter(t => t)
    });
    if (result.success) {
      setBulkResults([{
        success: true,
        companyName: formData.companyName,
        username: result.partner.username,
        password: result.generatedPassword,
        type: formData.type
      }]);
      setShowAddModal(false);
      setShowResultsModal(true);
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        city: '',
        type: 'distributor',
        territory: '',
        bankName: '',
        accountNumber: '',
        accountName: ''
      });
    }
  };

  // Handle bulk add
  const handleBulkAdd = () => {
    const lines = bulkInput.trim().split('\n').filter(line => line.trim());
    const partnerList = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        companyName: parts[0] || '',
        contactName: parts[1] || '',
        email: parts[2] || `${parts[0]?.toLowerCase().replace(/\s+/g, '')}@partner.com`,
        phone: parts[3] || '',
        state: parts[4] || '',
        city: parts[5] || '',
        address: parts[6] || '',
        type: bulkType
      };
    }).filter(p => p.companyName);

    if (partnerList.length === 0) {
      alert('Please enter at least one partner');
      return;
    }

    const results = bulkAddPartners(partnerList);
    setBulkResults(results);
    setShowBulkModal(false);
    setShowResultsModal(true);
    setBulkInput('');
  };

  // Handle CSV file upload
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      const { data } = parseCSV(csvContent);
      
      if (data.length === 0) {
        alert('No valid data found in CSV file');
        return;
      }

      // Validate the data
      const validation = validateData('partners', data);
      
      if (validation.errors.length > 0) {
        const errorMessage = `Validation errors found:\n${validation.errors.slice(0, 5).join('\n')}${validation.errors.length > 5 ? `\n...and ${validation.errors.length - 5} more` : ''}`;
        alert(errorMessage);
      }

      if (validation.validRows.length > 0) {
        // Transform CSV data to partner format
        const partnerList = validation.validRows.map(row => ({
          companyName: row.companyName || '',
          contactName: row.contactName || '',
          email: row.email || '',
          phone: row.phone || '',
          state: row.state || '',
          city: row.city || '',
          address: row.address || '',
          type: row.type || bulkType,
          territory: row.territory ? row.territory.split(',').map(t => t.trim()) : [],
          bankName: row.bankName || '',
          accountNumber: row.accountNumber || '',
          accountName: row.accountName || ''
        }));

        const results = bulkAddPartners(partnerList);
        setBulkResults(results);
        setShowBulkModal(false);
        setShowResultsModal(true);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle password reset
  const handleResetPassword = (partnerId, partnerName) => {
    // Partners use a different structure, we need to handle this
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    const newPassword = generatePassword();
    updatePartner(partnerId, { password: newPassword, mustChangePassword: true });
    
    setBulkResults([{
      success: true,
      companyName: partnerName,
      newPassword: newPassword,
      action: 'Password Reset'
    }]);
    setShowResultsModal(true);
  };

  // Generate password helper
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle status toggle
  const handleToggleStatus = (partner) => {
    updatePartner(partner.id, { 
      status: partner.status === 'active' ? 'suspended' : 'active' 
    });
  };

  // Handle delete
  const handleDelete = (partnerId, partnerName) => {
    if (confirm(`Are you sure you want to delete ${partnerName}? This action cannot be undone.`)) {
      deletePartner(partnerId);
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
      'Company Name,Username,Password,Type,Status',
      ...bulkResults.map(r => `${r.companyName},${r.username || ''},${r.password || r.newPassword || ''},${r.type || ''},${r.success ? 'Success' : 'Failed'}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partner_credentials_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-gray-600">Manage distributors and wholesalers</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Create
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Partner
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('distributors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'distributors'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Distributors ({partners.filter(p => p.type === 'distributor').length})
          </button>
          <button
            onClick={() => setActiveTab('wholesalers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wholesalers'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Wholesalers ({partners.filter(p => p.type === 'wholesaler').length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search by company, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
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

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        partner.type === 'distributor' ? 'bg-orange-100' : 'bg-pink-100'
                      }`}>
                        <span className={`font-medium ${
                          partner.type === 'distributor' ? 'text-orange-600' : 'text-pink-600'
                        }`}>
                          {partner.companyName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{partner.companyName}</div>
                        <div className="text-sm text-gray-500">{partner.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      @{partner.username}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{partner.contactName}</div>
                    <div className="text-sm text-gray-500">{partner.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{partner.city}</div>
                    <div className="text-sm text-gray-500">{partner.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(partner)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        partner.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {partner.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {partner.mustChangePassword ? (
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetPassword(partner.id, partner.companyName)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Reset Password"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id, partner.companyName)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No {activeTab} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Partner</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddPartner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="distributor">Distributor</option>
                    <option value="wholesaler">Wholesaler</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Contact person name"
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
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="City"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
                {formData.type === 'distributor' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Territory (comma-separated states)</label>
                    <input
                      type="text"
                      value={formData.territory}
                      onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Enugu, Anambra, Ebonyi"
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-900 mb-2">Bank Details (Optional)</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Account number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Account name"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                * Username and password will be auto-generated. The partner must change their password on first login.
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
                  Add Partner
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
              <h2 className="text-xl font-bold">Bulk Partner Creation</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setBulkMode('text')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    bulkMode === 'text'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Text Input
                </button>
                <button
                  onClick={() => setBulkMode('csv')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    bulkMode === 'csv'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  CSV Upload
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type (for text input)</label>
                <select
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="distributor">Distributor</option>
                  <option value="wholesaler">Wholesaler</option>
                </select>
                {bulkMode === 'csv' && (
                  <p className="text-xs text-gray-500 mt-1">Note: CSV upload uses the 'type' column from the file</p>
                )}
              </div>
              
              {bulkMode === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter partner details (one per line)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Format: Company Name, Contact Person, Email, Phone, State, City, Address
                  </p>
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    placeholder={`ABC Pharmaceuticals, John Doe, john@abc.com, +234801234567, Lagos, Ikeja
XYZ Medical Supplies, Jane Smith, jane@xyz.com, +234802345678, Enugu, Enugu
MediCare Ltd, Mike Johnson, mike@medicare.com, +234803456789, Abuja, Garki`}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={() => downloadTemplate('partners')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download CSV Template
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Download the template, fill in partner details, then upload the completed file.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Template Instructions:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      {TEMPLATES.partners?.instructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-gray-600 font-medium">Click to upload CSV file</span>
                      <span className="text-xs text-gray-500">or drag and drop</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Important</p>
                    <p className="text-sm text-yellow-700">
                      Usernames and passwords will be auto-generated. Make sure to save the credentials after creation. 
                      All partners must change their password on first login.
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
                {bulkMode === 'text' && (
                  <button
                    onClick={handleBulkAdd}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create All Partners
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Partner Creation Results</h2>
              <button onClick={() => setShowResultsModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>⚠️ Important:</strong> Save these credentials now! Passwords cannot be viewed again. 
                Partners must change their password on first login.
              </p>
            </div>

            <div className="overflow-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
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
                      <td className="px-4 py-2 text-sm">{result.companyName}</td>
                      <td className="px-4 py-2 text-sm font-mono">{result.username || '-'}</td>
                      <td className="px-4 py-2 text-sm font-mono">{result.password || result.newPassword || '-'}</td>
                      <td className="px-4 py-2 text-sm capitalize">{result.type || result.action || '-'}</td>
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

export default AdminPartnerManagement;
