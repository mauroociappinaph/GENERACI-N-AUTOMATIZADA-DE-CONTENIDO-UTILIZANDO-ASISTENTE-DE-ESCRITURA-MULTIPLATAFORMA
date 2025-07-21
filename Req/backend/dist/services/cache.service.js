"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../utils/logger"));
class CacheService {
    constructor() {
        this.isConnected = false;
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.redis.on('connect', () => {
            this.isConnected = true;
            logger_1.default.info('Redis connected successfully');
        });
        this.redis.on('error', (error) => {
            this.isConnected = false;
            logger_1.default.error('Redis connection error:', error);
        });
        this.redis.on('close', () => {
            this.isConnected = false;
            logger_1.default.warn('Redis connection closed');
        });
    }
    async connect() {
        try {
            await this.redis.connect();
        }
        catch (error) {
            logger_1.default.error('Failed to connect to Redis:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.redis.disconnect();
            this.isConnected = false;
        }
        catch (error) {
            logger_1.default.error('Error disconnecting from Redis:', error);
        }
    }
    async get(key) {
        try {
            if (!this.isConnected) {
                logger_1.default.warn('Redis not connected, skipping cache get');
                return null;
            }
            const value = await this.redis.get(key);
            if (!value) {
                return null;
            }
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.default.error(`Error getting cache key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            if (!this.isConnected) {
                logger_1.default.warn('Redis not connected, skipping cache set');
                return false;
            }
            const serializedValue = JSON.stringify(value);
            if (ttlSeconds) {
                await this.redis.setex(key, ttlSeconds, serializedValue);
            }
            else {
                await this.redis.set(key, serializedValue);
            }
            return true;
        }
        catch (error) {
            logger_1.default.error(`Error setting cache key ${key}:`, error);
            return false;
        }
    }
    async del(key) {
        try {
            if (!this.isConnected) {
                logger_1.default.warn('Redis not connected, skipping cache delete');
                return false;
            }
            const result = await this.redis.del(key);
            return result > 0;
        }
        catch (error) {
            logger_1.default.error(`Error deleting cache key ${key}:`, error);
            return false;
        }
    }
    async exists(key) {
        try {
            if (!this.isConnected) {
                return false;
            }
            const result = await this.redis.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.default.error(`Error checking cache key existence ${key}:`, error);
            return false;
        }
    }
    async flush() {
        try {
            if (!this.isConnected) {
                logger_1.default.warn('Redis not connected, skipping cache flush');
                return false;
            }
            await this.redis.flushdb();
            return true;
        }
        catch (error) {
            logger_1.default.error('Error flushing cache:', error);
            return false;
        }
    }
    async keys(pattern) {
        try {
            if (!this.isConnected) {
                return [];
            }
            return await this.redis.keys(pattern);
        }
        catch (error) {
            logger_1.default.error(`Error getting keys with pattern ${pattern}:`, error);
            return [];
        }
    }
    async ttl(key) {
        try {
            if (!this.isConnected) {
                return -1;
            }
            return await this.redis.ttl(key);
        }
        catch (error) {
            logger_1.default.error(`Error getting TTL for key ${key}:`, error);
            return -1;
        }
    }
    isHealthy() {
        return this.isConnected;
    }
    async ping() {
        try {
            if (!this.isConnected) {
                return false;
            }
            const result = await this.redis.ping();
            return result === 'PONG';
        }
        catch (error) {
            logger_1.default.error('Redis ping failed:', error);
            return false;
        }
    }
}
exports.CacheService = CacheService;
// Singleton instance
exports.cacheService = new CacheService();
