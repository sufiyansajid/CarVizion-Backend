const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Add connection testing
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        console.log('Connection config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        });
        connection.release();
    })
    .catch(err => {
        console.error('Database connection error:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState
        });
    });

module.exports = pool;