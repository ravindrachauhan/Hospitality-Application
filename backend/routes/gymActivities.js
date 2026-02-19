const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gym_activities ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gym_activities WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Activity not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, category, description, duration_minutes, trainer, capacity, schedule } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO gym_activities (name, category, description, duration_minutes, trainer, capacity, schedule) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, description, duration_minutes, trainer, capacity || 20, schedule]
    );
    res.status(201).json({ message: 'Activity created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, category, description, duration_minutes, trainer, capacity, schedule, status } = req.body;
  try {
    await pool.query(
      'UPDATE gym_activities SET name=?, category=?, description=?, duration_minutes=?, trainer=?, capacity=?, schedule=?, status=? WHERE id=?',
      [name, category, description, duration_minutes, trainer, capacity, schedule, status, req.params.id]
    );
    res.json({ message: 'Activity updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM gym_activities WHERE id = ?', [req.params.id]);
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
