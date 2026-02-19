const express = require('express');
const router = express.Router();
const gymActivityController = require('../controllers/gymActivityController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Trainers
router.get('/trainers', gymActivityController.getTrainers);

// Schedules (before /:id to avoid conflict)
router.get('/schedules',                                            gymActivityController.getSchedules);
router.post('/schedules',                                           gymActivityController.createSchedule);
router.get('/schedules/:id',                                        gymActivityController.getScheduleById);
router.put('/schedules/:id',                                        gymActivityController.updateSchedule);
router.post('/schedules/:id/enroll',                                gymActivityController.enrollCustomer);
router.get('/schedules/:id/enrollments',                            gymActivityController.getEnrollments);
router.patch('/enrollments/:enrollmentId/attendance',               gymActivityController.markAttendance);

// Activities
router.get('/',    gymActivityController.getAll);
router.get('/:id', gymActivityController.getById);
router.post('/',   gymActivityController.create);
router.put('/:id', gymActivityController.update);
router.delete('/:id', gymActivityController.delete);

module.exports = router;