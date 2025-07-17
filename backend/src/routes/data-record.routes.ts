import { Router } from 'express';
import { DataRecordController } from '@/controllers/data-record.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/authorization.middleware';
import { validateRequest } from '@/middleware/validation';
import { createDataRecordSchema, updateDataRecordSchema } from '@/types/data-record';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateToken); // Todas las rutas requieren autenticación

// Rutas para DataRecord
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER),
  validateRequest({ body: createDataRecordSchema }),
  DataRecordController.createDataRecord
);

router.get(
  '/',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER),
  DataRecordController.getDataRecords
);

router.get(
  '/search',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER),
  DataRecordController.searchDataRecords
);

router.get(
  '/types',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER),
  DataRecordController.getDataTypes
);

router.get(
  '/stats',
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  DataRecordController.getDataRecordStats
);

router.get(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER),
  DataRecordController.getDataRecordById
);

router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER),
  validateRequest({ body: updateDataRecordSchema }),
  DataRecordController.updateDataRecord
);

router.delete(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  DataRecordController.deleteDataRecord
);

export default router;
