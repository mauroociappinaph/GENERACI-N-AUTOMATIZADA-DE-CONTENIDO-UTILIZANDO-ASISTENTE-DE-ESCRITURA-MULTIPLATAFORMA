import { PrismaClient, DataRecord } from '@prisma/client';
import {
  CreateDataRecordInput,
  UpdateDataRecordInput,
} from '@/types/data-record';

export class DataRecordService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Crea un nuevo registro de datos
   */
  async createDataRecord(
    data: CreateDataRecordInput,
    userId: string
  ): Promise<DataRecord> {
    return this.prisma.dataRecord.create({
      data: {
        ...data,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  /**
   * Obtiene registros de datos con paginación y filtros
   */
  async getDataRecords(
    page: number = 1,
    limit: number = 10,
    type?: string,
    createdBy?: string
  ): Promise<{
    dataRecords: DataRecord[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type }),
      ...(createdBy && { createdBy }),
    };

    const [dataRecords, total] = await Promise.all([
      this.prisma.dataRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataRecord.count({ where }),
    ]);

    return {
      dataRecords,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un registro de datos por ID
   */
  async getDataRecordById(id: string): Promise<DataRecord | null> {
    return this.prisma.dataRecord.findUnique({
      where: { id },
    });
  }

  /**
   * Actualiza un registro de datos
   */
  async updateDataRecord(
    id: string,
    inputData: UpdateDataRecordInput,
    userId: string
  ): Promise<DataRecord> {
    const existingRecord = await this.prisma.dataRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new Error('Registro de datos no encontrado');
    }

    const dataToUpdate: any = {
      ...inputData,
      updatedBy: userId,
    };

    if (inputData.data !== undefined) {
      dataToUpdate.data = inputData.data === null ? null : inputData.data;
    }
    if (inputData.metadata !== undefined) {
      dataToUpdate.metadata = inputData.metadata === null ? null : inputData.metadata;
    }

    return this.prisma.dataRecord.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  /**
   * Elimina un registro de datos
   */
  async deleteDataRecord(id: string): Promise<void> {
    const existingRecord = await this.prisma.dataRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new Error('Registro de datos no encontrado');
    }

    await this.prisma.dataRecord.delete({
      where: { id },
    });
  }
}
