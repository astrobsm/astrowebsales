// Database Schema Fix Script
// Run with: node scripts/fix-database-schema.js

import pg from 'pg';
const { Pool } = pg;

// Use individual environment variables (same as server/database.js)
const pool = new Pool({
  user: process.env.DB_USER || 'doadmin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

async function fixDatabaseSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting database schema fix...\n');
    
    // Fix staff table
    console.log('📋 Fixing staff table...');
    const staffColumns = [
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS username VARCHAR(100)',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS role VARCHAR(50)',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(255)',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone VARCHAR(50)',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS password VARCHAR(255)',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT \'{}\'',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'active\'',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ];
    
    for (const sql of staffColumns) {
      try {
        await client.query(sql);
        console.log('  ✅', sql.replace('ALTER TABLE staff ADD COLUMN IF NOT EXISTS ', ''));
      } catch (err) {
        console.log('  ⚠️', err.message);
      }
    }
    
    // Fix settings table
    console.log('\n📋 Fixing settings table...');
    const settingsColumns = [
      'ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_info JSONB DEFAULT \'{}\'',
      'ALTER TABLE settings ADD COLUMN IF NOT EXISTS voice_settings JSONB DEFAULT \'{}\'',
      'ALTER TABLE settings ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT \'{}\'',
      'ALTER TABLE settings ADD COLUMN IF NOT EXISTS sync_settings JSONB DEFAULT \'{}\'',
      'ALTER TABLE settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ];
    
    for (const sql of settingsColumns) {
      try {
        await client.query(sql);
        console.log('  ✅', sql.replace('ALTER TABLE settings ADD COLUMN IF NOT EXISTS ', ''));
      } catch (err) {
        console.log('  ⚠️', err.message);
      }
    }
    
    // Fix orders table - add created_at if missing
    console.log('\n📋 Fixing orders table...');
    const ordersColumns = [
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ];
    
    for (const sql of ordersColumns) {
      try {
        await client.query(sql);
        console.log('  ✅', sql.replace('ALTER TABLE orders ADD COLUMN IF NOT EXISTS ', ''));
      } catch (err) {
        console.log('  ⚠️', err.message);
      }
    }
    
    // Show current staff table structure
    console.log('\n📊 Current staff table structure:');
    const staffResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'staff' 
      ORDER BY ordinal_position
    `);
    console.table(staffResult.rows);
    
    // Show current settings table structure
    console.log('\n📊 Current settings table structure:');
    const settingsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'settings' 
      ORDER BY ordinal_position
    `);
    console.table(settingsResult.rows);
    
    // Show current orders table structure
    console.log('\n📊 Current orders table structure:');
    const ordersResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position
    `);
    console.table(ordersResult.rows);
    
    console.log('\n✅ Database schema fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixDatabaseSchema();
