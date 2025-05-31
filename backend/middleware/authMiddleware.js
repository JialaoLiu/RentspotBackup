const jwt = require('jsonwebtoken');
const { handleAuthError, handleValidationError, handleForbidden } = require('../utils/errorHandler');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const auth = req.header('Authorization');
  
  if (!auth) {
    return handleAuthError(res, 'Please login first');
  }

  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    handleValidationError(res, 'Invalid or expired login, please try again');
  }
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.user_role !== 2) {
      return handleForbidden(res, 'Access denied. Admin role required.');
    }
    next();
  });
}

function requireLandlord(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.user_role !== 1 && req.user.user_role !== 2) {
      return handleForbidden(res, 'Access denied. Landlord or admin role required.');
    }
    next();
  });
}

function requireRenterOrAbove(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.user_role === undefined || req.user.user_role === null) {
      return handleForbidden(res, 'Access denied. Valid role required.');
    }
    next();
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireLandlord,
  requireRenterOrAbove
};
