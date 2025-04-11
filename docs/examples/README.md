# Omniscript Examples

## Core Features

### Memory Management
```typescript
// Enable memory management features
runtime.enableMemoryManagement();

// Monitor memory usage
setInterval(() => {
  const usage = runtime.getMemoryUsage();
  console.log("Memory stats:", usage);
}, 10000);

// Detect circular references
runtime.detectCircularReferences();
```

### Reactive Programming
```typescript
// Event streams
const clicks = new Stream<MouseEvent>();
clicks.subscribe(event => {
  console.log(`Clicked at: ${event.x}, ${event.y}`);
});

// Reactive state
const counter = new Signal<number>(0);
counter.subscribe(value => {
  console.log(`Counter: ${value}`);
});

// Derived state
const doubled = derived(counter, n => n * 2);
doubled.subscribe(value => {
  console.log(`Doubled: ${value}`);
});
```

### Actor Model
```typescript
// Create a stateful counter actor
const counter = runtime.createActor(
  (msg: "increment" | "decrement", state: number) => {
    switch (msg) {
      case "increment": return state + 1;
      case "decrement": return state - 1;
    }
  },
  0 // Initial state
);

// Send messages
counter.send("increment"); // State: 1
counter.send("increment"); // State: 2
counter.send("decrement"); // State: 1
```

### Thread-Safe Collections
```typescript
// Thread-safe list
const list = new List<number>();
await list.push(1);
await list.push(2);

// Thread-safe map
const cache = new Map<string, User>();
await cache.set("user1", { id: 1, name: "John" });
const user = await cache.get("user1");
```

### Math Operations
```typescript
import { MathUtils } from 'stdlib/math';

// Constants
console.log(MathUtils.PI);  // 3.141592653589793
console.log(MathUtils.E);   // 2.718281828459045

// Functions
console.log(MathUtils.factorial(5));  // 120
console.log(MathUtils.gcd(48, 18));   // 6
```

## Web Development

### HTTP Server
```typescript
import { HTTP } from 'stdlib/network';

const app = new HTTP.Server();

app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.listen(3000);
```

### Database Operations
```typescript
import { Database } from 'stdlib/database';

interface User {
  id: number;
  name: string;
}

async fn getUsers(): Promise<User[]> {
  return await Database.query<User>()
    .where(u => u.active)
    .orderBy(u => u.name)
    .take(10);
}
```

### WebSocket Example
```typescript
import { WebSocket } from 'stdlib/network';

const ws = new WebSocket('ws://example.com');
ws.onMessage(msg => Console.log(msg));
```

## Error Handling

### Using Result Type
```typescript
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return Result.Err(new Error("Division by zero"));
  }
  return Result.Ok(a / b);
}

const result = divide(10, 2);
if (result.isOk()) {
  console.log(result.unwrap());
} else {
  console.error(result.unwrapErr());
}
```

### Pattern Matching
```typescript
match user {
  { role: "admin" } => handleAdmin(),
  { role: "user", id } => handleUser(id),
  _ => handleUnknown()
}
```

## Testing Examples

### Unit Testing
```typescript
describe('MathUtils', () => {
  test('factorial computes correct value', () => {
    expect(MathUtils.factorial(5)).toBe(120);
  });

  test('gcd finds greatest common divisor', () => {
    expect(MathUtils.gcd(48, 18)).toBe(6);
  });
});
```

### Reactive Testing
```typescript
describe('Signal', () => {
  test('notifies subscribers on value change', () => {
    const signal = new Signal<number>(0);
    const mockFn = jest.fn();
    
    signal.subscribe(mockFn);
    signal.value = 42;
    
    expect(mockFn).toHaveBeenCalledWith(42);
  });
});
```

## Implementation Status

### Core Features
✅ Memory Management
✅ Reactive Programming
✅ Actor Model
✅ Thread-Safe Collections
✅ Pattern Matching
✅ Error Handling

### Standard Library
✅ Math Utilities
✅ HTTP Client/Server
✅ WebSocket Support
✅ Database Operations
✅ Threading Support

### Development Tools
✅ Memory Profiling
✅ Garbage Collection
✅ Circular Reference Detection
✅ Performance Monitoring

For detailed implementation status, see our [Project Status](../status.md) page.
