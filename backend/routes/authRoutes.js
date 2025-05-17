const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Check captcha
async function checkCaptcha(token) {
  // Skip in dev mode
  if (!token) {
    return process.env.NODE_ENV === 'development';
  }

  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    return response.data.success;
  } catch (error) {
    console.log('Captcha error:', error.message);
    return false;
  }
}

// Login
router.post('/login', async (req, res) => {
  const { user_email, user_password, captcha } = req.body;

  // Check required fields
  if (!user_email || !user_password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  // Verify captcha if provided
  if (captcha && !(await checkCaptcha(captcha))) {
    return res.status(400).json({ message: 'Invalid captcha' });
  }

  try {
    // Find user
    const [users] = await db.execute('SELECT * FROM User WHERE user_email = ?', [user_email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    // Check password
    const passwordValid = await bcrypt.compare(user_password, user.user_password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.user_id, role: user.user_role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        name: user.user_name,
        email: user.user_email,
        role: user.user_role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { user_name, user_email, user_password, user_phone, user_role, captcha } = req.body;

  // Check required fields
  if (!user_name || !user_email || !user_password) {
    return res.status(400).json({ message: 'Name, email and password required' });
  }

  // Verify captcha if provided
  if (captcha && !(await checkCaptcha(captcha))) {
    return res.status(400).json({ message: 'Invalid captcha' });
  }

  try {
    // Check if email already exists
    const [existing] = await db.execute('SELECT * FROM User WHERE user_email = ?', [user_email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);
    
    // Create user
    await db.execute(
      `INSERT INTO User (user_name, user_email, user_password, user_phone, user_role, user_registered_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [user_name, user_email, hashedPassword, user_phone, user_role || 'user']
    );
    
    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Registration failed' });
  }
});

module.exports = router;