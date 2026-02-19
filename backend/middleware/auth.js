const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, email, role_id, full_name }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Role-based access: pass allowed role_ids e.g. adminOnly = checkRole(1)
const checkRole = (...allowedRoleIds) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    if (!allowedRoleIds.includes(req.user.role_id)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };