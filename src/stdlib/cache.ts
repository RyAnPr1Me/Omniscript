/**
 * Advanced caching library for Omniscript
 * Multi-level caching with TTL, LRU, and distributed cache support
 */

import { DateTime } from "./datetime";
import { logger } from "./logging";

export interface CacheEntry<T> {
  value: T;
  createdAt: DateTime;
  expiresAt?: DateTime;
  accessCount: number;
  lastAccessed: DateTime;
  size?: number;
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  maxMemory?: number; // Maximum memory usage in bytes
  tags?: string[];
  serialize?: boolean; // Whether to serialize the value
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memory: number;
  hitRate: number;
  evictions: number;
}

export interface CacheStorage<T = any> {
  get(key: string): Promise<CacheEntry<T> | null>;
  set(key: string, entry: CacheEntry<T>): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

// Base cache implementation
export abstract class BaseCache<T = any> {
  protected stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    memory: 0,
    hitRate: 0,
    evictions: 0,
  };

  protected defaultOptions: CacheOptions = {
    ttl: 300000, // 5 minutes
    maxSize: 1000,
    maxMemory: 50 * 1024 * 1024, // 50MB
    serialize: false,
  };

  constructor(protected options: CacheOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  abstract get(key: string): Promise<T | null>;
  abstract set(key: string, value: T, options?: CacheOptions): Promise<void>;
  abstract delete(key: string): Promise<boolean>;
  abstract clear(): Promise<void>;
  abstract keys(): Promise<string[]>;

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memory: 0,
      hitRate: 0,
      evictions: 0,
    };
  }

  protected updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  protected isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.expiresAt) return false;
    return DateTime.now().isAfter(entry.expiresAt);
  }

  protected calculateSize(value: T): number {
    if (typeof value === "string") {
      return value.length * 2; // 2 bytes per character in UTF-16
    }
    if (typeof value === "number") {
      return 8; // 64-bit number
    }
    if (typeof value === "boolean") {
      return 1;
    }
    if (value === null || value === undefined) {
      return 0;
    }

    // For objects, try to estimate size
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 1024; // Default estimate for non-serializable objects
    }
  }

  // Bulk operations
  async mget(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    await Promise.all(
      keys.map(async (key) => {
        result[key] = await this.get(key);
      }),
    );
    return result;
  }

  async mset(
    entries: Record<string, T>,
    options?: CacheOptions,
  ): Promise<void> {
    await Promise.all(
      Object.entries(entries).map(([key, value]) =>
        this.set(key, value, options),
      ),
    );
  }

  async deleteByTag(tag: string): Promise<number> {
    const keys = await this.keys();
    let deleted = 0;

    for (const key of keys) {
      const entry = await this.getEntry(key);
      if (entry && entry.tags && entry.tags.includes(tag)) {
        if (await this.delete(key)) {
          deleted++;
        }
      }
    }

    return deleted;
  }

  protected abstract getEntry(key: string): Promise<CacheEntry<T> | null>;
}

// Memory cache with LRU eviction
export class MemoryCache<T = any> extends BaseCache<T> {
  private storage = new Map<string, CacheEntry<T>>();
  private accessOrder = new Set<string>();

  async get(key: string): Promise<T | null> {
    const entry = this.storage.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    if (this.isExpired(entry)) {
      await this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = DateTime.now();
    this.accessOrder.delete(key);
    this.accessOrder.add(key);

    this.stats.hits++;
    this.updateHitRate();

    return entry.value;
  }

  async set(key: string, value: T, options?: CacheOptions): Promise<void> {
    const opts = { ...this.options, ...options };
    const now = DateTime.now();
    const size = this.calculateSize(value);

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: opts.ttl ? now.add(opts.ttl, "milliseconds") : undefined,
      accessCount: 0,
      lastAccessed: now,
      size,
      tags: opts.tags,
    };

    // Check if we need to evict entries
    await this.evictIfNeeded(size);

    // Delete existing entry if it exists
    if (this.storage.has(key)) {
      await this.delete(key);
    }

    this.storage.set(key, entry);
    this.accessOrder.add(key);
    this.stats.size++;
    this.stats.memory += size;

    logger.debug("MemoryCache set", {
      key,
      size: this.stats.size,
      memory: this.stats.memory,
    });
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.storage.get(key);
    if (!entry) return false;

    this.storage.delete(key);
    this.accessOrder.delete(key);
    this.stats.size--;
    this.stats.memory -= entry.size || 0;

    return true;
  }

