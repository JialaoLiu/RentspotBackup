const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Helper function to verify Cloudflare Turnstile
async function verifyTurnstile(token) {
  // If token isn't provided, we'll need to decide how to handle it
  // For development, you might want to bypass verification
  if (!token) {
    console.warn('No Turnstile token provided');
    // Return true for development, false for production
    return process.env.NODE_ENV === 'development';
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const verificationUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  try {
    const response = await axios.post(
      verificationUrl,
      new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const result = response.data;
    console.log('Turnstile verification result:', result);

    if (!result.success) {
      console.warn('Turnstile verification failed:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error.message);
    return false;
  }
}

// Login an existing user
router.post('/login', async (req, res) => {
  const { user_email, user_password, captcha } = req.body;

  // Validate input
  if (!user_email || !user_password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Verify Turnstile CAPTCHA if provided
  if (captcha) {
    const isCaptchaValid = await verifyTurnstile(captcha);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }
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
      const token = jwt.sign({ id: user.user_id, role: user.user_role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({
        message: 'Login successful',
        token,
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

// Register a new user
router.post('/register', async (req, res) => {
  const { user_name, user_email, user_password, user_phone, user_role, captcha } = req.body;

  // Validate input
  if (!user_name || !user_email || !user_password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Verify Turnstile CAPTCHA if provided
  if (captcha) {
    const isCaptchaValid = await verifyTurnstile(captcha);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }
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

module.exports = router;