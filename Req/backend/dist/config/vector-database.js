"use strict";
/**
 * Vector Database Configuration
 * Supports Pinecone and Weaviate for content similarity search
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_ENV_VARS = exports.localVectorConfig = exports.weaviateConfig = exports.pineconeConfig = exports.vectorDatabaseConfig = void 0;
exports.validateVectorConfig = validateVectorConfig;
exports.getVectorDatabaseConfig = getVectorDatabaseConfig;
// Default configuration
exports.vectorDatabaseConfig = {
    provider: process.env.VECTOR_DB_PROVIDER || 'local',
    apiKey: process.env.VECTOR_DB_API_KEY,
    environment: process.env.VECTOR_DB_ENVIRONMENT || 'us-east1-gcp',
    indexName: process.env.VECTOR_DB_INDEX_NAME || 'ai-content-similarity',
    dimension: parseInt(process.env.VECTOR_DB_DIMENSION || '1536'), // OpenAI embedding dimension
    metric: process.env.VECTOR_DB_METRIC || 'cosine',
    namespace: process.env.VECTOR_DB_NAMESPACE || 'content',
};
// Pinecone specific configuration
exports.pineconeConfig = {
    provider: 'pinecone',
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp',
    indexName: process.env.PINECONE_INDEX_NAME || 'ai-content-similarity',
    dimension: 1536, // OpenAI text-embedding-ada-002 dimension
    metric: 'cosine',
    namespace: process.env.PINECONE_NAMESPACE || 'content',
};
// Weaviate specific configuration
exports.weaviateConfig = {
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
exports.localVectorConfig = {
    provider: 'local',
    storagePath: process.env.LOCAL_VECTOR_STORAGE_PATH || './data/vectors',
    indexName: 'ai-content-local',
    dimension: 1536,
    metric: 'cosine',
};
// Validation functions
function validateVectorConfig(config) {
    if (!config.indexName || !config.dimension) {
        return false;
    }
    switch (config.provider) {
        case 'pinecone':
            return !!config.apiKey && !!config.environment;
        case 'weaviate':
            return !!config.url;
        case 'local':
            return !!config.storagePath;
        default:
            return false;
    }
}
// Get active configuration based on environment
function getVectorDatabaseConfig() {
    const provider = process.env.VECTOR_DB_PROVIDER || 'local';
    switch (provider) {
        case 'pinecone':
            return exports.pineconeConfig;
        case 'weaviate':
            return exports.weaviateConfig;
        case 'local':
        default:
            return exports.localVectorConfig;
    }
}
// Environment variables documentation
exports.REQUIRED_ENV_VARS = {
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
};
