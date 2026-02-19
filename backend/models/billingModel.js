const db = require('../config/database');

const BillingModel = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT i.*, c.full_name AS customer_name, c.phone AS customer_phone,
              u.full_name AS created_by_name
       FROM invoices i
       JOIN customers c ON i.customer_id = c.customer_id
       LEFT JOIN users u ON i.created_by_user = u.user_id
       WHERE i.IsDeleted = 0 ORDER BY i.invoice_date DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT i.*, c.full_name AS customer_name, c.phone AS customer_phone,
              u.full_name AS created_by_name, mp.plan_name
       FROM invoices i
       JOIN customers c ON i.customer_id = c.customer_id
       LEFT JOIN users u ON i.created_by_user = u.user_id
       LEFT JOIN customer_memberships cm ON i.membership_id = cm.membership_id
       LEFT JOIN membership_plans mp ON cm.plan_id = mp.plan_id
       WHERE i.invoice_id = ? AND i.IsDeleted = 0`,
      [id]
    );
    return rows[0];
  },

  getByCustomer: async (customerId) => {
    const [rows] = await db.query(
      `SELECT i.*, u.full_name AS created_by_name
       FROM invoices i
       LEFT JOIN users u ON i.created_by_user = u.user_id
       WHERE i.customer_id = ? AND i.IsDeleted = 0 ORDER BY i.invoice_date DESC`,
      [customerId]
    );
    return rows;
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO invoices 
       (customer_id, membership_id, order_id, invoice_type, amount, discount, tax,
        total_amount, payment_method, payment_status, due_date, notes, created_by_user, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.customer_id, data.membership_id || null, data.order_id || null,
       data.invoice_type, data.amount, data.discount || 0, data.tax || 0,
       data.total_amount, data.payment_method, data.payment_status || 'pending',
       data.due_date || null, data.notes, data.created_by_user, data.createdBy]
    );
    return result;
  },

  updateStatus: async (id, status, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE invoices SET payment_status=?, modifiedBy=?, modifiedOn=NOW() WHERE invoice_id=?`,
      [status, modifiedBy, id]
    );
    return result;
  },

  getRevenueSummary: async () => {
    const [rows] = await db.query(
      `SELECT 
         invoice_type,
         COUNT(*) AS total_invoices,
         SUM(total_amount) AS total_revenue,
         SUM(CASE WHEN payment_status='paid' THEN total_amount ELSE 0 END) AS paid_amount,
         SUM(CASE WHEN payment_status='pending' THEN total_amount ELSE 0 END) AS pending_amount
       FROM invoices WHERE IsDeleted=0
       GROUP BY invoice_type`
    );
    return rows;
  },

  getMonthlyRevenue: async () => {
    const [rows] = await db.query(
      `SELECT 
         DATE_FORMAT(invoice_date, '%Y-%m') AS month,
         SUM(total_amount) AS revenue,
         COUNT(*) AS invoice_count
       FROM invoices 
       WHERE payment_status='paid' AND IsDeleted=0
       GROUP BY DATE_FORMAT(invoice_date, '%Y-%m')
       ORDER BY month DESC LIMIT 12`
    );
    return rows;
  },

  softDelete: async (id, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE invoices SET IsDeleted=1, modifiedBy=?, modifiedOn=NOW() WHERE invoice_id=?`,
      [modifiedBy, id]
    );
    return result;
  },
};

module.exports = BillingModel;