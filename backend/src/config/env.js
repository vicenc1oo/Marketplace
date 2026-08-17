const path = require('path');

try {
    // dotenv is useful at runtime, but service-level tests should still run before npm install.
    require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
} catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
}

const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    apiPrefix: process.env.API_PREFIX || '/api',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
    jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS || 7 * 24 * 60 * 60),
};

module.exports = { env };
