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
      
      // Convert to frontend format
      const seminars = result.rows.map(row => ({
        id: row.id?.toString() || '',
        title: row.title || '',
        description: row.description || '',
        date: row.date,
        time: row.time || '',
        location: row.location || '',
        venue_type: row.venue_type || 'physical',
        capacity: row.capacity || 50,
        registered_count: row.registered_count || 0,
        speaker: row.speaker || '',
        topics: row.topics ? (typeof row.topics === 'string' ? JSON.parse(row.topics) : row.topics) : [],
        image: row.image_url || null,
        registration_open: row.registration_open !== false,
        featured: row.featured || false,
        createdAt: row.created_at
      }));
      
      return res.status(200).json(seminars);
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { 
        title, description, date, time, location, venue_type,
        capacity, speaker, topics, image_url, featured 
      } = body;
      
      const result = await pool.query(`
        INSERT INTO seminars 
        (title, description, date, time, location, venue_type, capacity, speaker, topics, image_url, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [title, description, date, time, location, venue_type || 'physical', 
          capacity || 50, speaker, JSON.stringify(topics || []), image_url, featured || false]);
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Seminars API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
