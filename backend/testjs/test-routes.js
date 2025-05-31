require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware for JSON parsing
app.use(express.json());
app.use(cors());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Import only auth routes for now
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Create a simple test property route
const testPropertyRoutes = express.Router();
testPropertyRoutes.get('/', (req, res) => {
  res.json({ message: 'Property test route works!' });
});
app.use('/api/properties', testPropertyRoutes);

// Start the Server
const PORT = process.env.PORT || 8081; // Using a different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`Test server is running on http://localhost:${PORT}`);
  console.log('Try accessing:');
  console.log(`- http://localhost:${PORT}/test`);
  console.log(`- http://localhost:${PORT}/api/properties`);
});