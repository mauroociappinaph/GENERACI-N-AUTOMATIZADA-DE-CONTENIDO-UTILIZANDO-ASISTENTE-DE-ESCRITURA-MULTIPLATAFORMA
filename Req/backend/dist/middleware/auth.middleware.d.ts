import { Request, Response, NextFunction } from 'express';
/**
 * Middleware de autenticación que verifica el JWT token
 * Updated: 2025-07-21 - Testing security review hook
 */
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
