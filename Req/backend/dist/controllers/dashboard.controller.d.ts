import { Request, Response } from 'express';
export declare class DashboardController {
    /**
     * Get dashboard metrics
     */
    static getDashboardMetrics(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get user's dashboard widgets
     */
    static getUserWidgets(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Save user's dashboard widget configuration
     */
    static saveWidgetConfiguration(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Add a new widget to the dashboard
     */
    static addWidget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete a widget from the dashboard
     */
    static deleteWidget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get data for a specific widget
     */
    static getWidgetData(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
