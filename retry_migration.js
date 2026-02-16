
const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    console.log('Starting migration...');
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
    };

    console.log('Connection config:', { ...config, password: '****' });

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to database.');

        const sqlPath = path.join(__dirname, 'config', 'feedback_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await connection.query(sql);
        console.log('Migration successful: Table created or already exists.');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
