const fs = require('fs');
const path = require('path');
const { query, pool } = require('../config/db');

const migrationsDir = path.resolve(__dirname, 'migrations');

async function runMigrations() {
    const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

    for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8').trim();

        if (!sql) {
            console.log(`Skipping empty migration ${file}`);
            continue;
        }

        console.log(`Running migration ${file}`);
        await query(sql);
    }
}

runMigrations()
    .then(() => {
        console.log('Migrations completed.');
    })
    .catch((error) => {
        console.log('Migrations failed:', error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());