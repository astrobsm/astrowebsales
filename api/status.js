// Vercel Serverless Function - API Status
import pg from 'pg';
const { Pool } = pg;

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      user: process.env.DB_USER || 'doadmin',
      host: process.env.DB_HOST,
      database: process.env.DB_NAME || 'defaultdb',
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 25060,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let dbStatus = { connected: false, error: null };

  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW() as time');
    dbStatus = { 
      connected: true, 
      timestamp: result.rows[0].time,
      host: process.env.DB_HOST ? 'DigitalOcean' : 'Not configured'
    };
  } catch (error) {
    dbStatus = { connected: false, error: error.message };
  }

  return res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    database: dbStatus
  });
}
