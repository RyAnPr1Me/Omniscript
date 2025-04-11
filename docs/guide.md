# Omniscript Language Guide

## Introduction
Omniscript is a modern programming language designed for full-stack web development, combining type safety, memory management, and reactive programming features.

## Runtime Features

### Memory Management
```typescript
// Enable garbage collection
runtime.enableGarbageCollection();

// Monitor memory usage
const usage = runtime.getMemoryUsage();
console.log(usage); // { allocated: 5, references: 10 }

// Detect circular references
runtime.detectCircularReferences();
```

### Actor Model
```typescript
const runtime = new Runtime();

// Create an actor with state
const counter = runtime.createActor((msg: number, state: number) => state + msg, 0);

// Send messages
counter.send(1);
counter.send(2);
```

### Coroutines
```typescript
runtime.scheduleCoroutine(async () => {
  console.time("Task");
  await someAsyncTask();
  console.timeEnd("Task");
});
```

## Language Features

### Type System
```typescript
// Type inference
let x = 42;  // inferred as number
let s = "hello";  // inferred as string

// Generic types
class Box<T> {
  constructor(private value: T) {}
  get(): T { return this.value; }
}
```

### Pattern Matching
```typescript
match value {
  0 => "zero",
  n if n > 0 => "positive",
  n if n < 0 => "negative",
  _ => "unknown"
}
```

### Error Handling
```typescript
// Using Result type
fn divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return Result.Err(new Error("Division by zero"));
  }
  return Result.Ok(a / b);
}

// Usage
const result = divide(10, 2);
if (result.isOk()) {
  console.log(result.unwrap());
} else {
  console.error(result.unwrapErr());
}
```

## Standard Library

### Reactive Programming
```typescript
// Stream for event-based programming
const stream = new Stream<number>();
const unsubscribe = stream.subscribe(value => {
  console.log(`Received: ${value}`);
});
stream.next(42);
unsubscribe();

// Signal for reactive state
const signal = new Signal<number>(0);
signal.subscribe(value => {
  console.log(`Value updated: ${value}`);
});
signal.value = 42; // Logs: Value updated: 42
```

### Thread-Safe Collections
```typescript
// Thread-safe List
const list = new List<number>();
await list.push(1);
await list.push(2);
const items = await list.filter(n => n > 1);

// Thread-safe Map
const cache = new Map<string, number>();
await cache.set("key", 42);
const value = await cache.get("key");
```

### Math Utilities
```typescript
import { MathUtils } from 'stdlib/math';

// Mathematical constants
console.log(MathUtils.PI);  // 3.141592653589793
console.log(MathUtils.E);   // 2.718281828459045

// Mathematical functions
console.log(MathUtils.factorial(5));  // 120
console.log(MathUtils.gcd(48, 18));   // 6
console.log(MathUtils.random(1, 10)); // Random number between 1 and 10
```

## Development Tools

### Debugging
```typescript
// Enable debug mode
runtime.enableDebugMode();

// Memory profiling
runtime.enableMemoryManagement();
```

### Package Management
```bash
# Add a package
omni add package-name

# Enable a standard library module
omni enable stdlib/http

# Install all dependencies
omni install
```

## Best Practices

1. Use the Result type for error handling
2. Enable garbage collection in long-running applications
3. Use thread-safe collections for concurrent access
4. Leverage reactive programming for state management
5. Use async/await with proper error handling
6. Monitor memory usage in production applications

## See Also
- [API Reference](./api/README.md)
- [Best Practices](./best-practices.md)
- [Examples](./examples/README.md)
