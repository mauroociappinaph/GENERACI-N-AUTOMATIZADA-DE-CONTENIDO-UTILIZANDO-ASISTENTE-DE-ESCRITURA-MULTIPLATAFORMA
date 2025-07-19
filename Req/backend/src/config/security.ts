import { config } from './index';

/**
 * Security configuration module
 * Responsabilidad: Configuración centralizada de medidas de seguridad
 */

export const securityConfig = {
  // Rate limiting configuration
  rateLimiting: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      maxRequestsAuthenticated: 200,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    },
    failedLogin: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
    },
    admin: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxRequests: 50,
    },
    sensitiveData: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 20,
    },
    reports: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 5,
    },
  },

  // Content Security Policy configuration
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null,
    },
    reportOnly: config.nodeEnv === 'development',
  },

  // HTTPS and TLS configuration
  https: {
    enabled: config.nodeEnv === 'production',
    forceHttps: config.nodeEnv === 'production',
    hstsMaxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Input validation configuration
  validation: {
    maxStringLength: 10000,
    maxPayloadSize: 10 * 1024 * 1024, // 10MB
    suspiciousPatterns: [
      // SQL injection patterns
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      // Path traversal
      /\.\.[\/\\]/,
      // Command injection
      /[;&|`$(){}[\]]/,
      // XSS patterns
      /<script|javascript:|vbscript:|onload=|onerror=/i,
      // Null bytes
      /\x00/,
      // Excessive length (potential DoS)
      /.{2000,}/,
    ],
    dangerousHeaders: ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'],
  },

  // Session and authentication security
  session: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // CORS security configuration
  cors: {
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours
  },

  // Security headers configuration
  headers: {
    frameOptions: 'DENY',
    contentTypeOptions: 'nosniff',
    xssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
    ].join(', '),
  },

  // Audit and monitoring configuration
  audit: {
    logSuspiciousActivity: true,
    logFailedAttempts: true,
    alertThresholds: {
      failedLogins: 5,
      rateLimitExceeded: 10,
      suspiciousRequests: 3,
    },
    retentionDays: 90,
  },
} as const;

/**
 * Get security configuration for specific environment
 */
export const getSecurityConfig = () => {
  return {
    ...securityConfig,
    // Override settings based on environment
    ...(config.nodeEnv === 'development' && {
      https: {
        ...securityConfig.https,
        enabled: false,
        forceHttps: false,
      },
      csp: {
        ...securityConfig.csp,
        reportOnly: true,
      },
    }),
  };
};

/**
 * Validate security configuration
 */
export const validateSecurityConfig = (): boolean => {
  const requiredEnvVars = ['JWT_SECRET'];

  if (config.nodeEnv === 'production') {
    requiredEnvVars.push('DATABASE_URL');
  }

  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar] || process.env[envVar] === 'fallback-secret-key'
  );

  if (missing.length > 0) {
    console.error(`Missing required environment variables for security: ${missing.join(', ')}`);
    return false;
  }

  // Validate JWT secret strength
  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters long for security');
    return false;
  }

  return true;
};

export default securityConfig;
