const app = require('./app');
const { env } = require('./config/env');
const { testDatabaseConnection } = require('./config/db');

async function startServer() {
  await testDatabaseConnection();

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
}

startServer().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
