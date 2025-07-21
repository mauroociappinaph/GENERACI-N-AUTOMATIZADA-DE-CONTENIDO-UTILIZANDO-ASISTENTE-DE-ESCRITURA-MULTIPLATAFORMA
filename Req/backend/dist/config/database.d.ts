import { PrismaClient } from '@prisma/client';
export declare class Database {
    private static instance;
    private constructor();
    static getInstance(): Database;
    getPrisma(): PrismaClient;
    testConnection(): Promise<boolean>;
    close(): Promise<void>;
}
export declare const database: Database;
export default database;
