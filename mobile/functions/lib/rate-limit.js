"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_PRESETS = void 0;
exports.assertRateLimit = assertRateLimit;
const https_1 = require("firebase-functions/v2/https");
const logger_1 = require("./logger");
const ONE_MINUTE_MS = 60_000;
const requestTimestampsByKey = new Map();
exports.RATE_LIMIT_PRESETS = {
    sendMessage: { limit: 30, windowMs: ONE_MINUTE_MS },
    ai: { limit: 20, windowMs: ONE_MINUTE_MS },
    oauth: { limit: 10, windowMs: ONE_MINUTE_MS },
    checkout: { limit: 10, windowMs: ONE_MINUTE_MS },
};
function assertRateLimit({ key, limit, windowMs }) {
    const now = Date.now();
    const windowStart = now - windowMs;
    const recentTimestamps = (requestTimestampsByKey.get(key) ?? []).filter((timestamp) => timestamp > windowStart);
    if (recentTimestamps.length >= limit) {
        const retryAfterMs = Math.max(1, recentTimestamps[0] + windowMs - now);
        requestTimestampsByKey.set(key, recentTimestamps);
        (0, logger_1.warn)('Rate limit exceeded', { key, limit, windowMs, retryAfterMs });
        throw new https_1.HttpsError('resource-exhausted', 'Muitas solicitações. Aguarde antes de tentar novamente.', { retryAfterMs });
    }
    requestTimestampsByKey.set(key, [...recentTimestamps, now]);
}
//# sourceMappingURL=rate-limit.js.map