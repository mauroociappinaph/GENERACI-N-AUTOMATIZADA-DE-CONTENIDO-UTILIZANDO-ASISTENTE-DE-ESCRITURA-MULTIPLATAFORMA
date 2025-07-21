"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRecordCrudService = void 0;
const base_service_1 = require("./base.service");
/**
 * Servicio para operaciones CRUD de registros de datos
 */
class DataRecordCrudService extends base_service_1.BaseDataRecordService {
    /**
     * Crea un nuevo registro de datos
     */
    async createDataRecord(dataRecordData, userId) {
        const startTime = Date.now();
        try {
            // Validar datos según el tipo
            const validationResult = await this.validateData(dataRecordData.type, dataRecordData.data);
            if (!validationResult.isValid) {
                const errorMessage = `Validación fallida: ${validationResult.errors?.join(', ')}`;
                this.logBusinessEvent('DATA_RECORD_VALIDATION_FAILED', {
                    type: dataRecordData.type,
                    errors: validationResult.errors
                }, userId);
                throw new Error(errorMessage);
            }
            // Validar metadatos si existen
            if (dataRecordData.metadata) {
                const metadataValidation = this.validateMetadata(dataRecordData.metadata);
                if (!metadataValidation.isValid) {
                    const errorMessage = `Validación de metadatos fallida: ${metadataValidation.errors?.join(', ')}`;
                    throw new Error(errorMessage);
                }
            }
            // Crear registro en la base de datos
            const dataRecord = await this.prisma.dataRecord.create({
                data: {
                    type: dataRecordData.type,
                    data: dataRecordData.data,
                    metadata: dataRecordData.metadata,
                    createdBy: userId,
                    updatedBy: userId,
                    version: 1, // Versión inicial
                },
            });
            // Registrar evento de negocio
            this.logBusinessEvent('DATA_RECORD_CREATED', {
                recordId: dataRecord.id,
                type: dataRecord.type
            }, userId);
            // Registrar rendimiento
            this.logPerformance('dataRecord.create', Date.now() - startTime, {
                type: dataRecord.type,
                userId
            });
            return dataRecord;
        }
        catch (error) {
            this.logError(error, 'DataRecordCrudService.createDataRecord', {
                userId,
                type: dataRecordData.type
            });
            throw error;
        }
    }
    /**
     * Obtiene un registro de datos por ID
     */
    async getDataRecordById(id) {
        const startTime = Date.now();
        try {
            const record = await this.prisma.dataRecord.findFirst({
                where: {
                    id,
                    deletedAt: null // Solo registros no eliminados
                }
            });
            // Registrar rendimiento
            this.logPerformance('dataRecord.getById', Date.now() - startTime, { id });
            return record;
        }
        catch (error) {
            this.logError(error, 'DataRecordCrudService.getDataRecordById', { id });
            throw error;
        }
    }
    /**
     * Actualiza un registro de datos
     */
    async updateDataRecord(id, updateData, userId, expectedVersion) {
        const startTime = Date.now();
        try {
            // Verificar que el registro existe
            const existingRecord = await this.prisma.dataRecord.findFirst({
                where: {
                    id,
                    deletedAt: null
                }
            });
            if (!existingRecord) {
                throw new Error('Registro de datos no encontrado');
            }
            // Verificar conflictos de concurrencia si se proporciona una versión esperada
            if (expectedVersion !== undefined && existingRecord.version !== expectedVersion) {
                this.logBusinessEvent('DATA_RECORD_CONCURRENCY_CONFLICT', {
                    recordId: id,
                    expectedVersion,
                    actualVersion: existingRecord.version
                }, userId);
                throw new Error(`Conflicto de concurrencia: El registro ha sido modificado. Versión actual: ${existingRecord.version}, versión esperada: ${expectedVersion}`);
            }
            // Preparar datos para actualización
            const updatePayload = {
                updatedBy: userId,
                version: {
                    increment: 1
                }
            };
            // Actualizar tipo si se proporciona
            if (updateData.type) {
                updatePayload.type = updateData.type;
            }
            // Actualizar datos si se proporcionan
            if (updateData.data) {
                // Validar datos según el tipo (usar el tipo existente o el nuevo)
                const type = updateData.type || existingRecord.type;
                const validationResult = await this.validateData(type, updateData.data);
                if (!validationResult.isValid) {
                    const errorMessage = `Validación fallida: ${validationResult.errors?.join(', ')}`;
                    this.logBusinessEvent('DATA_RECORD_UPDATE_VALIDATION_FAILED', {
                        recordId: id,
                        errors: validationResult.errors
                    }, userId);
                    throw new Error(errorMessage);
                }
                updatePayload.data = updateData.data;
            }
            // Actualizar metadatos si se proporcionan
            if (updateData.metadata) {
                const metadataValidation = this.validateMetadata(updateData.metadata);
                if (!metadataValidation.isValid) {
                    const errorMessage = `Validación de metadatos fallida: ${metadataValidation.errors?.join(', ')}`;
                    throw new Error(errorMessage);
                }
                updatePayload.metadata = updateData.metadata;
            }
            // Crear una entrada en el historial de versiones antes de actualizar
            await this.prisma.dataRecordVersion.create({
                data: {
                    recordId: id,
                    version: existingRecord.version,
                    data: existingRecord.data,
                    metadata: existingRecord.metadata,
                    type: existingRecord.type,
                    createdBy: userId,
                    updatedBy: userId,
                    archivedBy: userId,
                    createdAt: existingRecord.createdAt,
                    updatedAt: existingRecord.updatedAt
                }
            });
            // Actualizar el registro
            const updatedRecord = await this.prisma.dataRecord.update({
                where: { id },
                data: updatePayload
            });
            // Registrar evento de negocio
            this.logBusinessEvent('DATA_RECORD_UPDATED', {
                recordId: id,
                type: updatedRecord.type,
                version: updatedRecord.version
            }, userId);
            // Registrar rendimiento
            this.logPerformance('dataRecord.update', Date.now() - startTime, {
                id,
                userId
            });
            return updatedRecord;
        }
        catch (error) {
            this.logError(error, 'DataRecordCrudService.updateDataRecord', {
                id,
                userId,
                updateData
            });
            throw error;
        }
    }
    /**
     * Elimina un registro de datos (soft delete)
     */
    async deleteDataRecord(id, userId) {
        const startTime = Date.now();
        try {
            // Verificar que el registro existe
            const existingRecord = await this.prisma.dataRecord.findFirst({
                where: {
                    id,
                    deletedAt: null
                }
            });
            if (!existingRecord) {
                throw new Error('Registro de datos no encontrado');
            }
            // Crear una copia de respaldo antes de eliminar
            await this.prisma.dataRecordVersion.create({
                data: {
                    recordId: id,
                    version: existingRecord.version,
                    data: existingRecord.data,
                    metadata: existingRecord.metadata,
                    type: existingRecord.type,
                    createdBy: userId,
                    updatedBy: userId,
                    archivedBy: userId,
                    createdAt: existingRecord.createdAt,
                    updatedAt: existingRecord.updatedAt
                }
            });
            // Realizar soft delete
            await this.prisma.dataRecord.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    deletedBy: userId
                }
            });
            // Registrar evento de negocio
            this.logBusinessEvent('DATA_RECORD_DELETED', {
                recordId: id,
                type: existingRecord.type
            }, userId);
            // Registrar rendimiento
            this.logPerformance('dataRecord.delete', Date.now() - startTime, {
                id,
                userId
            });
        }
        catch (error) {
            this.logError(error, 'DataRecordCrudService.deleteDataRecord', {
                id,
                userId
            });
            throw error;
        }
    }
    /**
     * Recupera un registro eliminado
     */
    async recoverDeletedRecord(id, userId) {
        const startTime = Date.now();
        try {
            // Verificar que el registro existe y está eliminado
            const deletedRecord = await this.prisma.dataRecord.findFirst({
                where: {
                    id
                }
            });
            if (!deletedRecord) {
                throw new Error('Registro no encontrado');
            }
            if (deletedRecord.deletedAt === null) {
                throw new Error('El registro no está eliminado');
            }
            // Verificar si ya existe un registro activo con el mismo ID
            const activeRecord = await this.prisma.dataRecord.findFirst({
                where: {
                    id,
                    deletedAt: null
                }
            });
            if (activeRecord) {
                throw new Error('Ya existe un registro activo con este ID');
            }
            // Recuperar el registro eliminado
            const recoveredRecord = await this.prisma.dataRecord.update({
                where: { id },
                data: {
                    deletedAt: null,
                    deletedBy: null,
                    updatedBy: userId,
                    version: {
                        increment: 1
                    }
                }
            });
            // Registrar evento de negocio
            this.logBusinessEvent('DATA_RECORD_RECOVERED', {
                recordId: id,
                type: recoveredRecord.type
            }, userId);
            // Registrar rendimiento
            this.logPerformance('dataRecord.recover', Date.now() - startTime, {
                id,
                userId
            });
            return recoveredRecord;
        }
        catch (error) {
            this.logError(error, 'DataRecordCrudService.recoverDeletedRecord', {
                id,
                userId
            });
            throw error;
        }
    }
}
exports.DataRecordCrudService = DataRecordCrudService;
