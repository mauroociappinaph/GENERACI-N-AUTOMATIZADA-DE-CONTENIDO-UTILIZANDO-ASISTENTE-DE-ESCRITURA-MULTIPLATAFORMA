/**
 * Types and interfaces for vector database operations
 */
export type VectorMetadata = Record<string, string | number | boolean | Date | null>;
export interface VectorDocument {
    id: string;
    content: string;
    metadata: VectorMetadata;
    embedding: number[];
    createdAt: Date;
    updatedAt: Date;
}
export interface SimilarityResult {
    id: string;
    content: string;
    metadata: VectorMetadata;
    similarity: number;
    score: number;
}
export interface VectorDatabaseStats {
    totalDocuments: number;
    totalEmbeddings: number;
    memoryUsage: number;
    isInitialized: boolean;
    lastUpdated: Date;
}
export interface VectorDatabaseConfig {
    type: 'pinecone' | 'weaviate' | 'memory';
    dimensions: number;
    threshold: number;
}
