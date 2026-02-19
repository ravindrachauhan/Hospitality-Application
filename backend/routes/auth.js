const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Public
router.post('/login',    authController.login);

// Protected
router.post('/register', verifyToken, checkRole(1), authController.register);   // Admin only
router.get('/profile',   verifyToken, authController.getProfile);
router.get('/users',     verifyToken, checkRole(1), authController.getAllUsers); // Admin only
router.put('/users/:id', verifyToken, checkRole(1), authController.updateUser);
router.delete('/users/:id', verifyToken, checkRole(1), authController.deleteUser);

module.exports = router;