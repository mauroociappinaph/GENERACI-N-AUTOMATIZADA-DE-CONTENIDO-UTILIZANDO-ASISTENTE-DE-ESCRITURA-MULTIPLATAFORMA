"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_record_controller_1 = require("@/controllers/data-record.controller");
const auth_middleware_1 = require("@/middleware/auth.middleware");
const authorization_middleware_1 = require("@/middleware/authorization.middleware");
const validation_1 = require("@/middleware/validation");
const data_record_1 = require("@/types/data-record");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken); // Todas las rutas requieren autenticación
// Rutas para DataRecord
router.post('/', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER), (0, validation_1.validateRequest)({ body: data_record_1.createDataRecordSchema }), data_record_controller_1.DataRecordController.createDataRecord);
router.get('/', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER, client_1.UserRole.VIEWER), data_record_controller_1.DataRecordController.getDataRecords);
router.get('/search', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER, client_1.UserRole.VIEWER), data_record_controller_1.DataRecordController.searchDataRecords);
// Nuevas rutas para búsqueda avanzada y filtros dinámicos
router.post('/search/advanced', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER, client_1.UserRole.VIEWER), (0, validation_1.validateRequest)({ body: data_record_1.advancedSearchSchema }), data_record_controller_1.DataRecordController.advancedSearch);
router.post('/search/filters', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER, client_1.UserRole.VIEWER), data_record_controller_1.DataRecordController.applyDynamicFilters);
router.get('/types', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER, client_1.UserRole.VIEWER), data_record_controller_1.DataRecordController.getDataTypes);
router.get('/stats', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), data_record_controller_1.DataRecordController.getDataRecordStats);
// Rutas para versionado y control de concurrencia
router.get('/:id/versions', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER), data_record_controller_1.DataRecordController.getRecordVersionHistory);
router.post('/:id/versions/restore', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), data_record_controller_1.DataRecordController.restoreRecordVersion);
router.get('/:id/conflicts', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER), data_record_controller_1.DataRecordController.detectEditConflicts);
router.post('/recover/:id', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), data_record_controller_1.DataRecordController.recoverDeletedRecord);
// Rutas básicas CRUD
router.get('/:id', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER, client_1.UserRole.VIEWER), data_record_controller_1.DataRecordController.getDataRecordById);
router.put('/:id', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.USER), (0, validation_1.validateRequest)({ body: data_record_1.updateDataRecordSchema }), data_record_controller_1.DataRecordController.updateDataRecord);
router.delete('/:id', (0, authorization_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), data_record_controller_1.DataRecordController.deleteDataRecord);
exports.default = router;
