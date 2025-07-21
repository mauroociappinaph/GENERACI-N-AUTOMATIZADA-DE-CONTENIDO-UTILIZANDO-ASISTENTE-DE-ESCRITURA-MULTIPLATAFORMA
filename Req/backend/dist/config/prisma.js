"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Create Prisma client instance
const createPrismaClient = () => {
    return new client_1.PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
};
// Use global variable in development to prevent multiple instances
exports.prisma = globalThis.__prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = exports.prisma;
}
// Graceful shutdown
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
exports.default = exports.prisma;
