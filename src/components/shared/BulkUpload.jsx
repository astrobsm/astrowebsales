// Bulk Upload Templates and Utilities
import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

// CSV Template Definitions
export const TEMPLATES = {
  staff: {
    name: 'Staff Members',
    filename: 'staff_template.csv',
    headers: ['name', 'email', 'phone', 'role', 'zone', 'state', 'password'],
    sampleData: [
      ['John Doe', 'john@bonnesante.com', '+2348012345678', 'marketer', 'South West', 'Lagos', 'Welcome@123'],
      ['Jane Smith', 'jane@bonnesante.com', '+2348098765432', 'sales', 'South East', 'Enugu', 'Welcome@123'],
      ['Mike Johnson', 'mike@bonnesante.com', '+2348055555555', 'cco', 'North Central', 'Abuja', 'Welcome@123']
    ],
    validRoles: ['cco', 'marketer', 'sales'],
    instructions: [
      'Role must be one of: cco, marketer, sales',
      'Phone number should include country code (+234)',
      'Password must be at least 8 characters',
      'Zone options: South West, South East, South South, North Central, North East, North West',
      'State should be a valid Nigerian state'
    ]
  },
  distributors: {
    name: 'Distributors',
    filename: 'distributors_template.csv',
    headers: ['name', 'email', 'phone', 'zone', 'state', 'address', 'bankName', 'accountNumber', 'accountName', 'password'],
    sampleData: [
      ['Lagos Prime Distributors', 'lagos@dist.com', '+2348011111111', 'South West', 'Lagos', '123 Marina Road Lagos', 'First Bank', '1234567890', 'Lagos Prime Distributors Ltd', 'Dist@123'],
      ['FCT Medical Supplies', 'fct@dist.com', '+2348022222222', 'North Central', 'FCT', '45 Garki Avenue Abuja', 'GTBank', '0987654321', 'FCT Medical Supplies Ltd', 'Dist@123']
    ],
    instructions: [
      'Name is the distributor company/business name',
      'Zone: South West, South East, South South, North Central, North East, North West',
      'State should be a valid Nigerian state',
      'Bank Name, Account Number, and Account Name are for payment processing',
      'Password must be at least 8 characters'
    ]
  },
  wholesalers: {
    name: 'Wholesalers',
    filename: 'wholesalers_template.csv',
    headers: ['name', 'email', 'phone', 'businessName', 'state', 'address', 'assignedDistributor', 'password'],
    sampleData: [
      ['ABC Wholesaler', 'abc@whole.com', '+2348033333333', 'ABC Medical Supplies', 'Lagos', '10 Oshodi Road', 'lagos-dist-001', 'Whole@123'],
      ['XYZ Wholesaler', 'xyz@whole.com', '+2348044444444', 'XYZ Pharmacy Supplies', 'Enugu', '25 Ogui Road', 'enugu-dist-001', 'Whole@123']
    ],
    instructions: [
      'Assigned Distributor should be the distributor ID',
      'Leave assignedDistributor empty if not yet assigned',
      'Password must be at least 8 characters'
    ]
  },
  products: {
    name: 'Products',
    filename: 'products_template.csv',
    headers: ['name', 'sku', 'category', 'description', 'priceRetail', 'priceWholesale', 'priceDistributor', 'stock', 'minOrder'],
    sampleData: [
      ['Wound Dressing Large', 'WD-001', 'Wound Care', 'Premium wound dressing 10x10cm', '1500', '1200', '1000', '500', '10'],
      ['Antiseptic Solution', 'AS-001', 'Antiseptics', 'Medical grade antiseptic 500ml', '2500', '2000', '1800', '300', '5']
    ],
    instructions: [
      'SKU must be unique for each product',
      'Category options: Wound Care, Antiseptics, Bandages, Surgical Supplies',
      'Prices should be in Naira (numbers only, no currency symbol)',
      'Stock is the current inventory quantity',
      'Min Order is the minimum order quantity'
    ]
  },
  partners: {
    name: 'Partners (Distributors/Wholesalers)',
    filename: 'partners_template.csv',
    headers: ['companyName', 'contactName', 'email', 'phone', 'type', 'state', 'city', 'address', 'territory', 'bankName', 'accountNumber', 'accountName'],
    sampleData: [
      ['Lagos Medical Supplies', 'John Doe', 'john@lagosmed.com', '+2348011111111', 'distributor', 'Lagos', 'Ikeja', '15 Allen Avenue', 'Lagos,Ogun,Oyo', 'First Bank', '1234567890', 'Lagos Medical Supplies Ltd'],
      ['Enugu Pharma Hub', 'Jane Smith', 'jane@enugupharma.com', '+2348022222222', 'wholesaler', 'Enugu', 'Enugu', '25 Ogui Road', 'Enugu,Anambra', 'GTBank', '0987654321', 'Enugu Pharma Hub']
    ],
    instructions: [
      'Type must be: distributor or wholesaler',
      'Territory is a comma-separated list of states covered',
      'Bank details are required for payment processing',
      'State should be a valid Nigerian state'
    ]
  },
  hospitals: {
    name: 'Healthcare Partners (Hospitals/Clinics)',
    filename: 'hospitals_template.csv',
    headers: ['name', 'type', 'contactPerson', 'email', 'phone', 'state', 'address', 'assignedDistributor'],
    sampleData: [
      ['General Hospital Lagos', 'hospital', 'Dr. Adebayo', 'gh@hospital.com', '+2348055555555', 'Lagos', '1 Hospital Road', 'lagos-dist-001'],
      ['City Clinic Enugu', 'clinic', 'Nurse Chioma', 'city@clinic.com', '+2348066666666', 'Enugu', '15 New Layout', 'enugu-dist-001']
    ],
    instructions: [
      'Type must be: hospital, clinic, pharmacy, or nursing_home',
      'Contact person is the primary point of contact',
      'Assigned Distributor links the partner to a distributor'
    ]
  }
};

