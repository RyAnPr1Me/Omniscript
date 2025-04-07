# Omniscript

A modern programming language for full-stack development with first-class support for:
- Type safety and inference
- Async/await and concurrency
- Pattern matching
- Generic types
- Operator overloading

## Quick Start

```bash
# Install Omniscript
curl -fsSL https://get.omniscript.dev | sh

# Create a new project
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

### Standard Library
- Collections (List, Map, Set)
- HTTP Client/Server
- Database Connections
- Crypto Operations
- DateTime Utilities
- Math Functions
- Threading Support

## Documentation

- [Language Guide](docs/guide.md)
- [API Reference](docs/api/README.md)
- [Best Practices](docs/best-practices.md)
- [Examples](examples/README.md)

## Package Manager

```bash
# Add package
omni add package-name

# Enable stdlib module
omni enable stdlib/http

# Install all dependencies
omni install
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE) for details