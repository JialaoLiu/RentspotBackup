const mysql = require('mysql2/promise');
require('dotenv').config();

// Simple database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Rent_database',
  port: process.env.DB_PORT || 3306
});

// Check if we can connect
db.getConnection()
  .then(conn => {
    console.log(`Connected to MySQL: ${process.env.DB_NAME}`);
    conn.release();
  })
  .catch(err => {
    console.error('MySQL connection error:', err.message);
  });

module.exports = db;
