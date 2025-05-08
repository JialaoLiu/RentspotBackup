const express = require('express');
const db = require('./db');
const router = express.Router();

router.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM User WHERE user_email = ? AND user_password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).send('Server error');
    }
    if (results.length > 0) {
      // You can also add JWT here if needed
      res.status(200).json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

module.exports = router;
