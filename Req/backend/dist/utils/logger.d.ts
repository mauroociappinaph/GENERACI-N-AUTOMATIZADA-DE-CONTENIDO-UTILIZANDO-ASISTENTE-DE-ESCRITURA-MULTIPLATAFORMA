import winston from 'winston';
declare const logger: winston.Logger;
export declare const httpLogger: (req: any, res: any, next: any) => void;
export declare const logError: (error: Error, context?: string, metadata?: any) => void;
export declare const logBusinessEvent: (event: string, data?: any, userId?: string) => void;
export declare const logPerformance: (operation: string, duration: number, metadata?: any) => void;
export default logger;
