/**
 * Tipos para respuestas de API y eventos
 */
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    requestId?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface WebhookEvent {
    id: string;
    type: string;
    data: any;
    source: string;
    timestamp: Date;
    signature?: string;
}
export interface NotificationEvent {
    id: string;
    type: 'content_generated' | 'post_published' | 'error_occurred' | 'quota_exceeded';
    title: string;
    message: string;
    data: any;
    userId: string;
    channels: ('email' | 'push' | 'webhook' | 'telegram')[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: Date;
    sentAt?: Date;
    status: 'pending' | 'sent' | 'failed';
}
