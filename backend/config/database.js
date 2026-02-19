require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function initializeDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'hospitality_db'}\``);
    await connection.query(`USE \`${process.env.DB_NAME || 'hospitality_db'}\``);

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','staff') DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        membership_type ENUM('basic','premium','vip') DEFAULT 'basic',
        join_date DATE DEFAULT (CURRENT_DATE),
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        price DECIMAL(10,2) NOT NULL,
        stock INT DEFAULT 0,
        description TEXT,
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending','processing','completed','cancelled') DEFAULT 'pending',
        total_amount DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `);

    // Order items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `);

    // Billing table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS billing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        customer_id INT,
        invoice_number VARCHAR(50) UNIQUE,
        bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subtotal DECIMAL(10,2),
        tax DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2),
        payment_method ENUM('cash','card','online','upi') DEFAULT 'cash',
        payment_status ENUM('pending','paid','partial','refunded') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `);

    // GYM Activities table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gym_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        description TEXT,
        duration_minutes INT,
        trainer VARCHAR(100),
        capacity INT DEFAULT 20,
        schedule VARCHAR(100),
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (name, email, password, role) 
      VALUES ('Admin', 'admin@gym.com', '${hashedPassword}', 'admin')
    `);

    // Insert sample gym activities
    await connection.query(`
      INSERT IGNORE INTO gym_activities (id, name, category, description, duration_minutes, trainer, capacity, schedule) VALUES
      (1, 'Yoga', 'Mind & Body', 'Relaxing yoga session for flexibility and mindfulness', 60, 'Priya Sharma', 15, 'Mon-Wed-Fri 7:00 AM'),
      (2, 'Zumba', 'Cardio', 'High energy dance fitness workout', 45, 'Rohan Mehta', 20, 'Tue-Thu 6:00 PM'),
      (3, 'Weight Training', 'Strength', 'Guided weight and resistance training', 90, 'Arjun Singh', 10, 'Daily 8:00 AM'),
      (4, 'Crossfit', 'HIIT', 'High intensity functional fitness training', 60, 'Vikram Patel', 12, 'Mon-Wed-Sat 6:00 AM'),
      (5, 'Swimming', 'Cardio', 'Swimming training and water aerobics', 60, 'Sunita Rao', 8, 'Daily 6:00 AM'),
      (6, 'Boxing', 'Combat Sports', 'Boxing and kickboxing fitness training', 75, 'Ravi Kumar', 10, 'Tue-Thu-Sat 5:00 PM'),
      (7, 'Pilates', 'Mind & Body', 'Core strengthening and postural alignment', 50, 'Meera Joshi', 12, 'Mon-Wed-Fri 9:00 AM'),
      (8, 'Cycling', 'Cardio', 'Indoor cycling and spinning classes', 45, 'Anil Verma', 20, 'Daily 7:00 AM'),
      (9, 'Aerobics', 'Cardio', 'Classic aerobic fitness classes', 50, 'Pooja Gupta', 25, 'Mon-Wed-Fri 5:00 PM'),
      (10, 'Martial Arts', 'Combat Sports', 'Karate and self-defense training', 90, 'Suresh Nair', 15, 'Tue-Thu 7:00 PM')
    `);

    // Insert sample products
    await connection.query(`
      INSERT IGNORE INTO products (id, name, category, price, stock, description) VALUES
      (1, 'Whey Protein 1kg', 'Supplements', 2499.00, 50, 'High quality whey protein powder'),
      (2, 'Yoga Mat', 'Equipment', 999.00, 30, 'Non-slip premium yoga mat'),
      (3, 'Resistance Bands Set', 'Equipment', 599.00, 40, 'Set of 5 resistance bands'),
      (4, 'Sports Water Bottle', 'Accessories', 299.00, 100, '1 litre BPA-free sports bottle'),
      (5, 'Gym Gloves', 'Accessories', 449.00, 60, 'Weight lifting gloves with wrist support')
    `);

    // Insert sample customers
    await connection.query(`
      INSERT IGNORE INTO customers (id, name, email, phone, address, membership_type) VALUES
      (1, 'Rahul Sharma', 'rahul@email.com', '9876543210', '12 MG Road, Mumbai', 'premium'),
      (2, 'Anita Patel', 'anita@email.com', '9123456789', '45 Link Road, Delhi', 'basic'),
      (3, 'Kiran Mehta', 'kiran@email.com', '9988776655', '78 Park Street, Pune', 'vip')
    `);

    console.log('✅ Database initialized successfully!');
    console.log('📧 Admin login: admin@gym.com | Password: admin123');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Pool for application use
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospitality_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = { pool, initializeDatabase };

// Run if called directly
if (require.main === module) {
  initializeDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
