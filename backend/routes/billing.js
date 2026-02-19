const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const generateInvoiceNumber = () => {
  const now = new Date();
  return `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000+1000)}`;
};

// GET all bills
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, c.name as customer_name, c.phone as customer_phone, o.status as order_status
      FROM billing b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN orders o ON b.order_id = o.id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single bill with items
router.get('/:id', auth, async (req, res) => {
  try {
    const [bill] = await pool.query(`
      SELECT b.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email, c.address as customer_address
      FROM billing b LEFT JOIN customers c ON b.customer_id = c.id WHERE b.id = ?
    `, [req.params.id]);
    if (bill.length === 0) return res.status(404).json({ message: 'Bill not found' });

    if (bill[0].order_id) {
      const [items] = await pool.query(`
        SELECT oi.*, p.name as product_name FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
      `, [bill[0].order_id]);
      return res.json({ ...bill[0], items });
    }
    res.json({ ...bill[0], items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create bill
router.post('/', auth, async (req, res) => {
  const { order_id, customer_id, subtotal, tax, discount, payment_method, notes } = req.body;
  const invoice_number = generateInvoiceNumber();
  const total_amount = (parseFloat(subtotal) || 0) + (parseFloat(tax) || 0) - (parseFloat(discount) || 0);
  try {
    const [result] = await pool.query(
      'INSERT INTO billing (order_id, customer_id, invoice_number, subtotal, tax, discount, total_amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [order_id, customer_id, invoice_number, subtotal, tax || 0, discount || 0, total_amount, payment_method || 'cash', notes]
    );
    res.status(201).json({ message: 'Bill created', id: result.insertId, invoice_number });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update bill
router.put('/:id', auth, async (req, res) => {
  const { subtotal, tax, discount, payment_method, payment_status, notes } = req.body;
  const total_amount = (parseFloat(subtotal) || 0) + (parseFloat(tax) || 0) - (parseFloat(discount) || 0);
  try {
    await pool.query(
      'UPDATE billing SET subtotal=?, tax=?, discount=?, total_amount=?, payment_method=?, payment_status=?, notes=? WHERE id=?',
      [subtotal, tax, discount, total_amount, payment_method, payment_status, notes, req.params.id]
    );
    res.json({ message: 'Bill updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE bill
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM billing WHERE id = ?', [req.params.id]);
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
