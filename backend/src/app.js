const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const analyticsRoutes = require('./features/analytics/analytics.routes');
const currencyRoutes = require('./features/currency/currency.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { optionalAuth } = require('./middleware/auth.middleware');
const authRoutes = require('./features/auth/auth.routes');
const userRoutes = require('./features/user/user.routes');
const notificationRoutes = require('./features/notifications/notification.routes');
const { listingRouter, categoryRouter } = require('./features/listings/listing.routes')


const app = express();

// Do not disclose the framework name/version through the X-Powered-By header.
app.disable('x-powered-by');

app.use(cors({
    origin: env.corsOrigin === '*' ? true : env.corsOrigin,
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use(`${env.apiPrefix}/auth`, authRoutes);
app.use(optionalAuth);
app.use(`${env.apiPrefix}/currency`, currencyRoutes);
app.use(`${env.apiPrefix}/analytics`, analyticsRoutes);
app.use(`${env.apiPrefix}/users`, userRoutes);
app.use(`${env.apiPrefix}/notifications`, notificationRoutes);
app.use(`${env.apiPrefix}/listings`, listingRouter);
app.use(`${env.apiPrefix}/categories`, categoryRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
