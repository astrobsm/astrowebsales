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
      
      // Convert to frontend format
      const orders = result.rows.map(row => {
        // Helper to normalize items - ensure both name and productName exist
        const normalizeItems = (items) => {
          if (!items || !Array.isArray(items)) return [];
          return items.map(item => ({
            ...item,
            name: item.name || item.productName || 'Unknown Item',
            productName: item.productName || item.name || 'Unknown Item',
            price: item.price || item.unitPrice || 0,
            unitPrice: item.unitPrice || item.price || 0,
            quantity: item.quantity || item.qty || 1
          }));
        };
        
        // If we have the full order_data, use that
        if (row.order_data) {
          const orderData = typeof row.order_data === 'string' ? JSON.parse(row.order_data) : row.order_data;
          return {
            ...orderData,
            id: orderData.id || row.id,
            orderNumber: orderData.orderNumber || row.order_number || `ORD-${row.id}`,
            customerName: orderData.customerName || row.customer_name || 'Unknown Customer',
            status: orderData.status || row.status || 'pending',
            total: orderData.total || parseFloat(row.total_amount) || 0,
            totalAmount: orderData.totalAmount || orderData.total || parseFloat(row.total_amount) || 0,
            items: normalizeItems(orderData.items),
            createdAt: orderData.createdAt || row.created_at
          };
        }
        // Otherwise construct from individual fields
        const rawItems = row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : [];
        return {
          id: row.id?.toString() || '',
          orderNumber: row.order_number || `ORD-${row.id || 'UNKNOWN'}`,
          customerName: row.customer_name || 'Unknown Customer',
          customerEmail: row.customer_email || '',
          customerPhone: row.customer_phone || '',
          address: row.customer_address || '',
          state: row.customer_state || '',
          city: row.customer_city || '',
          items: normalizeItems(rawItems),
          subtotal: parseFloat(row.subtotal) || 0,
          deliveryFee: parseFloat(row.delivery_fee) || 0,
          total: parseFloat(row.total_amount) || 0,
          totalAmount: parseFloat(row.total_amount) || 0,
          urgencyLevel: row.urgency_level || 'routine',
          deliveryMode: row.delivery_option || 'pickup',
          distributorId: row.distributor_id || null,
          distributorName: row.distributor_name || '',
          status: row.status || 'pending',
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      });
      
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      // Create order
      const body = await parseBody(req);
      
      // Support both camelCase and snake_case
      const order_id = body.id || `ord-${Date.now()}`;
      const order_number = body.orderNumber || body.order_number || `BSM-${Date.now()}`;
      const customer_name = body.customerName || body.customer_name || '';
      const customer_email = body.customerEmail || body.customer_email || '';
      const customer_phone = body.customerPhone || body.customer_phone || '';
      const customer_address = body.customerAddress || body.customer_address || body.address || '';
      const customer_state = body.customerState || body.customer_state || body.state || '';
      const customer_city = body.customerCity || body.customer_city || body.city || '';
      const items = body.items || [];
      const subtotal = body.subtotal || 0;
      const delivery_fee = body.deliveryFee || body.delivery_fee || 0;
      const total_amount = body.total || body.totalAmount || body.total_amount || 0;
      const urgency_level = body.urgencyLevel || body.urgency_level || 'routine';
      const delivery_option = body.deliveryMode || body.deliveryOption || body.delivery_option || 'pickup';
      const distributor_id = body.distributorId || body.distributor_id || null;
      const distributor_name = body.distributorName || body.distributor_name || '';
      const status = body.status || 'pending';
      
      const result = await pool.query(`
        INSERT INTO orders 
        (id, order_number, customer_name, customer_email, customer_phone, customer_address,
         customer_state, customer_city, items, subtotal, delivery_fee, total_amount,
         urgency_level, delivery_option, distributor_id, distributor_name, status, order_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          order_data = EXCLUDED.order_data,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [order_id, order_number, customer_name, customer_email, customer_phone, customer_address,
          customer_state, customer_city, JSON.stringify(items), subtotal, delivery_fee, total_amount,
          urgency_level, delivery_option, distributor_id, distributor_name, status, JSON.stringify(body)]);
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
