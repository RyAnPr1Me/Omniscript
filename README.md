# Omniscript

A modern programming language for full-stack development with first-class support for:
- Type safety and inference
- Async/await and concurrency
- Pattern matching
- Generic types
- Operator overloading
- Built-in database ORM
- Advanced decorator support
- JIT compilation and performance optimizations

## Quick Start

```bash
# Clone the repository directly from GitHub:
git clone https://github.com/RyAnPr1Me/omniscript.git
cd omniscript
npm install
npm run build       # Build the project (compiles TypeScript files into the dist/ folder)
npm link            # Link the CLI globally so the 'omni' command is available

# Create a new project (ensure omni CLI is in your PATH)
omni new myapp

# Run in development mode
omni dev
```

## Features

### Type-safe Full Stack Development
```typescript
// Single file for both frontend and backend
@component
class UserList {
  @state users: User[] = [];
  
  async loadUsers() {
    // Auto-synchronized between client/server
    this.users = await db.users.findAll();
  }
  
  render() {
    return <ul>
      {this.users.map(user => <li>{user.name}</li>)}
    </ul>;
  }
}
```

### Built-in Database ORM
```typescript
class User {
  @id id: number;
  @field name: string;
  @relation posts: Post[];
}

// Type-safe queries
const newUsers = await db.users
  .where(u => u.posts.length > 0)
  .orderBy(u => u.name)
  .take(10);
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

### Advanced Decorators
Omniscript supports powerful decorators for classes, methods, and properties.

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

### JIT Compilation and Performance Optimizations
Omniscript includes a Just-In-Time (JIT) compiler for optimized execution. Features include:
- SIMD operations for numerical computations
- Parallel execution for supported operations
- Memory pooling for resource management

### Standard Library
Omniscript provides a rich standard library for common tasks:
- **Collections**: List, Map, Set
- **Networking**: HTTP Client/Server, WebSocket
- **Database**: ORM with type-safe queries
- **Crypto**: Hashing and encryption
- **DateTime**: Utilities for date and time manipulation
- **Math**: Advanced mathematical functions
- **Threading**: Worker threads and thread pools

### Example: REST API
```typescript
import { HTTP, Database } from 'stdlib';

class User {
  @id id: number;
  @field name: string;
  @field email: string;
  @timestamp createdAt: DateTime;
}

const app = new HTTP.Server();

app.get("/users", async (req, res) => {
  const users = await Database.query<User>()
    .orderBy("createdAt", "desc")
    .take(10);
  res.json(users);
});

app.post("/users", async (req, res) => {
  const user = new User(req.body);
  await Database.save(user);
  res.status(201).json(user);
});

app.listen(3000);
```

## Documentation

- [Language Guide](docs/guide.md)
- [API Reference](docs/api/README.md)
- [Best Practices](docs/best-practices.md)
- [Examples](examples/README.md)

## Package Manager

Omniscript includes a built-in package manager for managing dependencies and enabling standard library modules.

```bash
# Add a package
omni add package-name

# Enable a standard library module
omni enable stdlib/http

# Install all dependencies
omni install
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details
