"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsDebugMiddleware = void 0;
/**
 * Debug middleware to log CORS-related information
 * Helps troubleshoot CORS issues during development
 */
const corsDebugMiddleware = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('🌐 CORS Debug Info:');
        console.log(`  Method: ${req.method}`);
        console.log(`  Origin: ${req.headers.origin || 'No origin header'}`);
        console.log(`  User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'No user-agent'}...`);
        console.log(`  Path: ${req.path}`);
        if (req.method === 'OPTIONS') {
            console.log('  🔍 This is a CORS preflight request');
            console.log(`  Access-Control-Request-Method: ${req.headers['access-control-request-method'] || 'None'}`);
            console.log(`  Access-Control-Request-Headers: ${req.headers['access-control-request-headers'] || 'None'}`);
        }
        // Log response headers after they're set
        const originalSend = res.send;
        res.send = function (body) {
            console.log('📤 Response Headers:');
            console.log(`  Access-Control-Allow-Origin: ${res.getHeader('Access-Control-Allow-Origin') || 'Not set'}`);
            console.log(`  Access-Control-Allow-Methods: ${res.getHeader('Access-Control-Allow-Methods') || 'Not set'}`);
            console.log(`  Access-Control-Allow-Headers: ${res.getHeader('Access-Control-Allow-Headers') || 'Not set'}`);
            console.log(`  Status: ${res.statusCode}`);
            console.log('---');
            return originalSend.call(this, body);
        };
    }
    next();
};
exports.corsDebugMiddleware = corsDebugMiddleware;
