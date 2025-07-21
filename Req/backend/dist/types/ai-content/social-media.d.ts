/**
 * Tipos para redes sociales y publicación de contenido
 */
import { Platform, PostStatus } from './base';
export interface SocialMediaAccount {
    id: string;
    userId: string;
    platform: Platform;
    accountId: string;
    accountName: string;
    displayName?: string;
    profileImage?: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    permissions: string[];
    isActive: boolean;
    lastSyncAt?: Date;
    connectedAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}
export interface ScheduledPost {
    id: string;
    contentId: string;
    accountIds: string[];
    scheduledFor: Date;
    status: PostStatus;
    platformSpecificContent: Record<Platform, PlatformContent>;
    mediaAttachments?: MediaAttachment[];
    publishingResults?: PublishingResult[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}
export interface PlatformContent {
    content: string;
    hashtags?: string[];
    mentions?: string[];
    mediaUrls?: string[];
    customFields?: Record<string, any>;
}
export interface MediaAttachment {
    id: string;
    type: 'image' | 'video' | 'gif' | 'document';
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    altText?: string;
    caption?: string;
    metadata?: Record<string, any>;
}
export interface PublishingResult {
    id: string;
    scheduledPostId: string;
    accountId: string;
    platform: Platform;
    status: 'success' | 'failed' | 'pending' | 'cancelled';
    platformPostId?: string;
    platformUrl?: string;
    error?: string;
    publishedAt?: Date;
    metrics?: PostMetrics;
    createdAt: Date;
}
export interface PostMetrics {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
    impressions: number;
    reach: number;
    engagementRate: number;
    lastUpdated: Date;
}
