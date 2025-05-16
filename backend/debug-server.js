// Simplified test file with debug routes
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

// Import debug property routes 
const debugPropertyRoutes = require('./controllers/debugPropertyRoutes');
app.use('/api/properties', debugPropertyRoutes);

// Start the Server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Debug server is running on http://localhost:${PORT}`);
  console.log('Try accessing:');
  console.log(`- http://localhost:${PORT}/test`);
  console.log(`- http://localhost:${PORT}/api/properties`);
  console.log(`- http://localhost:${PORT}/api/properties/123`);
});