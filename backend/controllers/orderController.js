const OrderModel = require('../models/orderModel');

const orderController = {
  // GET /api/orders
  getAll: async (req, res) => {
    try {
      const data = await OrderModel.getAll();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/orders/:id
  getById: async (req, res) => {
    try {
      const order = await OrderModel.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      const items = await OrderModel.getItems(req.params.id);
      res.json({ success: true, data: { ...order, items } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/orders
  create: async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      if (!items || items.length === 0)
        return res.status(400).json({ success: false, message: 'Order must have at least one item.' });

      orderData.processed_by = req.user.user_id;
      const orderId = await OrderModel.create(orderData, items, req.user.full_name);
      res.status(201).json({ success: true, message: 'Order created successfully.', order_id: orderId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/orders/:id/payment
  updatePayment: async (req, res) => {
    try {
      const { payment_status } = req.body;
      if (!payment_status)
        return res.status(400).json({ success: false, message: 'payment_status is required.' });
      await OrderModel.updatePaymentStatus(req.params.id, payment_status, req.user.full_name);
      res.json({ success: true, message: 'Payment status updated.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/orders/:id
  delete: async (req, res) => {
    try {
      await OrderModel.softDelete(req.params.id, req.user.full_name);
      res.json({ success: true, message: 'Order deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = orderController;