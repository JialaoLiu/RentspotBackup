const jwt = require('jsonwebtoken');
const { handleAuthError, handleValidationError, handleForbidden } = require('../utils/errorHandler');
require('dotenv').config();

/**
 * JWT Authentication middleware - learned this pattern after getting hacked once...
 * Validates JWT tokens and extracts user information for protected routes
 * 
 * Originally tried simpler approach but had to handle edge cases like missing Authorization header,
 * malformed Bearer token format, expired tokens (users complain about this a lot),
 * and invalid signatures (usually development vs production secret mismatch).
 */
function authenticateToken(req, res, next) {
  // console.log('Auth check for:', req.path, req.method); // uncomment when debugging auth flow
  
  const auth = req.header('Authorization');
  
  if (!auth) {
    // TODO: maybe allow some public endpoints without throwing error immediately?
    return handleAuthError(res, 'Please login first');
  }

  // Handle both "Bearer TOKEN" and just "TOKEN" formats
  // Some mobile apps send just the token without "Bearer " prefix
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  
  // Early version (commented out - was too basic):
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ message: 'Invalid token' });
  //   req.user = user;
  //   next();
  // });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    // console.log('Authenticated user:', user.id, 'role:', user.user_role); // useful for debugging
    next();
  } catch (err) {
    // console.error('Token verification failed:', err.message); // keeping this for production debugging
    
    // Different error handling based on JWT error type
    if (err.name === 'TokenExpiredError') {
      // TODO: implement refresh token system instead of forcing re-login
      return handleValidationError(res, 'Session expired, please login again');
    } else if (err.name === 'JsonWebTokenError') {
      // Usually means wrong JWT_SECRET or malformed token
      return handleValidationError(res, 'Invalid login token, please login again');
    } else {
      // Catch-all for other JWT errors
      handleValidationError(res, 'Invalid or expired login, please try again');
    }
  }
}

/**
 * Role-based access control middleware
 * User roles: 0=renter, 1=landlord, 2=admin
 * 
 * Originally used strings but integers are faster for DB queries and comparisons.
 * Role hierarchy: admin (2) > landlord (1) > renter (0)
 */
function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    // console.log('Admin check - user role:', req.user.user_role); // debug role issues
    
    if (req.user.user_role !== 2) {
      // Admin-only endpoints - learned to check this after security incident
      return handleForbidden(res, 'Access denied. Admin role required.');
    }
    next();
  });
}

function requireLandlord(req, res, next) {
  authenticateToken(req, res, () => {
    // Allow both landlords (1) and admins (2) - admin can do everything
    if (req.user.user_role !== 1 && req.user.user_role !== 2) {
      // Property management requires landlord level access
      return handleForbidden(res, 'Access denied. Landlord or admin role required.');
    }
    next();
  });
}

/**
 * Basic authentication for any registered user
 * Just checks if user has a valid role (not null/undefined)
 * 
 * Note: Originally had separate middleware for each role but this is more flexible
 */
function requireRenterOrAbove(req, res, next) {
  authenticateToken(req, res, () => {
    // Check for valid role assignment
    if (req.user.user_role === undefined || req.user.user_role === null) {
      // This shouldn't happen if registration works properly... but sometimes it does
      return handleForbidden(res, 'Access denied. Valid role required.');
    }
    
    // Role 0 (renter) is minimum required level
    // TODO: maybe add role validation to ensure it's 0, 1, or 2?
    next();
  });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireLandlord,
  requireRenterOrAbove
};
