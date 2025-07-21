import { VectorDocument, SimilarityResult, VectorDatabaseStats, VectorMetadata } from './types';
/**
 * In-memory implementation of vector database
 * Used for development and testing
 */
export declare class MemoryStore {
    private documents;
    private embeddings;
    private embeddingGenerator;
    constructor(dimensions?: number);
    /**
     * Add document to memory store
     */
    addDocument(id: string, content: string, metadata?: VectorMetadata): Promise<void>;
    /**
     * Search for similar documents
     */
    searchSimilar(query: string, limit?: number, threshold?: number): Promise<SimilarityResult[]>;
    /**
     * Get document by ID
     */
    getDocument(id: string): Promise<VectorDocument | null>;
    /**
     * Update existing document
     */
    updateDocument(id: string, content: string, metadata?: VectorMetadata): Promise<void>;
    /**
     * Delete document
     */
    deleteDocument(id: string): Promise<void>;
    /**
     * Get store statistics
     */
    getStats(): Promise<VectorDatabaseStats>;
    /**
     * Calculate approximate memory usage
     */
    private calculateMemoryUsage;
    /**
     * Clear all documents
     */
    clear(): Promise<void>;
}
export default MemoryStore;
