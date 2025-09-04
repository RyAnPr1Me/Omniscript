import {
  MemoryCache,
  TieredCache,
  CacheFactory,
  Memoizer,
} from "../../src/stdlib/cache";

describe("Cache Library", () => {
  describe("MemoryCache", () => {
    test("should store and retrieve values", async () => {
      const cache = new MemoryCache<string>();

      await cache.set("key1", "value1");
      const value = await cache.get("key1");

      expect(value).toBe("value1");
    });

    test("should return null for non-existent keys", async () => {
      const cache = new MemoryCache<string>();
      const value = await cache.get("non-existent");

      expect(value).toBeNull();
    });

    test("should handle TTL expiration", async () => {
      const cache = new MemoryCache<string>({ ttl: 100 }); // 100ms TTL

      await cache.set("key1", "value1");
      let value = await cache.get("key1");
      expect(value).toBe("value1");

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      value = await cache.get("key1");
      expect(value).toBeNull();
    });

    test("should respect size limits and evict LRU entries", async () => {
      const cache = new MemoryCache<string>({ maxSize: 2 });

      await cache.set("key1", "value1");
      await cache.set("key2", "value2");
      await cache.set("key3", "value3"); // Should evict key1

      expect(await cache.get("key1")).toBeNull();
      expect(await cache.get("key2")).toBe("value2");
      expect(await cache.get("key3")).toBe("value3");
    });

    test("should update access order for LRU", async () => {
      const cache = new MemoryCache<string>({ maxSize: 2 });

      await cache.set("key1", "value1");
      await cache.set("key2", "value2");

      // Access key1 to make it recently used
      await cache.get("key1");

      await cache.set("key3", "value3"); // Should evict key2 (least recently used)

      expect(await cache.get("key1")).toBe("value1");
      expect(await cache.get("key2")).toBeNull();
      expect(await cache.get("key3")).toBe("value3");
    });

    test("should delete entries", async () => {
      const cache = new MemoryCache<string>();

      await cache.set("key1", "value1");
      expect(await cache.get("key1")).toBe("value1");

      const deleted = await cache.delete("key1");
      expect(deleted).toBe(true);
      expect(await cache.get("key1")).toBeNull();

      const deletedAgain = await cache.delete("key1");
      expect(deletedAgain).toBe(false);
    });

    test("should clear all entries", async () => {
      const cache = new MemoryCache<string>();

      await cache.set("key1", "value1");
      await cache.set("key2", "value2");

      await cache.clear();

      expect(await cache.get("key1")).toBeNull();
      expect(await cache.get("key2")).toBeNull();
    });

    test("should return all keys", async () => {
      const cache = new MemoryCache<string>();

      await cache.set("key1", "value1");
      await cache.set("key2", "value2");
      await cache.set("key3", "value3");

      const keys = await cache.keys();
      expect(keys.sort()).toEqual(["key1", "key2", "key3"]);
    });

    test("should track cache statistics", async () => {
      const cache = new MemoryCache<string>();

      // Initial stats
      let stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);

      // Test cache miss
      await cache.get("non-existent");
      stats = cache.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0);

      // Test cache hit
      await cache.set("key1", "value1");
      await cache.get("key1");
      stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    test("should handle bulk operations", async () => {
      const cache = new MemoryCache<string>();

      // Bulk set
      await cache.mset({
        key1: "value1",
        key2: "value2",
        key3: "value3",
      });

      // Bulk get
      const values = await cache.mget(["key1", "key2", "key3", "non-existent"]);

      expect(values).toEqual({
        key1: "value1",
        key2: "value2",
        key3: "value3",
        "non-existent": null,
      });
    });
  });

  describe("TieredCache", () => {
    test("should promote values from L2 to L1", async () => {
      const l1Cache = new MemoryCache<string>({ maxSize: 10 });
      const l2Cache = new MemoryCache<string>({ maxSize: 100 });
      const tieredCache = new TieredCache(l1Cache, l2Cache);

      // Set in L2 only
      await l2Cache.set("key1", "value1");

      // Get should promote to L1
      const value = await tieredCache.get("key1");
      expect(value).toBe("value1");

      // Should now be in L1
      const l1Value = await l1Cache.get("key1");
      expect(l1Value).toBe("value1");
    });

    test("should set in both L1 and L2 caches", async () => {
      const l1Cache = new MemoryCache<string>();
      const l2Cache = new MemoryCache<string>();
      const tieredCache = new TieredCache(l1Cache, l2Cache);

      await tieredCache.set("key1", "value1");

      expect(await l1Cache.get("key1")).toBe("value1");
      expect(await l2Cache.get("key1")).toBe("value1");
    });

    test("should delete from both caches", async () => {
      const l1Cache = new MemoryCache<string>();
      const l2Cache = new MemoryCache<string>();
      const tieredCache = new TieredCache(l1Cache, l2Cache);

      await tieredCache.set("key1", "value1");
      await tieredCache.delete("key1");

      expect(await l1Cache.get("key1")).toBeNull();
      expect(await l2Cache.get("key1")).toBeNull();
    });
  });

  describe("Memoizer", () => {
    test("should memoize function results", async () => {
      const memoizer = new Memoizer();
      let callCount = 0;

      const expensiveFunction = async (x: number, y: number) => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return x + y;
      };

      const memoizedFn = memoizer.memoize(expensiveFunction);

      // First call should execute the function
      const result1 = await memoizedFn(1, 2);
      expect(result1).toBe(3);
      expect(callCount).toBe(1);

      // Second call with same args should use cache
      const result2 = await memoizedFn(1, 2);
      expect(result2).toBe(3);
      expect(callCount).toBe(1); // Function not called again

      // Different args should execute function
      const result3 = await memoizedFn(2, 3);
      expect(result3).toBe(5);
      expect(callCount).toBe(2);
    });

    test("should use custom key generator", async () => {
      const memoizer = new Memoizer();
      let callCount = 0;

      const fn = async (obj: { x: number; y: number }) => {
        callCount++;
        return obj.x + obj.y;
      };

      // Custom key generator that only considers x value
      const memoizedFn = memoizer.memoize(fn, (obj) => `x:${obj.x}`);

      const result1 = await memoizedFn({ x: 1, y: 2 });
      expect(result1).toBe(3);
      expect(callCount).toBe(1);

      // Different y value but same x should use cache
      const result2 = await memoizedFn({ x: 1, y: 5 });
      expect(result2).toBe(3); // Returns cached result
      expect(callCount).toBe(1);

      // Different x value should execute function
      const result3 = await memoizedFn({ x: 2, y: 2 });
      expect(result3).toBe(4);
      expect(callCount).toBe(2);
    });
  });

  describe("Cache Factory", () => {
    test("should create memory cache", () => {
      const cache = CacheFactory.createMemoryCache({ maxSize: 100 });
      expect(cache).toBeInstanceOf(MemoryCache);
    });

    test("should create tiered cache", () => {
      const cache = CacheFactory.createTieredCache();
      expect(cache).toBeInstanceOf(TieredCache);
    });

    test("should create memoizer", () => {
      const memoizer = CacheFactory.createMemoizer(50);
      expect(memoizer).toBeInstanceOf(Memoizer);
    });
  });

  describe("Cache with tags", () => {
    test("should delete entries by tag", async () => {
      const cache = new MemoryCache<string>();

      await cache.set("user:1", "John", { tags: ["user", "profile"] });
      await cache.set("user:2", "Jane", { tags: ["user", "profile"] });
      await cache.set("post:1", "Hello World", { tags: ["post"] });

      // Delete all user-tagged entries
      const deletedCount = await cache.deleteByTag("user");
      expect(deletedCount).toBe(2);

      expect(await cache.get("user:1")).toBeNull();
      expect(await cache.get("user:2")).toBeNull();
      expect(await cache.get("post:1")).toBe("Hello World");
    });
  });

  describe("Memory management", () => {
    test("should respect memory limits", async () => {
      // Create cache with small memory limit
      const cache = new MemoryCache<string>({ maxMemory: 200 }); // Increased limit

      // Add entries that would exceed memory limit
      await cache.set("key1", "a".repeat(50)); // ~100 bytes
      await cache.set("key2", "b".repeat(50)); // ~100 bytes
      await cache.set("key3", "c".repeat(50)); // Should trigger eviction to stay under limit

      const stats = cache.getStats();
      expect(stats.memory).toBeLessThanOrEqual(200);

      // At least one entry should remain (the logic evicts to 80% of max memory)
      const remainingKeys = await cache.keys();
      expect(remainingKeys.length).toBeGreaterThan(0);

      // Most recent entries should still be available
      expect(await cache.get("key3")).toBe("c".repeat(50));
    });
  });
});
