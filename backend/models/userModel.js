// const db = require('../config/database');

// const { pool: db } = require('../config/database');
const db = require('../config/database');  // no destructuring

const UserModel = {
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT u.*, r.role_name FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.email = ? AND u.IsDeleted = 0`,
      [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.role_id, u.IsActive,
              r.role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.user_id = ? AND u.IsDeleted = 0`,
      [id]
    );
    return rows[0];
  },

  getAll: async () => {
    const [rows] = await db.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.IsActive, u.createdOn,
              r.role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.IsDeleted = 0 ORDER BY u.createdOn DESC`
    );
    return rows;
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO users (role_id, full_name, email, password_hash, phone, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.role_id, data.full_name, data.email, data.password_hash, data.phone, data.createdBy]
    );
    return result;
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE users SET full_name=?, phone=?, role_id=?, IsActive=?, modifiedBy=?, modifiedOn=NOW() 
       WHERE user_id=? AND IsDeleted=0`,
      [data.full_name, data.phone, data.role_id, data.IsActive, data.modifiedBy, id]
    );
    return result;
  },

  softDelete: async (id, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE users SET IsDeleted=1, IsActive=0, modifiedBy=?, modifiedOn=NOW() WHERE user_id=?`,
      [modifiedBy, id]
    );
    return result;
  },
};

module.exports = UserModel;