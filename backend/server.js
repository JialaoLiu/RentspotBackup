require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://dev.rentspot.com:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const authRoutes = require('./routes/authRoutes');
const workingPropertyRoutes = require('./routes/workingPropertyRoutes');
// database route not used: const realPropertyRoutes = require('./routes/realPropertyRoutes');
const userRoutes = require('./routes/userRoutes');

app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Debug endpoint for avatar upload
app.post('/test-avatar', (req, res) => {
  console.log('=== TEST AVATAR ENDPOINT HIT ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  res.json({ message: 'Test endpoint reached' });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', workingPropertyRoutes);
app.use('/api/users', userRoutes);

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
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('=== UNHANDLED PROMISE REJECTION ===');
  console.error('Error:', err);
  if (err && err.stack) {
    console.error('Stack:', err.stack);
  }
});