import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * Login endpoint
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * Refresh token endpoint
     */
    static refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * Logout endpoint (client-side token invalidation)
     */
    static logout(req: Request, res: Response): Promise<void>;
    /**
     * Get current user info
     */
    static me(req: Request, res: Response): Promise<void>;
}
