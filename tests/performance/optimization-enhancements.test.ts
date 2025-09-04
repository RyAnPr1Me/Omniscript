import { 
  ConstantFolder, 
  InlineCache
} from "../../src/runtime/optimizer";
import { MemoryPool } from "../../src/runtime/memory-pool";

describe("Performance Optimization Enhancements", () => {
  describe("Enhanced Constant Folding", () => {
    let constantFolder: ConstantFolder;

    beforeEach(() => {
      constantFolder = new ConstantFolder();
    });

    test("should fold arithmetic operations", () => {
      const bytecode = [
        { type: "LOAD_CONST", value: 10 },
        { type: "LOAD_CONST", value: 5 },
        { type: "ADD" }
      ];

      const result = constantFolder.fold(bytecode);
      
      expect(result.optimized).toHaveLength(1);
      expect(result.optimized[0]).toEqual({ type: "LOAD_CONST", value: 15 });
      expect(result.optimizations).toContain("Folded constants: 10 + 5 = 15");
    });

    test("should fold power operations", () => {
      const bytecode = [
        { type: "LOAD_CONST", value: 2 },
        { type: "LOAD_CONST", value: 3 },
        { type: "POWER" }
      ];

      const result = constantFolder.fold(bytecode);
      
      expect(result.optimized).toHaveLength(1);
      expect(result.optimized[0]).toEqual({ type: "LOAD_CONST", value: 8 });
      expect(result.optimizations).toContain("Folded constants: 2 ** 3 = 8");
    });

    test("should fold bitwise operations", () => {
      const bytecode = [
        { type: "LOAD_CONST", value: 12 },
        { type: "LOAD_CONST", value: 7 },
        { type: "BITWISE_AND" }
      ];

      const result = constantFolder.fold(bytecode);
      
      expect(result.optimized).toHaveLength(1);
      expect(result.optimized[0]).toEqual({ type: "LOAD_CONST", value: 4 });
      expect(result.optimizations).toContain("Folded constants: 12 & 7 = 4");
    });

    test("should fold string concatenation", () => {
      const bytecode = [
        { type: "LOAD_CONST", value: "hello" },
        { type: "LOAD_CONST", value: " world" },
        { type: "ADD" }
      ];

      const result = constantFolder.fold(bytecode);
      
      expect(result.optimized).toHaveLength(1);
      expect(result.optimized[0]).toEqual({ type: "LOAD_CONST", value: "hello world" });
      expect(result.optimizations).toContain('Folded string concatenation: "hello" + " world" = "hello world"');
    });

    test("should fold unary operations", () => {
      const bytecode = [
        { type: "LOAD_CONST", value: -5 },
        { type: "ABS" }
      ];

      const result = constantFolder.fold(bytecode);
      
      expect(result.optimized).toHaveLength(1);
      expect(result.optimized[0]).toEqual({ type: "LOAD_CONST", value: 5 });
      expect(result.optimizations).toContain("Folded unary operation: abs(-5) = 5");
    });

    test("should handle division by zero safely", () => {
      const bytecode = [
        { type: "LOAD_CONST", value: 10 },
        { type: "LOAD_CONST", value: 0 },
        { type: "DIVIDE" }
      ];

      const result = constantFolder.fold(bytecode);
      
      // Should not fold division by zero
      expect(result.optimized).toHaveLength(3);
      expect(result.optimizations).toHaveLength(0);
    });
  });

  describe("Inline Cache", () => {
    let inlineCache: InlineCache;

    beforeEach(() => {
      inlineCache = new InlineCache();
    });

    test("should cache method lookups", () => {
      const obj = {
        testMethod() { return "test"; }
      };

      // First lookup - cache miss
      const method1 = inlineCache.lookupMethod(obj, "testMethod");
      expect(method1).toBe(obj.testMethod);

      const stats1 = inlineCache.getCacheStats();
      expect(stats1.hits).toBe(0);
      expect(stats1.misses).toBe(1);

      // Second lookup - cache hit
      const method2 = inlineCache.lookupMethod(obj, "testMethod");
      expect(method2).toBe(obj.testMethod);

      const stats2 = inlineCache.getCacheStats();
      expect(stats2.hits).toBe(1);
      expect(stats2.misses).toBe(1);
      expect(stats2.hitRate).toBe(50);
    });

    test("should handle different object types", () => {
      const array = [1, 2, 3];
      const object = { value: 42 };

      inlineCache.lookupMethod(array, "push");
      inlineCache.lookupMethod(object, "toString");

      const stats = inlineCache.getCacheStats();
      expect(stats.cacheSize).toBe(2);
    });

    test("should evict least recently used items when cache is full", () => {
      // Create many different objects to fill cache
      const objects = Array.from({ length: 1500 }, (_, i) => ({
        [`method${i}`]: () => i
      }));

      // Fill cache beyond capacity
      objects.forEach((obj, i) => {
        inlineCache.lookupMethod(obj, `method${i}`);
      });

      const stats = inlineCache.getCacheStats();
      expect(stats.evictions).toBeGreaterThan(0);
      expect(stats.cacheSize).toBeLessThanOrEqual(1000); // maxCacheSize
    });

    test("should clear cache", () => {
      const obj = { method: () => "test" };
      inlineCache.lookupMethod(obj, "method");
      
      expect(inlineCache.getCacheStats().cacheSize).toBe(1);
      
      inlineCache.clearCache();
      
      const stats = inlineCache.getCacheStats();
      expect(stats.cacheSize).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe("Enhanced Memory Pool", () => {
    test("should integrate with garbage collection", () => {
      const pool = new MemoryPool({
        initialSize: 10,
        maxSize: 100,
        enableGCIntegration: true,
        gcThreshold: 0.8
      });

      // Allocate many objects to trigger GC threshold
      const objects = [];
      for (let i = 0; i < 85; i++) {
        objects.push(pool.allocate());
      }

      const stats = pool.getStats();
      expect(stats.gcEnabled).toBe(true);
      expect(stats.utilization).toBeGreaterThan(0.8);
    });

    test("should perform defragmentation", () => {
      const pool = new MemoryPool({
        initialSize: 10,
        maxSize: 20,
        enableDefragmentation: true
      });

      // Fill the pool
      const objects = [];
      for (let i = 0; i < 20; i++) {
        objects.push(pool.allocate());
      }

      // Release some objects
      for (let i = 0; i < 10; i++) {
        pool.release(objects[i]);
      }

      // Try to allocate beyond remaining capacity
      // This should trigger defragmentation
      const newObj = pool.allocate();
      expect(newObj).toBeDefined();

      const stats = pool.getStats();
      expect(stats.defragmentationEnabled).toBe(true);
    });

    test("should track memory usage", () => {
      const pool = new MemoryPool({
        initialSize: 5,
        maxSize: 50,
        objectType: Array
      });

      // Allocate arrays of different sizes
      const array1 = pool.allocate(10);
      const array2 = pool.allocate(20);
      const array3 = pool.allocate(5);

      const stats = pool.getStats();
      expect(stats.memoryUsed).toBe(35); // 10 + 20 + 5
      expect(stats.averageObjectSize).toBe(35 / 3);
      expect(stats.allocated).toBe(3);
    });

    test("should provide comprehensive statistics", () => {
      const pool = new MemoryPool({
        initialSize: 5,
        maxSize: 50,
        enableGCIntegration: true,
        enableDefragmentation: true
      });

      const obj = pool.allocate();
      pool.release(obj);

      const stats = pool.getStats();
      expect(stats).toHaveProperty('available');
      expect(stats).toHaveProperty('allocated');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('totalAllocated');
      expect(stats).toHaveProperty('totalReleased');
      expect(stats).toHaveProperty('utilization');
      expect(stats).toHaveProperty('memoryUsed');
      expect(stats).toHaveProperty('averageObjectSize');
      expect(stats).toHaveProperty('gcEnabled');
      expect(stats).toHaveProperty('defragmentationEnabled');
      expect(stats).toHaveProperty('lastGC');

      expect(stats.gcEnabled).toBe(true);
      expect(stats.defragmentationEnabled).toBe(true);
      expect(stats.totalAllocated).toBe(1);
      expect(stats.totalReleased).toBe(1);
    });
  });
});