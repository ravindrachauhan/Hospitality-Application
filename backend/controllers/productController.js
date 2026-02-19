const ProductModel = require('../models/productModel');

const productController = {
  // GET /api/products
  getAll: async (req, res) => {
    try {
      const data = await ProductModel.getAll();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/products/:id
  getById: async (req, res) => {
    try {
      const data = await ProductModel.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Product not found.' });
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/products
  create: async (req, res) => {
    try {
      const { product_name, category_id, price } = req.body;
      if (!product_name || !category_id || !price)
        return res.status(400).json({ success: false, message: 'product_name, category_id and price are required.' });

      const data = { ...req.body, createdBy: req.user.full_name };
      const result = await ProductModel.create(data);
      res.status(201).json({ success: true, message: 'Product created.', product_id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/products/:id
  update: async (req, res) => {
    try {
      const data = { ...req.body, modifiedBy: req.user.full_name };
      await ProductModel.update(req.params.id, data);
      res.json({ success: true, message: 'Product updated successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/products/:id/stock
  updateStock: async (req, res) => {
    try {
      const { qty } = req.body;
      if (qty === undefined)
        return res.status(400).json({ success: false, message: 'qty is required. Use negative to reduce.' });
      await ProductModel.updateStock(req.params.id, qty, req.user.full_name);
      res.json({ success: true, message: 'Stock updated.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/products/:id
  delete: async (req, res) => {
    try {
      await ProductModel.softDelete(req.params.id, req.user.full_name);
      res.json({ success: true, message: 'Product deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/products/alerts/low-stock
  getLowStock: async (req, res) => {
    try {
      const data = await ProductModel.getLowStock();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/products/categories
  getCategories: async (req, res) => {
    try {
      const data = await ProductModel.getCategories();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = productController;