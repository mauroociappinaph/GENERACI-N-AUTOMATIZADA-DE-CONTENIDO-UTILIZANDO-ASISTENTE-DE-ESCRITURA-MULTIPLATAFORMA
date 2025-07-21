/**
 * Tipos para el sistema de colas y trabajos
 */
import { JobStatus } from './base';
export interface ContentGenerationJob {
    id: string;
    type: 'generate' | 'analyze' | 'translate' | 'publish';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    data: any;
    userId: string;
    createdAt: Date;
    scheduledFor?: Date;
    attempts: number;
    maxAttempts: number;
    status: JobStatus;
    result?: any;
    error?: string;
    processingStartedAt?: Date;
    completedAt?: Date;
}
