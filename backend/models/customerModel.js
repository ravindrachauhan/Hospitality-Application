const db = require('../config/database');

const CustomerModel = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT c.*, 
              cm.plan_id, mp.plan_name, cm.start_date, cm.end_date, cm.status AS membership_status,
              DATEDIFF(cm.end_date, CURDATE()) AS days_remaining
       FROM customers c
       LEFT JOIN customer_memberships cm ON c.customer_id = cm.customer_id AND cm.status='active' AND cm.IsDeleted=0
       LEFT JOIN membership_plans mp ON cm.plan_id = mp.plan_id
       WHERE c.IsDeleted = 0 ORDER BY c.createdOn DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT c.*, 
              cm.plan_id, mp.plan_name, cm.start_date, cm.end_date, cm.status AS membership_status
       FROM customers c
       LEFT JOIN customer_memberships cm ON c.customer_id = cm.customer_id AND cm.status='active' AND cm.IsDeleted=0
       LEFT JOIN membership_plans mp ON cm.plan_id = mp.plan_id
       WHERE c.customer_id = ? AND c.IsDeleted = 0`,
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO customers 
       (full_name, email, phone, date_of_birth, gender, address, works,
        emergency_contact_name, emergency_contact_phone, joined_date, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
      [data.full_name, data.email, data.phone, data.date_of_birth, data.gender,
       data.address, data.works, data.emergency_contact_name, data.emergency_contact_phone,
       data.createdBy]
    );
    return result;
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE customers SET full_name=?, email=?, phone=?, date_of_birth=?, gender=?,
       address=?, works=?, emergency_contact_name=?, emergency_contact_phone=?,
       IsActive=?, modifiedBy=?, modifiedOn=NOW()
       WHERE customer_id=? AND IsDeleted=0`,
      [data.full_name, data.email, data.phone, data.date_of_birth, data.gender,
       data.address, data.works, data.emergency_contact_name, data.emergency_contact_phone,
       data.IsActive, data.modifiedBy, id]
    );
    return result;
  },

  softDelete: async (id, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE customers SET IsDeleted=1, IsActive=0, modifiedBy=?, modifiedOn=NOW() WHERE customer_id=?`,
      [modifiedBy, id]
    );
    return result;
  },

  getMemberships: async (customerId) => {
    const [rows] = await db.query(
      `SELECT cm.*, mp.plan_name, mp.price, CONCAT(u.full_name) AS assigned_by_name
       FROM customer_memberships cm
       JOIN membership_plans mp ON cm.plan_id = mp.plan_id
       LEFT JOIN users u ON cm.assigned_by = u.user_id
       WHERE cm.customer_id = ? AND cm.IsDeleted = 0 ORDER BY cm.start_date DESC`,
      [customerId]
    );
    return rows;
  },

  assignMembership: async (data) => {
    const [result] = await db.query(
      `INSERT INTO customer_memberships 
       (customer_id, plan_id, start_date, end_date, status, assigned_by, notes, createdBy)
       VALUES (?, ?, ?, DATE_ADD(?, INTERVAL (SELECT duration_days FROM membership_plans WHERE plan_id=?) DAY), 'active', ?, ?, ?)`,
      [data.customer_id, data.plan_id, data.start_date, data.start_date, data.plan_id,
       data.assigned_by, data.notes, data.createdBy]
    );
    return result;
  },

  getAttendance: async (customerId) => {
    const [rows] = await db.query(
      `SELECT * FROM attendance WHERE customer_id=? AND IsDeleted=0 ORDER BY check_in DESC LIMIT 30`,
      [customerId]
    );
    return rows;
  },

  checkIn: async (customerId, createdBy) => {
    const [result] = await db.query(
      `INSERT INTO attendance (customer_id, check_in, createdBy) VALUES (?, NOW(), ?)`,
      [customerId, createdBy]
    );
    return result;
  },

  checkOut: async (attendanceId, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE attendance SET check_out=NOW(), modifiedBy=?, modifiedOn=NOW() 
       WHERE attendance_id=? AND check_out IS NULL`,
      [modifiedBy, attendanceId]
    );
    return result;
  },
};

module.exports = CustomerModel;