const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// GET all orders with customer info
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, c.name as customer_name, c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single order with items
router.get('/:id', auth, async (req, res) => {
  try {
    const [order] = await pool.query(`
      SELECT o.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ?
    `, [req.params.id]);
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' });

    const [items] = await pool.query(`
      SELECT oi.*, p.name as product_name FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...order[0], items });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create order
router.post('/', auth, async (req, res) => {
  const { customer_id, items, notes } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_id, notes, total_amount) VALUES (?, ?, 0)',
      [customer_id, notes]
    );
    const orderId = orderResult.insertId;

    for (const item of items || []) {
      const [product] = await conn.query('SELECT price FROM products WHERE id = ?', [item.product_id]);
      if (product.length === 0) continue;
      const price = product[0].price;
      const subtotal = price * item.quantity;
      total += subtotal;
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, price, subtotal]
      );
    }

    await conn.query('UPDATE orders SET total_amount = ? WHERE id = ?', [total, orderId]);
    await conn.commit();
    res.status(201).json({ message: 'Order created', id: orderId, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    conn.release();
  }
});

// PUT update order status
router.put('/:id', auth, async (req, res) => {
  const { status, notes } = req.body;
  try {
    await pool.query('UPDATE orders SET status=?, notes=? WHERE id=?', [status, notes, req.params.id]);
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE order
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
