const db = require('../config/database');

const ProductModel = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT p.*, pc.category_name 
       FROM products p 
       JOIN product_categories pc ON p.category_id = pc.category_id 
       WHERE p.IsDeleted = 0 ORDER BY p.createdOn DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT p.*, pc.category_name 
       FROM products p 
       JOIN product_categories pc ON p.category_id = pc.category_id 
       WHERE p.product_id = ? AND p.IsDeleted = 0`,
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO products 
       (category_id, product_name, description, sku, price, stock_qty, low_stock_alert, image_url, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.category_id, data.product_name, data.description, data.sku,
       data.price, data.stock_qty, data.low_stock_alert || 5, data.image_url, data.createdBy]
    );
    return result;
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE products SET category_id=?, product_name=?, description=?, sku=?, price=?,
       stock_qty=?, low_stock_alert=?, image_url=?, IsActive=?, modifiedBy=?, modifiedOn=NOW()
       WHERE product_id=? AND IsDeleted=0`,
      [data.category_id, data.product_name, data.description, data.sku, data.price,
       data.stock_qty, data.low_stock_alert, data.image_url, data.IsActive, data.modifiedBy, id]
    );
    return result;
  },

  updateStock: async (id, qty, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE products SET stock_qty = stock_qty + ?, modifiedBy=?, modifiedOn=NOW() WHERE product_id=?`,
      [qty, modifiedBy, id]
    );
    return result;
  },

  softDelete: async (id, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE products SET IsDeleted=1, IsActive=0, modifiedBy=?, modifiedOn=NOW() WHERE product_id=?`,
      [modifiedBy, id]
    );
    return result;
  },

  getLowStock: async () => {
    const [rows] = await db.query(`SELECT * FROM vw_low_stock`);
    return rows;
  },

  getCategories: async () => {
    const [rows] = await db.query(
      `SELECT * FROM product_categories WHERE IsDeleted=0 ORDER BY category_name`
    );
    return rows;
  },
};

module.exports = ProductModel;