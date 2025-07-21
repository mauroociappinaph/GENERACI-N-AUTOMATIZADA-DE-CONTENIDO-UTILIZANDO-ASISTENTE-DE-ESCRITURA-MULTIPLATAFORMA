import { Request, Response, NextFunction } from 'express';
/**
 * IP blocking middleware
 */
export declare const ipBlockingMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Suspicious activity detection middleware
 */
export declare const suspiciousActivityDetection: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Geolocation-based security (basic implementation)
 */
export declare const geolocationSecurity: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Request fingerprinting for additional security
 */
export declare const requestFingerprinting: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Clean up old entries periodically (call this from a scheduled job)
 */
export declare const cleanupSecurityData: () => void;
/**
 * Get security statistics
 */
export declare const getSecurityStats: () => {
    suspiciousIPs: number;
    blockedIPs: number;
    timestamp: string;
};
/**
 * Manually block/unblock IP addresses
 */
export declare const blockIP: (ip: string) => void;
export declare const unblockIP: (ip: string) => void;
