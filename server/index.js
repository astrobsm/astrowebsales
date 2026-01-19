import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import pool, { initializeDatabase, testConnection, getConnectionStatus } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io for real-time cross-device sync
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? true  // Allow all origins in production
      : ['http://localhost:3000', 'http://localhost:3009', 'https://astrowebsales.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Track connected clients for sync
const connectedClients = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Register device for sync
  socket.on('register-device', (deviceId) => {
    connectedClients.set(socket.id, { deviceId, socket });
    console.log(`📱 Device registered: ${deviceId}`);
    
    // Notify client of successful connection
    socket.emit('sync-connected', { 
      deviceId, 
      connectedDevices: connectedClients.size,
      timestamp: Date.now() 
    });
    
    // Broadcast to other clients that a new device connected
    socket.broadcast.emit('device-joined', { deviceId, timestamp: Date.now() });
  });
  
  // Handle state sync requests
  socket.on('sync-state', (data) => {
    const { store, action, payload, deviceId } = data;
    console.log(`🔄 Sync event: ${store}.${action} from ${deviceId}`);
    
    // Broadcast to all other connected clients
    socket.broadcast.emit('state-update', {
      store,
      action,
      payload,
      sourceDeviceId: deviceId,
      timestamp: Date.now()
    });
  });
  
  // Handle full state sync request
  socket.on('request-full-sync', (deviceId) => {
    console.log(`📥 Full sync requested by: ${deviceId}`);
    socket.broadcast.emit('provide-full-sync', { requestingDeviceId: deviceId });
  });
  
  // Handle full state response
  socket.on('full-sync-response', (data) => {
    const { targetDeviceId, state } = data;
    // Find the socket of the requesting device
    for (const [socketId, client] of connectedClients.entries()) {
      if (client.deviceId === targetDeviceId) {
        io.to(socketId).emit('receive-full-sync', state);
        break;
      }
    }
  });
  
  // Handle order notifications
  socket.on('new-order', (orderData) => {
    console.log(`📦 New order notification: ${orderData.orderNumber}`);
    io.emit('order-notification', orderData);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const client = connectedClients.get(socket.id);
    if (client) {
      console.log(`📴 Device disconnected: ${client.deviceId}`);
      socket.broadcast.emit('device-left', { deviceId: client.deviceId });
    }
    connectedClients.delete(socket.id);
  });
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins in production (same server)
    : ['http://localhost:3000', 'http://localhost:3009', 'https://astrowebsales.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend files in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// ==================== IMAGE UPLOAD API ====================

// Single image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log(`📸 Image uploaded: ${imageUrl}`);
    
    res.json({ 
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Multiple images upload endpoint
app.post('/api/upload/multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }
    
    const uploadedImages = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
    
    console.log(`📸 ${uploadedImages.length} images uploaded`);
    
    res.json({ 
      success: true,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// ==================== PRODUCTS API ====================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    // Simple query without 'active' column filter - filter in JS if column exists
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    
    // Filter out inactive products in JS (handles missing column gracefully)
    const activeRows = result.rows.filter(row => row.active !== false);
    
    // Convert to frontend format
    const products = activeRows.map(row => {
      // If we have product_data JSON, use that
      if (row.product_data) {
        const data = typeof row.product_data === 'string' ? JSON.parse(row.product_data) : row.product_data;
        return {
          ...data,
          id: data.id || row.id?.toString(),
          image: data.image || row.image_url
        };
      }
      // Otherwise construct from individual fields
      return {
        id: row.id?.toString() || '',
        name: row.name || '',
        description: row.description || '',
        category: row.category || '',
        sku: row.sku || '',
        unit: row.unit || 'Piece',
        unitsPerCarton: row.units_per_carton || 1,
        prices: {
          distributor: parseFloat(row.price_distributor) || 0,
          retail: parseFloat(row.price_retail) || 0
        },
        stock: row.stock || 0,
        minOrderQty: row.min_order_qty || 1,
        image: row.image_url || null,
        images: row.image_url ? [row.image_url] : [],
        indications: row.indications || '',
        isActive: row.active !== false,
        isFeatured: row.is_featured || false,
        createdAt: row.created_at
      };
    });
    
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (with image upload)
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    
    // Support both camelCase and snake_case
    const name = productData.name || '';
    const description = productData.description || '';
    const sku = productData.sku || '';
    const category = productData.category || '';
    const unit = productData.unit || 'Piece';
    const unitsPerCarton = productData.unitsPerCarton || productData.units_per_carton || 1;
    const priceDistributor = productData.distributorPrice || productData.price_distributor || 0;
    const priceRetail = Math.round(priceDistributor * 1.25);
    const stock = productData.stock || 0;
    const minOrderQty = productData.minOrderQty || productData.min_order_qty || 1;
    const indications = productData.indications || '';
    const isActive = productData.isActive !== false;
    const isFeatured = productData.isFeatured || false;
    const productId = productData.id || `prod-${Date.now()}`;
    
    // Handle image - from upload or from body
    let imageUrl = req.file ? `/uploads/${req.file.filename}` : (productData.image || null);

    // Full product data for JSON storage
    const fullProductData = {
      id: productId,
      name,
      description,
      category,
      sku,
      unit,
      unitsPerCarton,
      prices: {
        distributor: parseFloat(priceDistributor),
        retail: priceRetail
      },
      stock: parseInt(stock),
      minOrderQty: parseInt(minOrderQty),
      image: imageUrl,
      images: imageUrl ? [imageUrl] : [],
      indications,
      isActive,
      isFeatured,
      createdAt: new Date().toISOString()
    };

    const result = await pool.query(
      `INSERT INTO products 
       (id, name, description, sku, category, unit, units_per_carton,
        price_retail, price_distributor, stock, min_order_qty, image_url, 
        indications, active, is_featured, product_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url,
         product_data = EXCLUDED.product_data,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [productId, name, description, sku, category, unit, unitsPerCarton,
       priceRetail, priceDistributor, stock, minOrderQty, imageUrl,
       indications, isActive, isFeatured, JSON.stringify(fullProductData)]
    );

    res.status(201).json(fullProductData);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    const productId = req.params.id;
    
    const name = productData.name || '';
    const description = productData.description || '';
    const sku = productData.sku || '';
    const category = productData.category || '';
    const unit = productData.unit || 'Piece';
    const unitsPerCarton = productData.unitsPerCarton || productData.units_per_carton || 1;
    const priceDistributor = productData.distributorPrice || productData.price_distributor || 0;
    const priceRetail = Math.round(priceDistributor * 1.25);
    const stock = productData.stock || 0;
    const minOrderQty = productData.minOrderQty || productData.min_order_qty || 1;
    const indications = productData.indications || '';
    const isActive = productData.isActive !== false;
    const isFeatured = productData.isFeatured || false;
    
    // Handle image - from upload, from body, or keep existing
    let imageUrl = req.file ? `/uploads/${req.file.filename}` : (productData.image || productData.image_url || null);

    // Full product data for JSON storage
    const fullProductData = {
      id: productId,
      name,
      description,
      category,
      sku,
      unit,
      unitsPerCarton,
      prices: {
        distributor: parseFloat(priceDistributor),
        retail: priceRetail
      },
      stock: parseInt(stock),
      minOrderQty: parseInt(minOrderQty),
      image: imageUrl,
      images: imageUrl ? [imageUrl] : [],
      indications,
      isActive,
      isFeatured,
      updatedAt: new Date().toISOString()
    };

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, sku = $3, category = $4, unit = $5,
           units_per_carton = $6, price_retail = $7, price_distributor = $8,
           stock = $9, min_order_qty = $10, image_url = $11, indications = $12,
           active = $13, is_featured = $14, product_data = $15, updated_at = CURRENT_TIMESTAMP
       WHERE id = $16
       RETURNING *`,
      [name, description, sku, category, unit, unitsPerCarton, priceRetail, priceDistributor,
       stock, minOrderQty, imageUrl, indications, isActive, isFeatured, 
       JSON.stringify(fullProductData), productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(fullProductData);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('UPDATE products SET active = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ARTICLES API ====================

app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM articles WHERE published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/articles', upload.single('image'), async (req, res) => {
  try {
    const { title, content, excerpt, author, category, featured } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO articles (title, content, excerpt, author, category, image_url, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, content, excerpt, author, category, image_url, featured || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/articles/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content, excerpt, author, category, featured } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    const result = await pool.query(
      `UPDATE articles 
       SET title = $1, content = $2, excerpt = $3, author = $4, category = $5, 
           image_url = $6, featured = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, content, excerpt, author, category, image_url, featured || false, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== VIDEOS API ====================

app.get('/api/videos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM videos WHERE published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/videos', upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, url, duration, category, description } = req.body;
    const thumbnail_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO videos (title, url, thumbnail_url, duration, category, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, url, thumbnail_url, duration, category, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SEMINARS API ====================

app.get('/api/seminars', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM seminars 
       WHERE registration_open = true AND date >= CURRENT_DATE
       ORDER BY date ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/seminars/upcoming', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM seminars 
       WHERE registration_open = true AND date >= CURRENT_DATE AND featured = true
       ORDER BY date ASC
       LIMIT 3`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/seminars', upload.single('image'), async (req, res) => {
  try {
    const {
      title, description, date, time, location, venue_type,
      capacity, speaker, topics, featured
    } = req.body;
    
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO seminars 
       (title, description, date, time, location, venue_type, capacity, speaker, topics, image_url, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description, date, time, location, venue_type, capacity, speaker, topics, image_url, featured || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register for seminar
app.post('/api/seminars/:id/register', async (req, res) => {
  try {
    const { full_name, email, phone, organization, role } = req.body;
    const registration_token = Math.random().toString(36).substring(2, 15);

    // Check capacity
    const seminar = await pool.query(
      'SELECT capacity, registered_count FROM seminars WHERE id = $1',
      [req.params.id]
    );

    if (seminar.rows[0].registered_count >= seminar.rows[0].capacity) {
      return res.status(400).json({ error: 'Seminar is full' });
    }

    const result = await pool.query(
      `INSERT INTO seminar_registrations 
       (seminar_id, full_name, email, phone, organization, role, registration_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.params.id, full_name, email, phone, organization, role, registration_token]
    );

    // Update registered count
    await pool.query(
      'UPDATE seminars SET registered_count = registered_count + 1 WHERE id = $1',
      [req.params.id]
    );

    res.status(201).json({
      ...result.rows[0],
      registration_link: `${req.protocol}://${req.get('host')}/seminar-registration/${registration_token}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PARTNER APPLICATIONS API ====================

app.post('/api/partners/apply', upload.array('documents', 5), async (req, res) => {
  try {
    const {
      partner_type, company_name, contact_name, email, phone, address,
      state, city, business_type, years_in_business, tax_id,
      bank_name, account_number, account_name
    } = req.body;

    const documents = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const result = await pool.query(
      `INSERT INTO partner_applications 
       (partner_type, company_name, contact_name, email, phone, address, state, city,
        business_type, years_in_business, tax_id, bank_name, account_number, account_name, documents)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [partner_type, company_name, contact_name, email, phone, address, state, city,
       business_type, years_in_business, tax_id, bank_name, account_number, account_name, JSON.stringify(documents)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/partners/applications', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM partner_applications ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CONTACT MESSAGES API ====================

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const result = await pool.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, subject, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORDERS API ====================

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Support both camelCase and snake_case
    const order_number = orderData.orderNumber || orderData.order_number;
    const customer_name = orderData.customerName || orderData.customer_name;
    const customer_email = orderData.customerEmail || orderData.customer_email;
    const customer_phone = orderData.customerPhone || orderData.customer_phone;
    const customer_address = orderData.customerAddress || orderData.customer_address || orderData.address;
    const customer_state = orderData.customerState || orderData.customer_state || orderData.state;
    const customer_city = orderData.customerCity || orderData.customer_city || orderData.city;
    const items = orderData.items || [];
    const subtotal = orderData.subtotal || 0;
    const delivery_fee = orderData.deliveryFee || orderData.delivery_fee || 0;
    const total_amount = orderData.total || orderData.totalAmount || orderData.total_amount || 0;
    const urgency_level = orderData.urgencyLevel || orderData.urgency_level || 'routine';
    const delivery_option = orderData.deliveryMode || orderData.deliveryOption || orderData.delivery_option || 'pickup';
    const distributor_id = orderData.distributorId || orderData.distributor_id;
    const distributor_name = orderData.distributorName || orderData.distributor_name;
    const status = orderData.status || 'pending';
    const order_id = orderData.id;

    const result = await pool.query(
      `INSERT INTO orders 
       (id, order_number, customer_name, customer_email, customer_phone, customer_address,
        customer_state, customer_city, items, subtotal, delivery_fee, total_amount,
        urgency_level, delivery_option, distributor_id, distributor_name, status, order_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         order_data = EXCLUDED.order_data,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [order_id, order_number, customer_name, customer_email, customer_phone, customer_address,
       customer_state, customer_city, JSON.stringify(items), subtotal, delivery_fee, total_amount,
       urgency_level, delivery_option, distributor_id, distributor_name, status, JSON.stringify(orderData)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // Convert back to frontend format
    const orders = result.rows.map(row => {
      // If we have the full order_data, use that
      if (row.order_data) {
        const orderData = typeof row.order_data === 'string' ? JSON.parse(row.order_data) : row.order_data;
        // Ensure required fields exist
        return {
          ...orderData,
          id: orderData.id || row.id,
          orderNumber: orderData.orderNumber || row.order_number || `ORD-${row.id}`,
          customerName: orderData.customerName || row.customer_name || 'Unknown Customer',
          status: orderData.status || row.status || 'pending',
          total: orderData.total || parseFloat(row.total_amount) || 0,
          createdAt: orderData.createdAt || row.created_at
        };
      }
      // Otherwise construct from individual fields
      return {
        id: row.id?.toString() || '',
        orderNumber: row.order_number || `ORD-${row.id || 'UNKNOWN'}`,
        customerName: row.customer_name || 'Unknown Customer',
        customerEmail: row.customer_email || '',
        customerPhone: row.customer_phone || '',
        address: row.customer_address || '',
        state: row.customer_state || '',
        city: row.customer_city || '',
        items: row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : [],
        subtotal: parseFloat(row.subtotal) || 0,
        deliveryFee: parseFloat(row.delivery_fee) || 0,
        total: parseFloat(row.total_amount) || 0,
        urgencyLevel: row.urgency_level || 'routine',
        deliveryMode: row.delivery_option || 'pickup',
        distributorId: row.distributor_id || null,
        distributorName: row.distributor_name || '',
        status: row.status || 'pending',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection first
    console.log('🔄 Testing database connection...');
    const connectionResult = await testConnection();
    
    if (connectionResult.success) {
      console.log('✅ Database connection verified');
      
      // Initialize tables
      await initializeDatabase();
      console.log('✅ Database tables ready');
    } else {
      console.warn('⚠️ Database connection failed, running in offline mode');
      console.warn('   Error:', connectionResult.error);
    }
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server ready for real-time sync`);
      console.log(`📊 Database: ${connectionResult.success ? 'Connected' : 'Offline Mode'}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    // Start server anyway in offline mode
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running in OFFLINE mode on http://localhost:${PORT}`);
    });
  }
};

// ==================== DATABASE STATUS API ====================

app.get('/api/status', async (req, res) => {
  const connectionStatus = getConnectionStatus();
  const testResult = await testConnection();
  
  res.json({
    server: 'online',
    database: testResult.success ? 'connected' : 'disconnected',
    databaseHost: connectionStatus.host,
    databaseName: connectionStatus.database,
    error: testResult.error || null,
    timestamp: testResult.timestamp || null,
    connectedClients: connectedClients.size,
    uptime: process.uptime()
  });
});

app.get('/api/status/db', async (req, res) => {
  const testResult = await testConnection();
  res.json(testResult);
});

// ==================== SPA FALLBACK ====================
// Serve index.html for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

startServer();

export default app;
