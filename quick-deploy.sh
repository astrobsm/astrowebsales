#!/bin/bash
# Quick Deployment Script for ASTROBSM Sales Platform
# Run this on your Digital Ocean droplet to deploy latest changes

set -e  # Exit on error

echo "🚀 ASTROBSM Quick Deployment"
echo "=============================="

# Navigate to app directory
cd /var/www/astrobsm

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install any new dependencies
echo "📦 Installing dependencies..."
npm install --production

# Run database migrations if needed
echo "🔄 Running database initialization/migrations..."
node -e "
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'doadmin',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 25060,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Create clinical_apps table if not exists
    await client.query(\`
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
    \`);
    console.log('✅ clinical_apps table ready');

    // Create training_courses table if not exists
    await client.query(\`
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
    \`);
    console.log('✅ training_courses table ready');

    // Create offices table if not exists
    await client.query(\`
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
    \`);
    console.log('✅ offices table ready');

    // Create downloads table if not exists
    await client.query(\`
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
    \`);
    console.log('✅ downloads table ready');

    // Create products table if not exists
    await client.query(\`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(100),
        category VARCHAR(100),
        subcategory VARCHAR(100),
        price_retail DECIMAL(10, 2),
        price_distributor DECIMAL(10, 2),
        price_wholesaler DECIMAL(10, 2),
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        unit VARCHAR(50) DEFAULT 'Piece',
        indications TEXT,
        is_featured BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    console.log('✅ products table ready');

    // Create orders table if not exists
    await client.query(\`
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
    \`);
    console.log('✅ orders table ready');

    client.release();
    console.log('✅ All migrations complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrate();
" || echo "⚠️ Migration warning - check database connection"

# Restart the application with PM2
echo "🔄 Restarting application..."
pm2 restart astrobsm || pm2 start ecosystem.config.cjs

# Show status
echo ""
echo "✅ Deployment Complete!"
echo "=============================="
pm2 status astrobsm
echo ""
echo "📋 View logs: pm2 logs astrobsm"
