/**
 * Service for generating embeddings from text
 * In production, this would use OpenAI Embeddings API or similar
 */
export declare class EmbeddingGenerator {
    private readonly dimensions;
    constructor(dimensions?: number);
    /**
     * Generate embedding for a text
     */
    generateEmbedding(text: string): Promise<number[]>;
    /**
     * Calculate cosine similarity between two vectors
     */
    calculateCosineSimilarity(a: number[], b: number[]): number;
    /**
     * Simple hash function for generating basic embeddings
     */
    private simpleHash;
}
export default EmbeddingGenerator;
