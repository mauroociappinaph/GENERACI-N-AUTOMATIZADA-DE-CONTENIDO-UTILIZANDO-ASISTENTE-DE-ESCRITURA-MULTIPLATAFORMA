import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../notification.service';
import { UserService } from '../user.service';
import { ReportService } from '../report.service';
import {
  INotificationService,
  IUserService,
  IReportService
} from '../interfaces';

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
export class ServiceFactoryImpl implements ServiceFactory {
  private static instance: ServiceFactoryImpl;

  public readonly notificationService: INotificationService;
  public readonly userService: IUserService;
  public readonly reportService: IReportService;

  private constructor(prisma: PrismaClient) {
    this.notificationService = new NotificationService();
    this.userService = new UserService(prisma);
    this.reportService = new ReportService(prisma);
  }

  static getInstance(prisma?: PrismaClient): ServiceFactory {
    if (!ServiceFactoryImpl.instance) {
      if (!prisma) {
        throw new Error('Prisma client is required for first initialization');
      }
      ServiceFactoryImpl.instance = new ServiceFactoryImpl(prisma);
    }
    return ServiceFactoryImpl.instance;
  }

  /**
   * Reset instance for testing purposes
   */
  static resetInstance(): void {
    ServiceFactoryImpl.instance = null as any;
  }
}