  async clear(): Promise<void> {
    this.storage.clear();
    this.accessOrder.clear();
    this.stats.size = 0;
    this.stats.memory = 0;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  protected async getEntry(key: string): Promise<CacheEntry<T> | null> {
    return this.storage.get(key) || null;
  }

  private async evictIfNeeded(newEntrySize: number): Promise<void> {
    const { maxSize, maxMemory } = this.options;

    // Evict expired entries first
    await this.evictExpired();

    // Evict by size limit
    if (maxSize && this.storage.size >= maxSize) {
      await this.evictLRU(1);
    }

    // Evict by memory limit
    if (maxMemory && this.stats.memory + newEntrySize > maxMemory) {
      const targetMemory = maxMemory * 0.8; // Evict to 80% of max memory
      while (this.stats.memory > targetMemory && this.storage.size > 0) {
        await this.evictLRU(1);
      }
    }
  }

  private async evictExpired(): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.storage) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
    }
  }

  private async evictLRU(count: number): Promise<void> {
    const keysToEvict = Array.from(this.accessOrder).slice(0, count);

    for (const key of keysToEvict) {
      await this.delete(key);
      this.stats.evictions++;
    }
  }
}

// Tiered cache (L1 memory + L2 storage)
export class TieredCache<T = any> extends BaseCache<T> {
  constructor(
    private l1Cache: BaseCache<T>,
    private l2Cache: BaseCache<T>,
    options?: CacheOptions,
  ) {
    super(options);
  }

  async get(key: string): Promise<T | null> {
    // Try L1 first
    let value = await this.l1Cache.get(key);
    if (value !== null) {
      this.stats.hits++;
      this.updateHitRate();
      return value;
    }

    // Try L2
    value = await this.l2Cache.get(key);
    if (value !== null) {
      // Promote to L1
      await this.l1Cache.set(key, value);
      this.stats.hits++;
      this.updateHitRate();
      return value;
    }

    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  async set(key: string, value: T, options?: CacheOptions): Promise<void> {
    // Set in both caches
    await Promise.all([
      this.l1Cache.set(key, value, options),
      this.l2Cache.set(key, value, options),
    ]);

    this.stats.size++;
  }

  async delete(key: string): Promise<boolean> {
    const [l1Deleted, l2Deleted] = await Promise.all([
      this.l1Cache.delete(key),
      this.l2Cache.delete(key),
    ]);

    if (l1Deleted || l2Deleted) {
      this.stats.size--;
      return true;
    }

    return false;
  }

  async clear(): Promise<void> {
    await Promise.all([this.l1Cache.clear(), this.l2Cache.clear()]);

    this.stats.size = 0;
    this.stats.memory = 0;
  }

  async keys(): Promise<string[]> {
    const [l1Keys, l2Keys] = await Promise.all([
      this.l1Cache.keys(),
      this.l2Cache.keys(),
    ]);

    return Array.from(new Set([...l1Keys, ...l2Keys]));
  }

  protected async getEntry(key: string): Promise<CacheEntry<T> | null> {
    const l1Entry = await this.l1Cache["getEntry"](key);
    if (l1Entry) return l1Entry;

    return await this.l2Cache["getEntry"](key);
  }

  getStats(): CacheStats {
    const l1Stats = this.l1Cache.getStats();
    const l2Stats = this.l2Cache.getStats();

    return {
      hits: l1Stats.hits + l2Stats.hits,
      misses: l1Stats.misses + l2Stats.misses,
      size: l1Stats.size + l2Stats.size,
      memory: l1Stats.memory + l2Stats.memory,
      hitRate:
        (l1Stats.hits + l2Stats.hits) /
          (l1Stats.hits + l2Stats.hits + l1Stats.misses + l2Stats.misses) || 0,
      evictions: l1Stats.evictions + l2Stats.evictions,
    };
  }
}

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  cache: BaseCache,
  options: {
    keyGenerator?: (...args: Parameters<T>) => string;
    ttl?: number;
    tags?: string[];
  } = {},
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const keyGen =
        options.keyGenerator ||
        ((...args) => `${propertyName}:${JSON.stringify(args)}`);
      const cacheKey = keyGen(...args);

      // Try to get from cache
      let result = await cache.get(cacheKey);
      if (result !== null) {
        return result;
      }

      // Execute function and cache result
      result = await method.apply(this, args);
      await cache.set(cacheKey, result, {
        ttl: options.ttl,
        tags: options.tags,
      });

      return result;
    };

    return descriptor;
  };
}

// Memoization utility
export class Memoizer<T = any> {
  private cache: BaseCache<T>;

  constructor(cache?: BaseCache<T>) {
    this.cache = cache || new MemoryCache<T>({ maxSize: 100 });
  }

  memoize<F extends (...args: any[]) => any>(
    fn: F,
    keyGenerator?: (...args: Parameters<F>) => string,
  ): F {
    const keyGen = keyGenerator || ((...args) => JSON.stringify(args));

    return (async (...args: Parameters<F>) => {
      const key = keyGen(...args);

      let result = await this.cache.get(key);
      if (result !== null) {
        return result;
      }

      result = await fn(...args);
      if (result !== null) {
        await this.cache.set(key, result);
      }

      return result;
    }) as F;
  }

