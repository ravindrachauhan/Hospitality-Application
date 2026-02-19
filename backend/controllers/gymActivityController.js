const GymActivityModel = require('../models/gymActivityModel');

const gymActivityController = {
  // GET /api/gym-activities
  getAll: async (req, res) => {
    try {
      const data = await GymActivityModel.getAll();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/gym-activities/:id
  getById: async (req, res) => {
    try {
      const data = await GymActivityModel.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Activity not found.' });
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/gym-activities
  create: async (req, res) => {
    try {
      const { activity_name } = req.body;
      if (!activity_name)
        return res.status(400).json({ success: false, message: 'activity_name is required.' });
      const data = { ...req.body, createdBy: req.user.full_name };
      const result = await GymActivityModel.create(data);
      res.status(201).json({ success: true, message: 'Activity created.', activity_id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/gym-activities/:id
  update: async (req, res) => {
    try {
      const data = { ...req.body, modifiedBy: req.user.full_name };
      await GymActivityModel.update(req.params.id, data);
      res.json({ success: true, message: 'Activity updated.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/gym-activities/:id
  delete: async (req, res) => {
    try {
      await GymActivityModel.softDelete(req.params.id, req.user.full_name);
      res.json({ success: true, message: 'Activity deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── SCHEDULES ──────────────────────────────────────────────

  // GET /api/gym-activities/schedules
  getSchedules: async (req, res) => {
    try {
      const data = await GymActivityModel.getSchedules();
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/gym-activities/schedules/:id
  getScheduleById: async (req, res) => {
    try {
      const data = await GymActivityModel.getScheduleById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Schedule not found.' });
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/gym-activities/schedules
  createSchedule: async (req, res) => {
    try {
      const { activity_id, schedule_date, start_time, end_time } = req.body;
      if (!activity_id || !schedule_date || !start_time || !end_time)
        return res.status(400).json({ success: false, message: 'activity_id, schedule_date, start_time and end_time are required.' });
      const data = { ...req.body, createdBy: req.user.full_name };
      const result = await GymActivityModel.createSchedule(data);
      res.status(201).json({ success: true, message: 'Schedule created.', schedule_id: result.insertId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/gym-activities/schedules/:id
  updateSchedule: async (req, res) => {
    try {
      const data = { ...req.body, modifiedBy: req.user.full_name };
      await GymActivityModel.updateSchedule(req.params.id, data);
      res.json({ success: true, message: 'Schedule updated.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/gym-activities/schedules/:id/enroll
  enrollCustomer: async (req, res) => {
    try {
      const { customer_id } = req.body;
      if (!customer_id)
        return res.status(400).json({ success: false, message: 'customer_id is required.' });
      await GymActivityModel.enrollCustomer(req.params.id, customer_id, req.user.full_name);
      res.status(201).json({ success: true, message: 'Customer enrolled successfully.' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ success: false, message: 'Customer already enrolled in this schedule.' });
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/gym-activities/schedules/:id/enrollments
  getEnrollments: async (req, res) => {
    try {
      const data = await GymActivityModel.getEnrollments(req.params.id);
      res.json({ success: true, count: data.length, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PATCH /api/gym-activities/enrollments/:enrollmentId/attendance
  markAttendance: async (req, res) => {
    try {
      const { attendance } = req.body;
      if (!attendance)
        return res.status(400).json({ success: false, message: 'attendance is required. (present/absent/pending)' });
      await GymActivityModel.markAttendance(req.params.enrollmentId, attendance, req.user.full_name);
      res.json({ success: true, message: 'Attendance marked.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/gym-activities/trainers
  getTrainers: async (req, res) => {
    try {
      const data = await GymActivityModel.getTrainers();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = gymActivityController;