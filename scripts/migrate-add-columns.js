import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

// Database configuration - uses same env vars as populate script
const pool = new Pool({
  user: process.env.DB_USER || 'doadmin',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 25060,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running database migration...\n');
    
    // Add missing columns to products table
    const alterStatements = [
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100)`,
        description: 'Adding sku column'
      },
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`,
        description: 'Adding active column'
      },
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100)`,
        description: 'Adding category column'
      },
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100)`,
        description: 'Adding subcategory column'
      },
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS price_wholesaler DECIMAL(10, 2)`,
        description: 'Adding price_wholesaler column'
      },
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS price_distributor DECIMAL(10, 2)`,
        description: 'Adding price_distributor column'
      },
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(50)`,
        description: 'Adding unit column'
      },
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS minimum_order INTEGER DEFAULT 1`,
        description: 'Adding minimum_order column'
      },
      {
        sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`,
        description: 'Adding image_url column'
      }
    ];
    
    for (const stmt of alterStatements) {
      try {
        await client.query(stmt.sql);
        console.log(`✅ ${stmt.description}`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`⏭️  ${stmt.description} - column already exists`);
        } else {
          console.error(`❌ ${stmt.description} - ${err.message}`);
        }
      }
    }
    
    // Verify the current schema
    console.log('\n📋 Current products table schema:');
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);
    
    console.log('\n' + '-'.repeat(70));
    console.log('Column Name'.padEnd(25) + 'Type'.padEnd(20) + 'Nullable'.padEnd(10) + 'Default');
    console.log('-'.repeat(70));
    
    for (const row of schemaResult.rows) {
      console.log(
        row.column_name.padEnd(25) + 
        row.data_type.padEnd(20) + 
        row.is_nullable.padEnd(10) + 
        (row.column_default || 'null')
      );
    }
    console.log('-'.repeat(70));
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📌 Next step: Run the product population script:');
    console.log('   node scripts/populate-all-products.js');
    
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
