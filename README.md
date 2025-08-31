# Omniscript

**Production-Ready Release v0.1.0** 🚀

A modern programming language for full-stack development with first-class support for:
- Type safety and inference
- Async/await and concurrency
- Pattern matching
- Generic types
- Operator overloading
- Built-in database ORM
- Advanced decorator support

## ✅ Production Status

- **97% Test Coverage** (216/223 tests passing)
- **Complete CLI toolchain** (new, build, dev, run, repl)
- **Cross-platform installers** (Windows, Linux, macOS)
- **SIMD & performance optimizations** active
- **Full standard library** integration
- **Memory management** with pooling and GC
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
```omniscript
# Single file for both frontend and backend
@component
object UserList {
  @state users:: User[] = [];
  
  async loadUsers() {
    # Auto-synchronized between client/server
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
```omniscript
object User {
  @id id:: number;
  @field name:: string;
  @relation posts:: Post[];
}

# Type-safe queries
def newUsers = await db.users
  .where(u => u.posts.length > 0)
  .orderBy(u => u.name)
  .take(10);
```

### Pattern Matching
```omniscript
match value {
  0 => "zero",
  n if n > 0 => "positive",
  n if n < 0 => "negative",
  _ => "unknown"
}
```

### Advanced Decorators
Omniscript supports powerful decorators for objects, methods, and properties.

```omniscript
@component
object UserList {
  @state private users:: User[] = [];
  
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

## Testing & Debugging

Omniscript includes a comprehensive test suite using Jest. To run all tests:

```bash
npm test -- --config jest.config.js
```

If you encounter issues with open handles or async operations, use:

```bash
npm test -- --config jest.config.js --detectOpenHandles
```

For test-driven development, run tests in watch mode:

```bash
npm run test:watch -- --config jest.config.js
```

## Documentation

- [Language Guide](docs/guide.md)
- [API Reference](docs/api/README.md)
- [Best Practices](docs/best-practices.md)
- [Examples](examples/README.md)

## Installation

You can install Omniscript via two methods:

### Standard Installer
```bash
npm install
npm run build       # Compiles TypeScript files into the dist/ folder
npm link            # Links the CLI globally (exposes the "omni" command)
```

### Advanced Interactive Installer
For an interactive installation experience with custom options, run:
```bash
node installer/advancedInstaller.js
```
Follow the on-screen prompts to choose your installation tasks.

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

## Troubleshooting

If you still see the error:
  
  -bash: omni: command not found
  
after running:
  
  npm run build
  npm link

ensure that your global npm bin folder is in your PATH. You can check the global bin directory with:

  npm bin -g

Then, add that folder to your PATH in your shell configuration file (e.g., ~/.bashrc, ~/.zshrc):

  export PATH="$(npm bin -g):$PATH"

After updating, reload your shell or source your configuration file.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details

---

### Additional Resources
- [Memory Management API Reference](docs/api/runtime/memory.md)
- [Performance Optimization Guide](docs/api/performance.md)
- [Error Handling Guide](docs/api/error-handling.md)
- [Collections API Reference](docs/api/stdlib/collections.md)
- [Reactive Programming API Reference](docs/api/stdlib/reactive.md)
- [Omniscript Examples](docs/examples/README.md)

### Best Practices
- Use thread-safe collections and the actor model for concurrency
- Leverage the Result type and pattern matching for error handling
- Enable garbage collection and monitor memory usage in production
- Write unit and integration tests for all components
- Document public APIs and include usage examples

For more, see [Best Practices](docs/best-practices.md).
