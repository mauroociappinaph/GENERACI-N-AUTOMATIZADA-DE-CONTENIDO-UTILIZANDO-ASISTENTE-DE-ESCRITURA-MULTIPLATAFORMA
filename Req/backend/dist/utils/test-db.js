"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
async function testDatabaseConnection() {
    try {
        console.log('Testing database connection...');
        // Test basic connection
        await config_1.prisma.$connect();
        console.log('✅ Database connection successful');
        // Test query execution
        const result = await config_1.prisma.$queryRaw `SELECT 1 as test`;
        console.log('✅ Query execution successful:', result);
        // Test user count (should be 0 initially)
        const userCount = await config_1.prisma.user.count();
        console.log('✅ User count query successful. Current users:', userCount);
        console.log('🎉 All database tests passed!');
    }
    catch (error) {
        console.error('❌ Database test failed:', error);
    }
    finally {
        await config_1.prisma.$disconnect();
    }
}
// Run the test if this file is executed directly
if (require.main === module) {
    testDatabaseConnection();
}
exports.default = testDatabaseConnection;
