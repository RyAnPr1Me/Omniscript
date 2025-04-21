# Memory Management API Reference

## Overview
Omniscript provides advanced memory management features including garbage collection, reference counting, circular reference detection, and memory profiling capabilities.

## Memory Management API

### Garbage Collection
```typescript
class Runtime {
  // Enable garbage collection with custom options
  enableGarbageCollection(options?: GCOptions): void;

  // Run garbage collector manually
  runGarbageCollector(): void;

  // Get current memory usage statistics
  getMemoryUsage(): MemoryStats;

  // Configure garbage collection behavior
  setGCOptions(options: GCOptions): void;
}

interface GCOptions {
  interval?: number;      // GC interval in milliseconds
  threshold?: number;     // Memory threshold to trigger GC
  aggressive?: boolean;   // Use aggressive collection
  generations?: number;   // Number of GC generations
}

interface MemoryStats {
  allocated: number;      // Total allocated memory
  used: number;          // Actually used memory
  available: number;     // Available memory
  collections: number;   // Number of GC runs
  lastCollection: Date;  // Timestamp of last GC
}
```

### Reference Counting
The runtime automatically tracks object references:

```typescript
// Objects are automatically reference counted
const obj = new Object();
runtime.allocate(obj);  // Reference count: 1

const ref = obj;        // Reference count: 2
runtime.release(obj);   // Reference count: 1

// WeakRef support
const weakRef = new WeakRef(obj);
```

### Circular References
Advanced circular reference detection and handling:

```typescript
// Enable circular reference detection
runtime.detectCircularReferences({
  aggressive: true,      // Aggressive detection
  maxDepth: 10,         // Maximum object depth
  ignoreWeakRefs: true  // Ignore weak references
});

// Example output:
// Circular reference detected:
// obj1 -> obj2 -> obj3 -> obj1
```

### Memory Profiling
Comprehensive memory profiling capabilities:

```typescript
// Start memory profiling
runtime.startMemoryProfile();

// Take memory snapshot
const snapshot = runtime.takeMemorySnapshot();

// Get memory leaks report
const leaks = runtime.detectMemoryLeaks();

// Get allocation tracking
const allocations = runtime.getAllocationProfile();
```

## Best Practices

### Memory Usage Monitoring
Monitor memory usage regularly in production:

```typescript
const MEMORY_THRESHOLD = 1000;
const COLLECTION_INTERVAL = 60000; // 1 minute

function monitorMemoryUsage() {
  setInterval(() => {
    const stats = runtime.getMemoryUsage();
    if (stats.used > MEMORY_THRESHOLD) {
      runtime.runGarbageCollector();
      console.log('GC triggered:', stats);
    }
  }, COLLECTION_INTERVAL);
}
```

### Resource Cleanup
Use automatic resource cleanup with the 'using' statement:

```typescript
// Files are automatically closed
using (file = File.open("data.txt")) {
  await file.write(data);
}

// Database connections are automatically closed
using (db = Database.connect(connectionString)) {
  await db.query(sql);
}
```

### Memory Leaks Prevention
1. Enable garbage collection for long-running applications
2. Monitor reference counts for critical objects
3. Run circular reference detection in development
4. Use weak references for caches
5. Clean up event listeners and subscriptions
6. Implement proper disposal patterns

### Performance Optimization
Configure memory settings for optimal performance:

```typescript
{
  "runtime": {
    "memory": {
      "gcInterval": 10000,    // Run GC every 10 seconds
      "gcThreshold": 1000,    // Run GC when allocated > 1000MB
      "gcGenerations": 3,     // Use generational GC
      "weakReferences": true, // Enable weak reference support
      "profiling": {
        "enabled": true,
        "stackTraces": true,
        "allocationSites": true
      }
    }
  }
}
```

## Error Handling
Memory-related operations use the Result type:

```typescript
try {
  // Allocate memory
  const result = await runtime.allocate(size);
  if (result.isErr()) {
    console.error("Memory allocation failed:", result.error);
    return;
  }

  // Use allocated memory
  const memory = result.unwrap();
  
} catch (error) {
  // Handle unexpected errors
  console.error("Memory operation failed:", error);
}
```

## Memory Events
Subscribe to memory-related events:

```typescript
// Listen for low memory warnings
runtime.on('lowMemory', (stats) => {
  console.warn('Low memory warning:', stats);
});

// Listen for GC events
runtime.on('beforeGC', () => {
  console.log('GC starting...');
});

runtime.on('afterGC', (stats) => {
  console.log('GC completed:', stats);
});
```

## Advanced Features

### Memory Snapshots
Take and compare memory snapshots:

```typescript
// Take initial snapshot
const snapshot1 = runtime.takeMemorySnapshot();

// Run some code
performOperations();

// Take another snapshot
const snapshot2 = runtime.takeMemorySnapshot();

// Compare snapshots
const diff = runtime.compareSnapshots(snapshot1, snapshot2);
console.log('Memory changes:', diff);
```

### Heap Analysis
Analyze heap usage and object retention:

```typescript
// Get heap statistics
const heapStats = runtime.analyzeHeap({
  detailed: true,
  retentionAnalysis: true
});

// Get object retention paths
const retentionPaths = runtime.findRetentionPaths(object);
```

### Memory Pools
Use memory pools for frequent allocations:

```typescript
// Create a memory pool
const pool = runtime.createMemoryPool({
  initialSize: 1024,
  maxSize: 4096,
  objectType: Float32Array
});

// Allocate from pool
const buffer = pool.allocate(256);

// Return to pool
pool.release(buffer);
```

## See Also
- [Performance Optimization Guide](../performance.md)
- [Resource Management Guide](../resources.md)
- [Configuration Guide](../config.md)
- [Error Handling Guide](../error-handling.md)
- [Profiling Guide](../profiling.md)