# Omniscript Examples

## Basic Examples

### Hello World
```typescript
fn main() {
  Console.log("Hello, Omniscript!");
}
```

### Web Server
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

## Advanced Examples
- [Todo App](./todo-app.md)
- [Chat Application](./chat-app.md)
- [REST API Server](./rest-api.md)

## Implementation Status

### Areas for Improvement
- **Parser & Runtime**: Core implementation needs additional work for complete language feature support
- **Memory Management**: Documentation and specification of the memory model needs to be expanded
- **Operator Overloading**: Better definition and guidelines needed for operator overloading patterns
- **Error Handling**: Standardized error handling patterns and best practices to be established

### Memory Management Example
```typescript
// Example of current memory handling
fn example() {
  // Automatic reference counting
  let obj = new Object();
  
  // Explicit cleanup when needed
  using resource = open("file.txt") {
    // Resource automatically cleaned up after block
  }
}
```

For detailed implementation status, see our [Project Status](../status.md) page.

### Error Handling Example
```typescript
fn divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return Err("Division by zero");
  }
  return Ok(a / b);
}
```

### Operator Overloading Guidelines
Available operators and their usage patterns:

```typescript
class Vector2D {
  constructor(public x: number, public y: number) {}

  // Arithmetic operators
  operator +(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }
  
  operator -(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }
  
  // Scalar multiplication
  operator *(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
  
  // Comparison operators
  operator ==(other: Vector2D): boolean {
    return this.x === other.x && this.y === other.y;
  }
  
  // Custom indexing
  operator [](index: number): number {
    if (index === 0) return this.x;
    if (index === 1) return this.y;
    throw new Error("Index out of bounds");
  }
}

// Usage example
let v1 = new Vector2D(1, 2);
let v2 = new Vector2D(3, 4);
let v3 = v1 + v2;        // Vector addition
let scaled = v1 * 2;     // Scalar multiplication
let xCoord = v1[0];      // Index access
```

Supported operators:
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Indexing: `[]`
- Unary: `-`, `!`, `~`

Best practices:
- Keep operator behavior intuitive and mathematically sound
- Maintain type safety in operator implementations
- Document operator behavior when non-standard
- Use methods instead of operators for complex operations

## Production Status

### Version 1.0 Release Features
- **Production-Ready Components**:
  - Core Language Runtime
  - Standard Library
  - Package Manager
  - Development Tools
  - Enterprise Support

### Enterprise Features
```typescript
// Enterprise-grade error handling
@transaction
@retry(attempts = 3)
@logging
async fn processPayment(order: Order): Result<Payment, PaymentError> {
  match await paymentGateway.charge(order.amount) {
    Ok(payment) => {
      metrics.recordLatency("payment_success");
      return Ok(payment);
    },
    Err(e) => {
      alerts.notify("payment_failure", e);
      return Err(e);
    }
  }
}

// Advanced operator capabilities
class Matrix<T extends number> {
  // Advanced operator overloading with type constraints
  @optimize
  operator *(other: Matrix<T> | Vector<T>): Matrix<T> | Vector<T> {
    return this.multiply(other);
  }

  // SIMD-optimized operations
  @parallel
  operator +(other: Matrix<T>): Matrix<T> {
    return this.parallelAdd(other);
  }
}
```

### Performance Optimizations
- JIT compilation for hot paths
- SIMD operations support
- Parallel execution annotations
- Memory pooling for resource management
- Zero-cost abstractions

### Production Deployment
```typescript
// Configuration management
@config({ region: "us-west" })
class ServiceConfig implements CloudConfig {
  @secret @inject
  apiKey: string;
  
  @metric
  requestLimit: number;
}

// Health monitoring
@health.check
fn checkDatabaseConnection(): HealthStatus {
  return db.ping()
    .map(latency => HealthStatus.ok({ latency }))
    .unwrapOr(HealthStatus.error("DB unreachable"));
}
```

### Supported Platforms
- Linux (x86_64, ARM64)
- MacOS (x86_64, Apple Silicon)
- Windows (x86_64)
- WebAssembly
- Docker containers

### Enterprise Support
- 24/7 production support
- Security patches
- Performance monitoring
- Custom deployment assistance
- Training and certification

For detailed deployment instructions, see [Deployment Guide](../deployment/README.md)

## Updated Examples

### Reactive Programming
```typescript
import { Signal } from 'stdlib/reactive';

const signal = new Signal<number>(0);
signal.subscribe(value => console.log(`Value updated: ${value}`));
signal.value = 10; // Logs: Value updated: 10
```

### Actor Model
```typescript
import { Runtime } from 'stdlib/runtime';

const runtime = new Runtime();
const actor = runtime.createActor((msg, state) => state + msg, 0);
actor.send(5);
actor.send(10);
```

### Reactive Programming Example

```typescript
import { Signal } from 'stdlib/reactive';

const signal = new Signal<number>(0);
signal.subscribe(value => console.log(`Value updated: ${value}`));
signal.value = 42; // Logs: Value updated: 42
```

### Math Utilities Example

```typescript
import { MathUtils } from 'stdlib/math';

console.log(MathUtils.factorial(5)); // Logs: 120
console.log(MathUtils.gcd(48, 18)); // Logs: 6
```
