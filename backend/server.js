require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

/**
 * RentSpot API Server
 * Express.js backend for property rental platform
 * 
 * Server setup evolved from basic Express server with hardcoded CORS, to environment-based configuration,
 * then added proper error handling and process monitoring, finally multiple CORS origins for development and production.
 * 
 * Port 8080 chosen because it avoids conflicts with frontend dev server (5173),
 * university firewall allows this port, and it's easy to remember for API testing.
 */
const app = express();
const PORT = process.env.PORT || 8080;

// Body parsing middleware - Express 4.16+ has built-in JSON parsing
// No need for body-parser package anymore (was using it in early versions)
app.use(express.json());

// CORS configuration - evolved to handle multiple environments
// Originally had simple CORS(origin: true) but that's insecure for production
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://dev.rentspot.com:5173',
    /https:\/\/.*\.app\.github\.dev$/,  // Allow all GitHub Codespaces URLs
    /https:\/\/.*\.github\.dev$/       // Allow any github.dev domain
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const authRoutes = require('./routes/authRoutes');
const workingPropertyRoutes = require('./routes/workingPropertyRoutes');
// database route not used: const realPropertyRoutes = require('./routes/realPropertyRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});


app.use('/api/auth', authRoutes);
app.use('/api/properties', workingPropertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Stack:', err.stack);
  
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: err.stack 
    });
  } else {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Frontend at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message || err);
});