// API Service Layer for connecting to the Express backend
// Uses relative URLs in production (served from same server)
// Check if we're in production using MODE or PROD environment variable
const isProduction = import.meta.env.MODE === 'production' || import.meta.env.PROD === true;
const API_BASE_URL = isProduction ? '/api' : 'http://localhost:5000/api';

// Helper function for making API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== STATUS API ====================

export const statusApi = {
  // Get server and database status
  getStatus: async () => {
    try {
      const response = await apiRequest('/status');
      return {
        server: response.server || 'online',
        database: response.database === 'connected' ? 'connected' : 'disconnected',
        connectedClients: response.connectedClients || 0,
        timestamp: response.timestamp
      };
    } catch (error) {
      return {
        server: 'offline',
        database: 'disconnected',
        connectedClients: 0
      };
    }
  },
  
  // Get database connection status
  getDbStatus: () => apiRequest('/status/db'),
  
  // Initialize database tables
  initDatabase: () => apiRequest('/db-init', { method: 'POST' }),
};

// ==================== PRODUCTS API ====================

export const productsApi = {
  // Get all products
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },
  
  // Get single product by ID
  getById: (id) => apiRequest(`/products/${id}`),
  
  // Create new product
  create: async (productData) => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });
    
    return fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  // Update product
  update: async (id, productData) => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });
    
    return fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: formData,
    }).then(res => res.json());
  },
  
  // Delete product
  delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

// ==================== ORDERS API ====================

export const ordersApi = {
  // Get all orders
  getAll: () => apiRequest('/orders'),
  
  // Get order by ID
  getById: (id) => apiRequest(`/orders/${id}`),
  
  // Create new order
  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  // Update order status
  updateStatus: (id, status) => apiRequest(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  // Delete order (admin only)
  delete: (id) => apiRequest(`/orders?id=${id}`, {
    method: 'DELETE',
  }),
};

// ==================== ARTICLES API ====================

export const articlesApi = {
  // Get all articles
  getAll: () => apiRequest('/articles'),
  
  // Get article by ID
  getById: (id) => apiRequest(`/articles/${id}`),
  
  // Create article
  create: async (articleData) => {
    const formData = new FormData();
    Object.entries(articleData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    return fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  // Update article
  update: async (id, articleData) => {
    const formData = new FormData();
    Object.entries(articleData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    return fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      body: formData,
    }).then(res => res.json());
  },
  
  // Delete article
  delete: (id) => apiRequest(`/articles/${id}`, { method: 'DELETE' }),
};

// ==================== SEMINARS API ====================

export const seminarsApi = {
  // Get all seminars
  getAll: () => apiRequest('/seminars'),
  
  // Get upcoming featured seminars
  getUpcoming: () => apiRequest('/seminars/upcoming'),
  
  // Register for seminar
  register: (seminarId, registrationData) => apiRequest(`/seminars/${seminarId}/register`, {
    method: 'POST',
    body: JSON.stringify(registrationData),
  }),
};

// ==================== PARTNERS API ====================

export const partnersApi = {
  // Submit partner application
  apply: async (applicationData, documents = []) => {
    const formData = new FormData();
    Object.entries(applicationData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    documents.forEach(doc => {
      formData.append('documents', doc);
    });
    
    return fetch(`${API_BASE_URL}/partners/apply`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  
  // Get all applications (admin)
  getApplications: () => apiRequest('/partners/applications'),
};

// ==================== CONTACT API ====================

export const contactApi = {
  // Submit contact message
  submit: (messageData) => apiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify(messageData),
  }),
};

// ==================== VIDEOS API ====================

export const videosApi = {
  // Get all videos
  getAll: () => apiRequest('/videos'),
  
  // Create video
  create: async (videoData) => {
    const formData = new FormData();
    Object.entries(videoData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    return fetch(`${API_BASE_URL}/videos`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
};

// ==================== CONTENT API ====================
// Handles Clinical Apps, Training, Offices, Downloads syncing

export const contentApi = {
  // ===== CLINICAL APPS =====
  getClinicalApps: () => apiRequest('/content?type=clinical-apps'),
  
  createClinicalApp: (appData) => apiRequest('/content?type=clinical-apps', {
    method: 'POST',
    body: JSON.stringify(appData),
  }),
  
  updateClinicalApp: (id, appData) => apiRequest(`/content?type=clinical-apps&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(appData),
  }),
  
  deleteClinicalApp: (id) => apiRequest(`/content?type=clinical-apps&id=${id}`, {
    method: 'DELETE',
  }),

  // ===== TRAINING COURSES =====
  getTraining: () => apiRequest('/content?type=training'),
  
  createTraining: (courseData) => apiRequest('/content?type=training', {
    method: 'POST',
    body: JSON.stringify(courseData),
  }),
  
  updateTraining: (id, courseData) => apiRequest(`/content?type=training&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  }),
  
  deleteTraining: (id) => apiRequest(`/content?type=training&id=${id}`, {
    method: 'DELETE',
  }),

  // ===== OFFICES =====
  getOffices: () => apiRequest('/content?type=offices'),
  
  createOffice: (officeData) => apiRequest('/content?type=offices', {
    method: 'POST',
    body: JSON.stringify(officeData),
  }),
  
  updateOffice: (id, officeData) => apiRequest(`/content?type=offices&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(officeData),
  }),
  
  deleteOffice: (id) => apiRequest(`/content?type=offices&id=${id}`, {
    method: 'DELETE',
  }),

  // ===== DOWNLOADS =====
  getDownloads: () => apiRequest('/content?type=downloads'),
  
  createDownload: (downloadData) => apiRequest('/content?type=downloads', {
    method: 'POST',
    body: JSON.stringify(downloadData),
  }),
  
  updateDownload: (id, downloadData) => apiRequest(`/content?type=downloads&id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(downloadData),
  }),
  
  deleteDownload: (id) => apiRequest(`/content?type=downloads&id=${id}`, {
    method: 'DELETE',
  }),
  
  incrementDownloadCount: (id) => apiRequest(`/content?type=downloads&id=${id}`, {
    method: 'PATCH',
  }),

  // ===== BULK SYNC =====
  // Get all content for initial sync
  syncAll: () => apiRequest('/content?type=sync'),
  
  // Save all content to server (bulk upload)
  saveAll: (contentData) => apiRequest('/content?type=sync', {
    method: 'POST',
    body: JSON.stringify(contentData),
  }),
};

export default {
  status: statusApi,
  products: productsApi,
  orders: ordersApi,
  articles: articlesApi,
  seminars: seminarsApi,
  partners: partnersApi,
  contact: contactApi,
  videos: videosApi,
  content: contentApi,
};
