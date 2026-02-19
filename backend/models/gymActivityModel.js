const db = require('../config/database');

const GymActivityModel = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT * FROM gym_activities WHERE IsDeleted=0 ORDER BY activity_name`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM gym_activities WHERE activity_id=? AND IsDeleted=0`, [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO gym_activities (activity_name, description, duration_mins, max_capacity, activity_type, createdBy)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.activity_name, data.description, data.duration_mins, data.max_capacity || 20,
       data.activity_type || 'group', data.createdBy]
    );
    return result;
  },

  update: async (id, data) => {
    const [result] = await db.query(
      `UPDATE gym_activities SET activity_name=?, description=?, duration_mins=?,
       max_capacity=?, activity_type=?, IsActive=?, modifiedBy=?, modifiedOn=NOW()
       WHERE activity_id=? AND IsDeleted=0`,
      [data.activity_name, data.description, data.duration_mins, data.max_capacity,
       data.activity_type, data.IsActive, data.modifiedBy, id]
    );
    return result;
  },

  softDelete: async (id, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE gym_activities SET IsDeleted=1, IsActive=0, modifiedBy=?, modifiedOn=NOW() WHERE activity_id=?`,
      [modifiedBy, id]
    );
    return result;
  },

  // Schedules
  getSchedules: async () => {
    const [rows] = await db.query(
      `SELECT s.*, ga.activity_name, t.full_name AS trainer_name
       FROM schedules s
       JOIN gym_activities ga ON s.activity_id = ga.activity_id
       LEFT JOIN trainers t ON s.trainer_id = t.trainer_id
       WHERE s.IsDeleted=0 ORDER BY s.schedule_date DESC, s.start_time`
    );
    return rows;
  },

  getScheduleById: async (id) => {
    const [rows] = await db.query(
      `SELECT s.*, ga.activity_name, t.full_name AS trainer_name
       FROM schedules s
       JOIN gym_activities ga ON s.activity_id = ga.activity_id
       LEFT JOIN trainers t ON s.trainer_id = t.trainer_id
       WHERE s.schedule_id=? AND s.IsDeleted=0`,
      [id]
    );
    return rows[0];
  },

  createSchedule: async (data) => {
    const [result] = await db.query(
      `INSERT INTO schedules (activity_id, trainer_id, schedule_date, start_time, end_time, max_capacity, room, notes, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.activity_id, data.trainer_id, data.schedule_date, data.start_time,
       data.end_time, data.max_capacity || 20, data.room, data.notes, data.createdBy]
    );
    return result;
  },

  updateSchedule: async (id, data) => {
    const [result] = await db.query(
      `UPDATE schedules SET activity_id=?, trainer_id=?, schedule_date=?, start_time=?,
       end_time=?, max_capacity=?, room=?, status=?, notes=?, modifiedBy=?, modifiedOn=NOW()
       WHERE schedule_id=? AND IsDeleted=0`,
      [data.activity_id, data.trainer_id, data.schedule_date, data.start_time,
       data.end_time, data.max_capacity, data.room, data.status, data.notes, data.modifiedBy, id]
    );
    return result;
  },

  enrollCustomer: async (scheduleId, customerId, createdBy) => {
    const [result] = await db.query(
      `INSERT INTO schedule_enrollments (schedule_id, customer_id, createdBy) VALUES (?, ?, ?)`,
      [scheduleId, customerId, createdBy]
    );
    // Increment enrolled count
    await db.query(
      `UPDATE schedules SET enrolled_count = enrolled_count + 1 WHERE schedule_id=?`,
      [scheduleId]
    );
    return result;
  },

  getEnrollments: async (scheduleId) => {
    const [rows] = await db.query(
      `SELECT se.*, c.full_name, c.phone 
       FROM schedule_enrollments se
       JOIN customers c ON se.customer_id = c.customer_id
       WHERE se.schedule_id=? AND se.IsDeleted=0`,
      [scheduleId]
    );
    return rows;
  },

  markAttendance: async (enrollmentId, attendance, modifiedBy) => {
    const [result] = await db.query(
      `UPDATE schedule_enrollments SET attendance=?, modifiedBy=?, modifiedOn=NOW()
       WHERE enrollment_id=?`,
      [attendance, modifiedBy, enrollmentId]
    );
    return result;
  },

  getTrainers: async () => {
    const [rows] = await db.query(
      `SELECT * FROM trainers WHERE IsDeleted=0 AND IsActive=1 ORDER BY full_name`
    );
    return rows;
  },
};

module.exports = GymActivityModel;