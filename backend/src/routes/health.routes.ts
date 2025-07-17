import { Router, Request, Response } from 'express';
import { database } from '../config/database';

const router = Router();

/**
 * Health check básico del servidor
 * GET /health
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Sistema de Gestión #040 API is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Health check de la base de datos
 * GET /health/db
 */
router.get('/db', async (_req: Request, res: Response) => {
  try {
    const isConnected = await database.testConnection();
    res.json({
      status: isConnected ? 'OK' : 'ERROR',
      message: isConnected
        ? 'Database connection successful'
        : 'Database connection failed',
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

export default router;
