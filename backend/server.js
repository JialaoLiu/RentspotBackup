require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://dev.rentspot.com:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import routes
const authRoutes = require('./routes/authRoutes');
const workingPropertyRoutes = require('./routes/workingPropertyRoutes');
const userRoutes = require('./routes/userRoutes');

// Test route to check if API is working
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', workingPropertyRoutes);
app.use('/api/users', userRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Show more details during development
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message
    });
  } else {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Frontend at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Handle crashes in development
process.on('uncaughtException', (err) => {
  console.error('Uncaught error:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('Promise rejection:', err);
});