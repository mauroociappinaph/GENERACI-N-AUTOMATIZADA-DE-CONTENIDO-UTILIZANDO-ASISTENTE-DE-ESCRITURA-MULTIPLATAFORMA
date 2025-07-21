export { default as prisma } from './prisma';
export * from './vector-database';
export declare const config: {
    readonly port: string | 3001;
    readonly nodeEnv: string;
    readonly database: {
        readonly url: string;
    };
    readonly jwt: {
        readonly secret: string;
        readonly expiresIn: string;
        readonly refreshExpiresIn: string;
    };
    readonly cors: {
        readonly origin: string[];
        readonly credentials: true;
        readonly methods: string[];
        readonly allowedHeaders: string[];
    };
    readonly redis: {
        readonly url: string;
    };
    readonly email: {
        readonly host: string;
        readonly port: number;
        readonly user: string;
        readonly pass: string;
    };
    readonly vectorDb: {
        readonly provider: "pinecone" | "weaviate" | "local";
        readonly apiKey: string | undefined;
        readonly environment: string;
        readonly indexName: string;
        readonly dimension: number;
        readonly metric: "cosine" | "euclidean" | "dotproduct";
    };
    readonly aiContent: {
        readonly openaiApiKey: string;
        readonly defaultModel: string;
        readonly maxTokens: number;
        readonly temperature: number;
        readonly embeddingModel: string;
    };
};
export default config;
