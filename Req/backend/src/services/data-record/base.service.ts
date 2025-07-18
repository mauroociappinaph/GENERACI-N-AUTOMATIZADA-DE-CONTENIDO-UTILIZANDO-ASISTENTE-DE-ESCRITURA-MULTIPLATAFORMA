import { PrismaClient } from '@prisma/client';
import { logError, logBusinessEvent, logPerformance } from '@/utils/logger';
import { DataValidationService } from '../data-validation.service';

/**
 * Servicio base para operaciones de registros de datos
 * Contiene funcionalidades comunes y utilidades
 */
export class BaseDataRecordService {
  constructor(protected prisma: PrismaClient) {}

  /**
   * Registra un error con contexto
   */
  protected logError(error: Error, context: string, metadata?: any): void {
    logError(error, context, metadata);
  }

  /**
   * Registra un evento de negocio
   */
  protected logBusinessEvent(event: string, data?: any, userId?: string): void {
    logBusinessEvent(event, data, userId);
  }

  /**
   * Registra métricas de rendimiento
   */
  protected logPerformance(operation: string, duration: number, metadata?: any): void {
    logPerformance(operation, duration, metadata);
  }

  /**
   * Valida datos según su tipo
   */
  protected async validateData(type: string, data: any): Promise<{
    isValid: boolean;
    errors?: string[];
    validatedData?: unknown;
  }> {
    return DataValidationService.validateDataByType(type, data);
  }

  /**
   * Valida metadatos
   */
  protected validateMetadata(metadata: any): {
    isValid: boolean;
    errors?: string[];
    validatedData?: unknown;
  } {
    return DataValidationService.validateMetadata(metadata);
  }
}
