const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken); // All customer routes require auth

router.get('/',    customerController.getAll);
router.get('/:id', customerController.getById);
router.post('/',   customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);

// Memberships
router.get('/:id/memberships',  customerController.getMemberships);
router.post('/:id/memberships', customerController.assignMembership);

// Attendance
router.get('/:id/attendance',                     customerController.getAttendance);
router.post('/:id/checkin',                       customerController.checkIn);
router.put('/checkout/:attendanceId',             customerController.checkOut);

module.exports = router;