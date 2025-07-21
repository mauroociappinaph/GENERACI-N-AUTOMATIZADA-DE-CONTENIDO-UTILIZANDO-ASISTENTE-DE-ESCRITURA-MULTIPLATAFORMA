import { Request, Response, NextFunction } from 'express';
/**
 * Debug middleware to log CORS-related information
 * Helps troubleshoot CORS issues during development
 */
export declare const corsDebugMiddleware: (req: Request, res: Response, next: NextFunction) => void;
