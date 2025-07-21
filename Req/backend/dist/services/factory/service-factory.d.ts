import { PrismaClient } from '@prisma/client';
import { INotificationService, IUserService, IReportService } from '../interfaces';
/**
 * Service Factory Interface
 * Prevents "property does not exist" errors by providing complete type definitions
 */
export interface ServiceFactory {
    notificationService: INotificationService;
    userService: IUserService;
    reportService: IReportService;
}
/**
 * Service Factory Implementation
 * Singleton pattern with proper typing to prevent property existence errors
 */
export declare class ServiceFactoryImpl implements ServiceFactory {
    private static instance;
    readonly notificationService: INotificationService;
    readonly userService: IUserService;
    readonly reportService: IReportService;
    private constructor();
    static getInstance(prisma?: PrismaClient): ServiceFactory;
    /**
     * Reset instance for testing purposes
     */
    static resetInstance(): void;
}
