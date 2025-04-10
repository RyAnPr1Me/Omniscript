# Omniscript Language Guide

## Introduction
Omniscript is a modern programming language designed for full-stack web development, combining the best features of TypeScript, Rust, and modern programming paradigms.

## Language Features

### Type System
```typescript
// Type inference
let x = 42;  // inferred as number
let s = "hello";  // inferred as string

// Explicit types
let numbers: number[] = [1, 2, 3];
let tuple: [string, number] = ["age", 25];

// Interfaces
interface User {
  id: number;
  name: string;
  email?: string;  // Optional property
}

// Generic Types
class Box<T> {
  constructor(private value: T) {}
  get(): T { return this.value; }
}
```

### Pattern Matching
```typescript
let result = match value {
  0 => "zero",
  n if n > 0 => "positive",
  n if n < 0 => "negative",
  _ => "unknown"
};

// Object pattern matching
match user {
  { name: "admin" } => handleAdmin(),
  { role: "user", id } => handleUser(id),
  _ => handleUnknown()
}
```

### Async/Await
```typescript
async fn fetchUserData(id: number): Promise<User> {
  let response = await HTTP.get(`/api/users/${id}`);
  return response.json();
}

async fn updateUser(id: number, data: Partial<User>): Promise<void> {
  await HTTP.put(`/api/users/${id}`, data);
}

async fn deleteUser(id: number): Promise<void> {
  await HTTP.delete(`/api/users/${id}`);
}

// Error handling
try {
  let user = await fetchUserData(123);
} catch (e) {
  Console.error("Failed to fetch user:", e);
}
```

### Decorators
```typescript
@component
class UserList {
  @state private users: User[] = [];
  
  @effect
  async loadUsers() {
    this.users = await db.users.findAll();
  }
  
  @computed
  get activeUsers() {
    return this.users.filter(u => u.active);
  }
}
```

### Operator Overloading
```typescript
class Vector2D {
  constructor(public x: number, public y: number) {}
  
  operator +(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }
  
  operator *(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
}
```

## Standard Library

### Collections
```typescript
import { List, Map, Set } from 'stdlib/collections';

let list = new List<number>();
list.push(1);
list.push(2);

let map = new Map<string, User>();
map.set("admin", adminUser);
```

### HTTP and Networking
```typescript
import { HTTP, WebSocket } from 'stdlib/network';

// REST API calls
let response = await HTTP.get('/api/data');
await HTTP.post('/api/users', { name: 'John' });

// WebSocket
let ws = new WebSocket('ws://example.com');
ws.onMessage(msg => Console.log(msg));
```

### Database Operations
```typescript
import { Database } from 'stdlib/database';

// Type-safe queries
let users = await db.users
  .where(u => u.age > 18)
  .orderBy(u => u.name)
  .take(10);

// Transactions
await Database.transaction(async () => {
  await db.users.insert(newUser);
  await db.logs.insert(auditLog);
});
```

## Package Management

### Installing Packages
```bash
omni add package-name
omni install
```

### Project Configuration
```json
{
  "name": "myproject",
  "version": "1.0.0",
  "dependencies": {
    "somelib": "^1.0.0"
  },
  "omniscript": {
    "stdlib": ["http", "database"],
    "plugins": ["myPlugin"]
  }
}
```

## Best Practices

1. Use type inference when possible
2. Prefer pattern matching over if-else chains
3. Use async/await for asynchronous operations
4. Implement proper error handling
5. Follow the principle of least privilege

## See Also
- [API Reference](./api/README.md)
- [Best Practices Guide](./best-practices.md)
- [Examples](./examples/README.md)

## Updated Features

### Debugging and Profiling
Omniscript now includes built-in support for debugging and profiling. Use the `enableDebugging` and `enableProfiler` methods to activate these features.

```typescript
HTTP.enableDebugging();
Database.enableProfiler();
```

## Debugging and Profiling
Omniscript provides built-in debugging and profiling tools to help developers optimize their applications.

### Debugging
Enable debugging to log detailed information about runtime operations:

```typescript
runtime.enableDebugMode();
```

