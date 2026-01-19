// Vercel Serverless Function - Products API
import { getPool, handleCors, parseBody } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      // Get all products - filter in JS for column compatibility
      const result = await pool.query(`SELECT * FROM products ORDER BY name`);
      
      // Filter out inactive products and convert to frontend format
      const products = result.rows
        .filter(row => row.active !== false)
        .map(row => {
          // If we have product_data JSON, use that
          if (row.product_data) {
            const data = typeof row.product_data === 'string' ? JSON.parse(row.product_data) : row.product_data;
            return {
              ...data,
              id: data.id || row.id?.toString(),
              image: data.image || row.image_url
            };
          }
          // Otherwise construct from individual fields
          return {
            id: row.id?.toString() || '',
            name: row.name || '',
            description: row.description || '',
            category: row.category || '',
            sku: row.sku || '',
            unit: row.unit || 'Piece',
            unitsPerCarton: row.units_per_carton || 1,
            prices: {
              distributor: parseFloat(row.price_distributor) || 0,
              retail: parseFloat(row.price_retail) || 0,
              wholesaler: parseFloat(row.price_wholesaler) || 0
            },
            stock: row.stock || 0,
            minOrderQty: row.min_order_qty || 1,
            image: row.image_url || null,
            images: row.image_url ? [row.image_url] : [],
            indications: row.indications || '',
            isActive: row.active !== false,
            isFeatured: row.is_featured || false,
            createdAt: row.created_at
          };
        });
      
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      // Create product
      const body = await parseBody(req);
      
      // Support both camelCase and snake_case from frontend
      const name = body.name || '';
      const description = body.description || '';
      const sku = body.sku || '';
      const category = body.category || '';
      const unit = body.unit || 'Piece';
      const unitsPerCarton = body.unitsPerCarton || body.units_per_carton || 1;
      const priceDistributor = body.distributorPrice || body.price_distributor || 0;
      const priceRetail = body.price_retail || Math.round(priceDistributor * 1.25);
      const priceWholesaler = body.price_wholesaler || Math.round(priceDistributor * 1.1);
      const stock = body.stock || 0;
      const minOrderQty = body.minOrderQty || body.min_order_qty || 1;
      const indications = body.indications || '';
      const isActive = body.isActive !== false;
      const isFeatured = body.isFeatured || false;
      const imageUrl = body.image || body.image_url || null;
      const productId = body.id || `prod-${Date.now()}`;

      // Full product data for JSON storage
      const fullProductData = {
        id: productId,
        name,
        description,
        category,
        sku,
        unit,
        unitsPerCarton,
        prices: {
          distributor: parseFloat(priceDistributor),
          retail: parseFloat(priceRetail),
          wholesaler: parseFloat(priceWholesaler)
        },
        stock: parseInt(stock),
        minOrderQty: parseInt(minOrderQty),
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
        indications,
        isActive,
        isFeatured,
        createdAt: new Date().toISOString()
      };

      const result = await pool.query(`
        INSERT INTO products 
        (id, name, description, sku, category, unit, units_per_carton,
         price_retail, price_distributor, price_wholesaler, stock, min_order_qty, 
         image_url, indications, active, is_featured, product_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          product_data = EXCLUDED.product_data,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [productId, name, description, sku, category, unit, unitsPerCarton,
          priceRetail, priceDistributor, priceWholesaler, stock, minOrderQty, 
          imageUrl, indications, isActive, isFeatured, JSON.stringify(fullProductData)]);
      
      return res.status(201).json(fullProductData);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