// Generate CSV content from template
export const generateCSV = (templateKey) => {
  const template = TEMPLATES[templateKey];
  if (!template) return null;

  const headerRow = template.headers.join(',');
  const dataRows = template.sampleData.map(row => row.join(',')).join('\n');
  
  return `${headerRow}\n${dataRows}`;
};

// Download CSV file
export const downloadTemplate = (templateKey) => {
  const template = TEMPLATES[templateKey];
  if (!template) return;

  const csvContent = generateCSV(templateKey);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', template.filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success(`${template.name} template downloaded!`);
};

// Parse CSV string to array
export const parseCSV = (csvString) => {
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }

  return { headers, data };
};

// Validate parsed data against template
export const validateData = (templateKey, data) => {
  const template = TEMPLATES[templateKey];
  if (!template) return { valid: false, errors: ['Invalid template'] };

  const errors = [];
  const validRows = [];

  data.forEach((row, index) => {
    const rowErrors = [];

    // Check required fields
    template.headers.forEach(header => {
      if (!row[header] || row[header].trim() === '') {
        // Some fields can be optional
        const optionalFields = ['assignedDistributor', 'zone'];
        if (!optionalFields.includes(header)) {
          rowErrors.push(`Row ${index + 2}: Missing ${header}`);
        }
      }
    });

    // Validate email format
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      rowErrors.push(`Row ${index + 2}: Invalid email format`);
    }

    // Validate phone format
    if (row.phone && !/^\+?[0-9]{10,14}$/.test(row.phone.replace(/\s/g, ''))) {
      rowErrors.push(`Row ${index + 2}: Invalid phone format`);
    }

    // Validate role for staff
    if (templateKey === 'staff' && row.role) {
      if (!template.validRoles.includes(row.role.toLowerCase())) {
        rowErrors.push(`Row ${index + 2}: Invalid role "${row.role}". Must be: ${template.validRoles.join(', ')}`);
      }
    }

    if (rowErrors.length === 0) {
      validRows.push(row);
    } else {
      errors.push(...rowErrors);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validRows,
    totalRows: data.length,
    validCount: validRows.length
  };
};

// Bulk Upload Component
const BulkUpload = ({ templateKey, onUpload, title }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  
  const template = TEMPLATES[templateKey];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const { headers, data } = parseCSV(text);
      
      // Check if headers match template
      const templateHeaders = template.headers;
      const missingHeaders = templateHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setUploadResult({
          success: false,
          message: `Missing columns: ${missingHeaders.join(', ')}`,
          errors: [`Expected columns: ${templateHeaders.join(', ')}`]
        });
        setIsProcessing(false);
        return;
      }

      // Validate data
      const validation = validateData(templateKey, data);
      
      if (validation.valid) {
        setUploadResult({
          success: true,
          message: `Successfully validated ${validation.validCount} records`,
          data: validation.validRows
        });
        
        if (onUpload) {
          onUpload(validation.validRows);
        }
      } else {
        setUploadResult({
          success: false,
          message: `Found ${validation.errors.length} errors in ${validation.totalRows} rows`,
          errors: validation.errors.slice(0, 10), // Show first 10 errors
          validCount: validation.validCount
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Failed to process file',
        errors: [error.message]
      });
    }
    
    setIsProcessing(false);
  };

  const clearResult = () => {
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title || `Bulk Upload ${template?.name}`}</h3>
          <p className="text-sm text-gray-600 mt-1">Upload a CSV file to add multiple records at once</p>
        </div>
        <button
          onClick={() => downloadTemplate(templateKey)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <Download size={16} />
          Download Template
        </button>
      </div>

      {/* Instructions */}
      {template && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Template Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {template.instructions.map((instruction, i) => (
              <li key={i}>• {instruction}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3"></div>
            <p className="text-gray-600">Processing file...</p>
          </div>
        ) : (
          <>
            <FileSpreadsheet size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-1">
              Drag and drop your CSV file here, or <span className="text-primary-600 font-medium">browse</span>
            </p>
            <p className="text-sm text-gray-500">Supports: .csv files only</p>
          </>
        )}
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              {uploadResult.success ? (
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
              ) : (
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
              )}
              <div>
                <p className={`font-medium ${uploadResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {uploadResult.message}
                </p>
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-700 space-y-1">
                    {uploadResult.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {uploadResult.errors.length >= 10 && (
                      <li className="text-red-600 font-medium">...and more errors</li>
                    )}
                  </ul>
                )}
                {uploadResult.validCount > 0 && !uploadResult.success && (
                  <p className="mt-2 text-sm text-gray-600">
                    {uploadResult.validCount} records are valid and can be imported
                  </p>
                )}
              </div>
            </div>
            <button onClick={clearResult} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
