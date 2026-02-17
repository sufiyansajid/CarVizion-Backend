
const db = require('./config/database');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        const migrationFile = process.argv[2] || 'migrations/010_users_add_reset_token.sql';
        const sqlPath = path.join(__dirname, migrationFile);
        console.log(`Reading migration from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await db.query(sql);
        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
