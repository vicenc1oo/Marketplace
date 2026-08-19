const http = require('http');
const app = require('./app');
const { env } = require('./config/env');
const { pool, testDatabaseConnection } = require('./config/db');
const { initializeSocketServer } = require('./socket');

async function startServer() {
  await testDatabaseConnection();

  const server = http.createServer(app);
  const io = initializeSocketServer(server);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.port}${env.apiPrefix}`);
  });

  function shutdown(signal) {
    // eslint-disable-next-line no-console
    console.log(`${signal} received, shutting down API.`);
    io.close(() => {
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
