const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'dev',
  database: 'ewali',
  password: 'dev123'
});

module.exports = pool.promise();