### Profiling
Use the profiler to measure performance of specific code sections:

```typescript
runtime.scheduleCoroutine(async () => {
  console.time("Task");
  await someAsyncTask();
  console.timeEnd("Task");
});
```

## Advanced Features

### Parallel Execution
Omniscript supports parallel execution for computationally intensive tasks:

```typescript
runtime.enableParallelExecution();
```

### Reactive Programming
Reactive programming primitives like `Stream`, `Observable`, and `Signal` are now part of the standard library.

```typescript
const signal = new Signal(0);
signal.subscribe(value => console.log(value));
signal.value = 42; // Logs: 42
```

### Enhanced Memory Management
Omniscript introduces advanced memory management features, including garbage collection and circular reference detection.

```typescript
runtime.enableGarbageCollection();
runtime.detectCircularReferences();
```

### Actor Model
The runtime now supports the actor model for concurrent programming.

```typescript
const actor = runtime.createActor((msg, state) => state + msg, 0);
actor.send(1);
actor.send(2);
```

## Error Handling
Omniscript provides robust error handling mechanisms, including:

- Try/Catch blocks for synchronous and asynchronous errors.
- Pattern matching for error cases.
- Custom error types for specific scenarios.

### Example
```typescript
try {
  const result = await someAsyncOperation();
} catch (error) {
  if (error instanceof SpecificError) {
    handleSpecificError(error);
  } else {
    console.error("An unexpected error occurred:", error);
  }
}
```

## Memory Management
Omniscript includes advanced memory management features:

- **Garbage Collection**: Automatically reclaims unused memory.
- **Circular Reference Detection**: Identifies and resolves circular references.

### Example
```typescript
runtime.enableMemoryManagement();
```

## Advanced Memory Management

Omniscript provides advanced memory management features to optimize resource usage and prevent memory leaks. These include garbage collection, circular reference detection, and memory usage statistics.

### Garbage Collection
Garbage collection automatically reclaims unused memory. You can enable it in your application:

```typescript
runtime.enableGarbageCollection();
```

The garbage collector logs memory usage before and after execution:

```typescript
Running garbage collector...
Garbage collection completed. {
  before: { allocated: 10, references: 20 },
  after: { allocated: 5, references: 10 }
}
```

### Circular Reference Detection
Circular references can lead to memory leaks. Omniscript detects and logs circular references:

```typescript
runtime.detectCircularReferences();
```

Example output:

```plaintext
Detecting circular references...
Circular references detected: [Object1, Object2]
```

### Memory Usage Statistics
You can retrieve memory usage statistics at any time:

```typescript
const memoryUsage = runtime.getMemoryUsage();
console.log(memoryUsage);
// Output: { allocated: 5, references: 10 }
```

### Best Practices
- Enable garbage collection in long-running applications.
- Regularly check for circular references during development.
- Monitor memory usage to identify potential issues.

## Reactive Programming

Omniscript now includes reactive programming primitives for state management and event-driven programming.

### Stream
A `Stream` allows you to emit values to multiple subscribers.

```typescript
import { Stream } from 'stdlib/reactive';

const stream = new Stream<number>();

const unsubscribe = stream.subscribe(value => {
  console.log(`Received: ${value}`);
});

stream.next(42); // Logs: Received: 42
unsubscribe();
```

### Signal
A `Signal` is a reactive state container that notifies subscribers when its value changes.

```typescript
import { Signal } from 'stdlib/reactive';

const signal = new Signal<number>(0);
signal.subscribe(value => {
  console.log(`Value updated: ${value}`);
});

signal.value = 10; // Logs: Value updated: 10
```

## Math Utilities

The `MathUtils` class has been enhanced with additional utilities.

### New Methods
- `factorial(n: number): number` - Computes the factorial of a number.
- `gcd(a: number, b: number): number` - Computes the greatest common divisor of two numbers.

### Example
```typescript
import { MathUtils } from 'stdlib/math';

console.log(MathUtils.factorial(5)); // Logs: 120
console.log(MathUtils.gcd(48, 18)); // Logs: 6
```
