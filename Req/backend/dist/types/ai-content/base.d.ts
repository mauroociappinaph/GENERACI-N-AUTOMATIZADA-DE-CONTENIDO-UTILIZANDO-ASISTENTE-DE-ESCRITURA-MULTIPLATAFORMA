/**
 * Tipos básicos para el sistema de generación de contenido con IA
 */
export type ContentCategory = 'social_media' | 'blog' | 'email' | 'product_description' | 'biography' | 'marketing' | 'technical' | 'creative';
export type Platform = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'blog' | 'email' | 'youtube' | 'tiktok';
export type ContentTone = 'professional' | 'casual' | 'friendly' | 'formal' | 'creative' | 'persuasive' | 'informative' | 'humorous';
export type AIProvider = 'openai' | 'huggingface' | 'google_gemini' | 'groq' | 'cohere' | 'together_ai' | 'replicate';
export type ContentStatus = 'generating' | 'generated' | 'analyzing' | 'analyzed' | 'approved' | 'rejected' | 'published' | 'scheduled' | 'failed';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
export type TranslationStatus = 'pending' | 'translating' | 'completed' | 'review_needed' | 'approved' | 'rejected' | 'failed';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'retrying';
