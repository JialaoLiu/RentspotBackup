const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

// Debugging: Log the environment variables
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '********' : 'MISSING');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const db = mysql.createConnection({
  host: process.env.DB_HOST, // Use variables from .env
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:');
    console.error('Code:', err.code); // Example: 'ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR'
    console.error('Message:', err.message); // Example: 'Access denied for user'
    console.error('Stack:', err.stack); // Full stack trace for debugging
    return;
  }
  console.log(`Connected to MySQL database: ${process.env.DB_NAME}`);
});

module.exports = db;