# Omniscript API Reference

npm## Core Runtime Features

### Memory Management
- [Garbage Collection](./runtime/memory.md)
- [Reference Counting](./runtime/memory.md#reference-counting)
- [Circular Reference Detection](./runtime/memory.md#circular-references)

### Concurrency & Parallelism
- [Actor Model](./runtime/actors.md)
- [Coroutines](./runtime/coroutines.md)
- [Parallel Execution](./runtime/parallel.md)

### Reactive Programming
- [Stream](./stdlib/reactive.md#stream)
- [Signal](./stdlib/reactive.md#signal)
- [Observable](./stdlib/reactive.md#observable)

## Standard Library

### Collections
- [List<T>](./stdlib/collections.md#list)
- [Map<K,V>](./stdlib/collections.md#map)
- [Set<T>](./stdlib/collections.md#set)

### Network & IO
- [HTTP Client](./http/client.md)
- [HTTP Server](./http/server.md)
- [WebSocket](./http/websocket.md)

### Database
- [Query Builder](./database/query.md)
- [Migrations](./database/migrations.md)
- [Connections](./database/connections.md)

### Utilities
- [Math](./stdlib/math.md)
- [Crypto](./stdlib/crypto.md)
- [DateTime](./stdlib/datetime.md)
- [Threading](./stdlib/threading.md)

## Development Tools

### Debugging & Profiling
- [Debug Mode](./tools/debugging.md)
- [Memory Profiler](./tools/profiling.md)
- [Performance Analysis](./tools/performance.md)

### Package Management
- [Package Configuration](./packages/config.md)
- [Dependencies](./packages/dependencies.md)
- [Publishing](./packages/publishing.md)

## Language Features

### Core Features
- [Type System](./language/types.md)
- [Pattern Matching](./language/patterns.md)
- [Async/Await](./language/async.md)
- [Error Handling](./language/errors.md)

### Advanced Features
- [Decorators](./language/decorators.md)
- [Operator Overloading](./language/operators.md)
- [Generics](./language/generics.md)
- [Macros](./language/macros.md)
