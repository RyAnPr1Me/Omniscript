import { Runtime } from "../../src/runtime";
import { MemoryPool, MemoryPoolManager } from "../../src/runtime/memory-pool";

describe("Runtime - Memory Pool", () => {
  let runtime: Runtime;
  let poolManager: MemoryPoolManager;

  beforeEach(() => {
    runtime = new Runtime();
    poolManager = new MemoryPoolManager();
  });

  describe("Memory Pool Basic Operations", () => {
    it("should create and allocate from a memory pool", () => {
      const pool = poolManager.createPool<object>("test", {
        initialSize: 5,
        maxSize: 10,
        objectType: Object,
      });

      const obj = pool.allocate();
      expect(obj).toBeDefined();
      expect(typeof obj).toBe("object");

      const stats = pool.getStats();
      expect(stats.allocated).toBe(1);
      expect(stats.available).toBe(4);
    });

    it("should release objects back to pool", () => {
      const pool = poolManager.createPool<object>("test", {
        initialSize: 3,
        maxSize: 10,
        objectType: Object,
      });

      const obj = pool.allocate();
      expect(pool.getStats().allocated).toBe(1);
      expect(pool.getStats().available).toBe(2);

      pool.release(obj);
      expect(pool.getStats().allocated).toBe(0);
      expect(pool.getStats().available).toBe(3);
    });

    it("should handle array allocation with size", () => {
      const pool = poolManager.createPool<number[]>("arrays", {
        initialSize: 2,
        maxSize: 5,
        objectType: Array,
      });

      const arr = pool.allocate(5);
      expect(Array.isArray(arr)).toBe(true);
      expect(arr).toHaveLength(5);
      expect(arr.every((item) => item === undefined)).toBe(true);
    });

    it("should clear object properties on allocation", () => {
      const pool = poolManager.createPool<any>("objects", {
        initialSize: 1,
        maxSize: 5,
        objectType: Object,
      });

      const obj = pool.allocate();
      obj.testProperty = "test";
      obj.anotherProperty = 123;

      pool.release(obj);

      const reusedObj = pool.allocate();
      expect(reusedObj.testProperty).toBeUndefined();
      expect(reusedObj.anotherProperty).toBeUndefined();
    });
  });

  describe("Memory Pool Limits", () => {
    it("should throw error when pool is exhausted", () => {
      const pool = poolManager.createPool("limited", {
        initialSize: 2,
        maxSize: 2,
        objectType: Object,
      });

      pool.allocate();
      pool.allocate();

      expect(() => pool.allocate()).toThrow(
        "Memory pool exhausted: maximum size reached",
      );
    });

    it("should not grow pool beyond max capacity when releasing", () => {
      const pool = poolManager.createPool("test", {
        initialSize: 1,
        maxSize: 2,
        objectType: Object,
      });

      // Fill the pool to max capacity
      const obj1 = pool.allocate();
      const obj2 = pool.allocate();

      // Release both objects
      pool.release(obj1);
      pool.release(obj2);

      const stats = pool.getStats();
      expect(stats.available).toBeLessThanOrEqual(1); // Should not exceed reasonable limit
    });
  });

  describe("Memory Pool Manager", () => {
    it("should create and retrieve pools by name", () => {
      const pool = poolManager.createPool("myPool", {
        initialSize: 3,
        maxSize: 10,
        objectType: Object,
      });

      const retrieved = poolManager.getPool("myPool");
      expect(retrieved).toBe(pool);
    });

    it("should throw error when creating duplicate pools", () => {
      poolManager.createPool("duplicate", {
        initialSize: 1,
        maxSize: 5,
        objectType: Object,
      });

      expect(() => {
        poolManager.createPool("duplicate", {
          initialSize: 1,
          maxSize: 5,
          objectType: Object,
        });
      }).toThrow("Memory pool 'duplicate' already exists");
    });

    it("should remove pools", () => {
      poolManager.createPool("toRemove", {
        initialSize: 1,
        maxSize: 5,
        objectType: Object,
      });

      expect(poolManager.getPool("toRemove")).toBeDefined();

      poolManager.removePool("toRemove");
      expect(poolManager.getPool("toRemove")).toBeUndefined();
    });

    it("should get stats for all pools", () => {
      poolManager.createPool("pool1", {
        initialSize: 2,
        maxSize: 5,
        objectType: Object,
      });

      poolManager.createPool("pool2", {
        initialSize: 3,
        maxSize: 8,
        objectType: Array,
      });

      const allStats = poolManager.getAllStats();

      expect(allStats).toHaveProperty("pool1");
      expect(allStats).toHaveProperty("pool2");
      expect(allStats.pool1.available).toBe(2);
      expect(allStats.pool2.available).toBe(3);
    });

    it("should clear all pools", () => {
      poolManager.createPool("pool1", {
        initialSize: 1,
        maxSize: 5,
        objectType: Object,
      });
      poolManager.createPool("pool2", {
        initialSize: 1,
        maxSize: 5,
        objectType: Array,
      });

      poolManager.clearAll();

      const stats1 = poolManager.getPool("pool1")?.getStats();
      const stats2 = poolManager.getPool("pool2")?.getStats();

      expect(stats1?.allocated).toBe(0);
      expect(stats2?.allocated).toBe(0);
    });
  });

  describe("Runtime Memory Pool Integration", () => {
    it("should create memory pools through runtime", () => {
      const pool = runtime.createMemoryPool("runtime-pool", 5, 15, Object);

      expect(pool).toBeDefined();
      expect(pool.getStats().available).toBe(5);
      expect(pool.getStats().maxSize).toBe(15);
    });

    it("should retrieve memory pools through runtime", () => {
      runtime.createMemoryPool("runtime-pool", 3, 10, Array);

      const pool = runtime.getMemoryPool("runtime-pool");
      expect(pool).toBeDefined();
      expect(pool?.getStats().available).toBe(3);
    });

    it("should get memory pool stats through runtime", () => {
      runtime.createMemoryPool("pool1", 2, 5, Object);
      runtime.createMemoryPool("pool2", 3, 8, Array);

      const stats = runtime.getMemoryPoolStats();

      expect(stats).toHaveProperty("pool1");
      expect(stats).toHaveProperty("pool2");
      expect(stats.pool1.available).toBe(2);
      expect(stats.pool2.available).toBe(3);
    });

    it("should have default pools initialized", () => {
      const stats = runtime.getMemoryPoolStats();

      expect(stats).toHaveProperty("objects");
      expect(stats).toHaveProperty("arrays");
      expect(stats).toHaveProperty("buffers");

      expect(stats.objects.available).toBe(100);
      expect(stats.arrays.available).toBe(50);
      expect(stats.buffers.available).toBe(20);
    });
  });

  describe("Memory Pool Statistics", () => {
    it("should track allocation and release statistics", () => {
      const pool = poolManager.createPool("stats-test", {
        initialSize: 2,
        maxSize: 5,
        objectType: Object,
      });

      const obj1 = pool.allocate();
      const obj2 = pool.allocate();

      let stats = pool.getStats();
      expect(stats.totalAllocated).toBe(2);
      expect(stats.totalReleased).toBe(0);
      expect(stats.allocated).toBe(2);

      pool.release(obj1);

      stats = pool.getStats();
      expect(stats.totalAllocated).toBe(2);
      expect(stats.totalReleased).toBe(1);
      expect(stats.allocated).toBe(1);
    });

    it("should calculate utilization correctly", () => {
      const pool = poolManager.createPool("utilization-test", {
        initialSize: 0,
        maxSize: 10,
        objectType: Object,
      });

      const obj1 = pool.allocate();
      const obj2 = pool.allocate();

      const stats = pool.getStats();
      expect(stats.utilization).toBe(0.2); // 2/10 = 0.2
    });
  });

  describe("Different Object Types", () => {
    it("should handle Float32Array allocation", () => {
      const pool = poolManager.createPool<Float32Array>("float-arrays", {
        initialSize: 2,
        maxSize: 5,
        objectType: Float32Array,
      });

      const buffer = pool.allocate();
      expect(buffer).toBeInstanceOf(Float32Array);
    });

    it("should handle custom class allocation", () => {
      class TestClass {
        value: number = 42;
      }

      const pool = poolManager.createPool<TestClass>("custom-class", {
        initialSize: 1,
        maxSize: 3,
        objectType: TestClass,
      });

      const instance = pool.allocate();
      expect(instance).toBeInstanceOf(TestClass);
      expect(instance.value).toBe(42);
    });
  });
});
