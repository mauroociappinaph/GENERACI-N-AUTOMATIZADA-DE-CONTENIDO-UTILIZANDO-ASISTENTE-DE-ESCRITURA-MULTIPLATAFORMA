import { CacheService } from '../../src/services/cache.service';
import Redis from 'ioredis';

// Mock ioredis
jest.mock('ioredis');
const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRedis = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      flushdb: jest.fn(),
      keys: jest.fn(),
      ttl: jest.fn(),
      ping: jest.fn(),
      on: jest.fn(),
    } as any;

    MockedRedis.mockImplementation(() => mockRedis);

    cacheService = new CacheService();
  });

  describe('constructor', () => {
    it('should create Redis instance with default configuration', () => {
      expect(MockedRedis).toHaveBeenCalledWith({
        host: 'localhost',
        port: 6379,
        password: undefined,
        db: 0,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    });

    it('should setup event handlers', () => {
      expect(mockRedis.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('connect', () => {
    it('should connect to Redis successfully', async () => {
      mockRedis.connect.mockResolvedValue(undefined);

      await cacheService.connect();

      expect(mockRedis.connect).toHaveBeenCalled();
    });

    it('should throw error if connection fails', async () => {
      const error = new Error('Connection failed');
      mockRedis.connect.mockRejectedValue(error);

      await expect(cacheService.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Redis successfully', async () => {
      (mockRedis.disconnect as jest.Mock).mockResolvedValue(undefined);

      await cacheService.disconnect();

      expect(mockRedis.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect errors gracefully', async () => {
      const error = new Error('Disconnect failed');
      (mockRedis.disconnect as jest.Mock).mockRejectedValue(error);

      // Should not throw
      await expect(cacheService.disconnect()).resolves.toBeUndefined();
    });
  });

  describe('get', () => {
    beforeEach(() => {
      // Simulate connected state
      (cacheService as any).isConnected = true;
    });

    it('should get and parse cached value', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test-key');

      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should return null when not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
      expect(mockRedis.get).not.toHaveBeenCalled();
    });

    it('should handle JSON parse errors', async () => {
      mockRedis.get.mockResolvedValue('invalid-json');

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle Redis errors', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
    });

    it('should set value without TTL', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.set.mockResolvedValue('OK');

      const result = await cacheService.set('test-key', testData);

      expect(mockRedis.set).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
      expect(result).toBe(true);
    });

    it('should set value with TTL', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.setex.mockResolvedValue('OK');

      const result = await cacheService.set('test-key', testData, 300);

      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 300, JSON.stringify(testData));
      expect(result).toBe(true);
    });

    it('should return false when not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.set('test-key', { data: 'test' });

      expect(result).toBe(false);
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('should handle Redis errors', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.set('test-key', { data: 'test' });

      expect(result).toBe(false);
    });
  });

  describe('del', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
    });

    it('should delete existing key', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await cacheService.del('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      mockRedis.del.mockResolvedValue(0);

      const result = await cacheService.del('non-existent-key');

      expect(result).toBe(false);
    });

    it('should return false when not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.del('test-key');

      expect(result).toBe(false);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
    });

    it('should return true for existing key', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await cacheService.exists('test-key');

      expect(result).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await cacheService.exists('non-existent-key');

      expect(result).toBe(false);
    });

    it('should return false when not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.exists('test-key');

      expect(result).toBe(false);
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
    });

    it('should flush database successfully', async () => {
      mockRedis.flushdb.mockResolvedValue('OK');

      const result = await cacheService.flush();

      expect(mockRedis.flushdb).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.flush();

      expect(result).toBe(false);
    });
  });

  describe('keys', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
    });

    it('should return matching keys', async () => {
      const keys = ['key1', 'key2', 'key3'];
      mockRedis.keys.mockResolvedValue(keys);

      const result = await cacheService.keys('key*');

      expect(mockRedis.keys).toHaveBeenCalledWith('key*');
      expect(result).toEqual(keys);
    });

    it('should return empty array when not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.keys('key*');

      expect(result).toEqual([]);
    });
  });

  describe('ttl', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
    });

    it('should return TTL for key', async () => {
      mockRedis.ttl.mockResolvedValue(300);

      const result = await cacheService.ttl('test-key');

      expect(mockRedis.ttl).toHaveBeenCalledWith('test-key');
      expect(result).toBe(300);
    });

    it('should return -1 when not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.ttl('test-key');

      expect(result).toBe(-1);
    });
  });

  describe('isHealthy', () => {
    it('should return connection status', () => {
      (cacheService as any).isConnected = true;
      expect(cacheService.isHealthy()).toBe(true);

      (cacheService as any).isConnected = false;
      expect(cacheService.isHealthy()).toBe(false);
    });
  });

  describe('ping', () => {
    beforeEach(() => {
      (cacheService as any).isConnected = true;
    });

    it('should return true for successful ping', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await cacheService.ping();

      expect(result).toBe(true);
    });

    it('should return false for failed ping', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Ping failed'));

      const result = await cacheService.ping();

      expect(result).toBe(false);
    });

    it('should return false when not connected', async () => {
      (cacheService as any).isConnected = false;

      const result = await cacheService.ping();

      expect(result).toBe(false);
    });
  });
});
