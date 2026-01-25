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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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
          retail: parseFloat(row.price_retail) || 0,
          wholesaler: parseFloat(row.price_wholesaler) || 0
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
    const priceDistributor = parseFloat(productData.distributorPrice || productData.price_distributor || 0);
    const priceRetail = parseFloat(productData.price_retail) || Math.round(priceDistributor * 1.25);
    const priceWholesaler = parseFloat(productData.price_wholesaler) || Math.round(priceDistributor * 1.1);
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
        distributor: priceDistributor,
        retail: priceRetail,
        wholesaler: priceWholesaler
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
        price_retail, price_distributor, price_wholesaler, stock, min_order_qty, image_url, 
        indications, active, is_featured, product_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url,
         product_data = EXCLUDED.product_data,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [productId, name, description, sku, category, unit, unitsPerCarton,
       priceRetail, priceDistributor, priceWholesaler, stock, minOrderQty, imageUrl,
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
    const priceDistributor = parseFloat(productData.distributorPrice || productData.price_distributor || 0);
    const priceRetail = parseFloat(productData.price_retail) || Math.round(priceDistributor * 1.25);
    const priceWholesaler = parseFloat(productData.price_wholesaler) || Math.round(priceDistributor * 1.1);
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
        distributor: priceDistributor,
        retail: priceRetail,
        wholesaler: priceWholesaler
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
           units_per_carton = $6, price_retail = $7, price_distributor = $8, price_wholesaler = $9,
           stock = $10, min_order_qty = $11, image_url = $12, indications = $13,
           active = $14, is_featured = $15, product_data = $16, updated_at = CURRENT_TIMESTAMP
       WHERE id = $17
       RETURNING *`,
      [name, description, sku, category, unit, unitsPerCarton, priceRetail, priceDistributor, priceWholesaler,
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

// ==================== CONTENT MANAGEMENT API ====================

// Get content by type or sync all
app.get('/api/content', async (req, res) => {
  const { type, id } = req.query;

  try {
    // Clinical Apps
    if (type === 'clinical-apps') {
      const result = await pool.query(
        'SELECT * FROM clinical_apps WHERE active = true ORDER BY featured DESC, rating DESC'
      );
      const apps = result.rows.map(row => ({
        id: row.app_id || `app-${row.id}`,
        name: row.name,
        description: row.description,
        category: row.category,
        platform: row.platform,
        price: row.price,
        icon: row.icon,
        url: row.url,
        iosUrl: row.ios_url,
        featured: row.featured,
        rating: parseFloat(row.rating) || 0
      }));
      return res.json(apps);
    }

    // Training courses
    if (type === 'training') {
      const result = await pool.query(
        'SELECT * FROM training_courses WHERE active = true ORDER BY rating DESC, students DESC'
      );
      const courses = result.rows.map(row => ({
        id: row.course_id || `train-${row.id}`,
        title: row.title,
        description: row.description,
        instructor: row.instructor,
        duration: row.duration,
        level: row.level,
        certification: row.certification,
        price: row.price,
        image: row.image_url,
        students: row.students || 0,
        rating: parseFloat(row.rating) || 0,
        modules: row.modules || []
      }));
      return res.json(courses);
    }

    // Offices
    if (type === 'offices') {
      const result = await pool.query(
        'SELECT * FROM offices WHERE active = true ORDER BY is_headquarters DESC, title ASC'
      );
      const offices = result.rows.map(row => ({
        id: row.office_id || `office-${row.id}`,
        title: row.title,
        address: row.address,
        phone: row.phone,
        email: row.email,
        hours: row.hours,
        isHeadquarters: row.is_headquarters
      }));
      return res.json(offices);
    }

    // Downloads
    if (type === 'downloads') {
      const result = await pool.query(
        'SELECT * FROM downloads WHERE active = true ORDER BY featured DESC, downloads DESC'
      );
      const downloads = result.rows.map(row => ({
        id: row.download_id || `dl-${row.id}`,
        title: row.title,
        description: row.description,
        category: row.category,
        fileUrl: row.file_url,
        fileSize: row.file_size,
        fileType: row.file_type,
        downloads: row.downloads || 0,
        featured: row.featured
      }));
      return res.json(downloads);
    }

    // Full sync - get all content
    if (type === 'sync') {
      const [appsResult, coursesResult, officesResult, downloadsResult] = await Promise.all([
        pool.query('SELECT * FROM clinical_apps WHERE active = true ORDER BY featured DESC'),
        pool.query('SELECT * FROM training_courses WHERE active = true ORDER BY rating DESC'),
        pool.query('SELECT * FROM offices WHERE active = true ORDER BY is_headquarters DESC'),
        pool.query('SELECT * FROM downloads WHERE active = true ORDER BY featured DESC')
      ]);

      return res.json({
        clinicalApps: appsResult.rows.map(row => ({
          id: row.app_id || `app-${row.id}`,
          name: row.name,
          description: row.description,
          category: row.category,
          platform: row.platform,
          price: row.price,
          icon: row.icon,
          url: row.url,
          iosUrl: row.ios_url,
          featured: row.featured,
          rating: parseFloat(row.rating) || 0
        })),
        training: coursesResult.rows.map(row => ({
          id: row.course_id || `train-${row.id}`,
          title: row.title,
          description: row.description,
          instructor: row.instructor,
          duration: row.duration,
          level: row.level,
          certification: row.certification,
          price: row.price,
          image: row.image_url,
          students: row.students || 0,
          rating: parseFloat(row.rating) || 0,
          modules: row.modules || []
        })),
        offices: officesResult.rows.map(row => ({
          id: row.office_id || `office-${row.id}`,
          title: row.title,
          address: row.address,
          phone: row.phone,
          email: row.email,
          hours: row.hours,
          isHeadquarters: row.is_headquarters
        })),
        downloads: downloadsResult.rows.map(row => ({
          id: row.download_id || `dl-${row.id}`,
          title: row.title,
          description: row.description,
          category: row.category,
          fileUrl: row.file_url,
          fileSize: row.file_size,
          fileType: row.file_type,
          downloads: row.downloads || 0,
          featured: row.featured
        })),
        lastSync: new Date().toISOString()
      });
    }

    return res.status(400).json({ error: 'Invalid content type. Use: clinical-apps, training, offices, downloads, or sync' });
  } catch (error) {
    console.error('Content API GET Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Create/Update content
app.post('/api/content', async (req, res) => {
  const { type } = req.query;
  const body = req.body;

  try {
    // Clinical Apps
    if (type === 'clinical-apps') {
      const { id: appId, name, description, category, platform, price, icon, url, iosUrl, featured, rating } = body;
      const result = await pool.query(`
        INSERT INTO clinical_apps (app_id, name, description, category, platform, price, icon, url, ios_url, featured, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (app_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          platform = EXCLUDED.platform,
          price = EXCLUDED.price,
          icon = EXCLUDED.icon,
          url = EXCLUDED.url,
          ios_url = EXCLUDED.ios_url,
          featured = EXCLUDED.featured,
          rating = EXCLUDED.rating,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [appId || `app-${Date.now()}`, name, description, category, platform, price || 'Free', icon, url, iosUrl, featured || false, rating || 0]);
      return res.status(201).json(result.rows[0]);
    }

    // Training courses
    if (type === 'training') {
      const { id: courseId, title, description, instructor, duration, level, certification, price, image, students, rating, modules } = body;
      const result = await pool.query(`
        INSERT INTO training_courses (course_id, title, description, instructor, duration, level, certification, price, image_url, students, rating, modules)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (course_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          instructor = EXCLUDED.instructor,
          duration = EXCLUDED.duration,
          level = EXCLUDED.level,
          certification = EXCLUDED.certification,
          price = EXCLUDED.price,
          image_url = EXCLUDED.image_url,
          students = EXCLUDED.students,
          rating = EXCLUDED.rating,
          modules = EXCLUDED.modules,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [courseId || `train-${Date.now()}`, title, description, instructor, duration, level, certification, price, image, students || 0, rating || 0, JSON.stringify(modules || [])]);
      return res.status(201).json(result.rows[0]);
    }

    // Offices
    if (type === 'offices') {
      const { id: officeId, title, address, phone, email, hours, isHeadquarters } = body;
      const result = await pool.query(`
        INSERT INTO offices (office_id, title, address, phone, email, hours, is_headquarters)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (office_id) DO UPDATE SET
          title = EXCLUDED.title,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          hours = EXCLUDED.hours,
          is_headquarters = EXCLUDED.is_headquarters,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [officeId || `office-${Date.now()}`, title, address, phone, email, hours, isHeadquarters || false]);
      return res.status(201).json(result.rows[0]);
    }

    // Downloads
    if (type === 'downloads') {
      const { id: downloadId, title, description, category, fileUrl, fileSize, fileType, featured, downloads: downloadCount } = body;
      const result = await pool.query(`
        INSERT INTO downloads (download_id, title, description, category, file_url, file_size, file_type, featured, downloads)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (download_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          file_url = EXCLUDED.file_url,
          file_size = EXCLUDED.file_size,
          file_type = EXCLUDED.file_type,
          featured = EXCLUDED.featured,
          downloads = EXCLUDED.downloads,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [downloadId || `dl-${Date.now()}`, title, description, category, fileUrl, fileSize, fileType, featured || false, downloadCount || 0]);
      return res.status(201).json(result.rows[0]);
    }

    // Full sync - save all content
    if (type === 'sync') {
      const { clinicalApps, training, offices, downloads } = body;

      // Sync clinical apps
      if (clinicalApps && clinicalApps.length > 0) {
        for (const app of clinicalApps) {
          await pool.query(`
            INSERT INTO clinical_apps (app_id, name, description, category, platform, price, icon, url, ios_url, featured, rating)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (app_id) DO UPDATE SET
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              category = EXCLUDED.category,
              platform = EXCLUDED.platform,
              price = EXCLUDED.price,
              icon = EXCLUDED.icon,
              url = EXCLUDED.url,
              ios_url = EXCLUDED.ios_url,
              featured = EXCLUDED.featured,
              rating = EXCLUDED.rating,
              updated_at = CURRENT_TIMESTAMP
          `, [app.id, app.name, app.description, app.category, app.platform, app.price, app.icon, app.url, app.iosUrl, app.featured, app.rating]);
        }
      }

      // Sync training
      if (training && training.length > 0) {
        for (const course of training) {
          await pool.query(`
            INSERT INTO training_courses (course_id, title, description, instructor, duration, level, certification, price, image_url, students, rating, modules)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (course_id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              instructor = EXCLUDED.instructor,
              duration = EXCLUDED.duration,
              level = EXCLUDED.level,
              certification = EXCLUDED.certification,
              price = EXCLUDED.price,
              image_url = EXCLUDED.image_url,
              students = EXCLUDED.students,
              rating = EXCLUDED.rating,
              modules = EXCLUDED.modules,
              updated_at = CURRENT_TIMESTAMP
          `, [course.id, course.title, course.description, course.instructor, course.duration, course.level, course.certification, course.price, course.image, course.students, course.rating, JSON.stringify(course.modules || [])]);
        }
      }

      // Sync offices
      if (offices && offices.length > 0) {
        for (const office of offices) {
          await pool.query(`
            INSERT INTO offices (office_id, title, address, phone, email, hours, is_headquarters)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (office_id) DO UPDATE SET
              title = EXCLUDED.title,
              address = EXCLUDED.address,
              phone = EXCLUDED.phone,
              email = EXCLUDED.email,
              hours = EXCLUDED.hours,
              is_headquarters = EXCLUDED.is_headquarters,
              updated_at = CURRENT_TIMESTAMP
          `, [office.id, office.title, office.address, office.phone, office.email, office.hours, office.isHeadquarters]);
        }
      }

      // Sync downloads
      if (downloads && downloads.length > 0) {
        for (const download of downloads) {
          await pool.query(`
            INSERT INTO downloads (download_id, title, description, category, file_url, file_size, file_type, featured, downloads)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (download_id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              category = EXCLUDED.category,
              file_url = EXCLUDED.file_url,
              file_size = EXCLUDED.file_size,
              file_type = EXCLUDED.file_type,
              featured = EXCLUDED.featured,
              downloads = EXCLUDED.downloads,
              updated_at = CURRENT_TIMESTAMP
          `, [download.id, download.title, download.description, download.category, download.fileUrl, download.fileSize, download.fileType, download.featured, download.downloads || 0]);
        }
      }

      return res.json({ success: true, message: 'Content synced successfully' });
    }

    return res.status(400).json({ error: 'Invalid content type. Use: clinical-apps, training, offices, downloads, or sync' });
  } catch (error) {
    console.error('Content API POST Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Update content by ID
app.put('/api/content', async (req, res) => {
  const { type, id } = req.query;
  const body = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID is required for update' });
  }

  try {
    if (type === 'clinical-apps') {
      const { name, description, category, platform, price, icon, url, iosUrl, featured, rating } = body;
      
      // First try to update existing
      const result = await pool.query(`
        UPDATE clinical_apps SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          platform = COALESCE($4, platform),
          price = COALESCE($5, price),
          icon = COALESCE($6, icon),
          url = COALESCE($7, url),
          ios_url = COALESCE($8, ios_url),
          featured = COALESCE($9, featured),
          rating = COALESCE($10, rating),
          updated_at = CURRENT_TIMESTAMP
        WHERE app_id = $11 OR id::text = $11
        RETURNING *
      `, [name, description, category, platform, price, icon, url, iosUrl, featured, rating, id]);
      
      if (result.rows[0]) {
        return res.json(result.rows[0]);
      }
      
      // If no row was updated, insert as new
      const insertResult = await pool.query(`
        INSERT INTO clinical_apps (app_id, name, description, category, platform, price, icon, url, ios_url, featured, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (app_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          platform = EXCLUDED.platform,
          price = EXCLUDED.price,
          icon = EXCLUDED.icon,
          url = EXCLUDED.url,
          ios_url = EXCLUDED.ios_url,
          featured = EXCLUDED.featured,
          rating = EXCLUDED.rating,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [id, name, description, category, platform, price || 'Free', icon, url, iosUrl, featured || false, rating || 0]);
      
      return res.json(insertResult.rows[0] || { success: true, id });
    }

    // Add similar PUT handlers for other types as needed
    return res.status(400).json({ error: 'Invalid content type' });
  } catch (error) {
    console.error('Content API PUT Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Delete content by ID
app.delete('/api/content', async (req, res) => {
  const { type, id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID is required for delete' });
  }

  try {
    if (type === 'clinical-apps') {
      await pool.query('UPDATE clinical_apps SET active = false WHERE app_id = $1 OR id::text = $1', [id]);
      return res.json({ success: true });
    }

    if (type === 'training') {
      await pool.query('UPDATE training_courses SET active = false WHERE course_id = $1 OR id::text = $1', [id]);
      return res.json({ success: true });
    }

    if (type === 'offices') {
      await pool.query('UPDATE offices SET active = false WHERE office_id = $1 OR id::text = $1', [id]);
      return res.json({ success: true });
    }

    if (type === 'downloads') {
      await pool.query('UPDATE downloads SET active = false WHERE download_id = $1 OR id::text = $1', [id]);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid content type' });
  } catch (error) {
    console.error('Content API DELETE Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ==================== PARTNERS API ====================

// Get all partners
app.get('/api/partners', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM partners WHERE active = true ORDER BY created_at DESC'
    );
    const partners = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      password: row.password,
      companyName: row.company_name,
      contactName: row.contact_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      state: row.state,
      city: row.city,
      type: row.type,
      status: row.status,
      mustChangePassword: row.must_change_password,
      territory: row.territory || [],
      bankName: row.bank_name,
      accountNumber: row.account_number,
      accountName: row.account_name,
      lastLogin: row.last_login,
      createdAt: row.created_at
    }));
    res.json(partners);
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create/Update partner
app.post('/api/partners', async (req, res) => {
  try {
    const partner = req.body;
    
    const result = await pool.query(`
      INSERT INTO partners (
        id, username, password, company_name, contact_name, email, phone, 
        address, state, city, type, status, must_change_password, territory,
        bank_name, account_number, account_name, last_login
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        company_name = EXCLUDED.company_name,
        contact_name = EXCLUDED.contact_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        state = EXCLUDED.state,
        city = EXCLUDED.city,
        type = EXCLUDED.type,
        status = EXCLUDED.status,
        must_change_password = EXCLUDED.must_change_password,
        territory = EXCLUDED.territory,
        bank_name = EXCLUDED.bank_name,
        account_number = EXCLUDED.account_number,
        account_name = EXCLUDED.account_name,
        last_login = EXCLUDED.last_login,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      partner.id,
      partner.username,
      partner.password,
      partner.companyName,
      partner.contactName,
      partner.email,
      partner.phone,
      partner.address,
      partner.state,
      partner.city,
      partner.type,
      partner.status || 'active',
      partner.mustChangePassword !== false,
      JSON.stringify(partner.territory || []),
      partner.bankName,
      partner.accountNumber,
      partner.accountName,
      partner.lastLogin
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create/Update partner error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk sync partners
app.post('/api/partners/sync', async (req, res) => {
  try {
    const { partners } = req.body;
    
    if (!partners || !Array.isArray(partners)) {
      return res.status(400).json({ error: 'Partners array is required' });
    }
    
    for (const partner of partners) {
      await pool.query(`
        INSERT INTO partners (
          id, username, password, company_name, contact_name, email, phone, 
          address, state, city, type, status, must_change_password, territory,
          bank_name, account_number, account_name, last_login
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          company_name = EXCLUDED.company_name,
          contact_name = EXCLUDED.contact_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          state = EXCLUDED.state,
          city = EXCLUDED.city,
          type = EXCLUDED.type,
          status = EXCLUDED.status,
          must_change_password = EXCLUDED.must_change_password,
          territory = EXCLUDED.territory,
          bank_name = EXCLUDED.bank_name,
          account_number = EXCLUDED.account_number,
          account_name = EXCLUDED.account_name,
          last_login = EXCLUDED.last_login,
          updated_at = CURRENT_TIMESTAMP
      `, [
        partner.id,
        partner.username,
        partner.password,
        partner.companyName,
        partner.contactName,
        partner.email,
        partner.phone,
        partner.address,
        partner.state,
        partner.city,
        partner.type,
        partner.status || 'active',
        partner.mustChangePassword !== false,
        JSON.stringify(partner.territory || []),
        partner.bankName,
        partner.accountNumber,
        partner.accountName,
        partner.lastLogin
      ]);
    }
    
    res.json({ success: true, count: partners.length });
  } catch (error) {
    console.error('Sync partners error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete partner
app.delete('/api/partners/:id', async (req, res) => {
  try {
    await pool.query('UPDATE partners SET active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Partner login
app.post('/api/partners/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM partners WHERE email = $1 AND active = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const partner = result.rows[0];
    
    if (partner.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    if (partner.status !== 'active') {
      return res.status(401).json({ success: false, error: 'Account is inactive' });
    }
    
    // Update last login
    await pool.query('UPDATE partners SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [partner.id]);
    
    // Return user data
    res.json({
      success: true,
      user: {
        id: partner.id,
        name: partner.contact_name || partner.company_name,
        companyName: partner.company_name,
        role: partner.type || 'distributor',
        email: partner.email,
        phone: partner.phone,
        state: partner.state,
        territory: partner.territory || [],
        bankName: partner.bank_name,
        accountNumber: partner.account_number,
        accountName: partner.account_name,
        mustChangePassword: partner.must_change_password
      }
    });
  } catch (error) {
    console.error('Partner login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ==================== COMPREHENSIVE SYNC API ====================

// Full sync - get all data for cross-device sync
app.get('/api/sync/full', async (req, res) => {
  try {
    // Helper function to safely query a table
    const safeQuery = async (query, fallback = []) => {
      try {
        const result = await pool.query(query);
        return result;
      } catch (err) {
        console.warn('Query failed (table may not exist or missing column):', err.message);
        return { rows: fallback };
      }
    };

    const [
      staffResult,
      partnersResult,
      distributorsResult,
      feedbackResult,
      settingsResult,
      productsResult,
      ordersResult,
      contentResult
    ] = await Promise.all([
      safeQuery('SELECT * FROM staff ORDER BY created_at DESC'),
      safeQuery('SELECT * FROM partners ORDER BY created_at DESC'),
      safeQuery('SELECT * FROM distributors ORDER BY name'),
      safeQuery('SELECT * FROM feedback ORDER BY created_at DESC'),
      safeQuery('SELECT * FROM settings WHERE id = \'global\''),
      safeQuery('SELECT * FROM products ORDER BY name'),
      safeQuery('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100'),
      safeQuery(`
        SELECT 
          (SELECT json_agg(row_to_json(ca)) FROM clinical_apps ca) as clinical_apps,
          (SELECT json_agg(row_to_json(tc)) FROM training_courses tc) as training,
          (SELECT json_agg(row_to_json(o)) FROM offices o) as offices,
          (SELECT json_agg(row_to_json(d)) FROM downloads d) as downloads
      `)
    ]);

    res.json({
      staff: staffResult.rows.map(row => ({
        id: row.id,
        username: row.username,
        password: row.password,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        status: row.status,
        mustChangePassword: row.must_change_password,
        permissions: row.permissions || [],
        lastLogin: row.last_login,
        activityLog: row.activity_log || [],
        createdAt: row.created_at
      })),
      partners: partnersResult.rows.map(row => ({
        id: row.id,
        username: row.username,
        password: row.password,
        companyName: row.company_name,
        contactName: row.contact_name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        state: row.state,
        city: row.city,
        type: row.type,
        status: row.status,
        mustChangePassword: row.must_change_password,
        territory: row.territory || [],
        bankName: row.bank_name,
        accountNumber: row.account_number,
        accountName: row.account_name,
        lastLogin: row.last_login,
        createdAt: row.created_at
      })),
      distributors: distributorsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        state: row.state,
        zone: row.zone,
        phone: row.phone,
        email: row.email,
        bankName: row.bank_name,
        accountNumber: row.account_number,
        accountName: row.account_name,
        isActive: row.is_active,
        isPrimary: row.is_primary
      })),
      feedback: feedbackResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
        rating: row.rating,
        type: row.type,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assigned_to,
        responses: row.responses || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      settings: settingsResult.rows[0] ? {
        companyInfo: settingsResult.rows[0].company_info || {},
        appearance: settingsResult.rows[0].appearance || {},
        slideshow: settingsResult.rows[0].slideshow || {},
        emailSettings: settingsResult.rows[0].email_settings || {},
        orderSettings: settingsResult.rows[0].order_settings || {},
        accessSettings: settingsResult.rows[0].access_settings || {}
      } : null,
      products: productsResult.rows,
      orders: ordersResult.rows.map(row => row.order_data || row),
      content: {
        clinicalApps: (contentResult.rows[0]?.clinical_apps || []).map(app => ({
          id: app.app_id || `app-${app.id}`,
          name: app.name,
          description: app.description,
          category: app.category,
          platform: app.platform,
          price: app.price,
          icon: app.icon,
          url: app.url,
          iosUrl: app.ios_url,
          featured: app.featured,
          rating: parseFloat(app.rating) || 0
        })),
        training: (contentResult.rows[0]?.training || []).map(course => ({
          id: course.course_id || `train-${course.id}`,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          duration: course.duration,
          level: course.level,
          certification: course.certification,
          price: course.price,
          image: course.image_url,
          students: course.students || 0,
          rating: parseFloat(course.rating) || 0,
          modules: course.modules || []
        })),
        offices: (contentResult.rows[0]?.offices || []).map(office => ({
          id: office.office_id || `office-${office.id}`,
          title: office.title,
          address: office.address,
          phone: office.phone,
          email: office.email,
          hours: office.hours,
          isHeadquarters: office.is_headquarters
        })),
        downloads: (contentResult.rows[0]?.downloads || []).map(dl => ({
          id: dl.download_id || `dl-${dl.id}`,
          title: dl.title,
          description: dl.description,
          category: dl.category,
          fileUrl: dl.file_url,
          fileSize: dl.file_size,
          fileType: dl.file_type,
          downloads: dl.downloads || 0,
          featured: dl.featured
        }))
      },
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Full sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Full sync - push all data
app.post('/api/sync/full', async (req, res) => {
  try {
    const { staff, partners, distributors, feedback, settings, content } = req.body;
    const errors = [];

    // Sync staff
    if (staff && staff.length > 0) {
      console.log(`📥 Syncing ${staff.length} staff members...`);
      for (const s of staff) {
        try {
          // First try to update by ID, then try by username
          const result = await pool.query(`
            INSERT INTO staff (id, username, password, name, email, phone, role, status, must_change_password, permissions, last_login, activity_log)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
              username = EXCLUDED.username,
              password = EXCLUDED.password,
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone,
              role = EXCLUDED.role,
              status = EXCLUDED.status,
              must_change_password = EXCLUDED.must_change_password,
              permissions = EXCLUDED.permissions,
              last_login = EXCLUDED.last_login,
              activity_log = EXCLUDED.activity_log,
              updated_at = CURRENT_TIMESTAMP
            RETURNING id
          `, [s.id, s.username, s.password, s.name, s.email, s.phone, s.role, s.status || 'active', s.mustChangePassword !== false, JSON.stringify(s.permissions || []), s.lastLogin || null, JSON.stringify(s.activityLog || [])]);
          console.log(`✅ Synced staff: ${s.username} (${s.id})`);
        } catch (err) {
          // If username conflict, try updating by username instead
          if (err.code === '23505' && err.constraint && err.constraint.includes('username')) {
            try {
              await pool.query(`
                UPDATE staff SET
                  password = $2,
                  name = $3,
                  email = $4,
                  phone = $5,
                  role = $6,
                  status = $7,
                  must_change_password = $8,
                  permissions = $9,
                  last_login = $10,
                  activity_log = $11,
                  updated_at = CURRENT_TIMESTAMP
                WHERE username = $1
              `, [s.username, s.password, s.name, s.email, s.phone, s.role, s.status || 'active', s.mustChangePassword !== false, JSON.stringify(s.permissions || []), s.lastLogin || null, JSON.stringify(s.activityLog || [])]);
              console.log(`✅ Updated staff by username: ${s.username}`);
            } catch (updateErr) {
              console.error(`Staff update error for ${s.username}:`, updateErr.message);
              errors.push(`Staff ${s.id}: ${updateErr.message}`);
            }
          } else {
            console.error(`Staff sync error for ${s.username}:`, err.message);
            errors.push(`Staff ${s.id}: ${err.message}`);
          }
        }
      }
    }

    // Sync partners - using simpler columns that definitely exist
    if (partners && partners.length > 0) {
      for (const p of partners) {
        try {
          // Use simpler insert with only columns that exist in the partners table
          await pool.query(`
            INSERT INTO partners (id, username, password, company_name, contact_name, email, phone, address, state, city, type, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
              username = EXCLUDED.username,
              password = EXCLUDED.password,
              company_name = EXCLUDED.company_name,
              contact_name = EXCLUDED.contact_name,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone,
              address = EXCLUDED.address,
              state = EXCLUDED.state,
              city = EXCLUDED.city,
              type = EXCLUDED.type,
              status = EXCLUDED.status,
              updated_at = CURRENT_TIMESTAMP
          `, [p.id, p.username, p.password, p.companyName, p.contactName, p.email, p.phone, p.address, p.state, p.city, p.type, p.status || 'active']);
          console.log('✅ Synced partner:', p.id);
        } catch (err) {
          console.error('Partner sync error:', err.message);
          errors.push(`Partner ${p.id}: ${err.message}`);
        }
      }
    }

    // Sync distributors
    if (distributors && distributors.length > 0) {
      for (const d of distributors) {
        try {
          await pool.query(`
            INSERT INTO distributors (id, name, state, zone, phone, email, bank_name, account_number, account_name, is_active, is_primary)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              state = EXCLUDED.state,
              zone = EXCLUDED.zone,
              phone = EXCLUDED.phone,
              email = EXCLUDED.email,
              bank_name = EXCLUDED.bank_name,
              account_number = EXCLUDED.account_number,
              account_name = EXCLUDED.account_name,
              is_active = EXCLUDED.is_active,
              is_primary = EXCLUDED.is_primary,
              updated_at = CURRENT_TIMESTAMP
          `, [d.id, d.name, d.state, d.zone, d.phone, d.email, d.bankName, d.accountNumber, d.accountName, d.isActive !== false, d.isPrimary || false]);
        } catch (err) {
          console.error('Distributor sync error:', err.message);
          errors.push(`Distributor ${d.id}: ${err.message}`);
        }
      }
    }

    // Sync feedback
    if (feedback && feedback.length > 0) {
      for (const f of feedback) {
        try {
          await pool.query(`
            INSERT INTO feedback (id, name, email, phone, subject, message, rating, type, status, priority, assigned_to, responses)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone,
              subject = EXCLUDED.subject,
              message = EXCLUDED.message,
              rating = EXCLUDED.rating,
              type = EXCLUDED.type,
              status = EXCLUDED.status,
              priority = EXCLUDED.priority,
              assigned_to = EXCLUDED.assigned_to,
              responses = EXCLUDED.responses,
              updated_at = CURRENT_TIMESTAMP
          `, [f.id, f.name, f.email, f.phone, f.subject, f.message, f.rating || 0, f.type || 'general', f.status || 'new', f.priority || 'normal', f.assignedTo || null, JSON.stringify(f.responses || [])]);
        } catch (err) {
          console.error('Feedback sync error:', err.message);
          errors.push(`Feedback ${f.id}: ${err.message}`);
        }
      }
    }

    // Sync settings
    if (settings) {
      try {
        await pool.query(`
          INSERT INTO settings (id, company_info, appearance, slideshow, email_settings, order_settings)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            company_info = EXCLUDED.company_info,
            appearance = EXCLUDED.appearance,
            slideshow = EXCLUDED.slideshow,
            email_settings = EXCLUDED.email_settings,
            order_settings = EXCLUDED.order_settings,
            updated_at = CURRENT_TIMESTAMP
        `, ['global', JSON.stringify(settings.companyInfo || {}), JSON.stringify(settings.appearance || {}), JSON.stringify(settings.slideshow || {}), JSON.stringify(settings.emailSettings || {}), JSON.stringify(settings.orderSettings || {})]);
        console.log('✅ Settings synced');
      } catch (err) {
        console.error('Settings sync error:', err.message);
        errors.push(`Settings: ${err.message}`);
      }
    }

    // Sync content (clinical apps, training, offices, downloads)
    if (content) {
      if (content.clinicalApps) {
        for (const app of content.clinicalApps) {
          try {
            await pool.query(`
              INSERT INTO clinical_apps (app_id, name, description, category, platform, price, icon, url, ios_url, featured, rating)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (app_id) DO UPDATE SET
                name = EXCLUDED.name, description = EXCLUDED.description, category = EXCLUDED.category,
                platform = EXCLUDED.platform, price = EXCLUDED.price, icon = EXCLUDED.icon,
                url = EXCLUDED.url, ios_url = EXCLUDED.ios_url, featured = EXCLUDED.featured,
                rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
            `, [app.id, app.name, app.description, app.category, app.platform, app.price, app.icon, app.url, app.iosUrl, app.featured, app.rating]);
          } catch (err) {
            console.error('Clinical app sync error:', err.message);
            errors.push(`Clinical app ${app.id}: ${err.message}`);
          }
        }
      }

      if (content.training) {
        for (const course of content.training) {
          try {
            await pool.query(`
              INSERT INTO training_courses (course_id, title, description, instructor, duration, level, certification, price, image_url, students, rating, modules)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              ON CONFLICT (course_id) DO UPDATE SET
                title = EXCLUDED.title, description = EXCLUDED.description, instructor = EXCLUDED.instructor,
                duration = EXCLUDED.duration, level = EXCLUDED.level, certification = EXCLUDED.certification,
                price = EXCLUDED.price, image_url = EXCLUDED.image_url, students = EXCLUDED.students,
                rating = EXCLUDED.rating, modules = EXCLUDED.modules, updated_at = CURRENT_TIMESTAMP
            `, [course.id, course.title, course.description, course.instructor, course.duration, course.level, course.certification, course.price, course.image, course.students, course.rating, JSON.stringify(course.modules || [])]);
          } catch (err) {
            console.error('Training sync error:', err.message);
            errors.push(`Training ${course.id}: ${err.message}`);
          }
        }
      }

      if (content.offices) {
        for (const office of content.offices) {
          try {
            await pool.query(`
              INSERT INTO offices (office_id, title, address, phone, email, hours, is_headquarters)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (office_id) DO UPDATE SET
                title = EXCLUDED.title, address = EXCLUDED.address, phone = EXCLUDED.phone,
                email = EXCLUDED.email, hours = EXCLUDED.hours, is_headquarters = EXCLUDED.is_headquarters,
                updated_at = CURRENT_TIMESTAMP
            `, [office.id, office.title, office.address, office.phone, office.email, office.hours, office.isHeadquarters]);
          } catch (err) {
            console.error('Office sync error:', err.message);
            errors.push(`Office ${office.id}: ${err.message}`);
          }
        }
      }

      if (content.downloads) {
        for (const dl of content.downloads) {
          try {
            await pool.query(`
              INSERT INTO downloads (download_id, title, description, category, file_url, file_size, file_type, featured, downloads)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (download_id) DO UPDATE SET
                title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category,
                file_url = EXCLUDED.file_url, file_size = EXCLUDED.file_size, file_type = EXCLUDED.file_type,
                featured = EXCLUDED.featured, downloads = EXCLUDED.downloads, updated_at = CURRENT_TIMESTAMP
            `, [dl.id, dl.title, dl.description, dl.category, dl.fileUrl, dl.fileSize, dl.fileType, dl.featured, dl.downloads]);
          } catch (err) {
            console.error('Download sync error:', err.message);
            errors.push(`Download ${dl.id}: ${err.message}`);
          }
        }
      }
    }

    // Broadcast sync to other devices via WebSocket
    io.emit('state-update', {
      store: 'sync',
      action: 'full-sync-completed',
      timestamp: Date.now()
    });

    // Return success with any errors that occurred
    if (errors.length > 0) {
      console.log('Sync completed with errors:', errors);
    }
    
    res.json({ success: true, message: 'Full sync completed', errors: errors.length > 0 ? errors : undefined, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Full sync push error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STAFF API ====================

app.get('/api/staff', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff ORDER BY created_at DESC');
    res.json(result.rows.map(row => ({
      id: row.id,
      username: row.username,
      password: row.password,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status,
      mustChangePassword: row.must_change_password,
      permissions: row.permissions || [],
      lastLogin: row.last_login,
      activityLog: row.activity_log || [],
      createdAt: row.created_at
    })));
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const s = req.body;
    const result = await pool.query(`
      INSERT INTO staff (id, username, password, name, email, phone, role, status, must_change_password, permissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username, password = EXCLUDED.password, name = EXCLUDED.name,
        email = EXCLUDED.email, phone = EXCLUDED.phone, role = EXCLUDED.role,
        status = EXCLUDED.status, must_change_password = EXCLUDED.must_change_password,
        permissions = EXCLUDED.permissions, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [s.id, s.username, s.password, s.name, s.email, s.phone, s.role, s.status || 'active', s.mustChangePassword !== false, JSON.stringify(s.permissions || [])]);
    
    io.emit('state-update', { store: 'staff', action: 'add', payload: result.rows[0], timestamp: Date.now() });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Staff login endpoint
app.post('/api/staff/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    
    const result = await pool.query(
      'SELECT * FROM staff WHERE email = $1 AND status = $2',
      [email, 'active']
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const staff = result.rows[0];
    
    if (staff.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Update last login
    await pool.query('UPDATE staff SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [staff.id]);
    
    // Return user data
    res.json({
      success: true,
      user: {
        id: staff.id,
        name: staff.name,
        username: staff.username,
        role: staff.role,
        email: staff.email,
        phone: staff.phone,
        permissions: staff.permissions || [],
        mustChangePassword: staff.must_change_password
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ==================== DISTRIBUTORS API ====================

app.get('/api/distributors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM distributors WHERE active = true ORDER BY name');
    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      state: row.state,
      zone: row.zone,
      phone: row.phone,
      email: row.email,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      accountName: row.account_name,
      isActive: row.is_active,
      isPrimary: row.is_primary
    })));
  } catch (error) {
    console.error('Get distributors error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/distributors', async (req, res) => {
  try {
    const d = req.body;
    const result = await pool.query(`
      INSERT INTO distributors (id, name, state, zone, phone, email, bank_name, account_number, account_name, is_active, is_primary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, state = EXCLUDED.state, zone = EXCLUDED.zone,
        phone = EXCLUDED.phone, email = EXCLUDED.email, bank_name = EXCLUDED.bank_name,
        account_number = EXCLUDED.account_number, account_name = EXCLUDED.account_name,
        is_active = EXCLUDED.is_active, is_primary = EXCLUDED.is_primary, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [d.id || `dist-${Date.now()}`, d.name, d.state, d.zone, d.phone, d.email, d.bankName, d.accountNumber, d.accountName, d.isActive !== false, d.isPrimary || false]);
    
    io.emit('state-update', { store: 'distributors', action: 'add', payload: result.rows[0], timestamp: Date.now() });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create distributor error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update distributor
app.put('/api/distributors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const d = req.body;
    console.log(`📝 Updating distributor ${id}:`, d);
    
    const result = await pool.query(`
      UPDATE distributors SET
        name = $2, state = $3, zone = $4, phone = $5, email = $6,
        bank_name = $7, account_number = $8, account_name = $9,
        is_active = $10, is_primary = $11, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, d.name, d.state, d.zone, d.phone, d.email, d.bankName, d.accountNumber, d.accountName, d.isActive !== false, d.isPrimary || false]);
    
    if (result.rows.length === 0) {
      // If not found, insert it
      const insertResult = await pool.query(`
        INSERT INTO distributors (id, name, state, zone, phone, email, bank_name, account_number, account_name, is_active, is_primary)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [id, d.name, d.state, d.zone, d.phone, d.email, d.bankName, d.accountNumber, d.accountName, d.isActive !== false, d.isPrimary || false]);
      
      io.emit('state-update', { store: 'distributors', action: 'add', payload: insertResult.rows[0], timestamp: Date.now() });
      console.log(`✅ Distributor ${id} inserted (not found for update)`);
      return res.json(insertResult.rows[0]);
    }
    
    io.emit('state-update', { store: 'distributors', action: 'update', payload: result.rows[0], timestamp: Date.now() });
    console.log(`✅ Distributor ${id} updated successfully`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update distributor error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== FEEDBACK API ====================

app.get('/api/feedback', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feedback WHERE active = true ORDER BY created_at DESC');
    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      subject: row.subject,
      message: row.message,
      rating: row.rating,
      type: row.type,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to,
      responses: row.responses || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })));
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const f = req.body;
    const result = await pool.query(`
      INSERT INTO feedback (id, name, email, phone, subject, message, rating, type, status, priority, assigned_to, responses)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone,
        subject = EXCLUDED.subject, message = EXCLUDED.message, rating = EXCLUDED.rating,
        type = EXCLUDED.type, status = EXCLUDED.status, priority = EXCLUDED.priority,
        assigned_to = EXCLUDED.assigned_to, responses = EXCLUDED.responses, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [f.id || `FB-${Date.now()}`, f.name, f.email, f.phone, f.subject, f.message, f.rating || 0, f.type || 'general', f.status || 'new', f.priority || 'normal', f.assignedTo, JSON.stringify(f.responses || [])]);
    
    io.emit('state-update', { store: 'feedback', action: 'add', payload: result.rows[0], timestamp: Date.now() });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SETTINGS API ====================

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE id = $1', ['global']);
    if (result.rows[0]) {
      res.json({
        companyInfo: result.rows[0].company_info || {},
        appearance: result.rows[0].appearance || {},
        slideshow: result.rows[0].slideshow || {},
        emailSettings: result.rows[0].email_settings || {},
        orderSettings: result.rows[0].order_settings || {},
        accessSettings: result.rows[0].access_settings || {}
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const s = req.body;
    const result = await pool.query(`
      INSERT INTO settings (id, company_info, appearance, slideshow, email_settings, order_settings, access_settings)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        company_info = EXCLUDED.company_info, appearance = EXCLUDED.appearance,
        slideshow = EXCLUDED.slideshow, email_settings = EXCLUDED.email_settings,
        order_settings = EXCLUDED.order_settings, access_settings = EXCLUDED.access_settings,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, ['global', JSON.stringify(s.companyInfo || {}), JSON.stringify(s.appearance || {}), JSON.stringify(s.slideshow || {}), JSON.stringify(s.emailSettings || {}), JSON.stringify(s.orderSettings || {}), JSON.stringify(s.accessSettings || {})]);
    
    io.emit('state-update', { store: 'settings', action: 'update', payload: s, timestamp: Date.now() });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
