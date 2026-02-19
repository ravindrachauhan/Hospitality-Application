const CustomerModel = require('../models/customerModel');

const customerController = {
  // GET /api/customers
  getAll: async (req, res) => {
    try {
      const data = await CustomerModel.getAll();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/customers/:id
  getById: async (req, res) => {
    try {
      const data = await CustomerModel.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Customer not found.' });
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/customers
  create: async (req, res) => {
    try {
      const { full_name, phone } = req.body;
      if (!full_name || !phone)
        return res.status(400).json({ success: false, message: 'full_name and phone are required.' });

      const data = { ...req.body, createdBy: req.user.full_name };
      const result = await CustomerModel.create(data);
      res.status(201).json({ success: true, message: 'Customer created.', customer_id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/customers/:id
  update: async (req, res) => {
    try {
      const data = { ...req.body, modifiedBy: req.user.full_name };
      await CustomerModel.update(req.params.id, data);
      res.json({ success: true, message: 'Customer updated successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/customers/:id
  delete: async (req, res) => {
    try {
      await CustomerModel.softDelete(req.params.id, req.user.full_name);
      res.json({ success: true, message: 'Customer deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/customers/:id/memberships
  getMemberships: async (req, res) => {
    try {
      const data = await CustomerModel.getMemberships(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/customers/:id/memberships
  assignMembership: async (req, res) => {
    try {
      const { plan_id, start_date, notes } = req.body;
      if (!plan_id || !start_date)
        return res.status(400).json({ success: false, message: 'plan_id and start_date are required.' });

      const data = {
        customer_id: req.params.id,
        plan_id, start_date, notes,
        assigned_by: req.user.user_id,
        createdBy:   req.user.full_name,
      };
      const result = await CustomerModel.assignMembership(data);
      res.status(201).json({ success: true, message: 'Membership assigned.', membership_id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/customers/:id/attendance
  getAttendance: async (req, res) => {
    try {
      const data = await CustomerModel.getAttendance(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/customers/:id/checkin
  checkIn: async (req, res) => {
    try {
      const result = await CustomerModel.checkIn(req.params.id, req.user.full_name);
      res.status(201).json({ success: true, message: 'Check-in recorded.', attendance_id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/customers/checkout/:attendanceId
  checkOut: async (req, res) => {
    try {
      await CustomerModel.checkOut(req.params.attendanceId, req.user.full_name);
      res.json({ success: true, message: 'Check-out recorded.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = customerController;