const db = require('./config/database');

async function checkSchema() {
    try {
        const [rows] = await db.execute('DESCRIBE users');
        console.log('Users table schema:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
