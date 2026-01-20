// Script to populate all Bonnesante products via API
// Run this in browser console or as a standalone script

const API_BASE = 'https://bonnesantemedicals.com/api';

// All products with complete pricing
const PRODUCTS = [
  // A. STOPAIN
  {
    id: 'prod-stopain-120ml',
    name: 'STOPAIN (120 ml)',
    description: 'Fast-acting pain relief solution for muscle and joint pain. Provides quick relief from aches, strains, and minor arthritis pain.',
    sku: 'BSM-STP-120',
    category: 'Solutions',
    unit: 'Bottle',
    unitsPerCarton: 12,
    prices: { wholesaler: 4250, distributor: 4900, retail: 5700 },
    stock: 200,
    minOrderQty: 1,
    indications: 'For temporary relief of minor aches and pains of muscles and joints associated with arthritis, backache, strains, and sprains.',
    isActive: true,
    isFeatured: true
  },

  // B. Wound-Care Honey Gauze - Big Size
  {
    id: 'prod-honey-gauze-big-pkt',
    name: 'Wound-Care Honey Gauze Big Size (Packet)',
    description: 'Medical-grade honey-infused gauze dressing for advanced wound care. Large size for bigger wounds. Natural antibacterial properties.',
    sku: 'BSM-HG-BIG-PKT',
    category: 'Gauze & Dressings',
    unit: 'Packet',
    unitsPerCarton: 12,
    prices: { wholesaler: 6000, distributor: 6900, retail: 8000 },
    stock: 300,
    minOrderQty: 1,
    indications: 'For chronic wounds, burns, diabetic ulcers, pressure sores, and post-surgical wounds.',
    isActive: true,
    isFeatured: true
  },
  {
    id: 'prod-honey-gauze-big-ctn',
    name: 'Wound-Care Honey Gauze Big Size (Carton)',
    description: 'Medical-grade honey-infused gauze dressing for advanced wound care. Large size carton pack for healthcare facilities.',
    sku: 'BSM-HG-BIG-CTN',
    category: 'Gauze & Dressings',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 65000, distributor: 74500, retail: 86000 },
    stock: 50,
    minOrderQty: 1,
    indications: 'For chronic wounds, burns, diabetic ulcers, pressure sores, and post-surgical wounds.',
    isActive: true,
    isFeatured: false
  },

  // B. Wound-Care Honey Gauze - Small Size
  {
    id: 'prod-honey-gauze-small-pkt',
    name: 'Wound-Care Honey Gauze Small Size (Packet)',
    description: 'Medical-grade honey-infused gauze dressing for advanced wound care. Small size for minor wounds.',
    sku: 'BSM-HG-SM-PKT',
    category: 'Gauze & Dressings',
    unit: 'Packet',
    unitsPerCarton: 20,
    prices: { wholesaler: 3500, distributor: 4000, retail: 4700 },
    stock: 400,
    minOrderQty: 1,
    indications: 'For minor cuts, abrasions, burns, and post-surgical wounds.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-honey-gauze-small-ctn',
    name: 'Wound-Care Honey Gauze Small Size (Carton)',
    description: 'Medical-grade honey-infused gauze dressing carton pack. Small size for healthcare facilities.',
    sku: 'BSM-HG-SM-CTN',
    category: 'Gauze & Dressings',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 61250, distributor: 70000, retail: 81000 },
    stock: 50,
    minOrderQty: 1,
    indications: 'For minor cuts, abrasions, burns, and post-surgical wounds.',
    isActive: true,
    isFeatured: false
  },

  // C. Wound-Clex Solution
  {
    id: 'prod-wound-clex-500ml',
    name: 'Wound-Clex Solution (500 ml)',
    description: 'Advanced wound cleansing solution with very dilute acetic acid. Disrupts biofilms and prepares wound bed for optimal healing.',
    sku: 'BSM-WCX-500',
    category: 'Solutions',
    unit: 'Bottle',
    unitsPerCarton: 6,
    prices: { wholesaler: 2300, distributor: 2650, retail: 3100 },
    stock: 500,
    minOrderQty: 1,
    indications: 'For wound bed preparation, biofilm disruption, and daily wound cleansing.',
    isActive: true,
    isFeatured: true
  },
  {
    id: 'prod-wound-clex-carton',
    name: 'Wound-Clex Solution (Carton)',
    description: 'Advanced wound cleansing solution carton pack. Contains 6 bottles of 500ml each.',
    sku: 'BSM-WCX-CTN',
    category: 'Solutions',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 12500, distributor: 14400, retail: 16900 },
    stock: 100,
    minOrderQty: 1,
    indications: 'For wound bed preparation, biofilm disruption, and daily wound cleansing.',
    isActive: true,
    isFeatured: false
  },

  // D. Hera Wound-Gel 100g
  {
    id: 'prod-hera-gel-100g',
    name: 'Hera Wound-Gel 100g',
    description: 'Premium wound healing gel with povidone-iodine, medical-grade honey, beta-sitosterol, and beeswax. Promotes faster healing.',
    sku: 'BSM-HWG-100',
    category: 'Gels',
    unit: 'Tube',
    unitsPerCarton: 20,
    prices: { wholesaler: 3250, distributor: 3750, retail: 4700 },
    stock: 350,
    minOrderQty: 1,
    indications: 'For burns, chronic wounds, diabetic ulcers, pressure sores, surgical wounds, and skin infections.',
    isActive: true,
    isFeatured: true
  },
  {
    id: 'prod-hera-gel-100g-ctn',
    name: 'Hera Wound-Gel 100g (Carton)',
    description: 'Premium wound healing gel carton pack. Contains 20 tubes of 100g each.',
    sku: 'BSM-HWG-100-CTN',
    category: 'Gels',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 65000, distributor: 74500, retail: 86000 },
    stock: 40,
    minOrderQty: 1,
    indications: 'For burns, chronic wounds, diabetic ulcers, pressure sores, surgical wounds, and skin infections.',
    isActive: true,
    isFeatured: false
  },

  // D. Hera Wound-Gel 40g
  {
    id: 'prod-hera-gel-40g',
    name: 'Hera Wound-Gel 40g',
    description: 'Compact wound healing gel with povidone-iodine, medical-grade honey, beta-sitosterol, and beeswax.',
    sku: 'BSM-HWG-40',
    category: 'Gels',
    unit: 'Tube',
    unitsPerCarton: 24,
    prices: { wholesaler: 2000, distributor: 2300, retail: 2800 },
    stock: 400,
    minOrderQty: 1,
    indications: 'For minor burns, cuts, abrasions, and small wounds.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-hera-gel-40g-ctn',
    name: 'Hera Wound-Gel 40g (Carton)',
    description: 'Compact wound healing gel carton pack. Contains 24 tubes of 40g each.',
    sku: 'BSM-HWG-40-CTN',
    category: 'Gels',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 48000, distributor: 55200, retail: 67000 },
    stock: 40,
    minOrderQty: 1,
    indications: 'For minor burns, cuts, abrasions, and small wounds.',
    isActive: true,
    isFeatured: false
  },

  // E. NPWT
  {
    id: 'prod-npwt-foam',
    name: 'NPWT (VAC) Foam',
    description: 'Negative Pressure Wound Therapy foam dressing. Used with VAC therapy systems for complex wound management.',
    sku: 'BSM-NPWT-FOAM',
    category: 'Accessories',
    unit: 'Piece',
    unitsPerCarton: 50,
    prices: { wholesaler: 2000, distributor: 2300, retail: 2800 },
    stock: 200,
    minOrderQty: 1,
    indications: 'For use with negative pressure wound therapy systems in complex wound management.',
    isActive: true,
    isFeatured: false
  },

  // F. Dressing Packs & Gauze
  {
    id: 'prod-sterile-dressing-pack',
    name: 'Sterile Dressing Pack (Piece)',
    description: 'Complete sterile dressing pack with all essential components for wound dressing changes.',
    sku: 'BSM-SDP-PC',
    category: 'Gauze & Dressings',
    unit: 'Piece',
    unitsPerCarton: 20,
    prices: { wholesaler: 600, distributor: 690, retail: 850 },
    stock: 500,
    minOrderQty: 1,
    indications: 'For aseptic wound dressing procedures in clinical and home settings.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-sterile-dressing-bag',
    name: 'Sterile Dressing Pack (Bag)',
    description: 'Bag of sterile dressing packs for healthcare facilities. Contains 20 pieces.',
    sku: 'BSM-SDP-BAG',
    category: 'Gauze & Dressings',
    unit: 'Bag',
    unitsPerCarton: 1,
    prices: { wholesaler: 10000, distributor: 11500, retail: 14000 },
    stock: 100,
    minOrderQty: 1,
    indications: 'For aseptic wound dressing procedures in clinical settings.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-sterile-gauze-pack',
    name: 'Sterile Gauze-Only Pack (Piece)',
    description: 'High-quality sterile gauze pack for wound care. Individually packaged for hygiene.',
    sku: 'BSM-SGP-PC',
    category: 'Gauze & Dressings',
    unit: 'Piece',
    unitsPerCarton: 20,
    prices: { wholesaler: 600, distributor: 690, retail: 850 },
    stock: 500,
    minOrderQty: 1,
    indications: 'For wound cleaning, covering, and protection.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-sterile-gauze-bag',
    name: 'Sterile Gauze-Only Pack (Bag)',
    description: 'Bag of sterile gauze packs for healthcare facilities. Contains 20 pieces.',
    sku: 'BSM-SGP-BAG',
    category: 'Gauze & Dressings',
    unit: 'Bag',
    unitsPerCarton: 1,
    prices: { wholesaler: 10000, distributor: 11500, retail: 14000 },
    stock: 100,
    minOrderQty: 1,
    indications: 'For wound cleaning, covering, and protection in clinical settings.',
    isActive: true,
    isFeatured: false
  },

  // G. Bandages
  {
    id: 'prod-coban-4inch-pc',
    name: 'Coban Bandage – 4 inch (Piece)',
    description: 'Self-adherent elastic bandage, 4-inch width. Provides excellent compression and stays in place without clips.',
    sku: 'BSM-CB4-PC',
    category: 'Bandages',
    unit: 'Piece',
    unitsPerCarton: 12,
    prices: { wholesaler: 3500, distributor: 4000, retail: 4700 },
    stock: 300,
    minOrderQty: 1,
    indications: 'For compression therapy, securing dressings, and support wrapping.',
    isActive: true,
    isFeatured: true
  },
  {
    id: 'prod-coban-4inch-ctn',
    name: 'Coban Bandage – 4 inch (Carton)',
    description: 'Self-adherent elastic bandage carton pack. Contains 12 pieces of 4-inch width.',
    sku: 'BSM-CB4-CTN',
    category: 'Bandages',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 37500, distributor: 43000, retail: 50000 },
    stock: 50,
    minOrderQty: 1,
    indications: 'For compression therapy, securing dressings, and support wrapping.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-coban-6inch-pc',
    name: 'Coban Bandage – 6 inch (Piece)',
    description: 'Self-adherent elastic bandage, 6-inch width. Extra wide for larger areas and better coverage.',
    sku: 'BSM-CB6-PC',
    category: 'Bandages',
    unit: 'Piece',
    unitsPerCarton: 12,
    prices: { wholesaler: 4500, distributor: 5200, retail: 6000 },
    stock: 250,
    minOrderQty: 1,
    indications: 'For compression therapy on larger limbs, securing dressings, and support wrapping.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-coban-6inch-ctn',
    name: 'Coban Bandage – 6 inch (Carton)',
    description: 'Self-adherent elastic bandage carton pack. Contains 12 pieces of 6-inch width.',
    sku: 'BSM-CB6-CTN',
    category: 'Bandages',
    unit: 'Carton',
    unitsPerCarton: 1,
    prices: { wholesaler: 48500, distributor: 55800, retail: 65000 },
    stock: 50,
    minOrderQty: 1,
    indications: 'For compression therapy on larger limbs, securing dressings, and support wrapping.',
    isActive: true,
    isFeatured: false
  },

  // H. Other Wound & Surgical Products
  {
    id: 'prod-opsite-dressing',
    name: 'Opsite Dressing (Piece)',
    description: 'Transparent film dressing for wound protection. Waterproof, breathable, and allows wound monitoring.',
    sku: 'BSM-OPS-PC',
    category: 'Gauze & Dressings',
    unit: 'Piece',
    unitsPerCarton: 50,
    prices: { wholesaler: 6000, distributor: 6900, retail: 8000 },
    stock: 200,
    minOrderQty: 1,
    indications: 'For covering and protecting minor wounds, IV sites, and surgical incisions.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-silicone-foot-pad',
    name: 'Silicone Foot Pad (Pair)',
    description: 'Medical-grade silicone foot pads for comfort and protection. Reduces pressure and friction.',
    sku: 'BSM-SFP-PR',
    category: 'Silicone Products',
    unit: 'Pair',
    unitsPerCarton: 50,
    prices: { wholesaler: 2000, distributor: 2300, retail: 2800 },
    stock: 150,
    minOrderQty: 1,
    indications: 'For foot comfort, diabetic foot protection, and pressure reduction.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-silicone-scar-sheet-pkt',
    name: 'Silicone Scar Sheet (Packet)',
    description: 'Medical-grade silicone sheet for scar management. Flattens, softens, and fades scars.',
    sku: 'BSM-SSS-PKT',
    category: 'Silicone Products',
    unit: 'Packet',
    unitsPerCarton: 20,
    prices: { wholesaler: 10000, distributor: 11500, retail: 14000 },
    stock: 100,
    minOrderQty: 1,
    indications: 'For hypertrophic scars, keloids, and post-surgical scar management.',
    isActive: true,
    isFeatured: true
  },
  {
    id: 'prod-silicone-scar-sheet-blk',
    name: 'Silicone Scar Sheet (Block)',
    description: 'Large block of medical-grade silicone sheet for scar management. Can be cut to size.',
    sku: 'BSM-SSS-BLK',
    category: 'Silicone Products',
    unit: 'Block',
    unitsPerCarton: 10,
    prices: { wholesaler: 90000, distributor: 103500, retail: 120000 },
    stock: 30,
    minOrderQty: 1,
    indications: 'For large hypertrophic scars, keloids, and extensive post-surgical scar management.',
    isActive: true,
    isFeatured: false
  },
  {
    id: 'prod-skin-staples',
    name: 'Skin Staples (Piece)',
    description: 'Surgical skin staples for wound closure. Quick and secure wound closure alternative to sutures.',
    sku: 'BSM-SKS-PC',
    category: 'Instruments & Tools',
    unit: 'Piece',
    unitsPerCarton: 50,
    prices: { wholesaler: 4000, distributor: 4600, retail: 5500 },
    stock: 200,
    minOrderQty: 1,
    indications: 'For surgical wound closure in hospital and clinical settings.',
    isActive: true,
    isFeatured: false
  }
];

