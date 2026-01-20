// Product Population Script v2
// Uses string IDs (VARCHAR) matching the updated schema
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

// Complete Bonnesante product catalog with correct pricing tiers
// Prices in Naira: Wholesaler (Factory) -> Distributor -> Retail (CRP)
const PRODUCTS = [
  // ============ A. STOPAIN ============
  {
    id: 'stopain-120ml',
    name: 'STOPAIN (120 ml)',
    sku: 'BSM-STP-120',
    category: 'solutions',
    description: 'Fast-acting pain relief solution for topical application. Provides quick relief from muscle and joint pain.',
    indications: 'Muscle pain, joint pain, arthritis, backaches, sprains',
    unit: 'Bottle',
    unitsPerCarton: 24,
    prices: { wholesaler: 2100, distributor: 2400, retail: 2800 },
    stock: 500,
    minOrderQty: 1,
    isFeatured: true
  },

  // ============ B. WOUND-CARE HONEY GAUZE ============
  // Big Size
  {
    id: 'honey-gauze-big-pkt',
    name: 'Wound-Care Honey Gauze Big Size (Packet)',
    sku: 'BSM-HGB-PKT',
    category: 'gauze',
    description: 'Medical-grade honey-impregnated gauze for advanced wound healing. Big size for larger wounds.',
    indications: 'Burns, ulcers, surgical wounds, chronic wounds, diabetic foot ulcers',
    unit: 'Packet',
    unitsPerCarton: 50,
    prices: { wholesaler: 3500, distributor: 4000, retail: 4700 },
    stock: 300,
    minOrderQty: 1,
    isFeatured: true
  },
  {
    id: 'honey-gauze-big-ctn',
    name: 'Wound-Care Honey Gauze Big Size (Carton)',
    sku: 'BSM-HGB-CTN',
    category: 'gauze',
    description: 'Medical-grade honey-impregnated gauze for advanced wound healing. Carton of 50 packets.',
    indications: 'Burns, ulcers, surgical wounds, chronic wounds, diabetic foot ulcers',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 175000, distributor: 200000, retail: 235000 },
    stock: 50,
    minOrderQty: 1,
    isFeatured: false
  },
  // Small Size
  {
    id: 'honey-gauze-small-pkt',
    name: 'Wound-Care Honey Gauze Small Size (Packet)',
    sku: 'BSM-HGS-PKT',
    category: 'gauze',
    description: 'Medical-grade honey-impregnated gauze for advanced wound healing. Small size for minor wounds.',
    indications: 'Minor burns, small ulcers, surgical sites, cuts',
    unit: 'Packet',
    unitsPerCarton: 50,
    prices: { wholesaler: 2500, distributor: 2900, retail: 3400 },
    stock: 400,
    minOrderQty: 1,
    isFeatured: false
  },
  {
    id: 'honey-gauze-small-ctn',
    name: 'Wound-Care Honey Gauze Small Size (Carton)',
    sku: 'BSM-HGS-CTN',
    category: 'gauze',
    description: 'Medical-grade honey-impregnated gauze. Carton of 50 small size packets.',
    indications: 'Minor burns, small ulcers, surgical sites, cuts',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 125000, distributor: 145000, retail: 170000 },
    stock: 50,
    minOrderQty: 1,
    isFeatured: false
  },

  // ============ C. WOUND-CLEX SOLUTION ============
  {
    id: 'wound-clex-500ml',
    name: 'Wound-Clex Solution (500 ml)',
    sku: 'BSM-WCX-500',
    category: 'solutions',
    description: 'Advanced wound cleansing solution with antimicrobial properties. Safe for all wound types.',
    indications: 'Wound irrigation, wound bed preparation, infection prevention',
    unit: 'Bottle',
    unitsPerCarton: 24,
    prices: { wholesaler: 3000, distributor: 3500, retail: 4100 },
    stock: 400,
    minOrderQty: 1,
    isFeatured: true
  },
  {
    id: 'wound-clex-carton',
    name: 'Wound-Clex Solution (Carton)',
    sku: 'BSM-WCX-CTN',
    category: 'solutions',
    description: 'Carton of 24 bottles of Wound-Clex solution (500ml each).',
    indications: 'Wound irrigation, wound bed preparation, infection prevention',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 72000, distributor: 84000, retail: 98400 },
    stock: 30,
    minOrderQty: 1,
    isFeatured: false
  },

  // ============ D. HERA WOUND-GEL ============
  // 100g size
  {
    id: 'hera-gel-100g',
    name: 'Hera Wound-Gel 100g',
    sku: 'BSM-HWG-100',
    category: 'gels',
    description: 'Premium wound healing gel with advanced hydrogel technology. Maintains optimal moisture balance.',
    indications: 'Burns, pressure ulcers, diabetic wounds, surgical wounds, abrasions',
    unit: 'Tube',
    unitsPerCarton: 48,
    prices: { wholesaler: 3000, distributor: 3250, retail: 4063 },
    stock: 500,
    minOrderQty: 1,
    isFeatured: true
  },
  {
    id: 'hera-gel-100g-ctn',
    name: 'Hera Wound-Gel 100g (Carton)',
    sku: 'BSM-HWG-100-CTN',
    category: 'gels',
    description: 'Carton of 48 tubes of Hera Wound-Gel 100g.',
    indications: 'Burns, pressure ulcers, diabetic wounds, surgical wounds, abrasions',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 144000, distributor: 156000, retail: 195000 },
    stock: 30,
    minOrderQty: 1,
    isFeatured: false
  },
  // 40g size
  {
    id: 'hera-gel-40g',
    name: 'Hera Wound-Gel 40g',
    sku: 'BSM-HWG-40',
    category: 'gels',
    description: 'Premium wound healing gel in convenient travel size. Perfect for first aid kits.',
    indications: 'Minor burns, small wounds, abrasions, cuts',
    unit: 'Tube',
    unitsPerCarton: 96,
    prices: { wholesaler: 1500, distributor: 1750, retail: 2063 },
    stock: 600,
    minOrderQty: 1,
    isFeatured: false
  },
  {
    id: 'hera-gel-40g-ctn',
    name: 'Hera Wound-Gel 40g (Carton)',
    sku: 'BSM-HWG-40-CTN',
    category: 'gels',
    description: 'Carton of 96 tubes of Hera Wound-Gel 40g.',
    indications: 'Minor burns, small wounds, abrasions, cuts',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 144000, distributor: 168000, retail: 198000 },
    stock: 20,
    minOrderQty: 1,
    isFeatured: false
  },

  // ============ E. NPWT (VAC) FOAM ============
  {
    id: 'npwt-foam',
    name: 'NPWT (VAC) Foam',
    sku: 'BSM-NPWT-FM',
    category: 'accessories',
    description: 'Negative Pressure Wound Therapy foam dressing. Compatible with major NPWT systems.',
    indications: 'Complex wounds, chronic wounds, post-surgical wounds, traumatic wounds',
    unit: 'Piece',
    unitsPerCarton: 10,
    prices: { wholesaler: 15000, distributor: 17000, retail: 20000 },
    stock: 100,
    minOrderQty: 1,
    isFeatured: true
  },

  // ============ F. DRESSING PACKS ============
  // Sterile Dressing Pack
  {
    id: 'sterile-dressing-pack',
    name: 'Sterile Dressing Pack (Piece)',
    sku: 'BSM-SDP-PC',
    category: 'gauze',
    description: 'Complete sterile dressing pack with gauze, cotton wool, and essential wound care components.',
    indications: 'Wound dressing, surgical procedures, first aid',
    unit: 'Piece',
    unitsPerCarton: 100,
    prices: { wholesaler: 550, distributor: 600, retail: 750 },
    stock: 1000,
    minOrderQty: 1,
    isFeatured: false
  },
  {
    id: 'sterile-dressing-bag',
    name: 'Sterile Dressing Pack (Bag)',
    sku: 'BSM-SDP-BG',
    category: 'gauze',
    description: 'Bag of 100 sterile dressing packs for hospitals and clinics.',
    indications: 'Wound dressing, surgical procedures, first aid',
    unit: 'Bag',
    unitsPerCarton: 1,
    prices: { wholesaler: 55000, distributor: 60000, retail: 75000 },
    stock: 50,
    minOrderQty: 1,
    isFeatured: false
  },
  // Sterile Gauze-Only Pack
  {
    id: 'sterile-gauze-pack',
    name: 'Sterile Gauze-Only Pack (Piece)',
    sku: 'BSM-SGP-PC',
    category: 'gauze',
    description: 'High-quality sterile gauze pack for wound care and medical procedures.',
    indications: 'Wound cleaning, wound packing, absorbing exudate',
    unit: 'Piece',
    unitsPerCarton: 100,
    prices: { wholesaler: 400, distributor: 450, retail: 550 },
    stock: 1200,
    minOrderQty: 1,
    isFeatured: false
  },
  {
    id: 'sterile-gauze-bag',
    name: 'Sterile Gauze-Only Pack (Bag)',
    sku: 'BSM-SGP-BG',
    category: 'gauze',
    description: 'Bag of 100 sterile gauze packs.',
    indications: 'Wound cleaning, wound packing, absorbing exudate',
    unit: 'Bag',
    unitsPerCarton: 1,
    prices: { wholesaler: 40000, distributor: 45000, retail: 55000 },
    stock: 60,
    minOrderQty: 1,
    isFeatured: false
  },

  // ============ G. BANDAGES ============
  // Coban 4 inch
  {
    id: 'coban-4inch-pc',
    name: 'Coban Bandage – 4 inch (Piece)',
    sku: 'BSM-CB4-PC',
    category: 'bandages',
    description: 'Self-adherent cohesive bandage. Sticks to itself, not to skin or hair.',
    indications: 'Compression therapy, wound securing, sports injuries, IV securing',
    unit: 'Piece',
    unitsPerCarton: 36,
    prices: { wholesaler: 900, distributor: 1000, retail: 1200 },
    stock: 800,
    minOrderQty: 1,
    isFeatured: false
  },
  {
    id: 'coban-4inch-ctn',
    name: 'Coban Bandage – 4 inch (Carton)',
    sku: 'BSM-CB4-CTN',
    category: 'bandages',
    description: 'Carton of 36 Coban 4-inch bandages.',
    indications: 'Compression therapy, wound securing, sports injuries',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 32400, distributor: 36000, retail: 43200 },
    stock: 40,
    minOrderQty: 1,
    isFeatured: false
  },
  // Coban 6 inch
  {
    id: 'coban-6inch-pc',
    name: 'Coban Bandage – 6 inch (Piece)',
    sku: 'BSM-CB6-PC',
    category: 'bandages',
    description: 'Wide self-adherent cohesive bandage for larger areas.',
    indications: 'Large wound compression, post-operative care, limb immobilization',
    unit: 'Piece',
    unitsPerCarton: 24,
    prices: { wholesaler: 1400, distributor: 1600, retail: 1900 },
    stock: 500,
    minOrderQty: 1,
    isFeatured: false
  },
  {
    id: 'coban-6inch-ctn',
    name: 'Coban Bandage – 6 inch (Carton)',
    sku: 'BSM-CB6-CTN',
    category: 'bandages',
    description: 'Carton of 24 Coban 6-inch bandages.',
    indications: 'Large wound compression, post-operative care, limb immobilization',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 33600, distributor: 38400, retail: 45600 },
    stock: 30,
    minOrderQty: 1,
    isFeatured: false
  },

  // ============ H. OTHER PRODUCTS ============
  // Opsite Dressing
  {
    id: 'opsite-dressing',
    name: 'Opsite Dressing (Piece)',
    sku: 'BSM-OPS-PC',
    category: 'gauze',
    description: 'Transparent film dressing for wound protection and IV site care.',
    indications: 'IV site protection, minor wounds, post-operative wounds, moisture barrier',
    unit: 'Piece',
    unitsPerCarton: 50,
    prices: { wholesaler: 800, distributor: 900, retail: 1100 },
    stock: 600,
    minOrderQty: 1,
    isFeatured: false
  },

  // Silicone Products
  {
    id: 'silicone-foot-pad',
    name: 'Silicone Foot Pad (Pair)',
    sku: 'BSM-SFP-PR',
    category: 'silicone',
    description: 'Medical-grade silicone foot pads for pressure relief and comfort.',
    indications: 'Foot pressure relief, diabetic foot care, heel pain, plantar fasciitis',
    unit: 'Pair',
    unitsPerCarton: 50,
    prices: { wholesaler: 2500, distributor: 2800, retail: 3300 },
    stock: 200,
    minOrderQty: 1,
    isFeatured: false
  },
  {
    id: 'silicone-scar-sheet-pkt',
    name: 'Silicone Scar Sheet (Packet)',
    sku: 'BSM-SSS-PKT',
    category: 'silicone',
    description: 'Medical-grade silicone sheet for scar management and prevention.',
    indications: 'Scar reduction, keloid prevention, hypertrophic scar treatment, post-surgical scars',
    unit: 'Packet',
    unitsPerCarton: 100,
    prices: { wholesaler: 3000, distributor: 3400, retail: 4000 },
    stock: 300,
    minOrderQty: 1,
    isFeatured: true
  },
  {
    id: 'silicone-scar-sheet-blk',
    name: 'Silicone Scar Sheet (Block)',
    sku: 'BSM-SSS-BLK',
    category: 'silicone',
    description: 'Block of 100 silicone scar sheets for clinics and hospitals.',
    indications: 'Scar reduction, keloid prevention, hypertrophic scar treatment',
    unit: 'Block',
    unitsPerCarton: 1,
    prices: { wholesaler: 300000, distributor: 340000, retail: 400000 },
    stock: 15,
    minOrderQty: 1,
    isFeatured: false
  },

  // Skin Staples
  {
    id: 'skin-staples',
    name: 'Skin Staples (Piece)',
    sku: 'BSM-SKS-PC',
    category: 'instruments',
    description: 'Sterile disposable skin stapler for wound closure.',
    indications: 'Surgical wound closure, laceration repair, scalp wounds',
    unit: 'Piece',
    unitsPerCarton: 12,
    prices: { wholesaler: 5000, distributor: 5500, retail: 6500 },
    stock: 150,
    minOrderQty: 1,
    isFeatured: false
  }
];

