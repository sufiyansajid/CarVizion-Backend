const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function seed() {
    try {
        const seedsDir = path.join(__dirname, '../seeds');

        if (!fs.existsSync(seedsDir)) {
            console.log('No seeds directory found.');
            return;
        }

        const files = fs.readdirSync(seedsDir).sort();

        console.log('🌱 Starting seeding...');

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`▶ Running seed: ${file}`);
                const filePath = path.join(seedsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');

                await db.query(sql);
                console.log(`✅ Completed: ${file}`);
            }
        }

        console.log('✨ All seeds completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
