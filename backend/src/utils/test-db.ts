import { prisma } from '../config';

async function testDatabaseConnection(): Promise<void> {
  try {
    console.log('Testing database connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test query execution
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query execution successful:', result);

    // Test user count (should be 0 initially)
    const userCount = await prisma.user.count();
    console.log('✅ User count query successful. Current users:', userCount);

    console.log('🎉 All database tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection();
}

export default testDatabaseConnection;
