# Omniscript

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![npm version](https://img.shields.io/badge/npm-2.1.0-blue)](https://www.npmjs.com/package/omniscript)
[![Tests](https://img.shields.io/badge/tests-782%20passing-success)](https://github.com/RyAnPr1Me/Omniscript)

A modern, production-ready programming language for full-stack development with advanced type safety, async/await, pattern matching, and built-in ORM capabilities.

## ✨ Features

### Language Features
- **🔒 Advanced Type System** - Strong typing with inference, generics, and union/intersection types
- **⚡ Async/Await** - First-class asynchronous programming support
- **🎯 Pattern Matching** - Powerful pattern matching and destructuring
- **🎨 Decorators** - Component, state, effect, and computed decorators
- **⚙️ Operator Overloading** - Custom operator implementations
- **🔄 Reactive Programming** - Built-in reactive features for modern UIs

### Developer Experience
- **📦 Complete CLI Toolchain** - `new`, `build`, `dev`, `run`, `repl` commands
- **🔧 VS Code Extension** - Full IDE support with syntax highlighting and debugging
- **🏗️ Project Scaffolding** - Professional project structure generation
- **🔥 Hot Reloading** - Modern development workflow
- **📚 Comprehensive Documentation** - Extensive guides and API references

### Runtime & Performance
- **⚡ JIT Compilation** - Optimized execution with just-in-time compilation
- **🚀 SIMD Operations** - Hardware-accelerated mathematical computations
- **💾 Memory Management** - Efficient pooling and garbage collection
- **🔀 Parallel Execution** - Multi-threading and concurrent processing

### Standard Library
- **🗄️ Database ORM** - Type-safe database queries (PostgreSQL, SQLite)
- **🌐 Networking & HTTP** - Built-in HTTP client and server utilities
- **🔐 Cryptography** - Security and encryption functions
- **🎬 Media Processing** - Audio, video, and graphics capabilities
- **🧬 AI & ML Utilities** - Neural networks and genetic algorithms
- **📊 Collections** - Rich data structures and algorithms
- **✅ Validation** - Input validation and sanitization

## 🚀 Quick Start

### Installation

```bash
npm install -g omniscript
```

### Create a New Project

```bash
omni new my-project
cd my-project
```

### Run Your Project

```bash
# Development mode with hot reload
omni dev

# Build for production
omni build

# Run production build
omni run
```

### Interactive REPL

```bash
omni repl
```

## 📖 Example

```omniscript
// Type-safe web server with ORM
@component
class UserService {
  @state users: User[] = []
  
  async getUser(id: number): User | null {
    return await db.users.findOne({ id })
  }
  
  @computed
  get activeUsers(): User[] {
    return this.users.filter(u => u.active)
  }
}

// Pattern matching
match response {
  { status: 200, data } => handleSuccess(data),
  { status: 404 } => handleNotFound(),
  { error } => handleError(error)
}

// Async/await with error handling
async function fetchData() {
  try {
    const result = await api.getData()
    return result
  } catch (error) {
    logger.error("Failed to fetch data", error)
    throw error
  }
}
```

## 🏗️ Project Structure

```
omniscript/
├── src/               # Source code (40k+ lines)
│   ├── compiler/      # Compiler and optimizer
│   ├── parser/        # Language parser
│   ├── runtime/       # Runtime engine
│   ├── stdlib/        # Standard library
│   └── type-checker/  # Type system
├── tests/             # Test suite (782 tests)
├── docs/              # Documentation
├── examples/          # Example projects
├── demos/             # Demo applications
└── vscode-extension/  # VS Code integration
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Coverage**: 782/782 tests passing (100%)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## 📚 Documentation

- [Language Guide](docs/guide.md) - Complete language reference
- [API Documentation](docs/api/) - Standard library APIs
- [Best Practices](docs/best-practices.md) - Coding guidelines
- [Migration Guide](docs/comprehensive-reference.md) - Upgrading from v1.x

## 🔐 Security

We take security seriously. See our [Security Policy](SECURITY.md) for reporting vulnerabilities.

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📋 Requirements

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🎯 Roadmap

See [ROADMAP.md](docs/ROADMAP.md) for planned features and improvements.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

## 👤 Author

**RyAnPr1Me**

- GitHub: [@RyAnPr1Me](https://github.com/RyAnPr1Me)
- Project: [Omniscript](https://github.com/RyAnPr1Me/Omniscript)

## 🙏 Acknowledgments

Built with TypeScript, ANTLR4, and modern web technologies.

---

**Status**: ✅ Production Ready | v2.1.0
