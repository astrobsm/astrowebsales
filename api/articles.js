// Vercel Serverless Function - Articles API
import { getPool, handleCors, parseBody } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const pool = getPool();

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT * FROM articles 
        WHERE published = true
        ORDER BY created_at DESC
      `);
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { title, content, category, author, image_url, published } = body;
      
      const result = await pool.query(`
        INSERT INTO articles (title, content, category, author, image_url, published)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [title, content, category, author, image_url, published !== false]);
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Articles API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
