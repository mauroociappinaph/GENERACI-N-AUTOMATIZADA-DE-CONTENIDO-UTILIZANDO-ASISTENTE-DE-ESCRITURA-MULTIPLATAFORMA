export declare class CacheService {
    private redis;
    private isConnected;
    constructor();
    private setupEventHandlers;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    flush(): Promise<boolean>;
    keys(pattern: string): Promise<string[]>;
    ttl(key: string): Promise<number>;
    isHealthy(): boolean;
    ping(): Promise<boolean>;
}
export declare const cacheService: CacheService;
