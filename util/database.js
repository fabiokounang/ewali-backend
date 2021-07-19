const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.NODE_DB_HOST || 'localhost',
  user: process.env.NODE_DB_USER || 'dev',
  database: process.env.NODE_DB_DATABASE || 'ewali',
  password: process.env.NODE_DB_PASSWORD || 'dev123'
});

module.exports = pool.promise();