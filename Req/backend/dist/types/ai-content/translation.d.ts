/**
 * Tipos para traducción y localización
 */
import { Platform, ContentTone, TranslationStatus } from './base';
export interface TranslationRequest {
    id: string;
    sourceContent: string;
    sourceLanguage: string;
    targetLanguages: string[];
    platform?: Platform;
    tone?: ContentTone;
    culturalAdaptation: boolean;
    preserveFormatting: boolean;
    customInstructions?: string;
    requestedBy: string;
    createdAt: Date;
    status: TranslationStatus;
}
export interface TranslatedContent {
    id: string;
    requestId: string;
    language: string;
    content: string;
    confidence: number;
    culturalAdaptations: CulturalAdaptation[];
    qualityScore: number;
    provider: string;
    tokensUsed: number;
    cost: number;
    createdAt: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    status: TranslationStatus;
}
export interface CulturalAdaptation {
    type: 'currency' | 'date_format' | 'cultural_reference' | 'tone_adjustment' | 'idiom' | 'measurement';
    original: string;
    adapted: string;
    reason: string;
    confidence: number;
    position: {
        start: number;
        end: number;
    };
}
