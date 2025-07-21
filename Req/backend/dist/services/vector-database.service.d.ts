import { VectorDocument, SimilarityResult, VectorDatabaseStats } from './vector-database/types';
/**
 * Main vector database service
 * Supports multiple backends: Pinecone, Weaviate, or in-memory
 */
export declare class VectorDatabaseService {
    private isInitialized;
    private store;
    constructor();
    /**
     * Initialize vector database connection
     */
    initialize(): Promise<void>;
    /**
     * Add document to vector database
     */
    addDocument(id: string, content: string, metadata?: Record<string, any>): Promise<void>;
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
    updateDocument(id: string, content: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Delete document
     */
    deleteDocument(id: string): Promise<void>;
    /**
     * Get database statistics
     */
    getStats(): Promise<VectorDatabaseStats>;
    /**
     * Initialize Pinecone (future implementation)
     */
    private initializePinecone;
    /**
     * Initialize Weaviate (future implementation)
     */
    private initializeWeaviate;
    /**
     * Initialize in-memory implementation
     */
    private initializeInMemory;
    /**
     * Ensure service is initialized
     */
    private ensureInitialized;
}
export { VectorDocument, SimilarityResult, VectorDatabaseStats } from './vector-database/types';
export default VectorDatabaseService;