// Function to add a single product
async function addProduct(product) {
  const formData = new FormData();
  
  // Add all fields
  formData.append('id', product.id);
  formData.append('name', product.name);
  formData.append('description', product.description);
  formData.append('sku', product.sku);
  formData.append('category', product.category);
  formData.append('unit', product.unit);
  formData.append('unitsPerCarton', product.unitsPerCarton);
  formData.append('distributorPrice', product.prices.distributor);
  formData.append('price_distributor', product.prices.distributor);
  formData.append('price_retail', product.prices.retail);
  formData.append('price_wholesaler', product.prices.wholesaler);
  formData.append('stock', product.stock);
  formData.append('minOrderQty', product.minOrderQty);
  formData.append('indications', product.indications);
  formData.append('isActive', product.isActive);
  formData.append('isFeatured', product.isFeatured);
  formData.append('prices', JSON.stringify(product.prices));
  
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

// Main function to populate all products
async function populateAllProducts() {
  console.log('🔄 Starting product population...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const product of PRODUCTS) {
    try {
      const result = await addProduct(product);
      if (result.id || result.name) {
        console.log(`✅ Added: ${product.name}`);
        successCount++;
      } else {
        console.log(`⚠️ Warning for ${product.name}:`, result);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Failed: ${product.name} - ${error.message}`);
      errorCount++;
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Summary: ${successCount} products added, ${errorCount} errors`);
  console.log('🔄 Refresh the page to see products.');
}

// Run it
populateAllProducts();
