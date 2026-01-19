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
      
      // Convert to frontend format
      const articles = result.rows.map(row => ({
        id: row.id?.toString() || '',
        title: row.title || '',
        content: row.content || '',
        excerpt: row.excerpt || '',
        author: row.author || '',
        category: row.category || '',
        image: row.image_url || null,
        featured: row.featured || false,
        published: row.published !== false,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      return res.status(200).json(articles);
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { title, content, excerpt, category, author, image_url, featured, published } = body;
      
      const result = await pool.query(`
        INSERT INTO articles (title, content, excerpt, category, author, image_url, featured, published)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [title, content, excerpt, category, author, image_url, featured || false, published !== false]);
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Articles API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
