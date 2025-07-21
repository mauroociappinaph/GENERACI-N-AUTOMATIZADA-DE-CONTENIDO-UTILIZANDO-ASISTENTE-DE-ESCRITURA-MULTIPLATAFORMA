"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDataRecordService = void 0;
const logger_1 = require("@/utils/logger");
const data_validation_service_1 = require("../data-validation.service");
/**
 * Servicio base para operaciones de registros de datos
 * Contiene funcionalidades comunes y utilidades
 */
class BaseDataRecordService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Registra un error con contexto
     */
    logError(error, context, metadata) {
        (0, logger_1.logError)(error, context, metadata);
    }
    /**
     * Registra un evento de negocio
     */
    logBusinessEvent(event, data, userId) {
        (0, logger_1.logBusinessEvent)(event, data, userId);
    }
    /**
     * Registra métricas de rendimiento
     */
    logPerformance(operation, duration, metadata) {
        (0, logger_1.logPerformance)(operation, duration, metadata);
    }
    /**
     * Valida datos según su tipo
     */
    async validateData(type, data) {
        return data_validation_service_1.DataValidationService.validateDataByType(type, data);
    }
    /**
     * Valida metadatos
     */
    validateMetadata(metadata) {
        return data_validation_service_1.DataValidationService.validateMetadata(metadata);
    }
}
exports.BaseDataRecordService = BaseDataRecordService;
