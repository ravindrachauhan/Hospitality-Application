const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// GET all customers
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single customer
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create customer
router.post('/', auth, async (req, res) => {
  const { name, email, phone, address, membership_type } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone, address, membership_type) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, address, membership_type || 'basic']
    );
    res.status(201).json({ message: 'Customer created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update customer
router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, address, membership_type, status } = req.body;
  try {
    await pool.query(
      'UPDATE customers SET name=?, email=?, phone=?, address=?, membership_type=?, status=? WHERE id=?',
      [name, email, phone, address, membership_type, status, req.params.id]
    );
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE customer
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
