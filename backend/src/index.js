const app = require('./app');
const { env } = require('./config/env');

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.port}${env.apiPrefix}`);
});

function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`${signal} received, shutting down API.`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
