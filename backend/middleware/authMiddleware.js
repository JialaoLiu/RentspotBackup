const jwt = require('jsonwebtoken');
require('dotenv').config();

// Simple auth check middleware
function authenticateToken(req, res, next) {
  const auth = req.header('Authorization');
  
  if (!auth) {
    return res.status(401).json({ message: 'Please login first' });
  }

  // Get just the token part
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

  try {
    // Verify the token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired login, please try again' });
  }
}

module.exports = authenticateToken;
