import pg from 'pg';
const { Pool } = pg;

// PostgreSQL connection configuration for DigitalOcean
// All credentials should be set via environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'doadmin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'astrobsm',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false // Required for DigitalOcean managed databases
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  statement_timeout: 30000,
});

// Note: Set these environment variables for production:
// DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DB_SSL=true

// Database connection state
let isConnected = false;
let connectionError = null;

// Test database connection
pool.on('connect', () => {
  isConnected = true;
  connectionError = null;
  console.log('✅ Connected to DigitalOcean PostgreSQL database');
});

pool.on('error', (err) => {
  isConnected = false;
  connectionError = err.message;
  console.error('❌ Database connection error:', err.message);
});

// Get connection status
export const getConnectionStatus = () => ({
  isConnected,
  error: connectionError,
  host: pool.options.host,
  database: pool.options.database
});

// Test connection function
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    isConnected = true;
    connectionError = null;
    return { 
      success: true, 
      timestamp: result.rows[0].current_time,
      message: 'Database connection successful'
    };
  } catch (error) {
    isConnected = false;
    connectionError = error.message;
    return { 
      success: false, 
      error: error.message,
      message: 'Database connection failed'
    };
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        price_retail DECIMAL(10, 2),
        price_distributor DECIMAL(10, 2),
        price_wholesaler DECIMAL(10, 2),
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        specifications JSONB,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Education Articles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        excerpt TEXT,
        author VARCHAR(255),
        category VARCHAR(100),
        image_url TEXT,
        featured BOOLEAN DEFAULT false,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Videos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        url TEXT,
        thumbnail_url TEXT,
        duration VARCHAR(20),
        category VARCHAR(100),
        description TEXT,
        views INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Training Courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS training_courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        duration VARCHAR(100),
        level VARCHAR(50),
        price DECIMAL(10, 2),
        modules INTEGER DEFAULT 0,
        students INTEGER DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        image_url TEXT,
        featured BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Downloads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS downloads (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        file_url TEXT,
        file_type VARCHAR(20),
        file_size VARCHAR(20),
        category VARCHAR(100),
        download_count INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seminars table
    await client.query(`
      CREATE TABLE IF NOT EXISTS seminars (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        date DATE,
        time VARCHAR(50),
        location VARCHAR(255),
        venue_type VARCHAR(50),
        capacity INTEGER,
        registered_count INTEGER DEFAULT 0,
        speaker VARCHAR(255),
        topics JSONB,
        image_url TEXT,
        registration_open BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seminar Registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS seminar_registrations (
        id SERIAL PRIMARY KEY,
        seminar_id INTEGER REFERENCES seminars(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        organization VARCHAR(255),
        role VARCHAR(100),
        registration_token VARCHAR(100) UNIQUE,
        confirmed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Partner Applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS partner_applications (
        id SERIAL PRIMARY KEY,
        partner_type VARCHAR(50) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT,
        state VARCHAR(100),
        city VARCHAR(100),
        business_type VARCHAR(100),
        years_in_business INTEGER,
        tax_id VARCHAR(100),
        bank_name VARCHAR(100),
        account_number VARCHAR(50),
        account_name VARCHAR(255),
        documents JSONB,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table (enhanced)
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50) NOT NULL,
        customer_address TEXT,
        customer_state VARCHAR(100),
        customer_city VARCHAR(100),
        items JSONB NOT NULL,
        subtotal DECIMAL(10, 2),
        delivery_fee DECIMAL(10, 2),
        total_amount DECIMAL(10, 2),
        urgency_level VARCHAR(50),
        delivery_option VARCHAR(50),
        distributor_id INTEGER,
        distributor_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        escalation_level INTEGER DEFAULT 0,
        escalation_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contact Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(500),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        replied BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance (with IF NOT EXISTS and error handling)
    const createIndexes = async () => {
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
        'CREATE INDEX IF NOT EXISTS idx_seminars_date ON seminars(date)',
        'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
        'CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number)'
      ];
      
      // Try to create optional indexes that depend on columns that may not exist
      const optionalIndexes = [
        'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
        'CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)'
      ];
      
      for (const sql of indexes) {
        try {
          await client.query(sql);
        } catch (e) {
          console.log(`Note: Could not create index: ${e.message}`);
        }
      }
      
      for (const sql of optionalIndexes) {
        try {
          await client.query(sql);
        } catch (e) {
          // Silently ignore - column may not exist
        }
      }
    };
    
    await createIndexes();

    await client.query('COMMIT');
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
