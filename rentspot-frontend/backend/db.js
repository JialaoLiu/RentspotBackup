const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '3306',
  user: 'root',
  password: '02052003',
  database: 'Rent_database'
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
});

module.exports = db;
