// Comprehensive database migration script
// Handles: INTEGER to VARCHAR id conversion, foreign key constraints, all missing columns
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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running comprehensive database migration...\n');
    
    // ========== STEP 1: Check if id column needs conversion ==========
    const idColumnCheck = await client.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'id'
    `);
    
    if (idColumnCheck.rows[0]?.data_type === 'integer') {
      console.log('🔄 Converting id column from INTEGER to VARCHAR...');
      
      // Check for foreign key constraints
      const fkCheck = await client.query(`
        SELECT tc.constraint_name, tc.table_name, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND kcu.column_name = 'product_id'
      `);
      
      // Drop foreign key constraints that reference products.id
      for (const fk of fkCheck.rows) {
        console.log(`  Dropping foreign key: ${fk.constraint_name} on ${fk.table_name}`);
        await client.query(`ALTER TABLE ${fk.table_name} DROP CONSTRAINT IF EXISTS ${fk.constraint_name}`);
      }
      
      // Check if order_items.product_id exists and needs conversion
      const orderItemsCheck = await client.query(`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'product_id'
      `);
      
      if (orderItemsCheck.rows.length > 0 && orderItemsCheck.rows[0].data_type === 'integer') {
        console.log('  Converting order_items.product_id to VARCHAR...');
        await client.query(`ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(100) USING product_id::VARCHAR`);
      }
      
      // Now convert products.id
      console.log('  Dropping default on products.id...');
      try {
        await client.query(`ALTER TABLE products ALTER COLUMN id DROP DEFAULT`);
      } catch (e) {
        console.log('  (No default to drop)');
      }
      
      // Drop the sequence if it exists
      try {
        await client.query(`DROP SEQUENCE IF EXISTS products_id_seq CASCADE`);
      } catch (e) {
        // Ignore
      }
      
      console.log('  Converting products.id to VARCHAR...');
      await client.query(`ALTER TABLE products ALTER COLUMN id TYPE VARCHAR(100) USING id::VARCHAR`);
      
      console.log('✅ Successfully converted id columns to VARCHAR\n');
    } else {
      console.log('⏭️  id column is already VARCHAR\n');
    }
    
    // ========== STEP 2: Add all missing columns ==========
    console.log('📋 Adding missing columns to products table...\n');
    
    const alterStatements = [
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100)`, description: 'sku' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true`, description: 'active' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100)`, description: 'category' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100)`, description: 'subcategory' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'Piece'`, description: 'unit' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS units_per_carton INTEGER DEFAULT 1`, description: 'units_per_carton' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS price_retail DECIMAL(10, 2)`, description: 'price_retail' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS price_wholesaler DECIMAL(10, 2)`, description: 'price_wholesaler' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS price_distributor DECIMAL(10, 2)`, description: 'price_distributor' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 100`, description: 'stock' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS min_order_qty INTEGER DEFAULT 1`, description: 'min_order_qty' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`, description: 'image_url' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS indications TEXT`, description: 'indications' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`, description: 'is_featured' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS product_data JSONB`, description: 'product_data' },
      { sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, description: 'updated_at' }
    ];
    
    for (const stmt of alterStatements) {
      try {
        await client.query(stmt.sql);
        console.log(`  ✅ ${stmt.description}`);
      } catch (err) {
        if (err.code === '42701') {
          console.log(`  ⏭️  ${stmt.description} (exists)`);
        } else {
          console.error(`  ❌ ${stmt.description}: ${err.message}`);
        }
      }
    }
    
    // ========== STEP 3: Show final schema ==========
    console.log('\n📋 Final products table schema:');
    console.log('-'.repeat(70));
    
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);
    
    console.log('Column Name'.padEnd(25) + 'Type'.padEnd(20) + 'Nullable');
    console.log('-'.repeat(70));
    
    for (const row of schemaResult.rows) {
      console.log(
        row.column_name.padEnd(25) + 
        row.data_type.padEnd(20) + 
        row.is_nullable
      );
    }
    console.log('-'.repeat(70));
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📌 Next: Run node scripts/populate-products-v2.js');
    
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
