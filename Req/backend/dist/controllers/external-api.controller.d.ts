import { Request, Response } from 'express';
export declare class ExternalApiController {
    /**
     * Register a new external API client
     */
    registerClient(req: Request, res: Response): Promise<void>;
    /**
     * Get list of registered clients
     */
    getClients(req: Request, res: Response): Promise<void>;
    /**
     * Remove an API client
     */
    removeClient(req: Request, res: Response): Promise<void>;
    /**
     * Make a request using a registered client
     */
    makeRequest(req: Request, res: Response): Promise<void>;
    /**
     * Get metrics for a specific client
     */
    getClientMetrics(req: Request, res: Response): Promise<void>;
    /**
     * Reset metrics for a specific client
     */
    resetClientMetrics(req: Request, res: Response): Promise<void>;
    /**
     * Health check for all clients
     */
    healthCheck(req: Request, res: Response): Promise<void>;
    /**
     * Clear cache for external API responses
     */
    clearCache(req: Request, res: Response): Promise<void>;
}
export declare const externalApiController: ExternalApiController;
