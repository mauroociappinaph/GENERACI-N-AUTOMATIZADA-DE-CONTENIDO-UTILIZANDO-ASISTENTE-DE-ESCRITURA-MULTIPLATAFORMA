import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { database } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sistema de Gestión #040 API is running',
    timestamp: new Date().toISOString(),
  });
});

// Basic API route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Sistema de Gestión #040 API',
    version: '1.0.0',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// User management routes
app.use('/api/users', userRoutes);

// Database health check route
app.get('/health/db', async (req, res) => {
  try {
    const isConnected = await database.testConnection();
    res.json({
      status: isConnected ? 'OK' : 'ERROR',
      message: isConnected ? 'Database connection successful' : 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Start server with database connection test
async function startServer() {
  try {
    // Test database connection on startup
    console.log('🔍 Testing database connection...');
    const isDbConnected = await database.testConnection();

    if (!isDbConnected) {
      console.warn('⚠️  Database connection failed, but server will start anyway');
    }

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`🗄️  Database health: http://localhost:${config.port}/health/db`);
      console.log(`🔗 API endpoint: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await database.close();
  process.exit(0);
});

startServer();

export default app;
