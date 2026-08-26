const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { optionalAuth } = require('./middleware/auth.middleware');
const agentRoutes = require('./features/ai-agent/agent.routes');
const analyticsRoutes = require('./features/analytics/analytics.routes');
const authRoutes = require('./features/auth/auth.routes');
const biddingRoutes = require('./features/bidding/bidding.routes');
const chatRoutes = require('./features/chat/chat.routes');
const currencyRoutes = require('./features/currency/currency.routes');
const { listingRouter, categoryRouter } = require('./features/listings/listing.routes')
const notificationRoutes = require('./features/notifications/notification.routes');
const promotionRoutes = require('./features/promotions/promotion.routes');
const uploadRoutes = require('./features/upload/upload.routes');
const uploadService = require('./features/upload/upload.service');
const userRoutes = require('./features/user/user.routes');

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

app.use(`${env.apiPrefix}/ai-agent/conversations`, agentRoutes);
app.use(`${env.apiPrefix}/auth`, authRoutes);
app.use(optionalAuth);
app.use(`${env.apiPrefix}/analytics`, analyticsRoutes);
app.use(`${env.apiPrefix}/bidding`, biddingRoutes);
app.use(`${env.apiPrefix}/categories`, categoryRouter);
app.use(`${env.apiPrefix}/chat`, chatRoutes);
app.use(`${env.apiPrefix}/currency`, currencyRoutes);
app.use(`${env.apiPrefix}/listings`, listingRouter);
app.use(`${env.apiPrefix}/notifications`, notificationRoutes);
app.use(`${env.apiPrefix}/promotions`, promotionRoutes);
app.use(`${env.apiPrefix}/upload`, uploadRoutes);
app.use(`${env.apiPrefix}/users`, userRoutes);

// Uploaded images are accessible for users and non-users
app.use(`${env.apiPrefix}/uploads`, express.static(uploadService.UPLOAD_ROOT, {
    dotfiles: 'deny',
    index: false,
    maxAge: '1d',
}));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
