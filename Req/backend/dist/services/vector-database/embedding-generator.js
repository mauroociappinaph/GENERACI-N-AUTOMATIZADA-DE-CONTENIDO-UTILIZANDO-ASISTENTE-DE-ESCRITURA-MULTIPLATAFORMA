"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingGenerator = void 0;
const debug_logger_1 = require("../../utils/debug-logger");
const logger = (0, debug_logger_1.createComponentLogger)('EMBEDDING_GENERATOR');
/**
 * Service for generating embeddings from text
 * In production, this would use OpenAI Embeddings API or similar
 */
class EmbeddingGenerator {
    constructor(dimensions = 384) {
        this.dimensions = dimensions;
    }
    /**
     * Generate embedding for a text
     */
    async generateEmbedding(text) {
        logger.debug(`Generating embedding for text: ${text.substring(0, 50)}...`);
        // Implementación simplificada para desarrollo
        // En producción, usar OpenAI Embeddings API o modelo local
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(this.dimensions).fill(0);
        // Generar embedding básico basado en hash de palabras
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const hash = this.simpleHash(word);
            const index = Math.abs(hash) % embedding.length;
            embedding[index] += 1 / Math.sqrt(words.length);
        }
        // Normalizar el vector
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < embedding.length; i++) {
                embedding[i] /= magnitude;
            }
        }
        return embedding;
    }
    /**
     * Calculate cosine similarity between two vectors
     */
    calculateCosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            magnitudeA += a[i] * a[i];
            magnitudeB += b[i] * b[i];
        }
        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);
        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }
        return dotProduct / (magnitudeA * magnitudeB);
    }
    /**
     * Simple hash function for generating basic embeddings
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }
}
exports.EmbeddingGenerator = EmbeddingGenerator;
exports.default = EmbeddingGenerator;
