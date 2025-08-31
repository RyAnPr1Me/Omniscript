# Omniscript Examples

This directory contains comprehensive examples demonstrating Omniscript's production-ready capabilities across various domains. All examples have been updated to use the latest modern Omniscript syntax with advanced features.

## Modern Language Features Used

### Updated Syntax
- **`def`** - Immutable variable declarations (replaces `const`)
- **`object`** - Class definitions with enhanced features (replaces `class`)
- **`::`** - Type annotations for better type safety
- **`use`** - Module imports with explicit exports (replaces `import`)
- **Pattern matching** - Exhaustive `match` expressions with guards
- **Pipeline operator** - `|>` for functional composition
- **Enhanced error handling** - `Either<L, R>` and `Option<T>` types

### Advanced Features
- **Type system** - Generics, union types, intersection types, type inference
- **Functional programming** - Immutable data, higher-order functions, monads
- **Actor model** - Concurrent programming with message passing
- **Reactive programming** - Observables, streams, and reactive state management
- **Pattern matching** - Algebraic data types with exhaustiveness checking
- **Metaprogramming** - Decorators, macros, and compile-time evaluation

## Basic Examples

### 1. Hello World (`hello.os`)
A comprehensive introduction showcasing:
- **Modern syntax**: `def`, `object`, `use` keywords with type annotations
- **HTTP server**: Updated server creation and routing
- **Operator overloading**: Vector mathematics with enhanced operators
- **Pattern matching**: Number categorization with guards
- **Functional programming**: Pipeline operators and functional composition

### 2. Functional Programming (`functional.os`)
Advanced functional programming concepts:
- **Immutable bindings**: `def` declarations with type safety
- **Monadic error handling**: `Maybe<T>` and `Either<L, R>` types
- **Function composition**: `compose`, `pipe`, and higher-order functions
- **Lazy evaluation**: Deferred computation with `lazy` and `force`
- **Memoization**: Performance optimization with automatic caching
- **Pipeline operations**: Fluent data transformation chains

### 3. REST API (`rest-api.os`)
Production-ready REST API with:
- **Type-safe ORM**: Enhanced database queries with generics
- **Error handling**: Comprehensive error types and pattern matching
- **Input validation**: Type-checked request/response schemas
- **Authentication**: JWT-based auth with type safety
- **Pagination**: Advanced query parameters and result handling

## Advanced Production Examples

### 4. E-commerce Application (`ecommerce-app.os`)
Full-featured e-commerce system featuring:
- **Enhanced data models**: Type-safe entities with validation methods
- **Authentication system**: Secure user registration and login
- **Order processing**: Complex business logic with functional patterns
- **Error handling**: Comprehensive error types and recovery strategies
- **Analytics**: Real-time sales analytics with functional data processing
- **Type safety**: End-to-end type checking for all operations

### 5. Real-time Chat Application (`chat-app.os`)
Modern chat system with:
- **Actor model**: Message processing with concurrent actors
- **WebSocket management**: Type-safe real-time communication
- **State management**: Immutable state with reactive updates
- **Rate limiting**: Sophisticated request throttling
- **Message features**: Reactions, editing, threading support
- **Connection management**: Automatic reconnection and presence tracking

### 6. Microservices Architecture (`microservices.os`)
Production microservices system demonstrating:
- **Service discovery**: Dynamic service registration and health checks
- **Load balancing**: Multiple strategies with circuit breakers
- **API Gateway**: Request routing with authentication and rate limiting
- **Circuit breakers**: Fault tolerance and failure recovery
- **Type safety**: End-to-end type checking across services
- **Observability**: Comprehensive logging and metrics

### 7. Data Processing Pipeline (`data-pipeline.os`)
High-performance data processing system featuring:
- **Functional pipelines**: Compose complex data transformations
- **Stream processing**: Real-time and batch data processing
- **Error handling**: Resilient processing with functional error types
- **Performance optimization**: Concurrent processing and intelligent caching
- **Analytics generation**: Advanced insights with functional composition
- **Type-safe transformations**: Compile-time validation of data flows

### 8. Machine Learning Inference Service (`ml-inference.os`)
Production ML service with:
- **Model registry**: Version management with type-safe configs
- **Feature engineering**: Automated feature computation and caching
- **Prediction caching**: Intelligent caching with TTL and LRU eviction
- **Batch processing**: Efficient batch prediction capabilities
- **Performance monitoring**: Real-time metrics and health tracking
- **Type safety**: Compile-time validation of model inputs/outputs

## New Advanced Examples

### 9. Pattern Matching (`pattern-matching.os`)
Comprehensive pattern matching demonstrations:
- **Algebraic data types**: `enum` definitions with associated data
- **Exhaustiveness checking**: Compile-time verification of pattern completeness
- **Guard patterns**: Conditional pattern matching with custom predicates
- **Nested destructuring**: Deep pattern matching with complex data structures
- **JSON processing**: Type-safe JSON parsing and manipulation
- **Error handling**: Pattern-based error recovery strategies

