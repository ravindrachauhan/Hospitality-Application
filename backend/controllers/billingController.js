const BillingModel = require('../models/billingModel');

const billingController = {
  // GET /api/billing
  getAll: async (req, res) => {
    try {
      const data = await BillingModel.getAll();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/billing/:id
  getById: async (req, res) => {
    try {
      const data = await BillingModel.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Invoice not found.' });
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/billing/customer/:customerId
  getByCustomer: async (req, res) => {
    try {
      const data = await BillingModel.getByCustomer(req.params.customerId);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/billing
  create: async (req, res) => {
    try {
      const { customer_id, invoice_type, amount, total_amount } = req.body;
      if (!customer_id || !invoice_type || !amount || !total_amount)
        return res.status(400).json({ success: false, message: 'customer_id, invoice_type, amount and total_amount are required.' });

      const data = { ...req.body, created_by_user: req.user.user_id, createdBy: req.user.full_name };
      const result = await BillingModel.create(data);
      res.status(201).json({ success: true, message: 'Invoice created.', invoice_id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/billing/:id/status
  updateStatus: async (req, res) => {
    try {
      const { payment_status } = req.body;
      if (!payment_status)
        return res.status(400).json({ success: false, message: 'payment_status is required.' });
      await BillingModel.updateStatus(req.params.id, payment_status, req.user.full_name);
      res.json({ success: true, message: 'Invoice status updated.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/billing/reports/summary
  getSummary: async (req, res) => {
    try {
      const summary  = await BillingModel.getRevenueSummary();
      const monthly  = await BillingModel.getMonthlyRevenue();
      res.json({ success: true, data: { summary, monthly } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/billing/:id
  delete: async (req, res) => {
    try {
      await BillingModel.softDelete(req.params.id, req.user.full_name);
      res.json({ success: true, message: 'Invoice deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = billingController;