const { env } = require('./env');

const socketOptions = {
    cors: {
        origin: env.corsOrigin === '*' ? true : env.corsOrigin,
        credentials: true,
    },
};

module.exports = { socketOptions };
