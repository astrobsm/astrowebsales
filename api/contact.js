// Vercel Serverless Function - Contact API
import { getPool, handleCors, parseBody } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT * FROM contact_messages 
        ORDER BY created_at DESC
        LIMIT 100
      `);
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { name, email, phone, subject, message } = body;
      
      const result = await pool.query(`
        INSERT INTO contact_messages (name, email, phone, subject, message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [name, email, phone, subject, message]);
      
      return res.status(201).json({ success: true, id: result.rows[0].id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Contact API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
