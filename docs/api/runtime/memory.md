# Memory Management API Reference

## Overview
Omniscript provides advanced memory management features including garbage collection, reference counting, and circular reference detection.

## Memory Management API

### Garbage Collection
```typescript
class Runtime {
  // Enable garbage collection
  enableGarbageCollection(): void;

  // Run garbage collector manually
  runGarbageCollector(): void;

  // Get current memory usage statistics
  getMemoryUsage(): { allocated: number; references: number };
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
```

### Circular References
Detect and handle circular references:

```typescript
// Enable circular reference detection
runtime.detectCircularReferences();

// Example output:
// Detecting circular references...
// Circular references detected: [Object1, Object2]
```

## Best Practices

### Memory Usage Monitoring
Monitor memory usage regularly in production:

```typescript
const MEMORY_THRESHOLD = 1000;

function checkMemoryUsage() {
  const usage = runtime.getMemoryUsage();
  if (usage.allocated > MEMORY_THRESHOLD) {
    runtime.runGarbageCollector();
  }
}
```

### Resource Cleanup
Use the `using` statement for automatic resource cleanup:

```typescript
using resource = open("file.txt") {
  // Resource automatically cleaned up after block
}
```

### Memory Leaks Prevention
1. Enable garbage collection in long-running applications
2. Monitor reference counts for critical objects
3. Run circular reference detection in development
4. Use weak references for caches
5. Clean up event listeners and subscriptions

### Performance Optimization
```typescript
// Configure garbage collection settings
{
  "runtime": {
    "memory": {
      "gcInterval": 10000,    // Run GC every 10 seconds
      "threshold": 1000,      // Run GC when allocated > 1000
      "weakReferences": true  // Enable weak reference support
    }
  }
}
```

## Error Handling
Memory-related operations use the Result type:

```typescript
try {
  runtime.allocate(resource);
} catch (error) {
  console.error("Memory allocation failed:", error);
}
```

## See Also
- [Performance Guide](../performance.md)
- [Resource Management](../resources.md)
- [Configuration](../config.md)