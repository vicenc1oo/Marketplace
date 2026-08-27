const requestsByUser = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

function aiAgentRateLimit(req, res, next) {
    const userId = req.user.id;
    const now = Date.now();

    let rateLimit = requestsByUser.get(userId);

    if (!rateLimit || now >= rateLimit.resetAt) {
        rateLimit = {
            count: 0,
            resetAt: now + WINDOW_MS,
        };
    }

    if (rateLimit.count >= MAX_REQUESTS) {
        const retryAfterSeconds = Math.ceil(
            (rateLimit.resetAt - now) / 1000,
        );

        res.set('Retry-After', String(retryAfterSeconds));

        return res.status(429).json({
            message: 'Too many AI requests. Please try again shortly.',
        });
    }

    rateLimit.count += 1;
    requestsByUser.set(userId, rateLimit);

    return next();
}

module.exports = {
    aiAgentRateLimit,
};