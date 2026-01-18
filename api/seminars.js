// Vercel Serverless Function - Seminars API
import { getPool, handleCors, parseBody } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT * FROM seminars 
        WHERE date >= CURRENT_DATE
        ORDER BY date ASC
      `);
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { title, description, date, time, location, capacity, image_url, registration_fee } = body;
      
      const result = await pool.query(`
        INSERT INTO seminars (title, description, date, time, location, capacity, image_url, registration_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [title, description, date, time, location, capacity || 100, image_url, registration_fee || 0]);
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Seminars API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
