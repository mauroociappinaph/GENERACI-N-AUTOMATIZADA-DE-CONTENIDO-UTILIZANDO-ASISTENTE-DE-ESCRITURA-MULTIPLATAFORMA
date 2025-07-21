"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unblockIP = exports.blockIP = exports.getSecurityStats = exports.cleanupSecurityData = exports.requestFingerprinting = exports.geolocationSecurity = exports.suspiciousActivityDetection = exports.ipBlockingMiddleware = void 0;
const security_1 = require("../config/security");
/**
 * Advanced security middleware
 * Responsabilidad: Detección y prevención de actividades sospechosas
 */
// In-memory store for tracking suspicious activity (in production, use Redis)
const suspiciousIPs = new Map();
const blockedIPs = new Set();
/**
 * IP blocking middleware
 */
const ipBlockingMiddleware = (req, res, next) => {
    const clientIP = getClientIP(req);
    // Check if IP is blocked
    if (blockedIPs.has(clientIP)) {
        console.warn(`Blocked IP ${clientIP} attempted to access ${req.path}`);
        res.status(403).json({
            error: {
                code: 'IP_BLOCKED',
                message: 'Access denied. Your IP address has been blocked due to suspicious activity.',
                timestamp: new Date().toISOString(),
            },
        });
        return;
    }
    next();
};
exports.ipBlockingMiddleware = ipBlockingMiddleware;
/**
 * Suspicious activity detection middleware
 */
const suspiciousActivityDetection = (req, res, next) => {
    const clientIP = getClientIP(req);
    const userAgent = req.get('User-Agent') || '';
    const path = req.path;
    // Check for suspicious patterns
    const suspiciousIndicators = [
        // Bot-like user agents
        /bot|crawler|spider|scraper/i.test(userAgent),
        // Missing or suspicious user agent
        !userAgent || userAgent.length < 10,
        // Rapid requests (this would be better handled with Redis in production)
        checkRapidRequests(clientIP),
        // Suspicious paths
        /\.(php|asp|jsp|cgi)$/i.test(path),
        // Common attack paths
        /\/(wp-admin|admin|phpmyadmin|xmlrpc)/i.test(path),
    ];
    const suspiciousCount = suspiciousIndicators.filter(Boolean).length;
    if (suspiciousCount >= 2) {
        trackSuspiciousActivity(clientIP, req);
        // Log suspicious activity
        console.warn(`Suspicious activity detected from IP ${clientIP}:`, {
            userAgent,
            path,
            method: req.method,
            suspiciousCount,
            timestamp: new Date().toISOString(),
        });
    }
    next();
};
exports.suspiciousActivityDetection = suspiciousActivityDetection;
/**
 * Geolocation-based security (basic implementation)
 */
const geolocationSecurity = (req, res, next) => {
    const clientIP = getClientIP(req);
    const country = req.get('CF-IPCountry') || req.get('X-Country-Code'); // Cloudflare or other proxy headers
    // List of countries to block (example - adjust based on your needs)
    const blockedCountries = process.env.BLOCKED_COUNTRIES?.split(',') || [];
    if (country && blockedCountries.includes(country.toUpperCase())) {
        console.warn(`Blocked request from country ${country}, IP: ${clientIP}`);
        res.status(403).json({
            error: {
                code: 'COUNTRY_BLOCKED',
                message: 'Access denied from your location.',
                timestamp: new Date().toISOString(),
            },
        });
        return;
    }
    next();
};
exports.geolocationSecurity = geolocationSecurity;
/**
 * Request fingerprinting for additional security
 */
const requestFingerprinting = (req, res, next) => {
    const fingerprint = generateRequestFingerprint(req);
    // Add fingerprint to request for use in other middleware
    req.fingerprint = fingerprint;
    // Log fingerprint for suspicious requests
    if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
        console.info(`Request fingerprint for ${req.path}: ${fingerprint}`);
    }
    next();
};
exports.requestFingerprinting = requestFingerprinting;
/**
 * Helper functions
 */
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    return cfConnectingIP || realIP || (forwarded ? forwarded.split(',')[0].trim() : req.ip) || 'unknown';
}
function checkRapidRequests(ip) {
    const now = new Date();
    const activity = suspiciousIPs.get(ip);
    if (!activity) {
        suspiciousIPs.set(ip, { count: 1, lastSeen: now, blocked: false });
        return false;
    }
    // Check if requests are too rapid (more than 10 requests per second)
    const timeDiff = now.getTime() - activity.lastSeen.getTime();
    if (timeDiff < 100) { // Less than 100ms between requests
        activity.count++;
        activity.lastSeen = now;
        if (activity.count > 10) {
            return true;
        }
    }
    else {
        // Reset count if enough time has passed
        activity.count = 1;
        activity.lastSeen = now;
    }
    return false;
}
function trackSuspiciousActivity(ip, req) {
    const activity = suspiciousIPs.get(ip) || { count: 0, lastSeen: new Date(), blocked: false };
    activity.count++;
    activity.lastSeen = new Date();
    // Block IP if too many suspicious activities
    if (activity.count >= security_1.securityConfig.audit.alertThresholds.suspiciousRequests) {
        activity.blocked = true;
        blockedIPs.add(ip);
        console.error(`IP ${ip} has been automatically blocked due to suspicious activity`, {
            count: activity.count,
            lastPath: req.path,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
        });
    }
    suspiciousIPs.set(ip, activity);
}
function generateRequestFingerprint(req) {
    const components = [
        req.get('User-Agent') || '',
        req.get('Accept-Language') || '',
        req.get('Accept-Encoding') || '',
        req.get('Accept') || '',
        getClientIP(req),
    ];
    // Simple hash function (in production, use a proper crypto hash)
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}
/**
 * Clean up old entries periodically (call this from a scheduled job)
 */
const cleanupSecurityData = () => {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    for (const [ip, activity] of suspiciousIPs.entries()) {
        if (now.getTime() - activity.lastSeen.getTime() > maxAge) {
            suspiciousIPs.delete(ip);
            blockedIPs.delete(ip);
        }
    }
    console.info(`Security data cleanup completed. Active suspicious IPs: ${suspiciousIPs.size}`);
};
exports.cleanupSecurityData = cleanupSecurityData;
/**
 * Get security statistics
 */
const getSecurityStats = () => {
    return {
        suspiciousIPs: suspiciousIPs.size,
        blockedIPs: blockedIPs.size,
        timestamp: new Date().toISOString(),
    };
};
exports.getSecurityStats = getSecurityStats;
/**
 * Manually block/unblock IP addresses
 */
const blockIP = (ip) => {
    blockedIPs.add(ip);
    const activity = suspiciousIPs.get(ip) || { count: 0, lastSeen: new Date(), blocked: false };
    activity.blocked = true;
    suspiciousIPs.set(ip, activity);
    console.info(`IP ${ip} manually blocked`);
};
exports.blockIP = blockIP;
const unblockIP = (ip) => {
    blockedIPs.delete(ip);
    const activity = suspiciousIPs.get(ip);
    if (activity) {
        activity.blocked = false;
        suspiciousIPs.set(ip, activity);
    }
    console.info(`IP ${ip} manually unblocked`);
};
exports.unblockIP = unblockIP;
