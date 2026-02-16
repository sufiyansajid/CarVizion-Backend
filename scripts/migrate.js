const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function migrate() {
    try {
        const migrationsDir = path.join(__dirname, '../migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        console.log('🚀 Starting migrations...');

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`▶Running migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');

                // Split by semicolon to handle multiple statements if any, though usually one per file is safer for error handling
                // For simplicity in this env, we assume standard queries. 
                // However, db.execute might not support multiple statements unless configured.
                // Let's try executing the whole file. If it fails due to multiple statements, we might need to split.
                // But our SQL files are single statements mostly.

                await db.query(sql); // usage of query instead of execute for broader compatibility with multiple statements if enabled
                console.log(`✅ Completed: ${file}`);
            }
        }

        console.log('✨ All migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
