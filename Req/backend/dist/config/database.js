"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.Database = void 0;
const prisma_1 = require("./prisma");
// Database connection utility class
class Database {
    constructor() {
        // No setup needed for Prisma
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    getPrisma() {
        return prisma_1.prisma;
    }
    async testConnection() {
        try {
            // Test connection with a simple query
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            console.log('Database connection test successful');
            return true;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
    async close() {
        await prisma_1.prisma.$disconnect();
        console.log('Database connection closed');
    }
}
exports.Database = Database;
// Export singleton instance
exports.database = Database.getInstance();
exports.default = exports.database;
