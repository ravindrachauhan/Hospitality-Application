const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/customers',      require('./routes/customers'));
app.use('/api/products',       require('./routes/products'));
app.use('/api/orders',         require('./routes/orders'));
app.use('/api/billing',        require('./routes/billing'));
app.use('/api/gym-activities', require('./routes/gymActivities'));

// ── Health Check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏋️ FitPro API is running',
    version: '1.0.0',
    endpoints: {
      auth:           '/api/auth',
      customers:      '/api/customers',
      products:       '/api/products',
      orders:         '/api/orders',
      billing:        '/api/billing',
      gymActivities:  '/api/gym-activities',
    },
  });
});

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// ── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 FitPro Server running on http://localhost:${PORT}`);
  console.log(`📋 API Base URL: http://localhost:${PORT}/api\n`);
});