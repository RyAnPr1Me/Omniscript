# Omniscript API Reference

> **📚 Looking for a complete language reference?** Check out the [Comprehensive Language Reference](../comprehensive-reference.md) which documents every function, keyword, operator, and feature in Omniscript with examples.

> **📑 Need to find something quickly?** Use the [Language Index](../language-index.md) for alphabetical access to all language features.

## Core Runtime Features

### Memory Management
- [Garbage Collection](./runtime/memory.md#garbage-collection)
- [Reference Counting](./runtime/memory.md#reference-counting)
- [Circular Reference Detection](./runtime/memory.md#circular-references)
- [Memory Profiling](./runtime/memory.md#profiling)

### Concurrency & Parallelism
- [Actor Model](./runtime/actors.md)
- [Coroutines](./runtime/coroutines.md)
- [Parallel Execution](./runtime/parallel.md)
- [Thread Pools](./runtime/threading.md)

### Reactive Programming
- [Stream<T>](./stdlib/reactive.md#stream)
- [Signal<T>](./stdlib/reactive.md#signal)
- [Observable<T>](./stdlib/reactive.md#observable)
- [Effect](./stdlib/reactive.md#effect)

## Standard Library

### Collections
- [List<T>](./stdlib/collections.md#list)
- [Map<K,V>](./stdlib/collections.md#map)
- [Set<T>](./stdlib/collections.md#set)
- [WeakMap<K,V>](./stdlib/collections.md#weakmap)
- [WeakSet<T>](./stdlib/collections.md#weakset)

### Network & IO
- [HTTP Client](./http/client.md)
- [HTTP Server](./http/server.md)
- [WebSocket](./http/websocket.md)
- [File System](./io/filesystem.md)
- [Streams](./io/streams.md)

### Database
- [Query Builder](./database/query.md)
- [Migrations](./database/migrations.md)
- [Connections](./database/connections.md)
- [Transactions](./database/transactions.md)
- [ORM Features](./database/orm.md)

### Security
- [Encryption](./security/encryption.md)
- [Hashing](./security/hashing.md)
- [Authentication](./security/auth.md)
- [Authorization](./security/authz.md)

### Utilities
- [Math](./stdlib/math.md)
- [Crypto](./stdlib/crypto.md)
- [DateTime](./stdlib/datetime.md)
- [Threading](./stdlib/threading.md)
- [Validation](./stdlib/validation.md)

## Development Tools

### Debugging & Profiling
- [Debug Mode](./tools/debugging.md)
- [Memory Profiler](./tools/profiling.md)
- [Performance Analysis](./tools/performance.md)
- [CPU Profiling](./tools/cpu-profiling.md)

### Package Management
- [Package Configuration](./packages/config.md)
- [Dependencies](./packages/dependencies.md)
- [Publishing](./packages/publishing.md)
- [Version Management](./packages/versioning.md)

## Language Features

### Core Features
- [Type System](./language/types.md)
- [Pattern Matching](./language/patterns.md)
- [Async/Await](./language/async.md)
- [Error Handling](./language/errors.md)
- [Iterators](./language/iterators.md)
- [Generators](./language/generators.md)

### Advanced Features
- [Decorators](./language/decorators.md)
- [Operator Overloading](./language/operators.md)
- [Generics](./language/generics.md)
- [Macros](./language/macros.md)
- [Type Inference](./language/type-inference.md)
- [Reflection](./language/reflection.md)

### Testing Features
- [Test Framework](./testing/framework.md)
- [Assertions](./testing/assertions.md)
- [Mocking](./testing/mocking.md)
- [Property Testing](./testing/property-testing.md)

## Deployment

### Compilation
- [JIT Compilation](./deployment/jit.md)
- [AOT Compilation](./deployment/aot.md)
- [Tree Shaking](./deployment/tree-shaking.md)
- [Code Splitting](./deployment/code-splitting.md)

### Optimization
- [SIMD Operations](./optimization/simd.md)
- [Memory Pooling](./optimization/memory-pooling.md)
- [Code Generation](./optimization/code-gen.md)
- [Dead Code Elimination](./optimization/dce.md)

## Platform Features

### Web Development
- [DOM API](./platform/dom.md)
- [Browser APIs](./platform/browser.md)
- [Web Workers](./platform/web-workers.md)
- [Service Workers](./platform/service-workers.md)

### Desktop Integration
- [File System Access](./platform/filesystem.md)
- [System Integration](./platform/system.md)
- [Native Modules](./platform/native.md)
- [IPC](./platform/ipc.md)

### Mobile Development
- [Mobile APIs](./platform/mobile.md)
- [Native Bridges](./platform/bridges.md)
- [Mobile Storage](./platform/storage.md)
- [Push Notifications](./platform/notifications.md)

## IDE Integration

### Language Server
- [LSP Implementation](./ide/lsp.md)
- [Code Completion](./ide/completion.md)
- [Code Navigation](./ide/navigation.md)
- [Refactoring](./ide/refactoring.md)

### Debug Protocol
- [DAP Implementation](./ide/dap.md)
- [Breakpoints](./ide/breakpoints.md)
- [Variable Inspection](./ide/variables.md)
- [Call Stack](./ide/call-stack.md)

## Best Practices & Guidelines
- [Memory Management](./guides/memory.md)
- [Error Handling](./guides/errors.md)
- [Performance](./guides/performance.md)
- [Security](./guides/security.md)
- [Testing](./guides/testing.md)
- [Documentation](./guides/documentation.md)
