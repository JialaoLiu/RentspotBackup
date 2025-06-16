const mysql = require('mysql2/promise');
require('dotenv').config();

// Use socket connection for Codespaces, TCP for local
const poolConfig = {
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Rent_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 100
};

// In Codespaces, use socket connection for better reliability
if (process.env.CODESPACE_NAME) {
  poolConfig.socketPath = '/var/run/mysqld/mysqld.sock';
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = process.env.DB_PORT || 3306;
}

const pool = mysql.createPool(poolConfig);

// const db = mysql.createConnection({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'Rent_database'
// });
//
// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed:', err.message);
//     return;
//   }
//   console.log('Connected to MySQL database');
// });

module.exports = pool;
