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
export declare const vectorDatabaseConfig: VectorDatabaseConfig;
export declare const pineconeConfig: PineconeConfig;
export declare const weaviateConfig: WeaviateConfig;
export declare const localVectorConfig: LocalVectorConfig;
export declare function validateVectorConfig(config: VectorDatabaseConfig): boolean;
export declare function getVectorDatabaseConfig(): VectorDatabaseConfig;
export declare const REQUIRED_ENV_VARS: {
    readonly PINECONE: readonly ["PINECONE_API_KEY", "PINECONE_ENVIRONMENT", "PINECONE_INDEX_NAME"];
    readonly WEAVIATE: readonly ["WEAVIATE_URL", "WEAVIATE_CLASS_NAME"];
    readonly LOCAL: readonly ["LOCAL_VECTOR_STORAGE_PATH"];
};
