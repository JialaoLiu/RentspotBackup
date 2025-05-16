require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware for JSON parsing
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://dev.rentspot.com:5173'];

    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Test Cloudinary connection
console.log('Testing Cloudinary connection...');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the RentSpot API!');
});
// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Frontend allowed origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log('Try accessing:');
  console.log(`- http://localhost:${PORT}/test`);
  console.log(`- http://localhost:${PORT}/api/properties`);
  console.log(`- http://localhost:${PORT}/api/properties/101`);
});

// Root route
app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.send(`
    RentSpot API Server is running. Use the frontend application to access the user interface.
    <br><br>
    Frontend allowed origin: <a href="${frontendUrl}" style="color: blue; text-decoration: underline;">${frontendUrl}</a>
  `);
});