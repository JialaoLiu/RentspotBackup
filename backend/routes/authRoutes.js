const express = require('express');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating and verifying JWT tokens
const db = require('../config/db'); // Database connection
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { user_name, user_email, user_password, user_phone, user_role } = req.body;

  // Validate input
  if (!user_name || !user_email || !user_password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if the email already exists
    const checkQuery = 'SELECT * FROM User WHERE user_email = ?';
    db.query(checkQuery, [user_email], async (checkErr, results) => {
      if (checkErr) {
        console.error(checkErr);
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user_password, 10);

        // Insert the new user
        const query = `
          INSERT INTO User (user_name, user_email, user_password, user_phone, user_role, user_registered_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `;
        db.query(query, [user_name, user_email, hashedPassword, user_phone, user_role], (insertErr, result) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ message: 'Database error' });
          }

          return res.status(201).json({ message: 'User registered successfully' });
        });
      } catch (hashErr) {
        console.error(hashErr);
        return res.status(500).json({ message: 'Error hashing password' });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login an existing user
router.post('/login', (req, res) => {
  const { user_email, user_password } = req.body;

  // Validate input
  if (!user_email || !user_password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Find the user in the database
  const query = 'SELECT * FROM User WHERE user_email = ?';
  db.query(query, [user_email], async (queryErr, results) => {
    if (queryErr) {
      console.error(queryErr);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    try {
      // Compare the entered password with the hashed password
      const isPasswordValid = await bcrypt.compare(user_password, user.user_password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: user.user_id, role: user.user_role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Use JWT_SECRET from .env

      return res.status(200).json({
        message: 'Login successful',
        token, // Send the token to the client
        user: {
          id: user.user_id,
          name: user.user_name,
          email: user.user_email,
          role: user.user_role,
        },
      });
    } catch (compareErr) {
      console.error(compareErr);
      return res.status(500).json({ message: 'Error comparing passwords' });
    }
  });
});

module.exports = router;