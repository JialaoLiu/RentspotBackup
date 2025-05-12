const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied, token missing!' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Use JWT_SECRET from .env
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

module.exports = authenticateToken;