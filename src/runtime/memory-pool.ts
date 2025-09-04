import { debug } from "../debug";

export interface MemoryPoolOptions {
  initialSize: number;
  maxSize: number;
  objectType?: any;
  growthFactor?: number;
  enableGCIntegration?: boolean;
  gcThreshold?: number;
  enableDefragmentation?: boolean;
}

export class MemoryPool<T = any> {
  private pool: T[] = [];
  private allocated: Set<T> = new Set();
  private options: Required<MemoryPoolOptions>;
  private totalAllocated = 0;
  private totalReleased = 0;
  private lastGC = Date.now();
  private objectSizes = new Map<T, number>();

  constructor(options: MemoryPoolOptions) {
    this.options = {
      initialSize: options.initialSize,
      maxSize: options.maxSize,
      objectType: options.objectType || Object,
      growthFactor: options.growthFactor || 1.5,
      enableGCIntegration: options.enableGCIntegration || true,
      gcThreshold: options.gcThreshold || 0.8,
      enableDefragmentation: options.enableDefragmentation || true,
    };

    this.initialize();
    debug.info(
      "MemoryPool",
      `Enhanced memory pool initialized with ${this.options.initialSize} objects`,
    );
  }

  private initialize(): void {
    for (let i = 0; i < this.options.initialSize; i++) {
      this.pool.push(this.createObject());
    }
  }

  private createObject(): T {
    const ObjectType = this.options.objectType;

    // Handle different object types
    if (ObjectType === Array) {
      return [] as any;
    } else if (ObjectType === Object) {
      return {} as any;
    } else if (typeof ObjectType === "function") {
      return new ObjectType();
    } else {
      return {} as any;
    }
  }

  allocate(size?: number): T {
    let object: T;

    // Trigger GC if threshold is reached
    if (this.shouldTriggerGC()) {
      this.triggerGC();
    }

    if (this.pool.length > 0) {
      object = this.pool.pop()!;
    } else if (this.getTotalSize() < this.options.maxSize) {
      object = this.createObject();
      debug.debug("MemoryPool", "Creating new object as pool is empty");
    } else {
      // Try defragmentation before throwing error
      if (this.options.enableDefragmentation) {
        this.defragment();
        if (this.pool.length > 0) {
          object = this.pool.pop()!;
        } else {
          throw new Error("Memory pool exhausted: maximum size reached");
        }
      } else {
        throw new Error("Memory pool exhausted: maximum size reached");
      }
    }

    // Handle sized allocations (like arrays)
    if (size !== undefined && Array.isArray(object)) {
      (object as any).length = 0; // Clear array
      for (let i = 0; i < size; i++) {
        (object as any).push(undefined);
      }
      this.objectSizes.set(object, size);
    } else if (
      typeof object === "object" &&
      object !== null &&
      object.constructor === Object
    ) {
      // Only clear properties for plain objects, not instances of custom classes
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          delete (object as any)[key];
        }
      }
      this.objectSizes.set(object, 1);
    } else {
      this.objectSizes.set(object, 1);
    }

    this.allocated.add(object);
    this.totalAllocated++;

    debug.debug(
      "MemoryPool",
      `Allocated object (${this.allocated.size} active, ${this.pool.length} available)`,
    );
    return object;
  }

  release(object: T): void {
    if (!this.allocated.has(object)) {
      debug.warn(
        "MemoryPool",
        "Attempted to release object not allocated from this pool",
      );
      return;
    }

    this.allocated.delete(object);
    this.objectSizes.delete(object);
    this.totalReleased++;

    // Don't grow the pool beyond a reasonable size
    if (this.pool.length < this.options.maxSize / 2) {
      this.pool.push(object);
      debug.debug(
        "MemoryPool",
        `Released object back to pool (${this.allocated.size} active, ${this.pool.length} available)`,
      );
    } else {
      debug.debug(
        "MemoryPool",
        "Released object not returned to pool (pool at capacity)",
      );
    }
  }

  private shouldTriggerGC(): boolean {
    if (!this.options.enableGCIntegration) return false;

    const utilization = this.allocated.size / this.options.maxSize;
    const timeSinceLastGC = Date.now() - this.lastGC;

    return utilization > this.options.gcThreshold && timeSinceLastGC > 1000;
  }

  private triggerGC(): void {
    if (typeof global !== "undefined" && global.gc) {
      debug.debug("MemoryPool", "Triggering garbage collection");
      global.gc();
      this.lastGC = Date.now();
    }
  }

  private defragment(): void {
    debug.debug("MemoryPool", "Starting defragmentation");

    // Remove any objects from pool that might have been corrupted
    const originalPoolSize = this.pool.length;
    this.pool = this.pool.filter((obj) => {
      try {
        // Basic validity check
        return obj !== null && obj !== undefined;
      } catch {
        return false;
      }
    });

    const removed = originalPoolSize - this.pool.length;
    if (removed > 0) {
      debug.debug(
        "MemoryPool",
        `Defragmentation removed ${removed} corrupted objects`,
      );
    }
  }

  clear(): void {
    this.pool.length = 0;
    this.allocated.clear();
    this.initialize();
    debug.info("MemoryPool", "Memory pool cleared and reinitialized");
  }

  getStats() {
    const totalMemoryUsed = Array.from(this.objectSizes.values()).reduce(
      (sum, size) => sum + size,
      0,
    );

    return {
      available: this.pool.length,
      allocated: this.allocated.size,
      totalSize: this.getTotalSize(),
      maxSize: this.options.maxSize,
      totalAllocated: this.totalAllocated,
      totalReleased: this.totalReleased,
      utilization: this.allocated.size / this.options.maxSize,
      memoryUsed: totalMemoryUsed,
      averageObjectSize:
        this.allocated.size > 0 ? totalMemoryUsed / this.allocated.size : 0,
      gcEnabled: this.options.enableGCIntegration,
      defragmentationEnabled: this.options.enableDefragmentation,
      lastGC: this.lastGC,
    };
  }

  private getTotalSize(): number {
    return this.pool.length + this.allocated.size;
  }

  // Grow the pool if needed
  private grow(): void {
    const currentSize = this.getTotalSize();
    const newSize = Math.min(
      Math.floor(currentSize * this.options.growthFactor),
      this.options.maxSize,
    );

    const objectsToAdd = newSize - currentSize;

    for (let i = 0; i < objectsToAdd; i++) {
      this.pool.push(this.createObject());
    }

    debug.info("MemoryPool", `Pool grown to ${newSize} objects`);
  }
}

export class MemoryPoolManager {
  private pools: Map<string, MemoryPool> = new Map();

  createPool<T>(name: string, options: MemoryPoolOptions): MemoryPool<T> {
    if (this.pools.has(name)) {
      throw new Error(`Memory pool '${name}' already exists`);
    }

    const pool = new MemoryPool<T>(options);
    this.pools.set(name, pool);
    debug.info("MemoryPoolManager", `Created memory pool '${name}'`);

    return pool;
  }

  getPool(name: string): MemoryPool | undefined {
    return this.pools.get(name);
  }

  removePool(name: string): void {
    const pool = this.pools.get(name);
    if (pool) {
      pool.clear();
      this.pools.delete(name);
      debug.info("MemoryPoolManager", `Removed memory pool '${name}'`);
    }
  }

  getAllStats() {
    const stats: Record<string, any> = {};

    for (const [name, pool] of this.pools) {
      stats[name] = pool.getStats();
    }

    return stats;
  }

  clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
    debug.info("MemoryPoolManager", "Cleared all memory pools");
  }
}

// Export a default manager instance
export const memoryPoolManager = new MemoryPoolManager();