### 10. Reactive Programming (`reactive-programming.os`)
Advanced reactive programming patterns:
- **Observable streams**: Event-driven programming with functional operators
- **State management**: Reactive state with automatic UI updates
- **Async composition**: Complex async operations with reactive patterns
- **Error propagation**: Functional error handling in reactive streams
- **Backpressure handling**: Flow control and buffering strategies
- **Performance optimization**: Efficient stream processing and memory management

### 11. Concurrency (`concurrency.os`)
Modern concurrency and parallelism:
- **Actor system**: Message-passing concurrency with supervision
- **CSP channels**: Go-style communication between coroutines
- **Worker pools**: CPU-intensive task distribution
- **Coroutines**: Cooperative multitasking with generators
- **Async/await**: Modern asynchronous programming patterns
- **Performance monitoring**: Real-time concurrency metrics

## Running the Examples

Each example is a complete, runnable Omniscript program. To run an example:

```bash
# Run basic examples
omni run examples/hello.os
omni run examples/functional.os
omni run examples/rest-api.os

# Run advanced examples
omni run examples/ecommerce-app.os
omni run examples/chat-app.os
omni run examples/microservices.os
omni run examples/data-pipeline.os
omni run examples/ml-inference.os

# Run new advanced examples
omni run examples/pattern-matching.os
omni run examples/reactive-programming.os
omni run examples/concurrency.os
```

## Example API Usage

### E-commerce API
```bash
# Start the server
omni run examples/ecommerce-app.os

# Test endpoints (requires authentication)
curl -H "Authorization: Bearer valid-token" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/users/1

curl -H "Authorization: Bearer valid-token" \
     -H "Content-Type: application/json" \
     -d '{"name":"New Product","price":99.99}' \
     http://localhost:3000/api/products
```

### Chat Application WebSocket
```javascript
// Connect to chat server
const ws = new WebSocket('ws://localhost:8080');

// Authenticate
ws.send(JSON.stringify({ type: 'AUTH', userId: 1 }));

// Join a room
ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: 1 }));

// Send a message
ws.send(JSON.stringify({ 
  type: 'SEND_MESSAGE', 
  roomId: 1, 
  content: 'Hello world!',
  messageType: 'text'
}));
```

### ML Inference API
```bash
# Start ML inference server
omni run examples/ml-inference.os

# Single prediction
curl -X POST http://localhost:4000/predict/customer-churn \
     -H "Content-Type: application/json" \
     -d '{"data": {"age": 35, "income": 75000, "usage_days": 120}}'

# Batch prediction
curl -X POST http://localhost:4000/predict/sentiment-analysis/batch \
     -H "Content-Type: application/json" \
     -d '{"data": [{"text": "I love this!"}, {"text": "This is terrible"}]}'
```

## Production Deployment

All examples include production-ready features:

- **Environment configuration**: Support for environment variables
- **Health checks**: Built-in health monitoring endpoints
- **Error handling**: Comprehensive error logging and recovery
- **Security**: Authentication, authorization, and input validation
- **Performance**: Caching, connection pooling, and optimization
- **Monitoring**: Metrics collection and performance tracking
- **Graceful shutdown**: Clean resource cleanup on termination

### Docker Deployment
```dockerfile
FROM omniscript:latest
COPY examples/ /app/examples/
WORKDIR /app
EXPOSE 3000
CMD ["omni", "run", "examples/ecommerce-app.os"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: omniscript-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: omniscript-app
  template:
    metadata:
      labels:
        app: omniscript-app
    spec:
      containers:
      - name: app
        image: omniscript-example:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
```

## Development

### Prerequisites
- Omniscript runtime v2.0+
- Node.js 18+ (for some stdlib features)
- TypeScript 5.0+ (for type checking)

### Setting up Development Environment
```bash
# Install Omniscript
curl -sSf https://get.omniscript.dev | sh

# Clone repository
git clone https://github.com/omniscript/examples.git
cd examples

# Install dependencies
omni install

# Run tests
omni test examples/

# Enable development mode with hot reload
omni dev examples/rest-api.os
```

### Code Style and Best Practices

1. **Use modern syntax**: Prefer `def`, `object`, `use` over legacy keywords
2. **Type annotations**: Always use `::` type annotations for better safety
3. **Pattern matching**: Use `match` expressions for complex conditional logic
4. **Functional composition**: Leverage `|>` and functional programming patterns
5. **Error handling**: Use `Either<L, R>` and `Option<T>` for safe error handling
6. **Immutability**: Prefer immutable data structures and `def` bindings
7. **Performance**: Use appropriate caching and async patterns
8. **Testing**: Write comprehensive tests with property-based testing

## Learn More

- [Language Guide](../docs/guide.md) - Complete language reference
- [API Reference](../docs/api/README.md) - Standard library documentation
- [Best Practices](../docs/best-practices.md) - Production development guidelines
- [Functional Programming](../FUNCTIONAL_FEATURES.md) - Functional programming features
- [Production Deployment](../docs/deployment.md) - Deployment and scaling guide
- [Type System](../docs/api/language/types.md) - Advanced type system features
- [Pattern Matching](../docs/api/language/patterns.md) - Pattern matching guide
- [Concurrency](../docs/api/runtime/concurrency.md) - Concurrency and parallelism