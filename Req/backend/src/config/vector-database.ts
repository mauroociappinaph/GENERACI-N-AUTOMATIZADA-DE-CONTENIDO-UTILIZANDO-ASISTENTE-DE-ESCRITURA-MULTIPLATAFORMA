/**
 * Vector Database Configuration
 * Supports Pinecone and Weaviate for content similarity search
 */

export interface VectorDatabaseConfig {
  provider: 'pinecone' | 'weaviate' | 'local';
  apiKey?: string;
  environment?: string;
  indexName: string;
  dimension: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  namespace?: string;
}

export interface PineconeConfig extends VectorDatabaseConfig {
  provider: 'pinecone';
  apiKey: string;
  environment: string;
  indexName: string;
  dimension: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  namespace?: string;
}

export interface WeaviateConfig extends VectorDatabaseConfig {
  provider: 'weaviate';
  url: string;
  apiKey?: string;
  className: string;
  dimension: number;
  vectorizer?: string;
  indexName: string;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
}

export interface LocalVectorConfig extends VectorDatabaseConfig {
  provider: 'local';
  storagePath: string;
  dimension: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
}

// Default configuration
export const vectorDatabaseConfig: VectorDatabaseConfig = {
  provider: (process.env.VECTOR_DB_PROVIDER as 'pinecone' | 'weaviate' | 'local') || 'local',
  apiKey: process.env.VECTOR_DB_API_KEY,
  environment: process.env.VECTOR_DB_ENVIRONMENT || 'us-east1-gcp',
  indexName: process.env.VECTOR_DB_INDEX_NAME || 'ai-content-similarity',
  dimension: parseInt(process.env.VECTOR_DB_DIMENSION || '1536'), // OpenAI embedding dimension
  metric: (process.env.VECTOR_DB_METRIC as 'cosine' | 'euclidean' | 'dotproduct') || 'cosine',
  namespace: process.env.VECTOR_DB_NAMESPACE || 'content',
};

// Pinecone specific configuration
export const pineconeConfig: PineconeConfig = {
  provider: 'pinecone',
  apiKey: process.env.PINECONE_API_KEY || '',
  environment: process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp',
  indexName: process.env.PINECONE_INDEX_NAME || 'ai-content-similarity',
  dimension: 1536, // OpenAI text-embedding-ada-002 dimension
  metric: 'cosine',
  namespace: process.env.PINECONE_NAMESPACE || 'content',
};

// Weaviate specific configuration
export const weaviateConfig: WeaviateConfig = {
  provider: 'weaviate',
  url: process.env.WEAVIATE_URL || 'http://localhost:8080',
  apiKey: process.env.WEAVIATE_API_KEY,
  className: process.env.WEAVIATE_CLASS_NAME || 'AIContent',
  dimension: 1536,
  vectorizer: process.env.WEAVIATE_VECTORIZER || 'text2vec-openai',
  indexName: process.env.WEAVIATE_INDEX_NAME || 'ai-content-weaviate',
  metric: 'cosine',
};

// Local vector storage configuration (for development)
export const localVectorConfig: LocalVectorConfig = {
  provider: 'local',
  storagePath: process.env.LOCAL_VECTOR_STORAGE_PATH || './data/vectors',
  indexName: 'ai-content-local',
  dimension: 1536,
  metric: 'cosine',
};

// Validation functions
export function validateVectorConfig(config: VectorDatabaseConfig): boolean {
  if (!config.indexName || !config.dimension) {
    return false;
  }

  switch (config.provider) {
    case 'pinecone':
      return !!(config as PineconeConfig).apiKey && !!(config as PineconeConfig).environment;
    case 'weaviate':
      return !!(config as WeaviateConfig).url;
    case 'local':
      return !!(config as LocalVectorConfig).storagePath;
    default:
      return false;
  }
}

// Get active configuration based on environment
export function getVectorDatabaseConfig(): VectorDatabaseConfig {
  const provider = process.env.VECTOR_DB_PROVIDER || 'local';

  switch (provider) {
    case 'pinecone':
      return pineconeConfig;
    case 'weaviate':
      return weaviateConfig;
    case 'local':
    default:
      return localVectorConfig;
  }
}

// Environment variables documentation
export const REQUIRED_ENV_VARS = {
  PINECONE: [
    'PINECONE_API_KEY',
    'PINECONE_ENVIRONMENT',
    'PINECONE_INDEX_NAME',
  ],
  WEAVIATE: [
    'WEAVIATE_URL',
    'WEAVIATE_CLASS_NAME',
  ],
  LOCAL: [
    'LOCAL_VECTOR_STORAGE_PATH',
  ],
} as const;
