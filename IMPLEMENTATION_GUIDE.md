# ASTROBSM WEBSALES - Implementation Guide

## ✅ COMPLETED TASKS

### 1. Contact Information Updated
- ✅ Address: 17A Isuofia Street Federal Housing Estate Trans Ekulu, Enugu
- ✅ Phone: +234 902 872 4839
- ✅ Email: astrobsm@gmail.com
- ✅ Emergency Support: +234 702 575 5406

### 2. Backend & Database Setup
- ✅ PostgreSQL database configuration (astrowebsale_db, postgres, blackvelvet)
- ✅ Express.js API server with all endpoints
- ✅ Database schema with 10 tables:
  - products (with image upload)
  - articles (education content)
  - videos
  - training_courses
  - downloads
  - seminars
  - seminar_registrations
  - partner_applications
  - orders
  - contact_messages

### 3. Admin Authentication
- ✅ Content management store with password: **blackvelvet**
- ✅ Admin authentication system

### 4. Partner Application System
- ✅ BecomeDistributor.jsx page with full form
- ✅ Document upload functionality
- ✅ Banking information collection
- ✅ API endpoint for partner applications

## 📋 SETUP INSTRUCTIONS

### 1. Install Dependencies
```bash
npm install
```

### 2. Install PostgreSQL
Download and install PostgreSQL from https://www.postgresql.org/download/windows/

### 3. Create Database
```sql
CREATE DATABASE astrowebsale_db;
-- Password: blackvelvet
```

### 4. Start Services
```bash
# Terminal 1: Start Backend Server
npm run server

# Terminal 2: Start Frontend
npm run dev

# OR run both together
npm run dev:all
```

### 5. Initialize Database
The database tables will be created automatically when you start the server for the first time.

## 🔧 API ENDPOINTS

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (with image upload)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Articles
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create article (with image upload)
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Videos
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Create video (with thumbnail)

### Seminars
- `GET /api/seminars` - Get all seminars
- `GET /api/seminars/upcoming` - Get featured upcoming seminars
- `POST /api/seminars` - Create seminar
- `POST /api/seminars/:id/register` - Register for seminar

### Partner Applications
- `POST /api/partners/apply` - Submit partner application
- `GET /api/partners/applications` - Get all applications (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders

### Contact
- `POST /api/contact` - Submit contact form

## 🚀 NEXT STEPS

### Admin Product Management UI
Create admin interface at `/admin/products` to:
- Add new products with image upload
- Edit existing products
- Delete products
- Manage inventory levels

### Education Content Management
Create admin interface at `/admin/content` to:
- Manage articles, videos, training courses, downloads
- Upload PDFs with company logo
- Generate downloadable resources

### Seminar Management
Create admin interface at `/admin/seminars` to:
- Create seminars with auto-generated registration links
- View registrations
- Send confirmation emails

### Frontend Integration
Update stores to use API instead of mock data:
```javascript
// Example: productStore.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useProductStore = create((set) => ({
  products: [],
  
  fetchProducts: async () => {
    const response = await axios.get(`${API_URL}/products`);
    set({ products: response.data });
  },
  
  addProduct: async (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    
    const response = await axios.post(`${API_URL}/products`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    set(state => ({ products: [...state.products, response.data] }));
  }
}));
```

### Partner Portal Pages
Already created:
- ✅ `/become-distributor` - Application form

Need to create:
- Distributor Portal (login at `/login`)
- Wholesaler Access (login at `/login`)
- Partner Resources page

### Homepage Seminar Display
Add to Home.jsx:
```javascript
import { useEffect, useState } from 'react';
import axios from 'axios';

// In Home component
const [upcomingSeminars, setUpcomingSeminars] = useState([]);

useEffect(() => {
  axios.get('http://localhost:5000/api/seminars/upcoming')
    .then(res => setUpcomingSeminars(res.data));
}, []);

// Display seminar registration links in hero or features section
```

## 🔐 ADMIN CREDENTIALS

- **Admin Portal**: http://localhost:3009/admin
- **Username**: admin@bonnesante.com
- **Password**: admin123
- **Content Management Password**: blackvelvet

## 📱 ROUTES TO UPDATE IN App.jsx

Add these new routes:
```javascript
// Partner Routes
<Route path="/become-distributor" element={<BecomeDistributor />} />
<Route path="/become-wholesaler" element={<BecomeWholesaler />} />
<Route path="/partner-resources" element={<PartnerResources />} />

// Admin Content Management
<Route path="/admin/content" element={<AdminContent />} />

// Seminar Registration
<Route path="/seminar-registration/:token" element={<SeminarConfirmation />} />
```

## 📦 FILE UPLOAD LOCATION

All uploaded files are stored in: `server/uploads/`

Accessible via: `http://localhost:5000/uploads/filename.ext`

## 🎨 PDF GENERATION WITH LOGO

To generate PDFs with company logo:
```javascript
import jsPDF from 'jspdf';

const generatePDF = (content) => {
  const doc = new jsPDF();
  
  // Add logo
  doc.addImage('/logo.png', 'PNG', 15, 10, 30, 30);
  
  // Add content
  doc.setFontSize(16);
  doc.text('Your Content', 15, 50);
  
  // Save
  doc.save('document.pdf');
};
```

## 🔄 ENVIRONMENT VARIABLES

Create `.env` file:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=astrowebsale_db
DB_USER=postgres
DB_PASSWORD=blackvelvet

# Server
PORT=5000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000/api
```

## ✨ FEATURES IMPLEMENTED

1. ✅ Admin password authentication (blackvelvet)
2. ✅ Product management with image upload API
3. ✅ Education content CRUD API
4. ✅ Seminar registration system with auto-generated links
5. ✅ Partner application forms with document upload
6. ✅ PostgreSQL database with comprehensive schema
7. ✅ Contact form API
8. ✅ Order management API
9. ✅ File upload handling (images, PDFs, documents)
10. ✅ Company contact information updated

## 🎯 REMAINING TASKS

1. Create admin UI components for:
   - Product management
   - Content management (articles, videos, training, downloads)
   - Seminar management
   - Partner application review

2. Connect frontend stores to backend API

3. Implement PDF generation for downloadable resources

4. Add homepage seminar display with registration links

5. Create wholesaler application page

6. Create partner resources page

7. Add email notifications for:
   - Seminar registrations
   - Partner applications
   - Order confirmations

## 📚 DOCUMENTATION

All API endpoints accept standard REST requests.
Image/file uploads use `multipart/form-data`.
Authentication uses session-based storage (can be enhanced with JWT).

For questions or issues, contact: astrobsm@gmail.com or +234 902 872 4839
