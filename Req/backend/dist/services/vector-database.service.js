"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorDatabaseService = void 0;
const debug_logger_1 = require("../utils/debug-logger");
const error_tracker_1 = __importDefault(require("../utils/error-tracker"));
const memory_store_1 = require("./vector-database/memory-store");
const logger = (0, debug_logger_1.createComponentLogger)('VECTOR_DATABASE');
const errorTracker = error_tracker_1.default.getInstance();
/**
 * Main vector database service
 * Supports multiple backends: Pinecone, Weaviate, or in-memory
 */
class VectorDatabaseService {
    constructor() {
        this.isInitialized = false;
        this.store = null;
        logger.info('VectorDatabaseService initialized');
    }
    /**
     * Initialize vector database connection
     */
    async initialize() {
        try {
            logger.info('Initializing vector database connection');
            if (process.env.VECTOR_DB_TYPE === 'pinecone') {
                await this.initializePinecone();
            }
            else if (process.env.VECTOR_DB_TYPE === 'weaviate') {
                await this.initializeWeaviate();
            }
            else {
                await this.initializeInMemory();
            }
            this.isInitialized = true;
            logger.info('Vector database initialized successfully');
        }
        catch (error) {
            errorTracker.trackError(error, {
                component: 'VECTOR_DATABASE',
                operation: 'initialize'
            });
            throw error;
        }
    }
    /**
     * Add document to vector database
     */
    async addDocument(id, content, metadata = {}) {
        try {
            this.ensureInitialized();
            await this.store.addDocument(id, content, metadata);
        }
        catch (error) {
            errorTracker.trackError(error, {
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
    async searchSimilar(query, limit = 10, threshold = 0.7) {
        try {
            this.ensureInitialized();
            return await this.store.searchSimilar(query, limit, threshold);
        }
        catch (error) {
            errorTracker.trackError(error, {
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
    async getDocument(id) {
        try {
            this.ensureInitialized();
            return await this.store.getDocument(id);
        }
        catch (error) {
            errorTracker.trackError(error, {
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
    async updateDocument(id, content, metadata = {}) {
        try {
            this.ensureInitialized();
            await this.store.updateDocument(id, content, metadata);
        }
        catch (error) {
            errorTracker.trackError(error, {
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
    async deleteDocument(id) {
        try {
            this.ensureInitialized();
            await this.store.deleteDocument(id);
        }
        catch (error) {
            errorTracker.trackError(error, {
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
    async getStats() {
        try {
            this.ensureInitialized();
            return await this.store.getStats();
        }
        catch (error) {
            errorTracker.trackError(error, {
                component: 'VECTOR_DATABASE',
                operation: 'getStats'
            });
            throw error;
        }
    }
    /**
     * Initialize Pinecone (future implementation)
     */
    async initializePinecone() {
        logger.info('Initializing Pinecone vector database');
        // TODO: Implement Pinecone connection
        throw new Error('Pinecone integration not implemented yet');
    }
    /**
     * Initialize Weaviate (future implementation)
     */
    async initializeWeaviate() {
        logger.info('Initializing Weaviate vector database');
        // TODO: Implement Weaviate connection
        throw new Error('Weaviate integration not implemented yet');
    }
    /**
     * Initialize in-memory implementation
     */
    async initializeInMemory() {
        logger.info('Initializing in-memory vector database');
        this.store = new memory_store_1.MemoryStore();
    }
    /**
     * Ensure service is initialized
     */
    ensureInitialized() {
        if (!this.isInitialized || !this.store) {
            throw new Error('Vector database not initialized. Call initialize() first.');
        }
    }
}
exports.VectorDatabaseService = VectorDatabaseService;
exports.default = VectorDatabaseService;
