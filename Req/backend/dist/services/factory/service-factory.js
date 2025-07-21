"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceFactoryImpl = void 0;
const notification_service_1 = require("../notification.service");
const user_service_1 = require("../user.service");
const report_service_1 = require("../report.service");
/**
 * Service Factory Implementation
 * Singleton pattern with proper typing to prevent property existence errors
 */
class ServiceFactoryImpl {
    constructor(prisma) {
        this.notificationService = new notification_service_1.NotificationService();
        this.userService = new user_service_1.UserService(prisma);
        this.reportService = new report_service_1.ReportService(prisma);
    }
    static getInstance(prisma) {
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
    static resetInstance() {
        ServiceFactoryImpl.instance = null;
    }
}
exports.ServiceFactoryImpl = ServiceFactoryImpl;
