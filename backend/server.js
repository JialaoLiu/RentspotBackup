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

// FIXME: CRITICAL - Database connection fails when switching between local and Codespace environments
// TODO: Need to implement automatic environment detection for database credentials
// Local environment requires DB_PASSWORD=Ljl12345! but Codespace uses empty password
// Current workaround: manually update .env files when switching environments
// 
// FIXME: Current issue - Codespace returns {"status":"error","message":"Database error"}
// TODO: The devcontainer.json creates .env with empty password but actual MySQL needs password
// TODO: Either fix devcontainer MySQL setup or add environment detection logic
// TODO: Possible solutions:
//   1. Auto-detect process.env.CODESPACE_NAME and set appropriate DB_PASSWORD
//   2. Fix devcontainer.json to set MySQL root password correctly
//   3. Create separate .env.codespace and .env.local files

// TEMPORARY FIX: Auto-detect Codespace environment and override DB_PASSWORD
if (process.env.CODESPACE_NAME) {
  // In Codespace, devcontainer sets up MySQL with empty password
  process.env.DB_PASSWORD = '';
  // Force IPv4 connection in Codespace (MySQL not listening on IPv6)
  process.env.DB_HOST = '127.0.0.1';
  console.log('CODESPACE DETECTED: Using empty database password and IPv4 connection');
  console.log('Current DB settings:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
} else {
  // Local environment uses password from .env file
  console.log('LOCAL MODE: Using database password from .env file');
}

// Body parsing middleware - Express 4.16+ has built-in JSON parsing
// No need for body-parser package anymore (was using it in early versions)
app.use(express.json());

// Debug: Log all incoming requests in Codespaces
if (process.env.CODESPACE_NAME) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
  });
}

// CORS configuration - evolved to handle multiple environments
// Originally had simple CORS(origin: true) but that's insecure for production

// FIXME: CRITICAL DATABASE ISSUE - Both local and Codespace environments failing with "Database error"
// TODO: Database credentials mismatch - .env has password but MySQL setup varies by environment
// TODO: Need to verify MySQL root password configuration in both environments

// CORS configuration - handles both local, private Codespaces, and public Codespaces
app.use(cors({
  origin: [
    'http://localhost:5173',                    // Local development
    'http://localhost:8080',                    // Local backend
    process.env.FRONTEND_URL,                   // Environment variable override
    /https:\/\/.*\.app\.github\.dev$/,          // GitHub Codespaces URLs (public)
    /https:\/\/.*\.github\.dev$/,               // Alternative Codespaces domains
    /https:\/\/.*\.githubpreview\.dev$/,        // GitHub Codespaces private URLs
    /https:\/\/.*-5173\.preview\.app\.github\.dev$/  // Codespaces preview URLs (private)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// FIXME: Previous complex CORS implementation - commented out but kept for reference
// Original array-based CORS - worked for most cases but had issues with dynamic Codespaces URLs
// app.use(cors({
//   origin: [
//     process.env.FRONTEND_URL || 'http://localhost:5173',
//     'https://dev.rentspot.com:5173',
//     /https:\/\/.*\.app\.github\.dev$/,  // Allow all GitHub Codespaces URLs
//     /https:\/\/.*\.github\.dev$/       // Allow any github.dev domain
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// FIXME: Previous conditional CORS - commented out due to reliability issues
// Temporary fix - allow all origins in Codespaces to debug CORS issues
// if (process.env.CODESPACE_NAME) {
//   console.log('CODESPACES MODE: Using permissive CORS for development');
//   app.use(cors({
//     origin: true,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
//   }));
// } else {
//   // TODO: Production CORS with function-based origin checking
//   app.use(cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       
//       const allowedOrigins = [
//         'http://localhost:5173',
//         process.env.FRONTEND_URL,
//         'https://dev.rentspot.com:5173'
//       ];
//       
//       // Allow GitHub Codespaces URLs - needed for deployment compatibility
//       if (origin.match(/https:\/\/.*\.app\.github\.dev$/) || 
//           origin.match(/https:\/\/.*\.github\.dev$/)) {
//         return callback(null, true);
//       }
//       
//       if (allowedOrigins.indexOf(origin) !== -1) {
//         return callback(null, true);
//       }
//       
//       return callback(new Error('Not allowed by CORS'));
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//     optionsSuccessStatus: 200
//   }));
// }

const authRoutes = require('./routes/authRoutes');
const workingPropertyRoutes = require('./routes/workingPropertyRoutes');
// database route not used: const realPropertyRoutes = require('./routes/realPropertyRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
// FIXME: Added NewsAPI proxy routes to handle CORS issues in Codespaces deployment
const newsRoutes = require('./routes/newsRoutes');

app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  const pool = require('./config/db');
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({ 
      message: 'Database connection successful',
      result: result[0],
      dbConfig: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]',
        database: process.env.DB_NAME
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message,
      dbConfig: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]',
        database: process.env.DB_NAME
      }
    });
  }
});


app.use('/api/auth', authRoutes);
app.use('/api/properties', workingPropertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
// TODO: Added NewsAPI proxy to handle external API integration complexity requirements
app.use('/api/news', newsRoutes);

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