  clear(): Promise<void> {
    return this.cache.clear();
  }

  getStats(): CacheStats {
    return this.cache.getStats();
  }
}

// Write-through cache
export class WriteThroughCache<T = any> extends BaseCache<T> {
  constructor(
    private cache: BaseCache<T>,
    private dataSource: {
      get(key: string): Promise<T | null>;
      set(key: string, value: T): Promise<void>;
      delete(key: string): Promise<boolean>;
    },
  ) {
    super();
  }

  async get(key: string): Promise<T | null> {
    // Try cache first
    let value = await this.cache.get(key);
    if (value !== null) {
      this.stats.hits++;
      this.updateHitRate();
      return value;
    }

    // Fallback to data source
    value = await this.dataSource.get(key);
    if (value !== null) {
      // Populate cache
      await this.cache.set(key, value);
    }

    if (value !== null) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    this.updateHitRate();

    return value;
  }

  async set(key: string, value: T, options?: CacheOptions): Promise<void> {
    // Write to both cache and data source
    await Promise.all([
      this.cache.set(key, value, options),
      this.dataSource.set(key, value),
    ]);
  }

  async delete(key: string): Promise<boolean> {
    const [cacheResult, dataSourceResult] = await Promise.all([
      this.cache.delete(key),
      this.dataSource.delete(key),
    ]);

    return cacheResult || dataSourceResult;
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async keys(): Promise<string[]> {
    return this.cache.keys();
  }

  protected async getEntry(key: string): Promise<CacheEntry<T> | null> {
    return this.cache["getEntry"](key);
  }
}

// Write-behind (write-back) cache
export class WriteBehindCache<T = any> extends BaseCache<T> {
  private writeQueue = new Map<string, T>();
  private writeTimer: NodeJS.Timeout | null = null;

  constructor(
    private cache: BaseCache<T>,
    private dataSource: {
      set(key: string, value: T): Promise<void>;
      setMany(entries: Record<string, T>): Promise<void>;
    },
    private flushInterval = 5000, // 5 seconds
  ) {
    super();
    this.startWriteTimer();
  }

  async get(key: string): Promise<T | null> {
    return this.cache.get(key);
  }

  async set(key: string, value: T, options?: CacheOptions): Promise<void> {
    // Write to cache immediately
    await this.cache.set(key, value, options);

    // Queue for background write
    this.writeQueue.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    // Remove from write queue
    this.writeQueue.delete(key);

    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.writeQueue.clear();
    return this.cache.clear();
  }

  async keys(): Promise<string[]> {
    return this.cache.keys();
  }

  protected async getEntry(key: string): Promise<CacheEntry<T> | null> {
    return this.cache["getEntry"](key);
  }

  async flush(): Promise<void> {
    if (this.writeQueue.size === 0) return;

    const entries = Object.fromEntries(this.writeQueue);
    this.writeQueue.clear();

    try {
      await this.dataSource.setMany(entries);
      logger.debug("WriteBehindCache flushed", {
        count: Object.keys(entries).length,
      });
    } catch (error) {
      logger.error("WriteBehindCache flush failed", error as Error);
      // Re-queue the entries for retry
      for (const [key, value] of Object.entries(entries)) {
        this.writeQueue.set(key, value);
      }
    }
  }

  private startWriteTimer(): void {
    this.writeTimer = setInterval(() => {
      this.flush().catch((error) => {
        logger.error("WriteBehindCache background flush failed", error);
      });
    }, this.flushInterval);
  }

  async close(): Promise<void> {
    if (this.writeTimer) {
      clearInterval(this.writeTimer);
      this.writeTimer = null;
    }

    await this.flush();
  }
}

// Cache factory for creating different cache types
export class CacheFactory {
  static createMemoryCache<T = any>(options?: CacheOptions): MemoryCache<T> {
    return new MemoryCache<T>(options);
  }

  static createTieredCache<T = any>(options?: CacheOptions): TieredCache<T> {
    const l1 = new MemoryCache<T>({ maxSize: 100, ttl: 60000 });
    const l2 = new MemoryCache<T>({ maxSize: 1000, ttl: 300000 });
    return new TieredCache<T>(l1, l2, options);
  }

  static createMemoizer<T = any>(maxSize = 100): Memoizer<T> {
    const cache = new MemoryCache<T>({ maxSize });
    return new Memoizer<T>(cache);
  }
}

// Global cache instances
export const defaultCache = CacheFactory.createMemoryCache();
export const tieredCache = CacheFactory.createTieredCache();
export const memoizer = CacheFactory.createMemoizer();

// Only log initialization in non-CLI contexts
if (
  !process.argv.some((arg) => arg.includes("cli.js") || arg.includes("bin/cli"))
) {
  logger.info("Cache library initialized");
}
