/**
 * Tipos para plantillas y generación de contenido
 */

import { ContentCategory, Platform, ContentTone, AIProvider, ContentStatus } from './base';

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  category: ContentCategory;
  platforms: Platform[];
  promptTemplate: string;
  parameters: TemplateParameter[];
  tone: ContentTone;
  language: string;
  maxLength?: number;
  minLength?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags?: string[];
}

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'text';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: ParameterOption[];
  validation?: ParameterValidation;
}

export interface ParameterOption {
  value: string | number;
  label: string;
  description?: string;
}

export interface ParameterValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
}

export interface ContentGenerationRequest {
  templateId: string;
  parameters: Record<string, any>;
  targetPlatforms: Platform[];
  tone?: ContentTone;
  language?: string;
  maxLength?: number;
  minLength?: number;
  keywords?: string[];
  aiProvider?: AIProvider;
  customPrompt?: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface GeneratedContent {
  id: string;
  templateId: string;
  content: string;
  platform: Platform;
  language: string;
  tone: ContentTone;
  qualityScore: number;
  sentimentScore: SentimentScore;
  seoScore: SEOMetrics;
  readabilityScore: number;
  suggestions: ContentSuggestion[];
  parameters: Record<string, any>;
  aiProvider: AIProvider;
  tokensUsed: number;
  generationTime: number;
  cost: number;
  createdBy: string;
  createdAt: Date;
  status: ContentStatus;
  metadata?: Record<string, any>;
}

export interface ContentSuggestion {
  type: 'grammar' | 'style' | 'seo' | 'engagement' | 'length' | 'tone' | 'platform';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
  autoFixAvailable?: boolean;
}

export interface SentimentScore {
  overall: number; // -1 to 1
  positive: number; // 0 to 1
  negative: number; // 0 to 1
  neutral: number; // 0 to 1
  confidence: number; // 0 to 1
  emotions?: EmotionScore[];
}

export interface EmotionScore {
  emotion: 'joy' | 'anger' | 'fear' | 'sadness' | 'surprise' | 'disgust' | 'trust' | 'anticipation';
  score: number; // 0 to 1
  confidence: number; // 0 to 1
}

export interface SEOMetrics {
  score: number; // 0 to 100
  keywordDensity: number;
  readabilityScore: number;
  titleOptimization: number;
  metaDescription?: string;
  suggestedKeywords: string[];
  issues: SEOIssue[];
  recommendations: string[];
}

export interface SEOIssue {
  type: 'keyword_density' | 'title_length' | 'meta_description' | 'readability' | 'structure';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
}
