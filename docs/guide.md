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
