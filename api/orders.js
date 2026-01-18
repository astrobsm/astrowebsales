// Vercel Serverless Function - Orders API
import { getPool, handleCors, parseBody } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      // Get all orders
      const result = await pool.query(`
        SELECT * FROM orders 
        ORDER BY created_at DESC
        LIMIT 100
      `);
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      // Create order
      const body = await parseBody(req);
      const { 
        order_number, 
        customer_name, 
        customer_email, 
        customer_phone, 
        customer_address,
        items, 
        subtotal, 
        tax, 
        total,
        status,
        payment_method,
        notes
      } = body;
      
      const result = await pool.query(`
        INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone, 
          customer_address, items, subtotal, tax, total, status, 
          payment_method, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        order_number, customer_name, customer_email, customer_phone,
        customer_address, JSON.stringify(items), subtotal, tax, total, 
        status || 'pending', payment_method, notes
      ]);
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
