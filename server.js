const mysql = require("mysql");

// Create a MySQL connection pool
const pool = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "keysfinder",
  waitForConnections: true,
  connectionLimit: 10,
  //   queueLimit: 0,
});

module.exports = pool;
