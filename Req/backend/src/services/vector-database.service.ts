import { createComponentLogger } from '../utils/debug-logger';
import ErrorTracker from '../utils/error-tracker';
import { MemoryStore } from './vector-database/memory-store';
import { VectorDocument, SimilarityResult, VectorDatabaseStats } from './vector-database/types';

const logger = createComponentLogger('VECTOR_DATABASE');
const errorTracker = ErrorTracker.getInstance();

/**
 * Main vector database service
 * Supports multiple backends: Pinecone, Weaviate, or in-memory
 */
export class VectorDatabaseService {
  private isInitialized = false;
  private store: MemoryStore | null = null;

  constructor() {
    logger.info('VectorDatabaseService initialized');
  }

  /**
   * Initialize vector database connection
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing vector database connection');

      if (process.env.VECTOR_DB_TYPE === 'pinecone') {
        await this.initializePinecone();
      } else if (process.env.VECTOR_DB_TYPE === 'weaviate') {
        await this.initializeWeaviate();
      } else {
        await this.initializeInMemory();
      }

      this.isInitialized = true;
      logger.info('Vector database initialized successfully');

    } catch (error) {
      errorTracker.trackError(error as Error, {
        component: 'VECTOR_DATABASE',
        operation: 'initialize'
      });
      throw error;
    }
  }

  /**
   * Add document to vector database
   */
  async addDocument(id: string, content: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      this.ensureInitialized();
      await this.store!.addDocument(id, content, metadata);
    } catch (error) {
      errorTracker.trackError(error as Error, {
        component: 'VECTOR_DATABASE',
        operation: 'addDocument',
        metadata: { documentId: id }
      });
      throw error;
    }
  }

  /**
   * Search for similar documents
   */
  async searchSimilar(query: string, limit: number = 10, threshold: number = 0.7): Promise<SimilarityResult[]> {
    try {
      this.ensureInitialized();
      return await this.store!.searchSimilar(query, limit, threshold);
    } catch (error) {
      errorTracker.trackError(error as Error, {
        component: 'VECTOR_DATABASE',
        operation: 'searchSimilar',
        metadata: { query, limit, threshold }
      });
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<VectorDocument | null> {
    try {
      this.ensureInitialized();
      return await this.store!.getDocument(id);
    } catch (error) {
      errorTracker.trackError(error as Error, {
        component: 'VECTOR_DATABASE',
        operation: 'getDocument',
        metadata: { documentId: id }
      });
      throw error;
    }
  }

  /**
   * Update existing document
   */
  async updateDocument(id: string, content: string, metadata: Record<string, unknown> = {}): Promise<void> {
    try {
      this.ensureInitialized();
      await this.store!.updateDocument(id, content, metadata);
    } catch (error) {
      errorTracker.trackError(error as Error, {
        component: 'VECTOR_DATABASE',
        operation: 'updateDocument',
        metadata: { documentId: id }
      });
      throw error;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      this.ensureInitialized();
      await this.store!.deleteDocument(id);
    } catch (error) {
      errorTracker.trackError(error as Error, {
        component: 'VECTOR_DATABASE',
        operation: 'deleteDocument',
        metadata: { documentId: id }
      });
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<VectorDatabaseStats> {
    try {
      this.ensureInitialized();
      return await this.store!.getStats();
    } catch (error) {
      errorTracker.trackError(error as Error, {
        component: 'VECTOR_DATABASE',
        operation: 'getStats'
      });
      throw error;
    }
  }

  /**
   * Initialize Pinecone (future implementation)
   */
  private async initializePinecone(): Promise<void> {
    logger.info('Initializing Pinecone vector database');
    // TODO: Implement Pinecone connection
    throw new Error('Pinecone integration not implemented yet');
  }

  /**
   * Initialize Weaviate (future implementation)
   */
  private async initializeWeaviate(): Promise<void> {
    logger.info('Initializing Weaviate vector database');
    // TODO: Implement Weaviate connection
    throw new Error('Weaviate integration not implemented yet');
  }

  /**
   * Initialize in-memory implementation
   */
  private async initializeInMemory(): Promise<void> {
    logger.info('Initializing in-memory vector database');
    this.store = new MemoryStore();
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.store) {
      throw new Error('Vector database not initialized. Call initialize() first.');
    }
  }
}

// Re-export types for convenience
export { VectorDocument, SimilarityResult, VectorDatabaseStats } from './vector-database/types';

export default VectorDatabaseService;
