/**
 * Security configuration module
 * Responsabilidad: Configuración centralizada de medidas de seguridad
 */
export declare const securityConfig: {
    readonly rateLimiting: {
        readonly general: {
            readonly windowMs: number;
            readonly maxRequests: 100;
            readonly maxRequestsAuthenticated: 200;
        };
        readonly auth: {
            readonly windowMs: number;
            readonly maxRequests: 5;
        };
        readonly failedLogin: {
            readonly windowMs: number;
            readonly maxRequests: 3;
        };
        readonly admin: {
            readonly windowMs: number;
            readonly maxRequests: 50;
        };
        readonly sensitiveData: {
            readonly windowMs: number;
            readonly maxRequests: 20;
        };
        readonly reports: {
            readonly windowMs: number;
            readonly maxRequests: 5;
        };
    };
    readonly csp: {
        readonly directives: {
            readonly defaultSrc: readonly ["'self'"];
            readonly styleSrc: readonly ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];
            readonly scriptSrc: readonly ["'self'", "'unsafe-inline'"];
            readonly fontSrc: readonly ["'self'", "https://fonts.gstatic.com"];
            readonly imgSrc: readonly ["'self'", "data:", "https:", "blob:"];
            readonly connectSrc: readonly ["'self'", "https:", "wss:", "ws:"];
            readonly mediaSrc: readonly ["'self'"];
            readonly objectSrc: readonly ["'none'"];
            readonly childSrc: readonly ["'self'"];
            readonly frameSrc: readonly ["'none'"];
            readonly workerSrc: readonly ["'self'"];
            readonly manifestSrc: readonly ["'self'"];
            readonly baseUri: readonly ["'self'"];
            readonly formAction: readonly ["'self'"];
            readonly frameAncestors: readonly ["'none'"];
            readonly upgradeInsecureRequests: never[] | null;
        };
        readonly reportOnly: boolean;
    };
    readonly https: {
        readonly enabled: boolean;
        readonly forceHttps: boolean;
        readonly hstsMaxAge: 31536000;
        readonly includeSubDomains: true;
        readonly preload: true;
    };
    readonly validation: {
        readonly maxStringLength: 10000;
        readonly maxPayloadSize: number;
        readonly suspiciousPatterns: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
        readonly dangerousHeaders: readonly ["x-forwarded-host", "x-original-url", "x-rewrite-url"];
    };
    readonly session: {
        readonly secure: boolean;
        readonly httpOnly: true;
        readonly sameSite: "strict";
        readonly maxAge: number;
    };
    readonly cors: {
        readonly credentials: true;
        readonly optionsSuccessStatus: 200;
        readonly maxAge: 86400;
    };
    readonly headers: {
        readonly frameOptions: "DENY";
        readonly contentTypeOptions: "nosniff";
        readonly xssProtection: "1; mode=block";
        readonly referrerPolicy: "strict-origin-when-cross-origin";
        readonly permissionsPolicy: string;
    };
    readonly audit: {
        readonly logSuspiciousActivity: true;
        readonly logFailedAttempts: true;
        readonly alertThresholds: {
            readonly failedLogins: 5;
            readonly rateLimitExceeded: 10;
            readonly suspiciousRequests: 3;
        };
        readonly retentionDays: 90;
    };
};
/**
 * Get security configuration for specific environment
 */
export declare const getSecurityConfig: () => {
    https: {
        readonly enabled: boolean;
        readonly forceHttps: boolean;
        readonly hstsMaxAge: 31536000;
        readonly includeSubDomains: true;
        readonly preload: true;
    };
    csp: {
        readonly directives: {
            readonly defaultSrc: readonly ["'self'"];
            readonly styleSrc: readonly ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];
            readonly scriptSrc: readonly ["'self'", "'unsafe-inline'"];
            readonly fontSrc: readonly ["'self'", "https://fonts.gstatic.com"];
            readonly imgSrc: readonly ["'self'", "data:", "https:", "blob:"];
            readonly connectSrc: readonly ["'self'", "https:", "wss:", "ws:"];
            readonly mediaSrc: readonly ["'self'"];
            readonly objectSrc: readonly ["'none'"];
            readonly childSrc: readonly ["'self'"];
            readonly frameSrc: readonly ["'none'"];
            readonly workerSrc: readonly ["'self'"];
            readonly manifestSrc: readonly ["'self'"];
            readonly baseUri: readonly ["'self'"];
            readonly formAction: readonly ["'self'"];
            readonly frameAncestors: readonly ["'none'"];
            readonly upgradeInsecureRequests: never[] | null;
        };
        readonly reportOnly: boolean;
    };
    rateLimiting: {
        readonly general: {
            readonly windowMs: number;
            readonly maxRequests: 100;
            readonly maxRequestsAuthenticated: 200;
        };
        readonly auth: {
            readonly windowMs: number;
            readonly maxRequests: 5;
        };
        readonly failedLogin: {
            readonly windowMs: number;
            readonly maxRequests: 3;
        };
        readonly admin: {
            readonly windowMs: number;
            readonly maxRequests: 50;
        };
        readonly sensitiveData: {
            readonly windowMs: number;
            readonly maxRequests: 20;
        };
        readonly reports: {
            readonly windowMs: number;
            readonly maxRequests: 5;
        };
    };
    validation: {
        readonly maxStringLength: 10000;
        readonly maxPayloadSize: number;
        readonly suspiciousPatterns: readonly [RegExp, RegExp, RegExp, RegExp, RegExp, RegExp];
        readonly dangerousHeaders: readonly ["x-forwarded-host", "x-original-url", "x-rewrite-url"];
    };
    session: {
        readonly secure: boolean;
        readonly httpOnly: true;
        readonly sameSite: "strict";
        readonly maxAge: number;
    };
    cors: {
        readonly credentials: true;
        readonly optionsSuccessStatus: 200;
        readonly maxAge: 86400;
    };
    headers: {
        readonly frameOptions: "DENY";
        readonly contentTypeOptions: "nosniff";
        readonly xssProtection: "1; mode=block";
        readonly referrerPolicy: "strict-origin-when-cross-origin";
        readonly permissionsPolicy: string;
    };
    audit: {
        readonly logSuspiciousActivity: true;
        readonly logFailedAttempts: true;
        readonly alertThresholds: {
            readonly failedLogins: 5;
            readonly rateLimitExceeded: 10;
            readonly suspiciousRequests: 3;
        };
        readonly retentionDays: 90;
    };
};
/**
 * Validate security configuration
 */
export declare const validateSecurityConfig: () => boolean;
export default securityConfig;
