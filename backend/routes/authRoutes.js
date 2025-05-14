const express = require('express');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating and verifying JWT tokens
const axios = require('axios'); // For making HTTP requests
const db = require('../config/db'); // Database connection
require('dotenv').config(); // Load environment variables

const router = express.Router();

// Helper function to verify CAPTCHA
// [CAPTCHA ADDED]
async function verifyCaptcha(captchaToken) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(verificationUrl, null, {
      params: {
        secret: secretKey,
        response: captchaToken,
      },
    });

    const result = response.data;

    // log
    console.log('reCAPTCHA result:', result);

    // check score
    if (!result.success || result.action !== 'login' || result.score < 0.5) {
      console.warn('reCAPTCHA verification failed:', result);
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
  const { user_email, user_password, captcha } = req.body; // [CAPTCHA ADDED]

  // Validate input
  if (!user_email || !user_password || !captcha) { // [CAPTCHA ADDED]
    return res.status(400).json({ message: 'Missing required fields or CAPTCHA' }); // [CAPTCHA ADDED]
  }

  // Verify CAPTCHA
  // [CAPTCHA ADDED]
  const isCaptchaValid = await verifyCaptcha(captcha);
  if (!isCaptchaValid) {
    return res.status(400).json({ message: 'CAPTCHA verification failed' });
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

// Register a new user (No changes made here)
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

module.exports = router;
