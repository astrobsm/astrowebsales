import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { initializeDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// ==================== PRODUCTS API ====================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products WHERE active = true';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
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
    const {
      name, description, sku, category, subcategory,
      price_retail, price_distributor, price_wholesaler,
      stock, specifications
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO products 
       (name, description, sku, category, subcategory, price_retail, price_distributor, 
        price_wholesaler, stock, image_url, specifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, description, sku, category, subcategory, price_retail, price_distributor,
       price_wholesaler, stock, image_url, specifications || '{}']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const {
      name, description, sku, category, subcategory,
      price_retail, price_distributor, price_wholesaler,
      stock, specifications
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, sku = $3, category = $4, subcategory = $5,
           price_retail = $6, price_distributor = $7, price_wholesaler = $8,
           stock = $9, image_url = $10, specifications = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [name, description, sku, category, subcategory, price_retail, price_distributor,
       price_wholesaler, stock, image_url, specifications || '{}', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
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
    const {
      order_number, customer_name, customer_email, customer_phone, customer_address,
      customer_state, customer_city, items, subtotal, delivery_fee, total_amount,
      urgency_level, delivery_option, distributor_id, distributor_name
    } = req.body;

    const result = await pool.query(
      `INSERT INTO orders 
       (order_number, customer_name, customer_email, customer_phone, customer_address,
        customer_state, customer_city, items, subtotal, delivery_fee, total_amount,
        urgency_level, delivery_option, distributor_id, distributor_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [order_number, customer_name, customer_email, customer_phone, customer_address,
       customer_state, customer_city, JSON.stringify(items), subtotal, delivery_fee, total_amount,
       urgency_level, delivery_option, distributor_id, distributor_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Database: astrowebsale_db`);
      console.log(`🔑 Password: blackvelvet`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

export default app;
