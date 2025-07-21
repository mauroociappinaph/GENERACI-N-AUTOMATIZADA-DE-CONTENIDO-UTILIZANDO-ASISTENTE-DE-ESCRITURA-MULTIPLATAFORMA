"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStore = void 0;
const embedding_generator_1 = require("./embedding-generator");
const debug_logger_1 = require("../../utils/debug-logger");
const logger = (0, debug_logger_1.createComponentLogger)('MEMORY_STORE');
/**
 * In-memory implementation of vector database
 * Used for development and testing
 */
class MemoryStore {
    constructor(dimensions = 384) {
        this.documents = new Map();
        this.embeddings = new Map();
        this.embeddingGenerator = new embedding_generator_1.EmbeddingGenerator(dimensions);
        logger.info('MemoryStore initialized');
    }
    /**
     * Add document to memory store
     */
    async addDocument(id, content, metadata = {}) {
        logger.debug(`Adding document to memory store: ${id}`);
        const embedding = await this.embeddingGenerator.generateEmbedding(content);
        const document = {
            id,
            content,
            metadata,
            embedding,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.documents.set(id, document);
        this.embeddings.set(id, embedding);
        logger.debug(`Document added to memory store: ${id}`);
    }
    /**
     * Search for similar documents
     */
    async searchSimilar(query, limit = 10, threshold = 0.7) {
        logger.debug(`Searching similar documents in memory store: "${query}"`);
        const queryEmbedding = await this.embeddingGenerator.generateEmbedding(query);
        const similarities = [];
        for (const [id, docEmbedding] of this.embeddings.entries()) {
            const similarity = this.embeddingGenerator.calculateCosineSimilarity(queryEmbedding, docEmbedding);
            if (similarity >= threshold) {
                const document = this.documents.get(id);
                if (document) {
                    similarities.push({
                        id,
                        content: document.content,
                        metadata: document.metadata,
                        similarity,
                        score: similarity
                    });
                }
            }
        }
        similarities.sort((a, b) => b.similarity - a.similarity);
        const results = similarities.slice(0, limit);
        logger.debug(`Found ${results.length} similar documents in memory store`);
        return results;
    }
    /**
     * Get document by ID
     */
    async getDocument(id) {
        const document = this.documents.get(id);
        if (document) {
            logger.debug(`Document retrieved from memory store: ${id}`);
            return document;
        }
        else {
            logger.debug(`Document not found in memory store: ${id}`);
            return null;
        }
    }
    /**
     * Update existing document
     */
    async updateDocument(id, content, metadata = {}) {
        const existingDoc = this.documents.get(id);
        if (!existingDoc) {
            throw new Error(`Document not found: ${id}`);
        }
        logger.debug(`Updating document in memory store: ${id}`);
        const embedding = await this.embeddingGenerator.generateEmbedding(content);
        const updatedDoc = {
            ...existingDoc,
            content,
            metadata,
            embedding,
            updatedAt: new Date()
        };
        this.documents.set(id, updatedDoc);
        this.embeddings.set(id, embedding);
        logger.debug(`Document updated in memory store: ${id}`);
    }
    /**
     * Delete document
     */
    async deleteDocument(id) {
        const deleted = this.documents.delete(id);
        this.embeddings.delete(id);
        if (deleted) {
            logger.debug(`Document deleted from memory store: ${id}`);
        }
        else {
            logger.debug(`Document not found for deletion in memory store: ${id}`);
        }
    }
    /**
     * Get store statistics
     */
    async getStats() {
        const stats = {
            totalDocuments: this.documents.size,
            totalEmbeddings: this.embeddings.size,
            memoryUsage: this.calculateMemoryUsage(),
            isInitialized: true,
            lastUpdated: new Date()
        };
        return stats;
    }
    /**
     * Calculate approximate memory usage
     */
    calculateMemoryUsage() {
        const docSize = JSON.stringify(Array.from(this.documents.values())).length;
        const embeddingSize = this.embeddings.size * 384 * 8; // 384 floats * 8 bytes
        return docSize + embeddingSize;
    }
    /**
     * Clear all documents
     */
    async clear() {
        this.documents.clear();
        this.embeddings.clear();
        logger.info('Memory store cleared');
    }
}
exports.MemoryStore = MemoryStore;
exports.default = MemoryStore;
