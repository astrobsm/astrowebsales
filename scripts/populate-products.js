// Script to populate products in the database
// Run with: node scripts/populate-products.js

import fetch from 'node-fetch';

const API_URL = 'https://bonnesantemedicals.com/api/products';

// Product data with all pricing tiers
const products = [
  // A. STOPAIN
  {
    name: 'STOPAIN (120 ml)',
    sku: 'BSM-STP-120',
    category: 'Solutions',
    description: 'STOPAIN pain relief solution for topical application. Provides fast-acting relief for muscle and joint pain.',
    indications: 'For temporary relief of minor aches and pains of muscles and joints associated with simple backache, arthritis, strains, bruises, and sprains.',
    unit: 'Bottle',
    unitsPerCarton: 12,
    stock: 100,
    minOrderQty: 1,
    price_wholesaler: 4250,
    price_distributor: 4900,
    price_retail: 5700,
    isFeatured: true,
    isActive: true
  },
  
  // B. Wound-Care Honey Gauze - Big Size
  {
    name: 'Wound-Care Honey Gauze - Big Size (Packet)',
    sku: 'BSM-WCHG-BP',
    category: 'Gauze & Dressings',
    description: 'Premium medical-grade honey gauze dressing for advanced wound care. Large size for extensive wound coverage.',
    indications: 'For burns, surgical wounds, diabetic ulcers, pressure ulcers, and chronic wounds requiring antimicrobial protection.',
    unit: 'Packet',
    unitsPerCarton: 12,
    stock: 200,
    minOrderQty: 1,
    price_wholesaler: 6000,
    price_distributor: 6900,
    price_retail: 8000,
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Wound-Care Honey Gauze - Big Size (Carton)',
    sku: 'BSM-WCHG-BC',
    category: 'Gauze & Dressings',
    description: 'Premium medical-grade honey gauze dressing for advanced wound care. Large size carton pack for healthcare facilities.',
    indications: 'For burns, surgical wounds, diabetic ulcers, pressure ulcers, and chronic wounds requiring antimicrobial protection.',
    unit: 'Carton',
    unitsPerCarton: 1,
    stock: 50,
    minOrderQty: 1,
    price_wholesaler: 65000,
    price_distributor: 74500,
    price_retail: 86000,
    isFeatured: false,
    isActive: true
  },
  
  // B. Wound-Care Honey Gauze - Small Size
  {
    name: 'Wound-Care Honey Gauze - Small Size (Packet)',
    sku: 'BSM-WCHG-SP',
    category: 'Gauze & Dressings',
    description: 'Premium medical-grade honey gauze dressing for advanced wound care. Small size for targeted wound coverage.',
    indications: 'For minor burns, small surgical wounds, diabetic foot ulcers, and localized chronic wounds.',
    unit: 'Packet',
    unitsPerCarton: 20,
    stock: 300,
    minOrderQty: 1,
    price_wholesaler: 3500,
    price_distributor: 4000,
    price_retail: 4700,
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Wound-Care Honey Gauze - Small Size (Carton)',
    sku: 'BSM-WCHG-SC',
    category: 'Gauze & Dressings',
    description: 'Premium medical-grade honey gauze dressing for advanced wound care. Small size carton pack for healthcare facilities.',
    indications: 'For minor burns, small surgical wounds, diabetic foot ulcers, and localized chronic wounds.',
    unit: 'Carton',
    unitsPerCarton: 1,
    stock: 50,
    minOrderQty: 1,
    price_wholesaler: 61250,
    price_distributor: 70000,
    price_retail: 81000,
    isFeatured: false,
    isActive: true
  },
  
  // C. Wound-Clex Solution
  {
    name: 'Wound-Clex Solution (500 ml) - Bottle',
    sku: 'BSM-WCS-500B',
    category: 'Solutions',
    description: 'Wound cleansing solution with very dilute acetic acid for effective wound bed preparation and biofilm disruption.',
    indications: 'For wound cleansing, biofilm disruption, and wound bed preparation before dressing application. Effective against Pseudomonas aeruginosa.',
    unit: 'Bottle',
    unitsPerCarton: 6,
    stock: 200,
    minOrderQty: 1,
    price_wholesaler: 2300,
    price_distributor: 2650,
    price_retail: 3100,
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Wound-Clex Solution (500 ml) - Carton',
    sku: 'BSM-WCS-500C',
    category: 'Solutions',
    description: 'Wound cleansing solution carton pack. Contains 6 bottles for healthcare facilities.',
    indications: 'For wound cleansing, biofilm disruption, and wound bed preparation before dressing application.',
    unit: 'Carton',
    unitsPerCarton: 1,
    stock: 50,
    minOrderQty: 1,
    price_wholesaler: 12500,
    price_distributor: 14400,
    price_retail: 16900,
    isFeatured: false,
    isActive: true
  },
  
  // D. Hera Wound-Gel 100g
  {
    name: 'Hera Wound-Gel 100g (Tube)',
    sku: 'BSM-HWG-100T',
    category: 'Wound Gels',
    description: 'Advanced wound healing gel containing povidone-iodine, medical-grade honey, beta-sitosterol, beeswax, and antioxidants.',
    indications: 'For burns, surgical wounds, diabetic ulcers, pressure ulcers, venous leg ulcers, and chronic non-healing wounds.',
    unit: 'Tube',
    unitsPerCarton: 20,
    stock: 250,
    minOrderQty: 1,
    price_wholesaler: 3250,
    price_distributor: 3750,
    price_retail: 4700,
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Hera Wound-Gel 100g (Carton)',
    sku: 'BSM-HWG-100C',
    category: 'Wound Gels',
    description: 'Hera Wound-Gel 100g carton pack. Contains 20 tubes for healthcare facilities and distributors.',
    indications: 'For burns, surgical wounds, diabetic ulcers, pressure ulcers, and chronic wounds.',
    unit: 'Carton',
    unitsPerCarton: 1,
    stock: 30,
    minOrderQty: 1,
    price_wholesaler: 65000,
    price_distributor: 74500,
    price_retail: 86000,
    isFeatured: false,
    isActive: true
  },
  
  // D. Hera Wound-Gel 40g
  {
    name: 'Hera Wound-Gel 40g (Tube)',
    sku: 'BSM-HWG-40T',
    category: 'Wound Gels',
    description: 'Compact wound healing gel containing povidone-iodine, medical-grade honey, beta-sitosterol, beeswax, and antioxidants.',
    indications: 'For minor burns, small wounds, diabetic foot ulcers, and localized chronic wounds. Ideal for home use.',
    unit: 'Tube',
    unitsPerCarton: 24,
    stock: 300,
    minOrderQty: 1,
    price_wholesaler: 2000,
    price_distributor: 2300,
    price_retail: 2800,
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Hera Wound-Gel 40g (Carton)',
    sku: 'BSM-HWG-40C',
    category: 'Wound Gels',
    description: 'Hera Wound-Gel 40g carton pack. Contains 24 tubes for healthcare facilities and distributors.',
    indications: 'For minor burns, small wounds, diabetic foot ulcers, and localized chronic wounds.',
    unit: 'Carton',
    unitsPerCarton: 1,
    stock: 40,
    minOrderQty: 1,
    price_wholesaler: 48000,
    price_distributor: 55200,
    price_retail: 67000,
    isFeatured: false,
    isActive: true
  },
  
  // E. NPWT
  {
    name: 'NPWT (VAC) Foam',
    sku: 'BSM-NPWT-FOAM',
    category: 'Accessories',
    description: 'Negative Pressure Wound Therapy (NPWT) foam dressing for vacuum-assisted closure therapy.',
    indications: 'For use with NPWT/VAC systems in acute and chronic wound management, surgical wounds, and complex wound closure.',
    unit: 'Piece',
    unitsPerCarton: 10,
    stock: 150,
    minOrderQty: 1,
    price_wholesaler: 2000,
    price_distributor: 2300,
    price_retail: 2800,
    isFeatured: false,
    isActive: true
  },
  
  // F. Dressing Packs & Gauze
  {
    name: 'Sterile Dressing Pack (Piece)',
    sku: 'BSM-SDP-P',
    category: 'Gauze & Dressings',
    description: 'Complete sterile dressing pack containing all essentials for wound dressing changes.',
    indications: 'For wound dressing changes in clinical and home settings. Contains gauze, cotton balls, and dressing essentials.',
    unit: 'Piece',
    unitsPerCarton: 50,
    stock: 500,
    minOrderQty: 1,
    price_wholesaler: 600,
    price_distributor: 690,
    price_retail: 850,
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Sterile Dressing Pack (Bag)',
    sku: 'BSM-SDP-B',
    category: 'Gauze & Dressings',
    description: 'Bulk pack of sterile dressing packs for healthcare facilities.',
    indications: 'For wound dressing changes in hospitals, clinics, and nursing stations.',
    unit: 'Bag',
    unitsPerCarton: 1,
    stock: 50,
    minOrderQty: 1,
    price_wholesaler: 10000,
    price_distributor: 11500,
    price_retail: 14000,
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Sterile Gauze-Only Pack (Piece)',
    sku: 'BSM-SGP-P',
    category: 'Gauze & Dressings',
    description: 'Sterile gauze pack for wound care and dressing.',
    indications: 'For wound cleaning, packing, and dressing. Suitable for all wound types.',
    unit: 'Piece',
    unitsPerCarton: 50,
    stock: 500,
    minOrderQty: 1,
    price_wholesaler: 600,
    price_distributor: 690,
    price_retail: 850,
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Sterile Gauze-Only Pack (Bag)',
    sku: 'BSM-SGP-B',
    category: 'Gauze & Dressings',
    description: 'Bulk pack of sterile gauze packs for healthcare facilities.',
    indications: 'For wound cleaning, packing, and dressing in hospitals and clinics.',
    unit: 'Bag',
    unitsPerCarton: 1,
    stock: 50,
    minOrderQty: 1,
    price_wholesaler: 10000,
    price_distributor: 11500,
    price_retail: 14000,
    isFeatured: false,
    isActive: true
  },
  
  // G. Bandages
  {
    name: 'Coban Bandage - 4 inch (Piece)',
    sku: 'BSM-CB4-P',
    category: 'Bandages',
    description: 'Self-adherent cohesive bandage, 4 inches wide. Provides excellent compression without adhesive.',
    indications: 'For wound care, compression therapy, securing dressings, and support for sprains and strains.',
    unit: 'Piece',
    unitsPerCarton: 12,
    stock: 300,
    minOrderQty: 1,
    price_wholesaler: 3500,
    price_distributor: 4000,
    price_retail: 4700,
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Coban Bandage - 4 inch (Carton)',
    sku: 'BSM-CB4-C',
    category: 'Bandages',
    description: 'Carton pack of 4-inch Coban self-adherent bandages for healthcare facilities.',
    indications: 'For wound care, compression therapy, and dressing securement in clinical settings.',
    unit: 'Carton',
    unitsPerCarton: 1,
    stock: 30,
    minOrderQty: 1,
    price_wholesaler: 37500,
    price_distributor: 43000,
    price_retail: 50000,
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Coban Bandage - 6 inch (Piece)',
    sku: 'BSM-CB6-P',
    category: 'Bandages',
    description: 'Self-adherent cohesive bandage, 6 inches wide. Ideal for larger limbs and body areas.',
    indications: 'For wound care, compression therapy on larger areas, securing dressings on torso and thigh.',
    unit: 'Piece',
    unitsPerCarton: 12,
    stock: 200,
    minOrderQty: 1,
    price_wholesaler: 4500,
    price_distributor: 5200,
    price_retail: 6000,
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Coban Bandage - 6 inch (Carton)',
    sku: 'BSM-CB6-C',
    category: 'Bandages',
    description: 'Carton pack of 6-inch Coban self-adherent bandages for healthcare facilities.',
    indications: 'For wound care, compression therapy, and dressing securement in clinical settings.',
    unit: 'Carton',
    unitsPerCarton: 1,
    stock: 25,
    minOrderQty: 1,
    price_wholesaler: 48500,
    price_distributor: 55800,
    price_retail: 65000,
    isFeatured: false,
    isActive: true
  },
  
  // H. Other Wound & Surgical Products
  {
    name: 'Opsite Dressing (Piece)',
    sku: 'BSM-OPD-P',
    category: 'Gauze & Dressings',
    description: 'Transparent adhesive film dressing for wound protection and moisture retention.',
    indications: 'For superficial wounds, IV sites, minor burns, and as a secondary dressing over other wound care products.',
    unit: 'Piece',
    unitsPerCarton: 50,
    stock: 200,
    minOrderQty: 1,
    price_wholesaler: 6000,
    price_distributor: 6900,
    price_retail: 8000,
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Silicone Foot Pad (Pair)',
    sku: 'BSM-SFP-PR',
    category: 'Silicone Products',
    description: 'Medical-grade silicone foot pads for pressure relief and foot protection.',
    indications: 'For diabetic foot protection, pressure relief, and prevention of foot ulcers.',
    unit: 'Pair',
    unitsPerCarton: 20,
    stock: 150,
    minOrderQty: 1,
    price_wholesaler: 2000,
    price_distributor: 2300,
    price_retail: 2800,
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Silicone Scar Sheet (Packet)',
    sku: 'BSM-SSS-PK',
    category: 'Silicone Products',
    description: 'Medical-grade silicone sheets for scar management and reduction.',
    indications: 'For prevention and treatment of hypertrophic scars and keloids from surgery, burns, or injuries.',
    unit: 'Packet',
    unitsPerCarton: 10,
    stock: 100,
    minOrderQty: 1,
    price_wholesaler: 10000,
    price_distributor: 11500,
    price_retail: 14000,
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Silicone Scar Sheet (Block)',
    sku: 'BSM-SSS-BL',
    category: 'Silicone Products',
    description: 'Large medical-grade silicone block for extensive scar treatment. Suitable for healthcare facilities.',
    indications: 'For prevention and treatment of large hypertrophic scars and keloids in clinical settings.',
    unit: 'Block',
    unitsPerCarton: 1,
    stock: 20,
    minOrderQty: 1,
    price_wholesaler: 90000,
    price_distributor: 103500,
    price_retail: 120000,
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Skin Staples (Piece)',
    sku: 'BSM-SKS-P',
    category: 'Instruments & Tools',
    description: 'Sterile disposable skin stapler for wound closure.',
    indications: 'For surgical wound closure, laceration repair, and skin approximation.',
    unit: 'Piece',
    unitsPerCarton: 12,
    stock: 100,
    minOrderQty: 1,
    price_wholesaler: 4000,
    price_distributor: 4600,
    price_retail: 5500,
    isFeatured: false,
    isActive: true
  }
];

async function addProduct(product) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...product,
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        distributorPrice: product.price_distributor,
        prices: {
          distributor: product.price_distributor,
          retail: product.price_retail,
          wholesaler: product.price_wholesaler
        }
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Added: ${product.name}`);
      return result;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to add ${product.name}:`, error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error adding ${product.name}:`, error.message);
    return null;
  }
}

async function populateProducts() {
  console.log('🚀 Starting product population...\n');
  console.log(`📦 Adding ${products.length} products to the database...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const product of products) {
    const result = await addProduct(product);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n========================================');
  console.log(`✅ Successfully added: ${successCount} products`);
  console.log(`❌ Failed: ${failCount} products`);
  console.log('========================================\n');
}

populateProducts();
