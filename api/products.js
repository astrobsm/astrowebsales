// Vercel Serverless Function - Products API
import { getPool, handleCors } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      // Get all products
      const result = await pool.query(`
        SELECT * FROM products 
        WHERE active = true 
        ORDER BY name
      `);
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      // Create product
      const { name, description, sku, category, price_retail, price_distributor, price_wholesaler, stock, image_url, unit } = req.body;
      
      const result = await pool.query(`
        INSERT INTO products (name, description, sku, category, price_retail, price_distributor, price_wholesaler, stock, image_url, unit)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [name, description, sku, category, price_retail, price_distributor, price_wholesaler, stock || 0, image_url, unit || 'Piece']);
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
