// TODO: Replace JWT with session-based authentication for codespaces deployment
// FIXME: Current use of jsonwebtoken not course submission requirements.

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/db');
const { handleValidationError, handleNotFound, handleAuthError, handleDbError } = require('../utils/errorHandler');
require('dotenv').config();

// Auth routes with CAPTCHA and JWT tokens
// CAPTCHA prevents spam registration, JWT handles authentication

const router = express.Router();

async function checkCaptcha(token) {
  if (!token) {
    return process.env.NODE_ENV === 'development';
  }

  // Use test keys only for Codespaces environment
  const isCodespaces = process.env.CODESPACE_NAME;
  
  const secretKey = isCodespaces 
    ? (process.env.TURNSTILE_TEST_SECRET_KEY || '1x0000000000000000000000000000000AA')
    : process.env.TURNSTILE_SECRET_KEY;

  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: secretKey, // Dynamic key selection for codespaces/local
        response: token
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    return response.data.success;
  } catch (error) {
    return false;
  }
}

router.post('/login', async (req, res) => {
  const { user_email, user_password, captcha } = req.body;

  if (!user_email || !user_password) {
    return handleValidationError(res, 'Email and password required');
  }

  // if (!captcha) {
  //   return handleValidationError(res, 'CAPTCHA required');
  // }

  if (captcha && !(await checkCaptcha(captcha))) {
    return handleValidationError(res, 'Invalid captcha');
  }

  try {
    const [users] = await db.execute('SELECT * FROM User WHERE user_email = ?', [user_email]);
    
    if (users.length === 0) {
      return handleNotFound(res, 'User');
    }

    const user = users[0];
    
    const passwordValid = await bcrypt.compare(user_password, user.user_password);
    if (!passwordValid) {
      return handleAuthError(res, 'Wrong password');
    }

    // create token
    const token = jwt.sign(
      { 
        id: user.user_id, 
        user_id: user.user_id,  // Add this for consistency
        user_role: user.user_role,
        role: user.user_role  // Keep for backward compatibility
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET);
    // res.cookie('token', token, { httpOnly: true });
    // res.json({ message: 'Login successful', user: { id: user.user_id, name: user.user_name } });

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
    handleDbError(res, error, 'login');
  }
});

router.post('/register', async (req, res) => {
  const { user_name, user_email, user_password, user_phone, user_role, captcha } = req.body;

  if (!user_name || !user_email || !user_password) {
    return handleValidationError(res, 'Name, email and password required');
  }

  if (captcha && !(await checkCaptcha(captcha))) {
    return handleValidationError(res, 'Invalid captcha');
  }

  try {
    const [existing] = await db.execute('SELECT * FROM User WHERE user_email = ?', [user_email]);
    
    if (existing.length > 0) {
      return handleValidationError(res, 'Email already registered');
    }
    
    const hashedPassword = await bcrypt.hash(user_password, 10);
    
    // default avatar
    const avatarUrl = 'https://res.cloudinary.com/dzxrmtus9/image/upload/v1747541055/defaultavatar_eavhnz_ezkjxa.png';
    
    // await db.execute(
    //   `INSERT INTO User (user_name, user_email, user_password, user_phone, user_role, user_registered_at) 
    //    VALUES (?, ?, ?, ?, ?, NOW())`,
    //   [user_name, user_email, hashedPassword, user_phone, user_role || 0]
    // );
    
    try {
      // create user
      await db.execute(
        `INSERT INTO User (user_name, user_email, user_password, user_phone, user_role, user_registered_at, user_avatar_url) 
         VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        [user_name, user_email, hashedPassword, user_phone, user_role !== undefined ? user_role : 0, avatarUrl]
      );
    } catch (err) {
      throw err;
    }
    
    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    handleDbError(res, error, 'registration');
  }
});

module.exports = router;