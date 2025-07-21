import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Export Prisma client
export { default as prisma } from './prisma';

// Export vector database configuration
export * from './vector-database';

export const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS Configuration
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000'
    ] as string[],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] as string[],
    allowedHeaders: ['Content-Type', 'Authorization'] as string[],
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  // Vector Database Configuration
  vectorDb: {
    provider: (process.env.VECTOR_DB_PROVIDER as 'pinecone' | 'weaviate' | 'local') || 'local',
    apiKey: process.env.VECTOR_DB_API_KEY,
    environment: process.env.VECTOR_DB_ENVIRONMENT || 'us-east1-gcp',
    indexName: process.env.VECTOR_DB_INDEX_NAME || 'ai-content-similarity',
    dimension: parseInt(process.env.VECTOR_DB_DIMENSION || '1536'),
    metric: (process.env.VECTOR_DB_METRIC as 'cosine' | 'euclidean' | 'dotproduct') || 'cosine',
  },

  // AI Content Configuration
  aiContent: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    defaultModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
  },
} as const;

export default config;
