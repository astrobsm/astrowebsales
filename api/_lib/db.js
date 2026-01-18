// Shared database connection for Vercel serverless functions
import pg from 'pg';
const { Pool } = pg;

let pool = null;

export const getPool = () => {
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

// CORS headers helper
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper to handle CORS preflight
export const handleCors = (req, res) => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};

// Parse JSON body
export const parseBody = (req) => {
  return new Promise((resolve) => {
    if (req.body) {
      resolve(req.body);
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
};
