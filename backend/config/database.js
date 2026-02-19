require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+05:30',
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Connected to:', process.env.DB_NAME);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;