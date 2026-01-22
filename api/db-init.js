// Vercel Serverless Function - Database Initialization
import { getPool, handleCors } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  // Only allow POST for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to initialize.' });
  }

  const pool = getPool();

  try {
    // Create all tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(100) UNIQUE,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        price_retail DECIMAL(10, 2),
        price_distributor DECIMAL(10, 2),
        price_wholesaler DECIMAL(10, 2),
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        unit VARCHAR(50) DEFAULT 'Piece',
        specifications JSONB,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        category VARCHAR(100),
        author VARCHAR(255),
        image_url TEXT,
        published BOOLEAN DEFAULT true,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seminars (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time VARCHAR(50),
        location VARCHAR(500),
        capacity INTEGER DEFAULT 100,
        registered INTEGER DEFAULT 0,
        image_url TEXT,
        registration_fee DECIMAL(10, 2) DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seminar_registrations (
        id SERIAL PRIMARY KEY,
        seminar_id INTEGER REFERENCES seminars(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        organization VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_address TEXT,
        items JSONB NOT NULL,
        subtotal DECIMAL(10, 2),
        tax DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        address TEXT,
        type VARCHAR(50) DEFAULT 'distributor',
        status VARCHAR(50) DEFAULT 'pending',
        discount_percentage DECIMAL(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        category VARCHAR(100),
        views INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clinical Apps table for recommended apps
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinical_apps (
        id SERIAL PRIMARY KEY,
        app_id VARCHAR(100) UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        platform VARCHAR(100),
        price VARCHAR(50) DEFAULT 'Free',
        icon VARCHAR(10),
        url TEXT,
        ios_url TEXT,
        featured BOOLEAN DEFAULT false,
        rating DECIMAL(2, 1) DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Training courses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS training_courses (
        id SERIAL PRIMARY KEY,
        course_id VARCHAR(100) UNIQUE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        instructor VARCHAR(255),
        duration VARCHAR(100),
        level VARCHAR(50),
        certification BOOLEAN DEFAULT false,
        price VARCHAR(50) DEFAULT 'Free',
        image_url TEXT,
        students INTEGER DEFAULT 0,
        rating DECIMAL(2, 1) DEFAULT 0,
        modules JSONB,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Offices/locations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offices (
        id SERIAL PRIMARY KEY,
        office_id VARCHAR(100) UNIQUE,
        title VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(100),
        email VARCHAR(255),
        hours VARCHAR(255),
        is_headquarters BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Downloads/resources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS downloads (
        id SERIAL PRIMARY KEY,
        download_id VARCHAR(100) UNIQUE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        file_url TEXT,
        file_size VARCHAR(50),
        file_type VARCHAR(50),
        downloads INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Education topics table (for syncing education content)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS education_topics (
        id SERIAL PRIMARY KEY,
        topic_id VARCHAR(100) UNIQUE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        icon VARCHAR(10),
        article_count INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Education articles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS education_articles (
        id SERIAL PRIMARY KEY,
        article_id VARCHAR(100) UNIQUE,
        topic_id VARCHAR(100),
        title VARCHAR(500) NOT NULL,
        content TEXT,
        excerpt TEXT,
        author VARCHAR(255),
        category VARCHAR(100),
        read_time VARCHAR(50),
        featured BOOLEAN DEFAULT false,
        references_list JSONB,
        article_date DATE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return res.status(200).json({ 
      success: true, 
      message: 'Database tables initialized successfully',
      tables: ['products', 'articles', 'seminars', 'seminar_registrations', 'orders', 'partners', 'contact_messages', 'videos', 'clinical_apps', 'training_courses', 'offices', 'downloads', 'education_topics', 'education_articles']
    });

  } catch (error) {
    console.error('DB Init Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
