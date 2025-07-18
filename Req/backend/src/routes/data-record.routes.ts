import { Router } from 'express';
import { DataRecordController } from '@/controllers/data-record.controller';
import { authenticateToken } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/authorization.middleware';
import { validateRequest } from '@/middleware/validation';
import {
  createDataRecordSchema,
  updateDataRecordSchema,
  advancedSearchSchema
} from '@/types/data-record';
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

// Nuevas rutas para búsqueda avanzada y filtros dinámicos
router.post(
  '/search/advanced',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER),
  validateRequest({ body: advancedSearchSchema }),
  DataRecordController.advancedSearch
);

router.post(
  '/search/filters',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER),
  DataRecordController.applyDynamicFilters
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

// Rutas para versionado y control de concurrencia
router.get(
  '/:id/versions',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER),
  DataRecordController.getRecordVersionHistory
);

router.post(
  '/:id/versions/restore',
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  DataRecordController.restoreRecordVersion
);

router.get(
  '/:id/conflicts',
  requireRole(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER),
  DataRecordController.detectEditConflicts
);

router.post(
  '/recover/:id',
  requireRole(UserRole.ADMIN, UserRole.MANAGER),
  DataRecordController.recoverDeletedRecord
);

// Rutas básicas CRUD
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
