const path = require('path');
const fs = require('fs');

try {
    // dotenv is useful at runtime, but service-level tests should still run before npm install.
    require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
} catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
}

function readSecret(name) {
    const filePath = process.env[`${name}_FILE`];

    if (filePath) {
        try {
            const value = fs.readFileSync(filePath, 'utf8').trim();

            if (!value) {
                throw new Error(`Secret file for ${name} is empty.`);
            }

            return value;
        } catch (error) {
            throw new Error(`Unable to read secret ${name}: ${error.message}`);
        }
    }

    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing secret: ${name}`);
    }

    return value;
}

const requiredEnv = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'GROQ_MODEL',
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}`);
    }
}

const dbPassword = readSecret('DB_PASSWORD');
const jwtSecret = readSecret('JWT_SECRET');
const groqApiKey = readSecret('GROQ_API_KEY');

const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.BACKEND_PORT || 3000),
    apiPrefix: process.env.API_PREFIX || '/api',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    jwtSecret,
    jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS || 7 * 24 * 60 * 60),

    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: dbPassword,
    },
    ai: {
        provider: 'groq',
        apiKey: groqApiKey,
        model: process.env.GROQ_MODEL,
        maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || 400),
        timeoutMS: Number(process.env.AI_TIMEOUT_MS || 12000),
        maxRetries: Number(process.env.AI_MAX_RETRIES || 1),
    }
};

module.exports = { env };
