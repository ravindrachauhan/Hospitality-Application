const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
require('dotenv').config();

const authController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ success: false, message: 'Email and password are required.' });

      const user = await UserModel.findByEmail(email);
      if (!user || user.IsActive === 0)
        return res.status(401).json({ success: false, message: 'Invalid credentials or account inactive.' });

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch)
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });

      const token = jwt.sign(
        { user_id: user.user_id, email: user.email, role_id: user.role_id, full_name: user.full_name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          user_id:   user.user_id,
          full_name: user.full_name,
          email:     user.email,
          role_id:   user.role_id,
          role_name: user.role_name,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const { role_id, full_name, email, password, phone } = req.body;
      if (!full_name || !email || !password)
        return res.status(400).json({ success: false, message: 'full_name, email and password are required.' });

      const existing = await UserModel.findByEmail(email);
      if (existing)
        return res.status(409).json({ success: false, message: 'Email already registered.' });

      const password_hash = await bcrypt.hash(password, 10);
      const createdBy = req.user ? req.user.full_name : 'system';
      await UserModel.create({ role_id: role_id || 2, full_name, email, password_hash, phone, createdBy });

      res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/auth/profile
  getProfile: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.user_id);
      res.json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/auth/users
  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getAll();
      res.json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/auth/users/:id
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const data = { ...req.body, modifiedBy: req.user.full_name };
      await UserModel.update(id, data);
      res.json({ success: true, message: 'User updated successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE /api/auth/users/:id
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      await UserModel.softDelete(id, req.user.full_name);
      res.json({ success: true, message: 'User deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = authController;