async function populateProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting product population (v2)...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of PRODUCTS) {
      try {
        // Build the full product data for JSON storage
        const fullProductData = {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          sku: product.sku,
          unit: product.unit,
          unitsPerCarton: product.unitsPerCarton,
          prices: {
            distributor: product.prices.distributor,
            retail: product.prices.retail,
            wholesaler: product.prices.wholesaler
          },
          stock: product.stock,
          minOrderQty: product.minOrderQty,
          image: null,
          images: [],
          indications: product.indications,
          isActive: true,
          isFeatured: product.isFeatured || false,
          createdAt: new Date().toISOString()
        };
        
        await client.query(`
          INSERT INTO products 
          (id, name, description, sku, category, unit, units_per_carton,
           price_retail, price_distributor, price_wholesaler, stock, min_order_qty, 
           image_url, indications, active, is_featured, product_data)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            sku = EXCLUDED.sku,
            category = EXCLUDED.category,
            unit = EXCLUDED.unit,
            units_per_carton = EXCLUDED.units_per_carton,
            price_retail = EXCLUDED.price_retail,
            price_distributor = EXCLUDED.price_distributor,
            price_wholesaler = EXCLUDED.price_wholesaler,
            stock = EXCLUDED.stock,
            min_order_qty = EXCLUDED.min_order_qty,
            indications = EXCLUDED.indications,
            active = EXCLUDED.active,
            is_featured = EXCLUDED.is_featured,
            product_data = EXCLUDED.product_data,
            updated_at = CURRENT_TIMESTAMP
        `, [
          product.id,
          product.name,
          product.description,
          product.sku,
          product.category,
          product.unit,
          product.unitsPerCarton,
          product.prices.retail,
          product.prices.distributor,
          product.prices.wholesaler,
          product.stock,
          product.minOrderQty,
          null, // image_url - can be added via admin panel
          product.indications,
          true, // active
          product.isFeatured,
          JSON.stringify(fullProductData)
        ]);
        
        console.log(`✅ Added: ${product.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed: ${product.name} - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Summary: ${successCount} products added, ${errorCount} errors`);
    
    // Verify count
    const countResult = await client.query('SELECT COUNT(*) FROM products WHERE active = true');
    console.log(`📦 Total active products in database: ${countResult.rows[0].count}`);
    
    // Show sample of products
    console.log(`\n📋 Sample products in database:`);
    const sampleResult = await client.query('SELECT id, name, price_retail, category FROM products LIMIT 5');
    for (const row of sampleResult.rows) {
      console.log(`   - ${row.name} (₦${row.price_retail}) [${row.category}]`);
    }
    
  } catch (error) {
    console.error('❌ Population error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

populateProducts();
