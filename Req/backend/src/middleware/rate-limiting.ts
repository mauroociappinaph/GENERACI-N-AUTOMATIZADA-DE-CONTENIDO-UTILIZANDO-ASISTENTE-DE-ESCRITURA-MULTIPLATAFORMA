import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { config } from '../config';

/**
 * Advanced rate limiting middleware configurations
 * Responsabilidad: Configuración avanzada de límites para diferentes endpoints
 */

// Advanced key generator for rate limiting
const generateKey = (req: Request): string => {
  // Use user ID if authenticated, otherwise use IP
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  // Get real IP address considering proxies
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
  return `ip:${ip}`;
};

// Enhanced general rate limiter with progressive penalties
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: Request) => {
    // Authenticated users get higher limits
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    return userId ? 200 : 100;
  },
  keyGenerator: generateKey,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
      retryAfter: 15 * 60, // seconds
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for OPTIONS requests (CORS preflight)
  skip: (req) => req.method === 'OPTIONS',
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    console.warn(`Rate limit exceeded for ${userId ? `user ${userId}` : `IP ${req.ip}`} on ${req.path}`);

    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please slow down and try again later.',
        timestamp: new Date().toISOString(),
        retryAfter: 15 * 60,
        path: req.path,
      },
    });
  },
});

// Enhanced authentication rate limiter with progressive penalties
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  keyGenerator: generateKey,
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
      timestamp: new Date().toISOString(),
      retryAfter: 15 * 60,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Allow OPTIONS requests to pass through without being limited
  skip: (req) => req.method === 'OPTIONS',
  // Custom handler for auth rate limit exceeded
  handler: (req, res) => {
    const ip = req.ip;
    const userAgent = req.get('User-Agent') || 'Unknown';
    console.error(`Authentication rate limit exceeded for IP ${ip}, User-Agent: ${userAgent}, Path: ${req.path}`);

    // Log suspicious activity for potential brute force attacks
    if (req.body?.email) {
      console.error(`Potential brute force attack on email: ${req.body.email} from IP: ${ip}`);
    }

    res.status(429).json({
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Your IP has been temporarily blocked for security reasons.',
        timestamp: new Date().toISOString(),
        retryAfter: 15 * 60,
        path: req.path,
      },
    });
  },
});

// Aggressive rate limiter for failed login attempts
export const failedLoginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 failed attempts per hour
  keyGenerator: (req: Request) => {
    // Combine IP and email for more targeted limiting
    const email = req.body?.email || 'unknown';
    const ip = req.ip;
    return `failed_login:${email}:${ip}`;
  },
  message: {
    error: {
      code: 'FAILED_LOGIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many failed login attempts. Account temporarily locked.',
      timestamp: new Date().toISOString(),
      retryAfter: 60 * 60,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
});

// Rate limiter for password reset endpoints
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: {
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset attempts, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for data creation endpoints
export const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 creation requests per minute
  message: {
    error: {
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      message: 'Too many creation requests, please slow down.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for report generation endpoints
export const reportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 report requests per 5 minutes
  keyGenerator: generateKey,
  message: {
    error: {
      code: 'REPORT_RATE_LIMIT_EXCEEDED',
      message:
        'Too many report generation requests, please wait before trying again.',
      timestamp: new Date().toISOString(),
      retryAfter: 5 * 60,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Advanced rate limiter for admin operations
export const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // Limit admin operations
  keyGenerator: generateKey,
  message: {
    error: {
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many administrative operations, please slow down.',
      timestamp: new Date().toISOString(),
      retryAfter: 10 * 60,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for sensitive data access
export const sensitiveDataLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit sensitive data access
  keyGenerator: generateKey,
  message: {
    error: {
      code: 'SENSITIVE_DATA_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests to sensitive data endpoints.',
      timestamp: new Date().toISOString(),
      retryAfter: 5 * 60,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    console.warn(`Sensitive data rate limit exceeded for ${userId ? `user ${userId}` : `IP ${req.ip}`} on ${req.path}`);

    res.status(429).json({
      error: {
        code: 'SENSITIVE_DATA_RATE_LIMIT_EXCEEDED',
        message: 'Too many requests to sensitive data. Access temporarily restricted.',
        timestamp: new Date().toISOString(),
        retryAfter: 5 * 60,
        path: req.path,
      },
    });
  },
});
