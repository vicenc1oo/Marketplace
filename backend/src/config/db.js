const { Pool } = require('pg');
const { env } = require('./env');

const pool = new Pool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
});

async function query(text, params) {
    return pool.query(text, params);
}

async function testDatabaseConnection() {
    const result = await query('SELECT NOW() AS now');
    console.log(`Database connected at ${result.rows[0].now}`);
}

module.exports = {
    pool,
    query,
    testDatabaseConnection,
};