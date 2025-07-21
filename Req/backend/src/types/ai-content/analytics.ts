/**
 * Tipos para análisis y métricas de contenido
 */

import { Platform, ContentCategory, ContentTone } from './base';

export interface ContentPerformance {
  id: string;
  contentId: string;
  platform: Platform;
  platformPostId?: string;
  metrics: PlatformMetrics;
  engagement: EngagementMetrics;
  reach: ReachMetrics;
  conversions?: ConversionMetrics;
  demographics?: DemographicMetrics;
  analyzedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

export interface PlatformMetrics {
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  impressions: number;
  reach: number;
  saves?: number;
  videoViews?: number;
  videoCompletionRate?: number;
}

export interface EngagementMetrics {
  rate: number; // 0 to 1
  quality: number; // 0 to 1
  responseTime: number; // minutes
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface ReachMetrics {
  organic: number;
  paid: number;
  viral: number;
  uniqueUsers: number;
  frequency: number;
}

export interface ConversionMetrics {
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  costPerConversion?: number;
}

export interface DemographicMetrics {
  ageGroups: Record<string, number>;
  genders: Record<string, number>;
  locations: Record<string, number>;
  interests: Record<string, number>;
}

export interface ContentRecommendation {
  id: string;
  type: 'template' | 'tone' | 'timing' | 'platform' | 'keywords' | 'length' | 'format';
  title: string;
  description: string;
  recommendation: string;
  confidence: number; // 0 to 1
  expectedImprovement: number; // percentage
  basedOn: string[];
  applicableTo: {
    platforms?: Platform[];
    categories?: ContentCategory[];
    tones?: ContentTone[];
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  validUntil?: Date;
}
