import { prisma } from './prisma';

// Database connection utility class
export class Database {
  private static instance: Database;

  private constructor() {
    // No setup needed for Prisma
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPrisma() {
    return prisma;
  }

  public async testConnection(): Promise<boolean> {
    try {
      // Test connection with a simple query
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

// Export singleton instance
export const database = Database.getInstance();
export default database;
