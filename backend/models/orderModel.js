const db = require('../config/database');

const OrderModel = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT o.*, c.full_name AS customer_name, u.full_name AS processed_by_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.customer_id
       LEFT JOIN users u ON o.processed_by = u.user_id
       WHERE o.IsDeleted = 0 ORDER BY o.order_date DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT o.*, c.full_name AS customer_name, u.full_name AS processed_by_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.customer_id
       LEFT JOIN users u ON o.processed_by = u.user_id
       WHERE o.order_id = ? AND o.IsDeleted = 0`,
      [id]
    );
    return rows[0];
  },

  getItems: async (orderId) => {
    const [rows] = await db.query(
      `SELECT oi.*, p.product_name, p.sku
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ? AND oi.IsDeleted = 0`,
      [orderId]
    );
    return rows;
  },

  create: async (orderData, items, createdBy) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Insert order
      const [orderResult] = await conn.query(
        `INSERT INTO orders 
         (customer_id, processed_by, total_amount, discount, tax, grand_total, payment_method, payment_status, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderData.customer_id, orderData.processed_by, orderData.total_amount,
         orderData.discount || 0, orderData.tax || 0, orderData.grand_total,
         orderData.payment_method, orderData.payment_status || 'paid', orderData.notes, createdBy]
      );
      const orderId = orderResult.insertId;

      // Insert items & reduce stock
      for (const item of items) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, createdBy)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.unit_price,
           item.quantity * item.unit_price, createdBy]
        );
        await conn.query(
          `UPDATE products SET stock_qty = stock_qty - ? WHERE product_id = ?`,
          [item.quantity, item.product_id]
        );
      }

      await conn.commit();
      return orderId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  updatePaymentStatus: async (id, status, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE orders SET payment_status=?, modifiedBy=?, modifiedOn=NOW() WHERE order_id=?`,
      [status, modifiedBy, id]
    );
    return result;
  },

  softDelete: async (id, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE orders SET IsDeleted=1, modifiedBy=?, modifiedOn=NOW() WHERE order_id=?`,
      [modifiedBy, id]
    );
    return result;
  },
};

module.exports = OrderModel;