#!/bin/bash
# Quick Deployment Script for ASTROBSM Sales Platform
# Run this on your Digital Ocean droplet to deploy latest changes

set -e  # Exit on error

echo "🚀 ASTROBSM Quick Deployment"
echo "=============================="

# Navigate to app directory
cd /var/www/astrowebsales

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

    // Create partners table if not exists
    await client.query(\`
      CREATE TABLE IF NOT EXISTS partners (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        contact_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        state VARCHAR(100),
        city VARCHAR(100),
        type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        must_change_password BOOLEAN DEFAULT true,
        territory JSONB DEFAULT '[]',
        bank_name VARCHAR(255),
        account_number VARCHAR(100),
        account_name VARCHAR(255),
        last_login TIMESTAMP,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    
    // Add missing columns to partners table
    await client.query(\`
      DO \$\$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'username') THEN
          ALTER TABLE partners ADD COLUMN username VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'password') THEN
          ALTER TABLE partners ADD COLUMN password VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'company_name') THEN
          ALTER TABLE partners ADD COLUMN company_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'contact_name') THEN
          ALTER TABLE partners ADD COLUMN contact_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'address') THEN
          ALTER TABLE partners ADD COLUMN address TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'city') THEN
          ALTER TABLE partners ADD COLUMN city VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'status') THEN
          ALTER TABLE partners ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'updated_at') THEN
          ALTER TABLE partners ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END \$\$;
    \`);
    console.log('✅ partners table ready');

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

    // Create orders table if not exists - with VARCHAR id for UUID support
    await client.query(\`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_address TEXT,
        items JSONB,
        subtotal DECIMAL(10, 2),
        tax DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    console.log('✅ orders table ready');

    // Fix id column type if it's integer (change to VARCHAR for UUID support)
    await client.query(\`
      DO \$\$
      BEGIN
        -- Check if id column is integer type and alter it
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'orders' AND column_name = 'id' 
          AND data_type IN ('integer', 'bigint')
        ) THEN
          -- Drop the primary key constraint first with CASCADE
          ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey CASCADE;
          -- Drop any default sequence
          ALTER TABLE orders ALTER COLUMN id DROP DEFAULT;
          -- Change id column to VARCHAR
          ALTER TABLE orders ALTER COLUMN id TYPE VARCHAR(100) USING id::VARCHAR;
          -- Re-add primary key
          ALTER TABLE orders ADD PRIMARY KEY (id);
        END IF;
      END \$\$;
    \`);
    console.log('✅ orders id column type verified');

    // Add missing columns to orders table if they don't exist
    await client.query(\`
      DO \$\$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
          ALTER TABLE orders ADD COLUMN order_number VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
          ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
          ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
          ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_address') THEN
          ALTER TABLE orders ADD COLUMN customer_address TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_state') THEN
          ALTER TABLE orders ADD COLUMN customer_state VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_city') THEN
          ALTER TABLE orders ADD COLUMN customer_city VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'items') THEN
          ALTER TABLE orders ADD COLUMN items JSONB;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal') THEN
          ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_fee') THEN
          ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
          ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10, 2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tax') THEN
          ALTER TABLE orders ADD COLUMN tax DECIMAL(10, 2) DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total') THEN
          ALTER TABLE orders ADD COLUMN total DECIMAL(10, 2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'urgency_level') THEN
          ALTER TABLE orders ADD COLUMN urgency_level VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_option') THEN
          ALTER TABLE orders ADD COLUMN delivery_option VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'distributor_id') THEN
          ALTER TABLE orders ADD COLUMN distributor_id VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'distributor_name') THEN
          ALTER TABLE orders ADD COLUMN distributor_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
          ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_data') THEN
          ALTER TABLE orders ADD COLUMN order_data JSONB;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
          ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
          ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'notes') THEN
          ALTER TABLE orders ADD COLUMN notes TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_at') THEN
          ALTER TABLE orders ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
          ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END \$\$;
    \`);
    console.log('✅ orders table columns verified');

    // Add active column to all tables that need it
    await client.query(\`
      DO \$\$
      BEGIN
        -- Add active to staff
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'active') THEN
          ALTER TABLE staff ADD COLUMN active BOOLEAN DEFAULT true;
        END IF;
        -- Add active to distributors
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'distributors' AND column_name = 'active') THEN
          ALTER TABLE distributors ADD COLUMN active BOOLEAN DEFAULT true;
        END IF;
        -- Add active to feedback
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback' AND column_name = 'active') THEN
          ALTER TABLE feedback ADD COLUMN active BOOLEAN DEFAULT true;
        END IF;
        -- Add active to settings
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'active') THEN
          ALTER TABLE settings ADD COLUMN active BOOLEAN DEFAULT true;
        END IF;
        -- Add active to partners
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'active') THEN
          ALTER TABLE partners ADD COLUMN active BOOLEAN DEFAULT true;
        END IF;
      END \$\$;
    \`);
    console.log('✅ active column verified for all tables');

    // Drop and recreate staff table with correct schema
    await client.query(\`DROP TABLE IF EXISTS staff CASCADE\`);
    await client.query(\`
      CREATE TABLE staff (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        role VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        must_change_password BOOLEAN DEFAULT true,
        permissions JSONB DEFAULT '[]',
        last_login TIMESTAMP,
        activity_log JSONB DEFAULT '[]',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    console.log('✅ staff table recreated with correct schema');

    // Create distributors table if not exists
    await client.query(\`
      CREATE TABLE IF NOT EXISTS distributors (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(100),
        zone VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(255),
        bank_name VARCHAR(255),
        account_number VARCHAR(100),
        account_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        is_primary BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    console.log('✅ distributors table ready');

    // Create feedback table if not exists
    await client.query(\`
      CREATE TABLE IF NOT EXISTS feedback (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        subject VARCHAR(500),
        message TEXT,
        rating INTEGER DEFAULT 0,
        type VARCHAR(50) DEFAULT 'general',
        status VARCHAR(50) DEFAULT 'new',
        priority VARCHAR(50) DEFAULT 'normal',
        assigned_to VARCHAR(100),
        responses JSONB DEFAULT '[]',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    console.log('✅ feedback table ready');

    // Drop and recreate settings table with correct schema
    await client.query(\`DROP TABLE IF EXISTS settings CASCADE\`);
    await client.query(\`
      CREATE TABLE settings (
        id VARCHAR(100) PRIMARY KEY DEFAULT 'global',
        company_info JSONB DEFAULT '{}',
        appearance JSONB DEFAULT '{}',
        slideshow JSONB DEFAULT '{}',
        email_settings JSONB DEFAULT '{}',
        order_settings JSONB DEFAULT '{}',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    console.log('✅ settings table recreated with correct schema');

    // Create sync_state table for full state sync
    await client.query(\`
      CREATE TABLE IF NOT EXISTS sync_state (
        id VARCHAR(100) PRIMARY KEY DEFAULT 'main',
        staff_data JSONB DEFAULT '[]',
        partners_data JSONB DEFAULT '[]',
        distributors_data JSONB DEFAULT '[]',
        feedback_data JSONB DEFAULT '[]',
        settings_data JSONB DEFAULT '{}',
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    console.log('✅ sync_state table ready');

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
pm2 restart astrowebsales || pm2 start ecosystem.config.cjs

# Show status
echo ""
echo "✅ Deployment Complete!"
echo "=============================="
pm2 status astrowebsales
echo ""
echo "📋 View logs: pm2 logs astrowebsales"
